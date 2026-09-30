# SEMAR Changelog

Format ini mencatat perubahan terverifikasi, bukan target roadmap.

## Unreleased — 28 September 2026

### Equipment Master 100 MB XLSX import and streaming processing

- Menaikkan batas ukuran unggah workbook XLSX Equipment Master dari 10 MB menjadi 100 MB (`100 << 20`) pada frontend UI (`EquipmentMasterPage`), backend HTTP handler (`AssetHandler.ImportAssets`), dan konfigurasi reverse proxy Nginx (`client_max_body_size 120M`).
- Mengoptimalkan pembacaan workbook besar secara hati-hati:
  - Mengonfigurasi `excelize.Options{UnzipXMLSizeLimit: 16 << 20}` agar worksheet XML berukuran >16 MB diekstrak ke temporary files daripada membebani memory heap Go.
  - Mengganti `book.GetRows()` yang memuat seluruh sheet ke memory menjadi streaming iterator `book.Rows()` dengan pembacaan row-by-row streaming, menjaga pemakaian RAM tetap minimal dan stabil untuk workbook berisi puluhan ribu baris.
  - Membatasi buffer memori multipart form ke 32 MB (`ParseMultipartForm(32 << 20)`) dengan pembersihan otomatis file temporary via `defer c.Request.MultipartForm.RemoveAll()`.
  - Menambahkan cooperative context check (`ctx.Done()`) pada parsing sheet dan loop upsert repositori untuk menangani diskoneksi klien atau pembatalan request secara bersih.
  - Menyesuaikan batas timeout permintaan import pada frontend Axios dan Nginx proxy menjadi 10 menit (600 detik).
- Validasi: `docker exec semar-backend go test ./app/api/handlers ./app/repositories ./app/services`, `docker exec semar-backend go vet ./app/api/handlers ./app/repositories ./app/services`, `docker exec semar-frontend pnpm test:run src/pages/risk/EquipmentMasterPage.test.tsx src/services/assetServices.test.ts`, dan `docker exec semar-frontend pnpm typecheck`.

### Docker frontend filesystem isolation

- Mempertahankan anonymous volume `/app/node_modules` (dibutuhkan untuk dependency Linux dalam container), melepas mount `.next` dan pnpm store yang tidak digunakan Vite, serta mematikan forced filesystem polling.
- Memperbarui panduan troubleshooting performa; proyek frontend saat ini memakai Vite, dengan cache transform di `node_modules/.vite`.

### Focus pengembangan RBI Equipment Master

- Menambahkan `docs/FUTURE_FEATURES.md` sebagai backlog fitur/submenu lain yang ada di manifest, menu, seeder, dan halaman Dashboard.
- Membatasi menu fallback dan menu API dinamis ke Dashboard serta Risk Based Inspection → Equipment Master; seeder menonaktifkan menu lama saat startup agar database yang sudah ada ikut tersinkron.
- Menyisakan route Dashboard dan `/risk/equipment-master`; root `/risk` diarahkan ke Equipment Master, sedangkan route backlog ditutup untuk semua role dan diarahkan ke halaman 404.
- Menyederhanakan Dashboard agar hanya menampilkan konteks utama dan tautan Equipment Master.
- Validasi: frontend typecheck, contract/navigation/menu tests, dan `go test ./...`.

### Equipment Master performance and scalability

- Menambahkan indeks GORM untuk pencarian `tag_number`, filter `asset_type`, `functional_location_id`, `status`, dan lifecycle status, termasuk indeks gabungan tenant agar query multi-tenant tetap selektif; indeks diterapkan lewat `AutoMigrate` saat startup.
- Menambahkan ekstensi PostgreSQL `pg_trgm` dan indeks GIN trigram untuk `tag_number`, sehingga pola pencarian `ILIKE '%query%'` pada tabel aset dapat memanfaatkan indeks.
- Menambahkan unit test repository untuk akurasi agregasi tipe/lifecycle dan total statistik, serta handler test untuk payload sukses yang tepat dan JSON error 500 pada `GET /api/v1/assets/stats`.
- Membungkus `AssetDataGrid` dan `StatDetailModal` dengan `React.memo`, menstabilkan callback pencarian, filter, lifecycle, pagination, sorting dan pilihan aset, serta memoize elemen pagination agar perubahan state lain tidak memicu render tabel/modal berulang.
- Validasi: `pnpm typecheck`, tes komponen dan halaman Equipment Master, serta `go test ./app/api/handlers ./app/repositories ./app/utils`.

### Equipment Master UX and API error handling

- Menambahkan skeleton loading pada tabel aset dan metric cards serta empty state pencarian tag yang menyediakan aksi hapus pencarian.
- Mengirim notifikasi Snackbar untuk perubahan lifecycle, penghapusan, dan utilitas Equipment Master saat operasi berhasil maupun gagal.
- Menstandarkan payload error JSON API aset serta memperbaiki pemetaan validasi ke HTTP 400 dan resource hilang ke HTTP 404.
- Validasi: frontend typecheck dan tes terpilih; `go test ./app/api/handlers ./app/utils`.

### Risk Management navbar navigation

- Memindahkan grup Risk Management (`/risk`) ke posisi navbar tepat setelah Dashboard.
- Menempatkan Equipment Master sebagai halaman pertama di dalam grup Risk Management, bukan sebagai menu top-level tersendiri.
- Memperbarui seeder database, fallback frontend, dan route/menu contract test.

### Equipment Master actions, maintenance, and XLSX integration

- Menghubungkan edit/delete dan perubahan lifecycle ke endpoint Asset `PUT /assets/Asset/:id`, `DELETE /assets/Asset/:id`, dan `PUT /assets/:id/lifecycle`; sukses/error dikirim lewat Snackbar global.
- Menghubungkan Diagnose duplicates (`GET /assets/diagnose-duplicates`), Fix component links (`POST /assets/fix-links`), dan Sync components to FLOC (`POST /assets/sync-floc`), termasuk state loading, ringkasan hasil, notifikasi, dan invalidasi query setelah mutasi.
- Menambahkan unggah XLSX multipart ke `POST /assets/import` serta unduh file Excel dari `GET /assets/export`, dengan indikator loading, validasi ekstensi, nama file dari response header, dan notifikasi hasil.
- Memperbaiki header upload multipart agar Axios/browser menyertakan boundary; menambah progres upload/pemrosesan, retry dengan file terpilih, hasil created/updated, dan detail kesalahan per baris.
- Mengimpor seluruh baris XLSX yang valid (dalam batas file 10 MB) tanpa batas tersembunyi 100 baris; mode `skip_errors` mempertahankan baris valid dan melaporkan error tiap baris.
- Validasi lanjutan: `go test ./...`, `go build ./...`, `go vet` service/handler/repository/database, tes service + halaman XLSX (8 tes), frontend typecheck, serta production build.
- Validasi terbaru: `pnpm typecheck`, ESLint untuk file integrasi baru/terkait (tanpa AssetFormModal dan assetServices yang memiliki temuan lint lama), 19 tes terpilih, dan production build lulus; build menampilkan peringatan chunk >500 kB.

### Equipment Master Excel import/export

- Menghasilkan workbook Excel `Data Source` untuk Equipment Master dengan header dua tingkat General, Component Design, dan Operating Envelope.
- Mengimpor workbook two-tier mulai baris 3, memetakan identitas/tag, description, class, dan type ke kolom relasional; atribut lainnya disimpan di `assets.rbi_properties` JSONB.
- Menjalankan upsert tenant-scoped dalam satu transaksi PostgreSQL; pembaruan menggabungkan nilai atribut RBI tanpa menghapus properti yang tidak ada di file.
- Validasi: `go test ./...`, `go build ./...`, dan `go vet` untuk service/handler/routes.

### Equipment Master API integration

- Menghubungkan query statistics ke `GET /api/v1/assets/stats` dan mendistribusikan agregat lifecycle ke metric cards.
- Menghubungkan grid dan detail modal ke `GET /api/v1/assets` dengan parameter `page`, `limit`, `search`, serta `lifecycle_status`; filter grid mengubah query server dan modal menerapkan status kartu yang dipilih.
- Menambahkan typing/normalisasi response envelope sesuai kontrak backend serta tes service, query hooks, filter grid, dan alur klik kartu hingga modal.
- Validasi: `pnpm typecheck`, ESLint file terkait, 15 tes terpilih, dan `pnpm build` lulus. Build mencatat warning chunk >500 kB; percobaan build pertama mencapai timeout 5 menit, build ulang berhasil.

### Equipment Master UI interactions

- Menambahkan `/risk/equipment-master` dengan metric cards dan modal detail yang membaca daftar aset secara paginated, menyediakan pencarian tag, filter lifecycle, dan sorting.
- Menambahkan aksi per aset untuk manage/detail, tambah component melalui Asset Hierarchy, timeline, edit, delete terkonfirmasi, serta perubahan lifecycle melalui `PUT /api/v1/assets/:id/lifecycle`.
- Menghubungkan query/mutation dan invalidasi cache statistik/daftar; menambahkan tes interaksi komponen dan panduan di halaman arsitektur/engineering kanonis.
- Validasi pada task implementasi: `pnpm typecheck`, lint terpilih, 12 tes terpilih, dan `pnpm build` lulus; build memberi peringatan chunk >500 kB.

### Documentation consolidation

- Menggabungkan snapshot audit serta strategi rekayasa frontend/backend ke `docs/SEMAR_AIMS_ARCHITECTURE_PLAN.md` agar arah, gap, dan aturan utama tersedia di satu referensi.
- Merampingkan `docs/AGENT_EXECUTION_PLAYBOOK.md` menjadi entry point dan checklist kerja; detail domain Asset, workflow Docker, serta histori tetap di dokumen khususnya.
- Menghapus dokumen audit, rencana frontend/backend, dan panduan Equipment Master yang terpisah setelah konten relevan dipindahkan; memperbarui indeks dan instruksi handoff.

## Unreleased — 3 September 2026

### Tenant Context & Asset Authorization Gate (SAAS-01)

- Mengeliminasi total hardcoded fallback `return 1` pada context extractor backend (`backend/app/utils/asset_handler_utils.go`).
- Mengimplementasikan helper zero-trust `GetTenantID`, `GetUserID`, `RequireTenantID`, dan `RequireUserID` dengan coercion tipe (`int`, `int64`, `float64`, `string`, `*int`) yang mengembalikan error eksplisit dan nilai `0` jika context tenant/user tidak ada atau tidak valid.
- Membangun middleware `RequireTenantContext()` pada `backend/app/middleware/auth_middleware.go` yang menolak request ber-tenant missing/0 dengan HTTP 401 Unauthorized (`code: TENANT_CONTEXT_REQUIRED`), menjamin keamanan multi-tenant tanpa default bypass.
- Menerapkan granular RBAC dan otorisasi tenant pada seluruh rute Asset di `backend/app/api/routes/asset_routes.go` (`asset:view` untuk query/read, `asset:create` untuk POST, `asset:update` untuk PUT/PATCH, `asset:delete` untuk DELETE, `asset:import` untuk batch import, dan `asset:export` untuk export).
- Menambahkan pemeriksaan batas relasi multi-tenant di `backend/app/services/asset_service.go`:
  - `CreateUnit` dan `UpdateUnit`: Memvalidasi kepemilikan `SiteID` pada tenant yang sama (`siteRepo.FindByID`).
  - `CreateAsset` dan `UpdateAsset`: Memvalidasi kepemilikan `UnitID` (`unitRepo.FindByID`), parent asset (`AssetRepo.FindByID`), dan mencegah self-parenting (`*req.ParentID == assetID`).
  - `CreateComponent`: Memvalidasi kepemilikan `AssetID` pada tenant yang sama (`AssetRepo.FindByID`).
- Menambahkan permission Asset standar (`asset:view`, `asset:create`, `asset:update`, `asset:delete`, `asset:import`, `asset:export`) pada database seeder (`backend/app/database/seeder.go`).
- Membangun automated cross-tenant test suite komprehensif di `backend/app/api/handlers/asset_tenant_isolation_test.go` (8 negative & positive test cases) dan `backend/app/services/asset_service_tenant_test.go` (5 relationship boundary unit tests).
- Menjalankan seluruh quality gates: `go test ./...` lulus 100% pada seluruh 6 paket backend (handlers, database, middleware, repositories, services, utils), `go vet ./...` 0 warning/error, regression test frontend (`pnpm test:run`) 11/11 file passed (69/69 tests), dan runtime `/health` `healthy` (database: up).

### Asset Management standards baseline & readiness assessment (AM-00)

- Menambahkan `docs/ASSET_MANAGEMENT_REENGINEERING_PLAN.md` sebagai source of truth Asset-first: standards layering ISO 55000/55001, ISO 55013, IEC 81346, ISO 14224, ISO 15489, posisi API RP 580/581, benchmark capability Cenosco IMS, target domain, quality gates, dan decision log meeting.
- Mengaudit jalur FE–BE–DB Asset dan mencatat blocker faktual: tenant/user handler hardcoded `1`, route/DTO drift, Technical Data/Documents/Import-Export placeholder, hierarchy single-aspect, migration tidak lengkap/versioned, bulk operation semu, dan perhitungan remaining life berbasis umur kalender.
- Mengubah work queue menjadi Asset-first: `SAAS-01 -> AM-01 -> AM-02 -> AM-03 -> AM-04 -> AM-05 -> AM-06 -> ENG-01`; FE-05 Risk/RBI ditunda sampai data Asset dan SME gate terpenuhi.
- Memperbarui README, architecture plan, codebase analysis, dan handoff playbook agar agent berikutnya tidak mengulang audit atau menganggap test mock sebagai bukti production readiness.
- Tidak mengubah source runtime pada AM-00. Direct validation host belum dapat dijalankan: wrapper `pnpm` meminta purge/install tanpa TTY dan Go build cache host ditolak sandbox; documentation validation dicatat terpisah.

### AIMS Workflows: Inspection Vertical Slice (FE-04)

- Menyelesaikan migrasi vertikal penuh modul **Inspection Management** (`/inspection/*`) dari state in-memory statis ke arsitektur **TanStack Query** terpusat.
- **Domain Types & DTOs**: Membangun `frontend/src/features/inspection/types.ts` mendefinisikan model domain kanonikal (`Finding`, `FindingSeverity`, `FindingStatus`, `FindingPriority`, `FindingFormData`, `InspectionPlan`, `PlanStatus`, `PlanPriority`, `InspectionPlanFormData`, `InspectionTask`, `InspectionSearchParams`, `InspectionStatistics`).
- **Query Keys**: Mendaftarkan `inspectionKeys` (`plans`, `plan`, `tasks`, `task`, `findings`, `finding`, `statistics`) pada master registry `frontend/src/shared/api/queryKeys.ts`.
- **Service Layer**: Mengkonsolidasikan `frontend/src/services/inspectionService.ts` untuk typed CRUD calls melalui `apiClient`. Fallback data yang masih ada diklasifikasikan sebagai technical debt/non-production dan wajib dihapus saat backend slice dikerjakan.
- **Custom Query Hooks**: Mengimplementasikan hooks `@tanstack/react-query` di `frontend/src/features/inspection/api/inspectionQueries.ts` (`useInspectionPlans`, `useInspectionPlan`, `useCreateInspectionPlan`, `useInspectionTasks`, `useInspectionFindings`, `useInspectionFinding`, `useCreateInspectionFinding`, `useUpdateInspectionFinding`, `useDeleteInspectionFinding`, `useInspectionStatistics`) dengan mekanisme auto-invalidation cache saat mutasi data.
- **Halaman Termigrasi**:
  - `InspectionPlansPage.tsx`: Integrasi `useInspectionPlans`, `useInspectionStatistics`, modal pembuatan rencana inspeksi interaktif, skeleton loading, dan error banner retry.
  - `InspectionTasksPage.tsx`: Integrasi `useInspectionTasks`, filtering status tugas interaktif, status badge dinamis, dan skeleton loading.
  - `InspectionFindingsPage.tsx`: Integrasi `useInspectionFindings`, mutasi `useCreateInspectionFinding`, `useUpdateInspectionFinding`, `useDeleteInspectionFinding`, modal observasi lengkap, severity pills, dan error handling dengan retry.
- **Pengujian & Verifikasi**: Menambahkan suite pengujian Vitest di `src/features/inspection/api/inspectionQueries.test.tsx` (6 unit tests) dan `src/pages/inspection/InspectionFindingsPage.test.tsx` (3 integration tests). Seluruh 11 test file (69 test) lulus 100% dan seluruh rute inspeksi terverifikasi merespon `HTTP 200 OK`.

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
