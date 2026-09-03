# Audit Aktual Codebase SEMAR

**Snapshot:** 2 September 2026  
**Ruang lingkup:** frontend, backend, routing/menu, test, dan Docker runtime.

## Ringkasan

SEMAR memiliki fondasi AIMS yang luas, tetapi implementasinya belum konsisten dengan arsitektur target. Aplikasi dapat dijalankan lokal: Vite merespons pada port 3000 dan health backend pada port 4072 melaporkan database sehat. Frontend quality gate sudah hijau; backend test gate masih tertinggal dan sebagian modul masih berupa UI/service skeleton.

| Area | Status | Bukti utama |
| --- | --- | --- |
| Docker development | Implemented | Bind mount frontend/backend, Vite polling, Air, dependency cache |
| Dashboard navigation | Implemented | `/dashboard` canonical; legacy overview redirect; lima child dashboard |
| Frontend compile | Implemented | `pnpm typecheck` lulus dengan 0 error |
| Frontend tests | Implemented | 4 file test; 25 dari 25 test lulus |
| Backend runtime | Implemented | Server aktif dan `/health` mengembalikan database `up` |
| Backend tests | Blocked | Test repository/auth/RBAC lama tidak cocok dengan interface saat ini |
| Target server-state | Planned | TanStack Query belum ada di `package.json` |
| Modular monolith | Planned | Struktur masih layer-global, belum bounded context end-to-end |
| Calculation engine | Planned | Belum ada engine terversi dengan golden dataset |
| Transactional outbox | Planned | Belum ditemukan implementasi outbox/worker |

## Inventaris terverifikasi

- Frontend: React 19, TypeScript 5.7, Vite 6, React Router 7, Redux Toolkit, Axios, MUI 7, Tailwind 4.
- Frontend sekitar 267 file `.ts/.tsx` dan memiliki 4 file test (25 test).
- Backend: Go 1.24.2, Gin, PostgreSQL, Redis, GORM, dan SQLX.
- Backend sekitar 203 file Go dan 16 file test.
- Runtime dev: PostgreSQL 15, Redis, backend Air, frontend Vite.

Angka tersebut adalah snapshot, bukan KPI permanen.

## Temuan frontend

### F-01 — Quality baseline dipulihkan (P0, mitigated)

TypeScript, test, dan production build kini lulus. Drift API MUI, import/casing, state auth, dan kontrak banner diperbaiki. Debug/demo tanpa production import dikarantina dari TypeScript graph. Baseline ini harus dipertahankan dengan `pnpm check`.

### F-02 — Arsitektur data bercampur (P0)

Server state ditangani melalui Redux async thunk, state komponen, custom hook, dan service langsung. Terdapat beberapa pintu API/config (`config.ts`, `config/api.config.ts`, `services/apiClient.ts`, `utils/api.ts`). TanStack Query baru target, belum dependency aktif.

### F-03 — Navigation mempunyai lebih dari satu sumber (P0)

Menu berasal dari database dan fallback JSON, sementara route didefinisikan terpisah. Sebelum perbaikan terakhir, seed menu lama tetap hidup pada database existing. Kontrak canonical sekarang `/dashboard`, tetapi perlu contract test agar drift tidak berulang.

### F-04 — Design system belum tunggal (P1)

MUI, Tailwind, Emotion, serta ikon MUI/Lucide dipakai tanpa token dan ownership tegas. Campuran ini menghasilkan type/import drift dan perilaku layout tidak konsisten.

### F-05 — Diagnostic surface besar (P1)

Folder debug, demo, duplicate auth implementation, dan komponen eksperimental ikut TypeScript graph. Setiap bagian harus diklasifikasikan sebagai production, development-only, quarantine, atau dihapus setelah import graph diverifikasi.

## Temuan backend

### B-01 — Dua jalur database (P0)

`main.go` membuka SQLX melalui connector dan GORM terpisah untuk migration/seeding. Repository terbagi antara GORM dan SQLX. Transaksi lintas repository sulit, pool ganda, dan lifecycle lebih rumit.

### B-02 — Kontrak test tertinggal (P0)

`go test ./...` gagal karena constructor dan interface repository/auth/RBAC pada test tidak mengikuti kode produksi. Package produksi dikompilasi Air, tetapi suite belum menjadi safety net.

### B-03 — REST contract belum konsisten (P0)

Sebagian route plural lowercase, sedangkan aset masih memakai `/api/v1/assets/Asset`. Client mengikuti bentuk campuran. Normalisasi memerlukan compatibility window.

### B-04 — Isolasi tenant tersebar (P0)

Banyak query menyertakan `tenant_id`, tetapi enforcement manual di middleware/service/repository dan belum dibuktikan negative cross-tenant test konsisten. Klaim “tenant-safe” belum dapat dibuat.

### B-05 — Batas domain belum nyata (P1)

Kode dikelompokkan per layer global. Asset, inspection, maintenance, compliance, risk, IAM, dan dashboard belum memiliki boundary package serta dependency rule tegas.

### B-06 — Kemampuan AIMS inti masih gap (P1)

Calculation engine terversi, provenance formula, golden dataset, transactional outbox, dan ingestion governance masih target. Analytics yang ada tidak sama dengan mesin engineering auditable.

### B-07 — Logging keamanan dan operasional (P0, mitigated)

Audit menemukan authentication service mencatat password plaintext dan password hash, sementara debug CORS membanjiri healthcheck log. Logging rahasia sudah dihapus dan health/CORS noise dikurangi. Audit lanjutan tetap wajib untuk token, PII, request body, dan query parameter di seluruh logger.

Terdapat pula dua implementasi `LoggingMiddleware` di package berbeda; router menggunakan `app/middleware`, bukan duplikat di `app/api/middleware`. Konsolidasi middleware masuk cleanup backend agar perbaikan tidak lagi diterapkan ke file yang tidak aktif.

## Urutan perbaikan

1. Pulihkan test Go.
2. Konsolidasikan frontend ke satu API client dan state ownership.
3. Bekukan kontrak route/menu/API serta perluas contract test.
4. Konsolidasikan backend database lifecycle dan transaksi.
5. Migrasikan satu vertical slice Asset Registry end-to-end sebagai pola acuan.
6. Baru bangun bounded context berikutnya dan calculation engine.

## Quality gate minimum

- `pnpm exec tsc -p tsconfig.app.json --noEmit`
- `pnpm test -- --run`
- `pnpm build`
- `go test ./...`
- smoke test `/`, `/health`, login, `/dashboard`, dan menu user-tree
- negative tenant isolation test pada setiap endpoint data tenant

Hasil audit terakhir: gate compile/test belum seluruhnya lulus; fase stabilisasi belum selesai.
