# SEMAR Changelog

Format ini mencatat perubahan terverifikasi, bukan target roadmap.

## Unreleased — 3 September 2026

### Execution Playbook & Engineering Rules Expansion

- Memperluas `docs/AGENT_EXECUTION_PLAYBOOK.md` dengan merumuskan 6 aturan dan batasan arsitektur inti (Rule 1: Vertical Slice Migration, Rule 2: Multi-Tenancy & Zero-Trust Tenant Boundary, Rule 3: Frontend State Ownership via TanStack Query, Rule 4: Backend Single Pool Database Lifecycle, Rule 5: Non-Negotiable Quality Gates, Rule 6: Factual Documentation & Handoff).
- Memetakan roadmap work queue masa depan secara komprehensif:
  - **Frontend Track**: `FE-04` (Inspection Vertical Slice), `FE-05` (Risk & RBI Assessment), `FE-06` (Maintenance & Compliance), `FE-07` (Real-Time Telemetry & IoT), `FE-08` (Cross-Route Authenticated E2E Playwright Suite).
  - **Backend Track**: `BE-01` (Single Database Lifecycle & Connection Pool Management), `BE-02` (API Normalization & Multi-Tenant Isolation), `BE-03` (Vertical Slice Asset Domain Boundary), `BE-04` (Deterministic Calculation Engine & Golden Tests), `BE-05` (Transactional Outbox & Event-Driven Integrations).
### Single Database Lifecycle & Connection Pool Management (BE-01)

- Mengkonsolidasikan seluruh koneksi database backend ke dalam satu lifecycle dan satu connection pool `*sql.DB` terpadu melalui `backend/app/database/connection.go`.
- Mengeliminasi fragmentasi koneksi PostgreSQL (sebelumnya membuka 3 pool terpisah: GORM seeder di `main.go`, GORM router di `router.go`, dan SQLX repository di `repositories/db.go`).
- Menerapkan adapter GORM (`gormPostgres.Open`) dan SQLX (`sqlx.NewDb(sqlDB, "postgres")`) yang berbagi pool underlying `*sql.DB` yang sama.
- Mengonfigurasi parameter batas connection pool secara eksplisit (`MaxOpenConns: 25`, `MaxIdleConns: 10`, `ConnMaxLifetime: 15m`, `ConnMaxIdleTime: 5m`) dengan mekanisme ping-retry backoff hingga 10 percobaan saat startup.
- Menyediakan abstraksi `database.TransactionManager` terpusat (`WithTransaction`) untuk atomic operations lintas repositori dan metode `Stats()` untuk observabilitas pool.
- Menghubungkan graceful shutdown di `main.go` yang memastikan `dbHolder.Close()` menutup pool koneksi database secara bersih saat menerima signal `SIGINT`/`SIGTERM`.
- Menambahkan unit test suite `backend/app/database/connection_test.go` menggunakan `sqlmock` yang menguji `Stats()`, commit transaksi, rollback saat callback error, dan penutupan pool.
- Memvalidasi seluruh quality gate backend: `docker exec semar-backend go test ./...` lulus 100% (5 paket teruji), `go vet ./...` 0 error/warning, dan `/health` runtime status `healthy` (database: up).

### Backend test suite recovery (BE-00)

- Memulihkan dan memperbaiki seluruh suite pengujian Go backend (`docker exec semar-backend go test ./...`) sehingga seluruh paket (`middleware`, `repositories`, `services`, `utils`) lulus 100% (exit code 0).
- **Utils**: Memperbaiki `backend/app/utils/cache_test.go` (`Set`, `Get`, `Delete`, `Flush`, expiration test) dan `backend/app/utils/jwt_test.go` (`GenerateToken`, `ValidateToken`, blacklist, token validation failure), membersihkan duplicate check pada `asset_errors.go`, serta memperbaiki logger string formatting pada `logger.go` dari audit `go vet`.
- **Repositories**: Membersihkan unused variables pada `configuration_repository_test.go` dan `rbac_repository_test.go`. Memperbaiki format specifier `%s` menjadi `%d` pada `dashboard_layout_repository.go`. Memigrasikan `user_repository_test.go` dari mock GORM fiktif ke konstruktor nyata `NewUserRepository(sqlxDB)` dengan `sqlmock` untuk skenario `FindByUsername` (Found, NotFound, DatabaseError).
- **Services**: Menyelaraskan `backend/app/services/auth_service_test.go` dengan arsitektur produksi `NewAuthService` (7 parameter), memperbarui mock `UserRepository` (`FindByUsernameOrEmail`, `UpdateLastLogin`), menggunakan tipe DTO kanonikal `request.LoginRequest`, dan menguji 5 skenario autentikasi (Username, Email, User Not Found, Wrong Password, Inactive User).
- **Middleware**: Memisahkan database integration test pada `backend/app/middleware/rbac_middleware_integration_test.go` menggunakan build tag `//go:build integration` dan menyelaraskan dependensi dengan interface aktual. Membangun unit test murni `backend/app/middleware/rbac_middleware_test.go` dengan mock `RBACRoleProvider` untuk menguji unauthenticated access, superuser bypass, single permission, wildcard (`*`), dan permission denied.

### Permission-aware navigation contract (FE-03)

- Membangun Typed Route Manifest terpusat pada `frontend/src/config/route-manifest.ts` yang mendefinisikan seluruh 60+ rute aplikasi SEMAR beserta metadata semantic ID, path kanonikal, module association, access control (`isProtected`), permissions, dan landing destination status.
- Menyelaraskan `frontend/src/config/module-destinations.ts` agar diturunkan secara langsung dari `ROUTE_MANIFEST`.
- Mengimplementasikan helper validasi dan access check murni `checkRouteAccess(items, path, isSuperuser)` untuk proteksi deep-link terhadap rute yang tersembunyi, non-aktif, atau belum diberi lisensi.
- Memperkuat `ProtectedRoute` pada `frontend/src/router/index.tsx` dengan ekspor modular dan pelestarian target path serta search parameters pada `state.from`.
- Mendelegasikan verifikasi akses pada `frontend/src/layouts/MainLayout.tsx` ke `checkRouteAccess` untuk pengalihan konsisten ke `/access-inactive`.
- Menambahkan 8 contract tests pada `frontend/src/config/route-manifest.test.ts` (mencegah duplikasi slug, duplikasi path, orphan landing destinations, invalid menu URLs, dan missing icons).
- Menambahkan 10 navigation tests pada `frontend/src/router/navigation-guard.test.tsx` (menguji skenario unauthenticated redirect, deep link search query preservation, authorized direct access, menu inactivity guard, dan superuser bypass). Total test suite frontend meningkat menjadi 9 file dan 60/60 test lulus.

### API client consolidation & TanStack Query (FE-02)

- Menetapkan satu API client kanonikal pada `frontend/src/shared/api/client.ts` dengan request interceptors (`Authorization Bearer`, `X-Tenant-ID`, `X-Request-ID`, `X-CSRF-TOKEN`), response auto-sync session, 401 concurrent silent refresh queue (`failedQueue`), dan error normalization (`NormalizedApiError`).
- Menjadikan `frontend/src/services/apiClient.ts` sebagai backward-compatibility re-export bridge ke client kanonikal.
- Menambahkan `@tanstack/react-query@5.102.8` secara resmi dan memasang `QueryClientProvider` pada `frontend/src/App.tsx`.
- Membangun query-key factory terpusat di `frontend/src/shared/api/queryKeys.ts` (`assetKeys`, `menuKeys`, `authKeys`).
- Memigrasikan Asset Registry (`frontend/src/pages/assets/AssetRegistryPage.tsx`) sebagai vertical slice pertama ke TanStack Query hooks (`useAssets`, `useDeleteAsset`), cache invalidation otomatis saat create/edit/delete, serta penanganan UI loading state dan error retry.
- Menghapus Redux asset server-state (`frontend/src/store/slices/assetSlice.ts`) dan membersihkan `frontend/src/store/index.ts` setelah seluruh test parity dan regression lulus.
- Menambahkan test suite baru: `src/shared/api/client.test.ts` (8 test), `src/features/assets/api/assetQueries.test.tsx` (5 test), dan `src/pages/assets/AssetRegistryPage.test.tsx` (4 test). Suite frontend kini memiliki 7 file dan 42/42 test lulus.

## Unreleased — 2 September 2026

### Navigation dan dashboard

- Menjadikan `/dashboard` route canonical dan mengarahkan `/dashboard/overview` ke route tersebut.
- Menghapus page overview yang redundant.
- Menyinkronkan system menu saat startup existing database, bukan hanya fresh seed.
- Menambahkan Home, Asset, Inspection, Maintenance, dan Compliance dashboard beserta icon mapping.
- Menggunakan slug database sebagai ID navigasi stabil.
- Memulihkan scroll/touch navigation dan active-item centering pada primary navbar.
- Menambahkan landing page reusable untuk Asset, Inspection, Risk, Analytics, Maintenance, Compliance, dan Administration.
- Mengubah root menu canonical ke `/assets`, `/inspection`, `/risk`, `/analytics`, `/maintenance`, `/compliance`, dan `/admin`.
- Membersihkan root Content Management legacy dari primary navigation; utility route `/content/*` tetap tersedia untuk deep link/admin workflow.
- Menjadikan destination landing page permission-aware: card difilter terhadap metadata canonical dan user menu tree runtime (permission + visibility + disabled), dengan superuser bypass dan empty state saat tidak ada akses.
- Menambahkan `config/module-destinations.ts` sebagai kontrak canonical href per module landing.
- Memindahkan `NavigationContext` ke `config/navigation-context.ts` agar halaman landing dapat membaca top-level menu tanpa circular import; re-export lama pada MainLayout dipertahankan.
- Menambahkan test FE-00 (13): kontrak destination landing, filter permission (termasuk hidden/permission child dan superuser), accessible names, keyboard focus, dan empty state.
- Memperbaiki Vitest setup: cleanup antar test, serta polyfill `matchMedia` dan `ResizeObserver` untuk jsdom; `vite.config.ts` kini memuat `setupFiles` dan menonaktifkan CSS di test.
- Memperluas `MenuItemDTO` backend user-tree dengan `access_level`, `permissions`, dan `menu_group` untuk mendukung permission filtering di klien.

### Development environment

- Menambahkan `docker-compose.dev.yml` dengan bind mount dan dependency cache volumes.
- Menambahkan `frontend/Dockerfile.dev` untuk Vite dan `backend/Dockerfile.dev` untuk Air.
- Mengaktifkan polling Air agar perubahan Go pada bind mount Docker Desktop Windows terdeteksi konsisten.
- Menambahkan Vite proxy `/api`/`/ws`, polling Windows, interval, dan ignored directories.
- Menambahkan backend health dependency agar frontend tidak start sebelum API siap.
- Menambahkan backend `.dockerignore` dan memperbaiki port/path stale pada compose example.
- Memasang Docker CLI 29.7.2 dan Docker Compose 5.5.0 pada Windows user profile.
- Mengurangi healthcheck log noise dan memperbaiki format debug CORS.
- Menghapus logging plaintext password dan password hash dari authentication service.
- Melepas DebugConsole legacy dari app shell agar collector rusak tidak ikut runtime default.

### Frontend quality baseline

- Memulihkan TypeScript dari 48 error aktual menjadi 0 error.
- Menyelaraskan auth forms dengan state `loading` dan action `clearError` canonical.
- Memigrasikan Select events, ListItemButton, serta SimpleTreeView ke API MUI v7/v8.
- Memperbaiki import dan kontrak icon pada Backup, Version History, Dashboard Grid, serta Animated Gradient Banner.
- Menyelaraskan AssetList dengan default export dan props VirtualScroll; mode table memakai representasi list sampai table renderer tersedia.
- Mengarantina debug/demo source tanpa production import dari TypeScript production graph.
- Memperbaiki bug FileUpload yang membaca snapshot status lama; 4 test kini menguji pemilihan file dan pemanggilan upload aktual.
- Menambahkan scripts `typecheck`, `test:run`, dan `check`.
- Memverifikasi 25/25 frontend test, TypeScript 0 error, dan production build sukses.

### Documentation

- Mengganti klaim status lama dengan audit berbasis evidence.
- Menambahkan frontend re-engineering plan dan development workflow.
- Menyusun ulang master architecture dan backend roadmap berbasis quality gate.
- Menambahkan Agent Execution Playbook dengan work queue, quality gate, dan format handoff wajib.

### Known blockers

- Backend `go test ./...` masih gagal karena test contracts tertinggal.
- Authenticated cross-route E2E belum menjadi test suite repository.
- Build frontend lulus tetapi masih relatif lambat dan belum memiliki performance budget otomatis.
