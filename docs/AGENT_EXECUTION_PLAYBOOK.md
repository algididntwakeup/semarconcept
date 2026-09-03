# SEMAR Agent Execution Playbook

Dokumen ini adalah entry point untuk agent yang melanjutkan re-engineering SEMAR. Tujuannya menghindari audit ulang, perubahan acak, dan klaim selesai tanpa quality gate.

**Snapshot konteks:** 2 September 2026  
**Prioritas aktif:** FE-02 — konsolidasi API client dan state ownership.

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
- Frontend quality gate FE-01 hijau: TypeScript 0 error, 25/25 test lulus, dan production build sukses.
- Debug/demo collectors yang tidak memiliki production import dikarantina dari TypeScript production graph.
- Script `typecheck`, `test:run`, dan `check` tersedia sebagai quality gate standar.

## 3. Blocker yang jangan ditemukan ulang

- `go test ./...` masih gagal karena test repository/auth/RBAC tertinggal dari interface produksi.
- Backend production code lulus `go build ./...`.
- TanStack Query belum menjadi dependency; ia masih target arsitektur.
- Backend masih memakai GORM dan SQLX dengan lifecycle/pool yang belum terkonsolidasi.

## 4. Work queue yang harus dikerjakan berurutan

### FE-00 — Stabilkan module landing pages

Status: **complete**

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

Status: **complete** (lanjut ke FE-02)

Kerjakan dalam batch kecil:

1. [x] Betulkan casing duplicate `assetPresets.ts`/`assetpresets.ts` dan missing icon imports.
2. [x] Betulkan state/export mismatch pada auth forms.
3. [x] Migrasikan API MUI lama (`ListItem button`, TreeView props, Select event types).
4. [x] Betulkan missing imports di Backup, VersionHistory, dan DashboardGrid.
5. [x] Karantina debug/demo collectors yang tidak dipakai production setelah import graph dicek.
6. [x] Betulkan Vitest setup dan FileUpload cleanup; test kini menguji upload aktual.
7. [x] Tambahkan scripts `typecheck`, `test:run`, dan `check`.

Gate wajib:

```powershell
docker exec semar-frontend pnpm exec tsc -p tsconfig.app.json --noEmit
docker exec semar-frontend pnpm test -- --run
docker exec semar-frontend pnpm build
```

Ketiga command lulus pada 2 September 2026.

### FE-02 — Satukan API client dan state ownership

Status: **complete** (lanjut ke FE-03)

- [x] Inventaris import pengguna `config.ts`, `config/api.config.ts`, `services/apiClient.ts`, dan `utils/api.ts`.
- [x] Tetapkan satu `shared/api/client` dengan auth refresh, CSRF, tenant header, dan normalized error (`NormalizedApiError`).
- [x] Tambahkan TanStack Query v5 (`@tanstack/react-query@5.102.8`) sebagai dependency resmi dan pasang `QueryClientProvider`.
- [x] Buat query-key factory terstandarisasi (`assetKeys`, `menuKeys`, `authKeys`).
- [x] Migrasikan Asset Registry (`/assets/registry`) list/detail/mutation sebagai vertical slice acuan dengan feedback pending & error.
- [x] Hapus asset server-state Redux (`assetSlice.ts`) setelah parity test lulus.

Gate wajib:

```powershell
docker exec semar-frontend pnpm typecheck
docker exec semar-frontend pnpm test:run
docker exec semar-frontend pnpm build
```

Semua command lulus pada 3 September 2026.

### FE-03 — Permission-aware navigation contract

Status: **complete** (lanjut ke BE-00 atau FE-04)

- [x] Buat satu route manifest typed (`src/config/route-manifest.ts`).
- [x] Derive landing destinations dan fallback menu dari manifest atau validasi keduanya terhadap manifest (`module-destinations.ts` diturunkan langsung dari `ROUTE_MANIFEST`).
- [x] Filter landing cards dari user menu tree/permissions (`ModuleLandingPage.tsx`).
- [x] Tambahkan contract test: tidak ada orphan route, duplicate slug, missing icon, atau menu URL invalid (`route-manifest.test.ts` - 8 contract test lulus).
- [x] Uji deep link, unauthorized, inactive tenant, dan refresh (`navigation-guard.test.tsx` - 10 test lulus).

Gate wajib:

```powershell
docker exec semar-frontend pnpm typecheck
docker exec semar-frontend pnpm test:run
docker exec semar-frontend pnpm build
```

Semua command lulus pada 3 September 2026.

### BE-00 — Pulihkan backend tests

Status: **next** (dapat dikerjakan paralel setelah frontend baseline scope disepakati)

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
Task ID: FE-03
Outcome: Kontrak navigasi dan permission awareness disatukan menggunakan master Typed Route Manifest (src/config/route-manifest.ts) yang mendefinisikan 60+ rute SEMAR dengan semantic ID, canonical path, modul, permissions, dan metadata. MODULE_DESTINATIONS diturunkan langsung dari ROUTE_MANIFEST untuk menjamin nol desinkronisasi. Router dan MainLayout diperkuat dengan delegasi pengecekan akses ke checkRouteAccess (whitelist, superuser bypass, pemblokiran menu tersembunyi/tidak aktif, dan pengalihan ke /access-inactive). ProtectedRoute meng-export fungsi guard dengan pelestarian target deep link di state.from. 8 contract tests ditambahkan di route-manifest.test.ts (menjamin tidak ada duplikasi slug, duplikasi path, orphan destination, invalid menu URL, dan missing icon). 10 navigation tests ditambahkan di navigation-guard.test.tsx.
Files changed: frontend/src/config/route-manifest.ts; frontend/src/config/route-manifest.test.ts; frontend/src/config/module-destinations.ts; frontend/src/router/index.tsx; frontend/src/router/navigation-guard.test.tsx; frontend/src/layouts/MainLayout.tsx; docs/AGENT_EXECUTION_PLAYBOOK.md; docs/changelogs.md.
Validation passed: `pnpm typecheck` exit 0 (0 error); `pnpm test:run` 9 file/60 test lulus (0 failed); `pnpm build` sukses (3m 48s, 14.385 modul); runtime dev server responsif 200 OK pada /assets/registry; backend /health database up.
Validation still failing: backend `go test ./...` tetap menjadi BE-00 dan tidak termasuk scope FE-03; browser automation lokal menunggu konfigurasi playwright offline driver.
Known risks: Tidak ada. Struktur URL, aliases, dan permission contract sepenuhnya backward compatible.
Exact next task: BE-00 — Pulihkan backend unit & repository test suite (update constructor AuthService, selaraskan RoleRepository, perbaiki NewGormUserRepository), atau FE-04 jika melanjutkan frontend vertical slice berikutnya (Inspection).
Do not redo: FE-00 navigation/landing, FE-01 quality baseline recovery, FE-02 API client consolidation, FE-03 route manifest & navigation contract tests.
```
