# SEMAR Agent Execution Playbook

Dokumen ini adalah entry point untuk agent yang melanjutkan re-engineering SEMAR. Tujuannya menghindari audit ulang, perubahan acak, dan klaim selesai tanpa quality gate.

**Snapshot konteks:** 3 September 2026  
**Prioritas aktif:** FE-04 — AIMS Workflows: Inspection Vertical Slice.

---

## 1. Instruksi mulai untuk agent berikutnya

Baca berurutan, jangan membaca semua file repository terlebih dahulu:

1. Dokumen ini ([AGENT_EXECUTION_PLAYBOOK.md](./AGENT_EXECUTION_PLAYBOOK.md)).
2. [Codebase Analysis](./CODEBASE_ANALYSIS.md) untuk blocker aktual.
3. [Frontend Re-Engineering Plan](./FRONTEND_REENGINEERING_PLAN.md) untuk target frontend.
4. [Backend Re-Engineering Plan](./BACKEND_REENGINEERING_PLAN.md) hanya jika task menyentuh backend.
5. [Development Workflow](./DEVELOPMENT_WORKFLOW.md) untuk command Docker.

Lalu jalankan pemeriksaan runtime awal:

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

---

## 2. Kondisi yang sudah implemented

- **Docker stack**: Docker dev stack dengan Vite dan Air polling pada bind mount Windows. Docker CLI dan Compose tersedia pada Windows user profile.
- **Navigasi & Dashboard**:
  - `/dashboard` adalah canonical dashboard route.
  - Root module landing route aktif untuk 7 modul utama: `/assets`, `/inspection`, `/risk`, `/analytics`, `/maintenance`, `/compliance`, `/admin`.
  - Primary navigation hanya memuat modul resmi AIMS; utility route `/content/*` tetap tersedia untuk deep link/admin.
  - Landing card difilter terhadap user menu tree runtime (permission + visibility + disabled), superuser bypass, dan empty state.
- **Frontend Quality Gate (FE-01)**:
  - TypeScript 0 error (`pnpm typecheck`), Vitest setup dengan auto-cleanup dan polyfill, produksi build bersih (`pnpm build`).
  - Debug/demo collectors yang tidak dipakai produksi telah dikarantina.
- **API Client & TanStack Query (FE-02)**:
  - Satu API client kanonikal pada `frontend/src/shared/api/client.ts` dengan interceptor auth Bearer, `X-Tenant-ID`, `X-Request-ID`, `X-CSRF-TOKEN`, auto-refresh queue 401 concurrent, dan `NormalizedApiError`.
  - `@tanstack/react-query@5.102.8` terpasang secara resmi dengan `QueryClientProvider` pada `src/App.tsx`.
  - Query-key factory terpusat di `src/shared/api/queryKeys.ts`.
  - Asset Registry (`/assets/registry`) dimigrasikan penuh ke TanStack Query hooks; Redux asset server-state (`assetSlice.ts`) dihapus.
- **Route Manifest & Navigation Contract (FE-03)**:
  - Master Typed Route Manifest (`frontend/src/config/route-manifest.ts`) untuk 60+ rute SEMAR.
  - `module-destinations.ts` diturunkan langsung dari `ROUTE_MANIFEST`.
  - Access guard murni `checkRouteAccess` melindungi deep link ke rute tersembunyi/tidak aktif dan me-redirect ke `/access-inactive`.
  - 8 contract tests di `route-manifest.test.ts` dan 10 navigation tests di `navigation-guard.test.tsx` lulus 100%. Total test frontend: 9 file, 60/60 tests lulus.
- **Backend Test Safety Net (BE-00)**:
  - `docker exec semar-backend go test ./...` lulus 100% (exit code 0) pada seluruh 4 paket (`middleware`, `repositories`, `services`, `utils`).
  - Unit test `cache_test.go`, `jwt_test.go`, `auth_service_test.go`, dan `user_repository_test.go` diselaraskan dengan arsitektur & interface produksi.
  - Database integration test `rbac_middleware_integration_test.go` diisolasi dengan tag `//go:build integration`; pure unit test baru dibangun di `rbac_middleware_test.go`.
  - Audit `go vet` bersih dari duplikasi error check, logger non-constant format, dan format specifier typo.

---

## 3. Blocker yang jangan ditemukan ulang

- `go test ./...` **SUDAH HIJAU**: Seluruh 4 paket backend lulus unit test per 3 September 2026.
- TanStack Query **SUDAH MENJADI DEPENDENCY RESMI**: Versi 5.102.8 terpasang di `frontend/package.json` dan telah digunakan di Asset Registry.
- Backend production code **LULUS KOMPILASI**: `go build ./...` dan container runtime sehat (`/health` mengembalikan `database: up`).
- **Sisa pekerjaan arsitektur riil**:
  1. Backend masih menggunakan koneksi terpisah antara GORM dan SQLX tanpa satu `*sql.DB` lifecycle owner (target BE-01).
  2. Modul frontend di luar Asset Registry (Inspection, Risk, Maintenance, Compliance) masih memanggil Redux/legacy API client (target FE-04 s/d FE-06).

---

## 4. Aturan & Konvensi Rekayasa (Engineering Rules & Constraints)

Setiap agent yang mengeksekusi task wajib mematuhi 6 aturan berikut:

### Rule 1: Vertical Slice Migration (Anti Big-Bang Rewrite)
- Dilarang memindahkan atau menulis ulang seluruh modul frontend atau backend sekaligus.
- Setiap slice modul (Asset &rarr; Inspection &rarr; Risk/RBI &rarr; Maintenance &rarr; Compliance) harus diselesaikan tuntas secara vertikal: DTO/Domain &rarr; Repository/Query &rarr; Service/Hooks &rarr; UI/Validation &rarr; Unit/Integration Tests &rarr; Hapus legacy code.

### Rule 2: Multi-Tenancy & Zero-Trust Tenant Boundary
- `tenant_id` **wajib** diekstraksi dari klaim JWT yang terverifikasi pada context backend (`c.Get("tenant_id")`).
- Backend **dilarang** mempercayai `tenant_id` yang dikirim dari payload request client (body, query params, atau custom client header) dari non-superuser.
- Setiap query database untuk data tenant-scoped **wajib** menyertakan filter `tenant_id`.
- Setiap endpoint mutasi/baca baru **wajib** memiliki negative cross-tenant test (memastikan Tenant A ditolak dengan 403/404 saat mencoba mengakses/memodifikasi data Tenant B).

### Rule 3: Frontend State Ownership (TanStack Query vs Redux)
- Seluruh *server-state* (data API, caching, loading/error states, pagination, dynamic filters) **wajib** dikelola oleh TanStack Query (`@tanstack/react-query`) menggunakan query keys terpusat dari `src/shared/api/queryKeys.ts`. Dilarang menyimpan data server di Redux!
- Redux Toolkit strictly dibatasi hanya untuk *pure client-side ephemeral state* (misal: UI preferences, sidebar collapse toggle, active modal identifier).
- Seluruh pemanggilan network wajib melalui `src/shared/api/client.ts` (`apiClient`) untuk menjamin token auto-refresh, CSRF token attachment, tenant header injection, dan error normalization (`NormalizedApiError`).

### Rule 4: Backend Database Lifecycle (Single Pool Ownership)
- Aplikasi hanya memiliki **satu** `*sql.DB` connection pool yang dikonfigurasi secara eksplisit (MaxOpenConns, MaxIdleConns, ConnMaxLifetime, ConnMaxIdleTime) via `config.Config`.
- GORM (`*gorm.DB`) dan SQLX (`*sqlx.DB`) wajib membungkus underlying `*sql.DB` pool yang persis sama selama masa transisi arsitektur. Dilarang membuka koneksi baru di luar composition root (`main.go`).
- Operasi multi-mutasi antar-repository wajib menggunakan Transaction Manager interface (`database.TransactionManager`).

### Rule 5: Quality Gate Non-Negotiable
Setiap task wajib memenuhi quality gate berikut sebelum handoff:
- **Frontend Gate**:
  ```powershell
  docker exec semar-frontend pnpm typecheck
  docker exec semar-frontend pnpm test:run
  docker exec semar-frontend pnpm build
  ```
  (Harus: 0 TypeScript errors, 100% tests lulus, production build exit 0).
- **Backend Gate**:
  ```powershell
  docker exec semar-backend go test ./...
  docker exec semar-backend go vet ./...
  ```
  (Harus: 100% packages pass, go vet bersih).
- **Runtime Health Gate**:
  ```powershell
  curl.exe -s http://localhost:4072/health
  ```
  (Harus mengembalikan: `{"database":"up","status":"healthy"}`).

### Rule 6: Dokumentasi Faktual & Handoff Wajib
- Dilarang membuat klaim "all errors fixed" atau "done" tanpa mencantumkan hasil eksekusi command aktual.
- Setiap task yang selesai wajib mencatatkan perubahan faktual pada [docs/changelogs.md](./changelogs.md).
- Checklist task dan Section 8 (Handoff terbaru) di dokumen ini wajib diperbarui sebelum turn berakhir.

---

## 5. Work Queue Berurutan

### FE-00 — Stabilkan module landing pages
Status: **complete** (lihat catatan Section 2)

### FE-01 — Pulihkan frontend quality gate
Status: **complete** (TypeScript 0 error, 25 test lulus, build sukses)

### FE-02 — Satukan API client dan state ownership
Status: **complete** (TanStack Query terpasang, Asset Registry vertical slice pertama, Redux assetSlice dihapus)

### FE-03 — Permission-aware navigation contract
Status: **complete** (Route manifest typed, 60+ rute dipetakan, 8 contract tests, 10 navigation tests lulus)

### BE-00 — Pulihkan backend tests
Status: **complete** (`go test ./...` lulus 100% pada middleware, repositories, services, utils)

---

### BE-01 — Satu database lifecycle & connection pool management (Fase 1)
Status: **complete** (single *sql.DB pool konsolidasi untuk GORM dan SQLX)

- [x] Jadikan satu `*sql.DB` sebagai pool owner tunggal di `backend/app/database/connection.go`.
- [x] Bungkus GORM dan SQLX di atas pool `*sql.DB` yang sama, mengeliminasi pool terpisah menjadi 1 pool terpadu.
- [x] Konfigurasikan pool limits (`MaxOpenConns`, `MaxIdleConns`, `ConnMaxLifetime`, `ConnMaxIdleTime`) melalui `config.Config`.
- [x] Hentikan global unmanaged DB state; inject database instances langsung dari composition root (`main.go`).
- [x] Buat abstraksi Transaction Manager lintas repository (`database.TransactionManager`) untuk atomic mutations.
- [x] Verifikasi graceful shutdown: koneksi pool tertutup bersih saat container menerima signal SIGTERM/SIGINT.

Gate:
```powershell
docker exec semar-backend go test ./...
curl.exe -s http://localhost:4072/health
```
Lulus 100% pada 3 September 2026.

---

### FE-04 — AIMS Workflows: Inspection Vertical Slice
Status: **ready to execute** (baseline FE-02 & FE-03 selesai)

1. Definisikan typed models & DTOs untuk inspeksi di `frontend/src/features/inspection/types.ts` (Inspection Plan, Work Order, Findings, Measurements).
2. Daftarkan query keys di `src/shared/api/queryKeys.ts` (`inspectionKeys`).
3. Buat TanStack Query hooks di `src/features/inspection/api/inspectionQueries.ts` (`useInspectionPlans`, `useInspectionFindings`, `useInspectionWorkOrders`, `useCreateInspectionFinding`, dll.).
4. Migrasikan halaman inspeksi (`/inspection/plans`, `/inspection/execution`, `/inspection/findings`) ke canonical hooks dan `apiClient`.
5. Terapkan feedback UX: loading skeletons, error states dengan retry button, dan optimistik / auto-invalidation cache saat submit finding.
6. Hubungkan dengan `ROUTE_MANIFEST` dan hak akses (`inspection:read`, `inspection:create`, `inspection:approve`).
7. Tambahkan unit & query tests di `src/features/inspection/api/inspectionQueries.test.tsx`.

Gate:
```powershell
docker exec semar-frontend pnpm typecheck
docker exec semar-frontend pnpm test:run
docker exec semar-frontend pnpm build
```

---

### BE-02 — API Contract Normalization & Multi-Tenant Isolation Layer (Fase 2)
Status: **queued** (setelah BE-01)

1. Standarisasi middleware isolasi tenant: enforce `tenant_id` diambil dari context JWT tervalidasi; tolak manipulasi `tenant_id` dari client body/query.
2. Bangun negative cross-tenant test suite: pastikan Tenant A ditolak (403/404) saat mencoba membaca/mengubah aset, inspeksi, atau user milik Tenant B.
3. Standarisasi JSON API response envelope dan error format (`utils.ApiError`, structured validation errors, correlation ID).
4. Standarisasi parameter pagination (`page`, `page_size`, `sort_by`, `order`) secara seragam di seluruh handler list.

Gate:
```powershell
docker exec semar-backend go test ./...
```

---

### FE-05 — AIMS Workflows: Risk & Integrity Assessment (RBI / Corrosion)
Status: **queued** (setelah FE-04)

1. Migrasikan modul Risk Assessment (`/risk/matrix`, `/risk/assessment`, `/risk/corrosion-analysis`, `/risk/rbi`) ke TanStack Query.
2. Daftarkan `riskKeys` pada query-key factory terpusat.
3. Terapkan validasi ketat satuan rekayasa (mm, mpy, mils/yr, bar, Celsius) sebelum pengiriman ke backend.
4. Tampilkan visualisasi Risk Matrix 5x5 interaktif dengan indikasi high/medium/low risk berbasis data API.
5. Sajikan metadata provenance kalkulasi (formula version, timestamp kalkulasi, status approval engineer).
6. Tambahkan unit tests untuk risk calculation presentation dan input converters.

Gate:
```powershell
docker exec semar-frontend pnpm typecheck
docker exec semar-frontend pnpm test:run
docker exec semar-frontend pnpm build
```

---

### BE-03 — Vertical Slice Asset Domain Boundary (Fase 3)
Status: **queued** (setelah BE-02)

1. Rekayasa ulang modul aset ke boundary yang modular: Site &rarr; Unit &rarr; Asset/Equipment &rarr; Component &rarr; Inspection Point.
2. Satukan vocabulary dan glosarium: hilangkan inkonsistensi antara istilah `asset` dan `equipment` pada database dan API.
3. Terapkan optimistic locking (`version` column) pada aset untuk mencegah concurrent overwrite pada data rekayasa sensitif.
4. Implementasikan audit trail logging otomatis untuk setiap mutasi status aset.

Gate:
```powershell
docker exec semar-backend go test ./...
```

---

### FE-06 — AIMS Workflows: Maintenance & Compliance
Status: **queued** (setelah FE-05)

1. Migrasikan modul Maintenance (`/maintenance/work-orders`, `/maintenance/schedule`) dan Compliance (`/compliance/audit-trail`, `/compliance/statutory-certificates`).
2. Daftarkan `maintenanceKeys` dan `complianceKeys` pada query-key factory.
3. Integrasikan upload file bukti inspeksi dan sertifikat statutori melalui `apiClient` dengan progress bar dan validasi format (PDF, PNG, JPG).
4. Tambahkan unit & component tests untuk workflow approval sertifikat dan status jadwal pemeliharaan.

Gate:
```powershell
docker exec semar-frontend pnpm typecheck
docker exec semar-frontend pnpm test:run
docker exec semar-frontend pnpm build
```

---

### BE-04 — Deterministic Calculation Engine (Fase 4)
Status: **queued** (setelah BE-03)

1. Buat paket kalkulasi deterministik murni tanpa efek samping untuk Corrosion Rate, Remaining Safe Life, dan Risk Ranking (mengikuti panduan API 581 / API 570).
2. Simpan rekam jejak (provenance) kalkulasi: formula/ruleset version, raw inputs snapshot, satuan, output, warnings, timestamp, dan identitas engineer penyetuju.
3. Bangun golden test suite komprehensif yang menguji boundary conditions, zero-division, limit ketebalan minimum (t_min), dan konversi satuan.

Gate:
```powershell
docker exec semar-backend go test ./...
```

---

### FE-07 — Real-Time Telemetry & Live Asset Health (IoT/SSE/WebSocket)
Status: **queued** (setelah FE-06)

1. Standardisasi koneksi real-time untuk pembacaan sensor IoT, alarm getaran/suhu, dan live health status.
2. Terapkan heartbeat, auto-reconnect backoff, dan error recovery pada WebSocket / SSE client.
3. Hubungkan stream data langsung ke TanStack Query cache (`queryClient.setQueryData`) untuk pembaruan komponen live metric tanpa polling seluruh halaman.

Gate:
```powershell
docker exec semar-frontend pnpm typecheck
docker exec semar-frontend pnpm test:run
docker exec semar-frontend pnpm build
```

---

### BE-05 — Transactional Outbox & Event-Driven Integrations (Fase 5)
Status: **queued** (setelah BE-04)

1. Implementasikan pola Transactional Outbox: simpan domain events (`AssetCreated`, `InspectionFindingCritical`, `RiskRecalculated`) dalam transaksi SQL yang sama dengan mutasi bisnis.
2. Bangun background worker idempotent dengan interval polling, exponential backoff, status tracking (`pending`, `published`, `failed`), dan dead-letter queue.
3. Lindungi endpoint integrasi pihak ketiga (ERP/CMMS) agar mengonsumsi public events, bukan mengakses tabel domain internal langsung.

Gate:
```powershell
docker exec semar-backend go test ./...
```

---

### FE-08 — Cross-Route Authenticated E2E Test Suite (Playwright)
Status: **queued** (setelah FE-07 & BE-05)

1. Siapkan infrastruktur Playwright offline/containerized untuk pengujian end-to-end multi-route.
2. Implementasikan auth fixtures dan user journey kritis:
   - Skenario 1: Login &rarr; Deep link ke rute terproteksi &rarr; Verifikasi akses menu.
   - Skenario 2: Asset Registry &rarr; Create Asset &rarr; Filter & Search &rarr; View Detail &rarr; Edit Asset.
   - Skenario 3: Inspection &rarr; Buat Finding baru &rarr; Verifikasi update status di dashboard.
   - Skenario 4: Role-based navigation guard &rarr; User biasa mencoba akses `/admin` &rarr; Terhalang 403 / Redirect.

Gate:
```powershell
docker exec semar-frontend pnpm exec playwright test
```

---

## 6. Pola Kerja Satu Task

Untuk setiap task, agent harus:

1. Nyatakan task ID dari work queue (misal: `BE-01` atau `FE-04`).
2. Baca hanya file hotspot dan dependency langsung (hindari audit massal).
3. Catat baseline command dan kondisi awal yang relevan.
4. Implementasi perubahan terkecil yang menutup acceptance criteria (vertical slice).
5. Jalankan targeted check, kemudian full quality gate yang dipersyaratkan pada Rule 5.
6. Verifikasi runtime melalui Docker (container logs dan `/health`).
7. Update `docs/changelogs.md` dan checklist playbook.
8. Berikan handoff dengan format wajib di bawah.

---

## 7. Format Handoff Wajib

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

---

## 8. Handoff Terbaru

```text
Task ID: BE-01
Outcome: Mengkonsolidasikan seluruh koneksi database backend ke dalam satu lifecycle dan satu connection pool *sql.DB terpadu melalui backend/app/database/connection.go. Mengeliminasi 3 pool terpisah (GORM seeder, GORM router, SQLX repository) menjadi 1 pool yang dibungkus bersama oleh adapter GORM dan SQLX. Konfigurasi limit pool (MaxOpenConns 25, MaxIdleConns 10, ConnMaxLifetime, ConnMaxIdleTime 5m) diterapkan secara eksplisit dan divalidasi dengan ping/retry. Composition root di backend/main.go dan backend/app/api/routes/router.go diselaraskan untuk meng-inject database holder dan shared GORM/SQLX adapters tanpa duplicate connect. Ditambahkan abstraksi database.TransactionManager dan unit test connection_test.go (memverifikasi stats, commit transaksi, rollback pada error, dan graceful close). Seluruh paket test backend lulus 100% dan runtime health check database up.
Files changed: backend/app/database/connection.go; backend/app/database/connection_test.go; backend/app/repositories/db.go; backend/main.go; backend/app/api/routes/router.go; docs/AGENT_EXECUTION_PLAYBOOK.md; docs/changelogs.md.
Validation passed: `docker exec semar-backend go test ./...` exit 0 (database 0.143s, middleware 0.068s, repositories 0.081s, services 1.060s, utils cached); `docker exec semar-backend go vet ./...` exit 0 (0 error/warning); `curl.exe -s http://localhost:4072/health` mengembalikan `{"database":"up","status":"healthy"}`; frontend 200 OK.
Validation still failing: Playwright cross-route test suite akan diimplementasikan secara terstruktur pada task FE-08.
Known risks: Tidak ada. Tidak ada perubahan struktur query bisnis; seluruh repository dan handler tetap menerima tipe DB yang sesuai via dependency injection.
Exact next task: FE-04 — AIMS Workflows: Inspection Vertical Slice (Memigrasikan /inspection/* ke TanStack Query, queryKeys, typed DTOs, permission awareness, dan Vitest test suite).
Do not redo: FE-00, FE-01, FE-02, FE-03, BE-00, atau BE-01.
```
