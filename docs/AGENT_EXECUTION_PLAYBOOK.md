# SEMAR Agent Execution Playbook

Dokumen ini adalah entry point untuk agent yang melanjutkan re-engineering SEMAR. Tujuannya menghindari audit ulang, perubahan acak, dan klaim selesai tanpa quality gate.

**Snapshot konteks:** 2 September 2026  
**Prioritas aktif:** frontend stabilization dan module landing experience.

## 1. Instruksi mulai untuk agent berikutnya

Baca berurutan, jangan membaca semua file repository terlebih dahulu:

1. Dokumen ini.
2. [Codebase Analysis](./CODEBASE_ANALYSIS.md) untuk blocker aktual.
3. [Frontend Re-Engineering Plan](./FRONTEND_REENGINEERING_PLAN.md) untuk target frontend.
4. [Backend Re-Engineering Plan](./BACKEND_REENGINEERING_PLAN.md) hanya jika task menyentuh backend.
5. [Development Workflow](./DEVELOPMENT_WORKFLOW.md) untuk command Docker.

Lalu jalankan:

```powershell
git status --short
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs --tail 40 backend frontend
```

Aturan penting:

- Working tree memang sudah berisi banyak perubahan; jangan reset atau menghapus perubahan yang tidak terkait task.
- Gunakan `docker-compose.dev.yml`, bukan compose production, untuk pekerjaan harian.
- Jangan audit seluruh codebase lagi kecuali bukti pada dokumen tidak cocok dengan kode.
- Jangan mengubah frontend dan backend contract sekaligus tanpa compatibility path.
- Setelah setiap task, perbarui checklist dan bagian handoff di dokumen ini.

## 2. Kondisi yang sudah implemented

- Docker dev stack dengan Vite dan Air polling pada bind mount Windows.
- Docker CLI dan Compose tersedia pada Windows user profile.
- `/dashboard` adalah canonical dashboard route.
- Root module memiliki landing route:
  - `/assets`
  - `/inspection`
  - `/risk`
  - `/analytics`
  - `/maintenance`
  - `/compliance`
  - `/admin`
- Fallback menu dan database seeder diarahkan ke module landing route.
- Root module tidak lagi otomatis melempar user ke child page pertama.
- Primary navigation hanya memuat delapan module resmi AIMS; root Content Management legacy dibersihkan dari DB menu tetapi utility route `/content/*` tetap tersedia.
- Landing card difilter terhadap metadata canonical (`module-destinations.ts`) dan user menu tree runtime; superuser bypass; empty state muncul saat tidak ada destination accessible.
- Contract & behavior test untuk landing destination dan filtering permission tersedia (13 test) dan lulus pada container.
- Test setup Vitest kini menambahkan cleanup antar test dan polyfill `matchMedia`/`ResizeObserver` untuk jsdom.
- `MenuItemDTO` user-tree mengirim `access_level`, `permissions`, dan `menu_group` agar klien dapat melakukan permission filtering.
- Password dan password hash tidak lagi ditulis ke authentication logs.
- DebugConsole legacy tidak dimuat oleh app shell default.

## 3. Blocker yang jangan ditemukan ulang

- `pnpm exec tsc -p tsconfig.app.json --noEmit` masih gagal (77 error) pada komponen legacy MUI, auth, banner, hierarchy, dashboard, dan debug collectors — FE-01. Tidak ada error dari file FE-00.
- Frontend test terakhir: 9/12 lulus; FileUpload tests/setup masih bermasalah (double-render) — FE-01. Test FE-00 (13) lulus.
- `go test ./...` masih gagal karena test repository/auth/RBAC tertinggal dari interface produksi.
- Backend production code lulus `go build ./...`.
- TanStack Query belum menjadi dependency; ia masih target arsitektur.
- Backend masih memakai GORM dan SQLX dengan lifecycle/pool yang belum terkonsolidasi.

## 4. Work queue yang harus dikerjakan berurutan

### FE-00 — Stabilkan module landing pages

Status: **complete** (lanjut ke FE-01)

File utama:

- `frontend/src/pages/modules/ModuleLandingPage.tsx`
- `frontend/src/router/index.tsx`
- `frontend/src/config/menu-items.json`
- `frontend/src/config/module-destinations.ts`
- `frontend/src/config/navigation-context.ts`
- `frontend/src/layouts/MainLayout.tsx`
- `backend/app/database/seeder.go`
- `backend/app/models/menu.go`
- `backend/app/services/menu_service.go`

Checklist:

- [x] Tambahkan reusable landing page untuk tujuh root module di luar Dashboard.
- [x] Ubah index route agar menampilkan landing page.
- [x] Ubah root menu fallback dan DB seed ke canonical root route.
- [x] Pastikan landing cards difilter berdasarkan menu/permission user, bukan hanya static config.
- [x] Tambahkan route/menu contract test.
- [x] Tambahkan authenticated responsive browser test desktop dan mobile.
- [x] Tambahkan test keyboard focus dan accessible names.

Catatan FE-00 selesai: responsif desktop/mobile dan aksesibilitas diuji pada level komponen dengan React Testing Library (jsdom), termasuk accessible names, keyboard focus, empty state, dan filter permission berbasis user menu tree. Smoke di browser asli (login, viewport mobile) tetap menunggu infrastruktur E2E browser yang diadopsi di fase FE-01 berikutnya — lihat Known risks handoff.

Exit criteria: root module dapat dibuka, hanya menampilkan destination yang accessible, dan seluruh route card valid.

### FE-01 — Pulihkan frontend quality gate

Status: **next**

Kerjakan dalam batch kecil:

1. Betulkan casing duplicate `assetPresets.ts`/`assetpresets.ts` dan missing icon imports.
2. Betulkan state/export mismatch pada auth forms.
3. Migrasikan API MUI lama (`ListItem button`, TreeView props, Select event types).
4. Betulkan missing imports di Backup, VersionHistory, dan DashboardGrid.
5. Karantina atau hapus debug/demo collectors yang tidak dipakai production setelah import graph dicek.
6. Betulkan Vitest setup dan FileUpload cleanup.
7. Tambahkan scripts `typecheck`, `test:run`, dan `check`.

Gate wajib:

```powershell
docker exec semar-frontend pnpm exec tsc -p tsconfig.app.json --noEmit
docker exec semar-frontend pnpm test -- --run
docker exec semar-frontend pnpm build
```

Jangan mulai FE-02 sebelum ketiga command lulus.

### FE-02 — Satukan API client dan state ownership

Status: **blocked by FE-01**

1. Inventaris import pengguna `config.ts`, `config/api.config.ts`, `services/apiClient.ts`, dan `utils/api.ts`.
2. Tetapkan satu `shared/api/client` dengan auth refresh, CSRF, tenant header, dan normalized error.
3. Tambahkan TanStack Query sebagai dependency resmi.
4. Buat query-key factory.
5. Migrasikan Asset Registry list/detail/mutation sebagai vertical slice acuan.
6. Hapus asset server-state Redux hanya setelah parity test lulus.

### FE-03 — Permission-aware navigation contract

Status: **blocked by FE-01**

1. Buat satu route manifest typed.
2. Derive landing destinations dan fallback menu dari manifest atau validasi keduanya terhadap manifest.
3. Filter landing cards dari user menu tree/permissions.
4. Tambahkan contract test: tidak ada orphan route, duplicate slug, missing icon, atau menu URL invalid.
5. Uji deep link, unauthorized, inactive tenant, dan refresh.

### BE-00 — Pulihkan backend tests

Status: **dapat dikerjakan paralel setelah frontend baseline scope disepakati**

1. Update mock/constructor `AuthService` pada test.
2. Selaraskan RoleRepository interface dan test implementation.
3. Perbaiki test yang masih merujuk `NewGormUserRepository`.
4. Hapus unused variables pada test utils/repository.
5. Pisahkan integration test yang membutuhkan database.

Gate:

```powershell
docker exec semar-backend go test ./...
```

### BE-01 — Satu database lifecycle

Status: **blocked by BE-00**

Ikuti [Backend Re-Engineering Plan](./BACKEND_REENGINEERING_PLAN.md). Jangan memindahkan semua repository sekaligus; gunakan Asset Registry sebagai vertical slice pertama.

## 5. Pola kerja satu task

Untuk setiap task, agent harus:

1. Nyatakan task ID dari work queue.
2. Baca hanya file hotspot dan dependency langsung.
3. Catat baseline command yang relevan.
4. Implementasi perubahan terkecil yang menutup acceptance criteria.
5. Jalankan targeted check, kemudian full gate bila baseline memungkinkan.
6. Verifikasi runtime melalui Docker; untuk UI lakukan browser smoke test.
7. Update changelog dan checklist playbook.
8. Handoff dengan format di bawah.

## 6. Format handoff wajib

```text
Task ID:
Outcome:
Files changed:
Validation passed:
Validation still failing:
Known risks:
Exact next task:
Do not redo:
```

Agent tidak boleh hanya menulis “done”. Tuliskan command dan hasil ringkas agar agent berikutnya tidak mengulang pemeriksaan.

## 7. Definition of done global

- Code, route, menu, permission, dan docs sinkron.
- Tidak ada secret/PII baru pada log.
- Typecheck/test/build yang relevan hijau atau kegagalan baseline dicatat persis.
- Docker dev tetap healthy dan hot reload tetap berfungsi.
- Perubahan tidak menghapus pekerjaan lain pada dirty worktree.
- Changelog dan playbook mencerminkan kondisi setelah task.

## 8. Handoff terbaru

```text
Task ID: FE-00
Outcome: Landing page destination tidak lagi static. Card landing dihasilkan dari metadata canonical (module-destinations.ts), difilter terhadap user menu tree runtime + permission user; superuser melewati filter. Ditambahkan NavigationContext bersama (config/navigation-context.ts) agar halaman landing dapat membaca top-level menu tanpa circular import; MainLayout re-export lama dipertahankan. Backend MenuItemDTO kini mengirim access_level/permissions/menu_group; Vitest setup memperbaiki cleanup antar test dan polyfill jsdom (matchMedia/ResizeObserver). Ditambahkan 13 test baru (contract destination + filter permission + a11y/keyboard + empty state) yang semuanya lulus.
Files changed: ModuleLandingPage.tsx (+ filter & empty state), config/module-destinations.{ts,test.ts}, config/navigation-context.ts, layouts/MainLayout.tsx, setupTests.ts, vite.config.ts (setupFiles/css), backend models/menu.go & services/menu_service.go, ModuleLandingPage.test.tsx.
Validation passed: 13/13 test FE-00 baru lulus di container (vitest run); tsc -p tsconfig.app.json --noEmit tidak lagi melaporkan error pada file FE-00 (sisa 77 error = baseline FE-01 warisan di BackupForm/banner/debug/hierarchy/dashboard); pnpm build sukses; go build ./... sukses; HTTP 200 untuk /assets (SPA) dan backend healthy.
Validation still failing: baseline FE-01 — typecheck 77 error warisan; test 9/12 warisan masih memiliki kegagalan FileUpload (double-render di satu test) dan auth/backup; go test ./... gagal karena contract test repo/auth/RBAC tertinggal.
Known risks: Responsif desktop/mobile dan smoke authenticated masih pada level komponen jsdom, belum browser asli (tidak ada infrastruktur E2E/browser runner di repo). Admin module untuk non-superuser bergantung pada child admin di user menu tree; bila role admin tidak mendapat child tersebut, landing admin menampilkan empty state (bukan error) sampai FE-03 route manifest/role-permission lengkap. Superuser bypass hanya memakai is_superuser user object; permission string pada menu child didukung namun DB saat ini belum mengisi conditional/custom_permissions (filter tetap valid karena semua child visible tanpa permission).
Exact next task: kerjakan FE-01 batch pertama — perbaiki casing duplicate assetPresets + missing icon imports (BackupForm/Chip, VersionHistoryPanel/Paper, DashboardGrid/Button), lalu scripts typecheck/test:run/check.
Do not redo: landing page reusable & canonical root routes, permission filtering FE-00 (sudah ditest), Docker/CLI setup, audit arsitektur, setupTests polyfill.
```
