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

- TypeScript check masih gagal pada beberapa komponen legacy/debug/auth/banner/MUI.
- Frontend test terakhir: 9/12 lulus.
- Backend `go test ./...` masih gagal karena test contracts tertinggal.
- Production build belum boleh dinyatakan hijau sebelum typecheck/test diperbaiki.
