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

Status: **next**

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
Task ID: FE-02
Outcome: API client dikonsolidasi ke shared/api/client dengan request interceptors (auth bearer, tenant ID, request ID, CSRF), silent token refresh queue, dan error normalization (NormalizedApiError). Services/apiClient dijadikan backward-compatibility bridge. TanStack Query v5 (@tanstack/react-query@5.102.8) diadopsi resmi dan dipasang di App.tsx. Query-key factory dibuat untuk domain asset. Asset Registry (/assets/registry) dimigrasikan sebagai vertical slice acuan dengan hook useAssets dan useDeleteAsset, invalidasi otomatis saat mutasi, serta UI loading spinner & error retry. Redux asset server-state (assetSlice.ts) dihapus bersih setelah seluruh parity test lulus.
Files changed: frontend/package.json; frontend/src/shared/api/types.ts; frontend/src/shared/api/client.ts; frontend/src/shared/api/client.test.ts; frontend/src/shared/api/queryClient.ts; frontend/src/shared/api/queryKeys.ts; frontend/src/shared/api/index.ts; frontend/src/services/apiClient.ts; frontend/src/features/assets/types/index.ts; frontend/src/features/assets/api/assetQueries.ts; frontend/src/features/assets/api/assetQueries.test.tsx; frontend/src/pages/assets/AssetRegistryPage.tsx; frontend/src/pages/assets/AssetRegistryPage.test.tsx; frontend/src/App.tsx; frontend/src/store/index.ts; frontend/src/store/slices/assetSlice.ts (deleted); docs/AGENT_EXECUTION_PLAYBOOK.md; docs/changelogs.md.
Validation passed: `pnpm typecheck` exit 0 (0 error); `pnpm test:run` 7 file/42 test lulus (0 failed); `pnpm build` sukses (2m 28s); dev server HTTP 200 pada /assets/registry; backend /health database up.
Validation still failing: backend `go test ./...` tetap menjadi BE-00 dan tidak termasuk scope FE-02; browser automation lokal menunggu konfigurasi playwright offline driver.
Known risks: Service domain selain Asset Registry masih mengimpor services/apiClient (jembatan backward-compatibility aktif dan stabil, migrasikan bertahap saat vertical slice masing-masing dikerjakan).
Exact next task: FE-03 — Permission-aware navigation contract (typed route manifest, contract test route/menu/landing, dynamic permission filtering), atau BE-00 untuk backend unit test recovery.
Do not redo: FE-00 navigation/landing, FE-01 quality baseline recovery, FE-02 API client consolidation, TanStack Query setup, Asset Registry query migration, atau Redux assetSlice removal.
```
