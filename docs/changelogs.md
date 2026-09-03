# SEMAR Changelog

Format ini mencatat perubahan terverifikasi, bukan target roadmap.

## Unreleased — 3 September 2026

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
