# SEMAR Changelog

Format ini mencatat perubahan terverifikasi, bukan target roadmap.

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

### Documentation

- Mengganti klaim status lama dengan audit berbasis evidence.
- Menambahkan frontend re-engineering plan dan development workflow.
- Menyusun ulang master architecture dan backend roadmap berbasis quality gate.
- Menambahkan Agent Execution Playbook dengan work queue, quality gate, dan format handoff wajib.

### Known blockers

- TypeScript check masih gagal pada beberapa komponen legacy/debug/auth/banner/MUI (77 error, tidak ada dari file FE-00).
- Frontend test terakhir: 9/12 lulus (kegagalan FileUpload double-render); 13 test FE-00 lulus.
- Backend `go test ./...` masih gagal karena test contracts tertinggal.
- Production build tetap hijau; typecheck/test warisan ditangani di FE-01.
- Smoke browser asli (responsive desktop/mobile authenticated) belum berjalan karena belum ada infrastruktur E2E browser.
