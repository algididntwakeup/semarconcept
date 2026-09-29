# SEMAR Asset Management Re-Engineering Plan

**Discovery snapshot:** 3 September 2026 (sebelum SAAS-01)
**Status:** discovery selesai; SAAS-01 selesai; AM-01 adalah task berikutnya. Asset Management end-to-end belum production-complete.
**Prioritas produk:** Asset Management menjadi vertical slice utama sebelum Risk/RBI dan perluasan modul lain.

## 1. Keputusan utama

SEMAR belum dapat disebut Asset Management production-ready, SaaS multitenant-ready, atau compliant terhadap ISO 55001. Yang tersedia saat ini adalah fondasi UI dan CRUD parsial. Urutan pengembangan harus dibalik: amankan tenant boundary dan kontrak API terlebih dahulu, lalu bangun Asset Registry, Hierarchy, Technical Data, dan Documents sebagai satu vertical slice yang nyata dari frontend sampai database.

ISO 55000/55001 bukan spesifikasi tabel atau daftar field. Keduanya menjadi kerangka governance, lifecycle, value, risk, objective, dan decision-making. Model data SEMAR harus memakai lapisan standar berikut:

| Lapisan | Acuan | Pengaruh ke produk |
| --- | --- | --- |
| Management system | [ISO 55000:2024](https://www.iso.org/standard/83053.html), [ISO 55001:2024](https://committee.iso.org/sites/tc251/home/projects/published/iso-55001.html), ISO 55002:2018 | lifecycle, value, objective, decision criteria, risk/opportunity, assurance, evidence |
| Asset data governance | [ISO 55013:2024](https://www.iso.org/standard/82455.html) | ownership, source, quality, usefulness, security, version, review, dan provenance data |
| Structure dan designation | [IEC 81346-1:2022](https://webstore.iec.ch/en/publication/64021), [IEC 81346-2:2019](https://webstore.iec.ch/en/publication/29181) | multiple hierarchy aspects, class codes, stable reference designation, relasi objek–dokumen |
| Reliability/maintenance overlay | [ISO 14224:2016](https://www.iso.org/standard/64076.html) | taxonomy equipment, failure, consequence, maintenance action/resource/downtime untuk petroleum, petrochemical, dan natural gas |
| Records/document control | [ISO 15489-1:2016](https://committee.iso.org/sites/tc46sc11/home/projects/published/iso-15489-records-management.html) | capture, metadata, revision, status, retention, disposal, access, dan audit record |
| Integrity/RBI overlay | API RP 580/581 dan equipment-specific codes | baru dipakai untuk ruleset kalkulasi setelah scope industri, lisensi standar, dan SME approval ditetapkan |

Catatan penting:

- ISO 14224 tidak universal untuk semua industri dan tidak mendefinisikan datasheet lengkap atau metode kalkulasi. Aktifkan sebagai `industry profile`, bukan hardcode global.
- API RP 580 menjelaskan elemen program RBI; API RP 581 adalah metodologi kuantitatif. Keduanya bukan pengganti registry, hierarchy, atau data governance.
- Tulisan “based on ISO” pada UI/type comment tidak menjadi evidence compliance. Klaim compliance hanya boleh muncul setelah requirement mapping, control evidence, internal review, dan assessment.

## 2. Benchmark Cenosco yang relevan

Cenosco IMS adalah benchmark Asset **Integrity** Management, bukan sekadar asset registry. Berdasarkan [situs dan suite resminya](https://cenosco.com/asset-integrity-software), pola produknya adalah:

- satu platform cloud yang menyatukan integrity, reliability, functional safety, dan compliance;
- modul berbasis equipment/process: pressure equipment, RCM, SIS, pipeline/subsea, flange, civil, dan field work;
- decision workflow dan engineering method seperti RBI, corrosion, FFS, inspection planning, dan guided RCM;
- data lifecycle lintas site serta integrasi dengan SAP, Maximo, EAM, DMS, dan process historian;
- auditability, offline/mobile work, data migration, dan knowledge preservation.

Implikasi untuk SEMAR: jangan menyalin daftar modul atau tampilan Cenosco. Bangun `common asset kernel` yang stabil, lalu pasang industry/equipment packs dan versioned engineering rules di atasnya. Registry empat halaman saat ini adalah lapisan master data awal; belum sebanding dengan kemampuan Cenosco.

## 3. Audit implementasi aktual

Audit pada bagian ini adalah kondisi saat discovery 3 September 2026, sebelum SAAS-01 selesai. Temuan tenant-context yang menyebut helper hardcoded dan belum ada cross-tenant tests adalah baseline historis; SAAS-01 kini selesai untuk scope Asset yang diuji. Lihat status terkini di bagian 6, playbook, dan changelog.

### 3.1 Verdict kesiapan

| Area | Status | Bukti aktual | Keputusan |
| --- | --- | --- | --- |
| Frontend shell/navigation | Hijau untuk baseline | route manifest dan module landing tersedia | pertahankan; bukan fokus rewrite |
| Asset Registry UI | Kuning | React Query sudah dipakai, tetapi response dibaca dengan beberapa tebakan envelope dan pagination difilter ulang di client | kontrak typed harus disatukan dan diuji terhadap API nyata |
| Asset CRUD backend | Merah | handler memakai `utils.GetTenantID/GetUserID` yang masih selalu mengembalikan `1` | hentikan feature work sebelum context JWT diperbaiki |
| API contract | Merah | frontend mendefinisikan puluhan call tanpa route backend; naming `/Asset` campur dengan plural lowercase | buat inventory contract dan compatibility window |
| Hierarchy | Kuning/merah | tree dapat memanggil API, tetapi hanya model Site → Unit → Asset → Component dan validasi backend belum memeriksa cycle/orphan lengkap | desain ulang sebagai multiple structure/aspect |
| Technical Data | Merah | data/specification/drawing masih array sample dan state lokal; JSON bebas memakai `any` | perlu schema registry, unit definition, validation, version/provenance |
| Asset Documents | Merah | halaman hanya state lokal; backend tidak memiliki asset-document model/repository/route | bangun document metadata + object storage lifecycle |
| Import/Export | Merah | job/template sample; service backend mengembalikan “not yet implemented” | buat asynchronous staged import dengan validation report |
| Database migration | Merah | `AutoMigrate` hanya memuat sebagian model; Component tidak ikut daftar walau service memakainya; tidak ada versioned asset schema migration | ganti dengan migration versioned dan constraints eksplisit |
| Tenant isolation | Merah/kritis | request path Asset efektif diarahkan ke tenant 1 oleh helper hardcoded; belum ada negative cross-tenant suite/RLS defense | gate pertama sebelum demo multitenant |
| Engineering calculation readiness | Merah | `remaining_life_years` dihitung dari design life minus umur kalender; ini bukan remaining safe life engineering | hapus makna engineering palsu; keluarkan hanya dari versioned ruleset |
| SaaS operations | Merah | quota storage masih placeholder; tenant-aware file/cache/job, onboarding/offboarding, restore per tenant, rate limit, dan observability belum terbukti | wajib sebelum production SaaS |

### 3.2 Temuan kontrak yang harus dibereskan

1. `backend/app/utils/asset_handler_utils.go` mengembalikan tenant dan user `1`, walaupun auth middleware sudah menaruh claim dalam context.
2. `backend/app/api/routes/asset_routes.go` mencatat tenant middleware “removed temporarily”; seluruh Asset route hanya memakai auth dan satu permission `asset:view`, termasuk mutation.
3. Route backend CRUD memakai `/assets/Asset`, sementara frontend juga memanggil endpoint yang tidak terdaftar seperti patch asset, timeline, audit log, children count, documents, status, location, tag, QR, recommendation, prediction, dan cost analysis.
4. Frontend `BaseAsset` menggunakan camelCase dan banyak required field yang tidak diberikan backend snake_case. `any` dan envelope guessing menyembunyikan mismatch.
5. Repository inti memang menyertakan `tenant_id` pada banyak query, tetapi itu tidak melindungi sistem jika tenant context asalnya salah. Partitioning data bukan isolation.
6. Asset self-parent belum memiliki database constraint untuk mencegah cross-tenant parent, self-parent, cycle, duplicate designation, atau invalid type transition.
7. Technical properties berada pada beberapa JSONB map tanpa schema ID/version, unit metadata, effective date, source, confidence, atau approval status.
8. Dokumen belum punya entity dan lifecycle; upload UI belum menyimpan apa pun ke backend.
9. Bulk update/delete menambah counter tanpa melakukan mutasi; import/export mengembalikan respons placeholder.
10. Test frontend saat ini memock service, sehingga dapat hijau saat route/DTO backend tidak cocok. Belum ada contract test atau authenticated Asset E2E.

## 4. Target SaaS multitenant

Model awal yang disarankan adalah pooled PostgreSQL dengan `tenant_id` pada setiap entity tenant-owned, repository scoping wajib, dan PostgreSQL Row-Level Security sebagai defense-in-depth. Jika kemudian ada tenant enterprise yang membutuhkan silo database, domain/API tidak boleh berubah.

Tenant context harus berasal dari JWT/session tervalidasi atau service credential yang terikat tenant. Header/subdomain hanya membantu resolution dan tidak boleh mengotorisasi perpindahan tenant. Context yang sudah diverifikasi harus mengalir ke query, transaction, event, cache key, object path, async job, audit log, metrics, dan rate limit.

Gate minimum sebelum disebut multitenant-ready:

- tidak ada fallback tenant/user dalam production path;
- semua read/write/delete/relationship query memiliki tenant guard;
- unique/FK constraint memasukkan tenant boundary bila relevan;
- negative test Tenant A → resource Tenant B untuk list/get/create relation/update/delete/download/export;
- cache, queue, WebSocket topic, file path, signed URL, dan log ter-scope tenant;
- DB request role bukan superuser/BYPASSRLS dan RLS policy diuji bila diaktifkan;
- onboarding, suspension, offboarding, retention, backup, dan restore tenant terdokumentasi;
- plan/entitlement/quota diberlakukan server-side;
- audit event immutable memiliki tenant, actor, action, target, before/after atau change-set, timestamp, request/correlation ID.

Referensi keamanan implementasi: [OWASP Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html) dan [AWS SaaS Lens — SaaS identity](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-identity.html).

## 5. Target capability Asset Management

### 5.1 Common asset kernel

Pisahkan konsep berikut, jangan memasukkan semuanya ke satu tabel `assets`:

- `asset`: identity stabil, tenant, lifecycle status, owner/custodian, criticality policy/result, commissioning/decommissioning, source system;
- `asset_designation`: reference designation/tag, scheme, aspect, validity period, alias, uniqueness scope;
- `asset_class`: standards profile, class code, allowed relation/type, schema version;
- `asset_relation`: parent/child atau graph relation bertipe, aspect, effective dates, ordering;
- `technical_schema` dan `technical_value`: property definition, datatype, unit, validation, source, effective version, approval;
- `document_record`, `document_version`, `asset_document_link`: metadata, revision, checksum, lifecycle, many-to-many link;
- `data_quality_issue`: rule, severity, affected field/relation, status, assignee;
- `audit_event`: append-only evidence;
- `external_reference`: SAP/Maximo/DMS/historian ID dan sync metadata.

Semua public ID baru memakai UUID/ULID yang tidak membocorkan urutan tenant. Integer internal boleh dipertahankan selama compatibility migration bila perlu.

### 5.2 Asset Registry

Minimum production scope:

- create/read/update/retire asset dengan permission terpisah;
- stable public ID dan reference designation/tag unik sesuai tenant/site/scheme;
- class/type dari controlled taxonomy dan standards profile, bukan string bebas;
- lifecycle state machine (`planned`, `installed`, `commissioned`, `in_service`, `out_of_service`, `retired`) dengan reason/effective date;
- site/location, owner/custodian, manufacturer/model/serial, criticality status, source system;
- version/ETag untuk optimistic concurrency;
- bulk staged import: upload → parse → map → validate → dry-run → approve → commit → report;
- server-side search/filter/sort/pagination dan saved views;
- audit timeline serta data quality indicators.

### 5.3 Hierarchy dan reference designation

Jangan batasi domain pada satu pohon Site → Unit → Asset → Component. IEC 81346 membedakan cara melihat objek berdasarkan aspect. SEMAR minimal mendukung:

- location/spatial hierarchy;
- functional hierarchy;
- product/equipment breakdown;
- optional process/system grouping sesuai industry profile.

Aturan wajib: acyclic graph per aspect, no self-parent, parent dan child satu tenant, class relation valid, stable designation, effective dating, history saat move, impact preview sebelum move, serta validasi orphan/duplicate/cycle. UI boleh menampilkan tree per aspect, sementara database menyimpan typed relations.

### 5.4 Technical Data

Technical Data bukan satu tabel label/value bebas. Gunakan schema versioned per equipment class:

- property code dan human label terpisah;
- datatype, cardinality, required/optional, allowed range/enumeration;
- unit dimension dan canonical unit; nilai asli serta hasil konversi disimpan dengan jelas;
- grouping: identification, design, construction/material, operating envelope, inspection prerequisites;
- source/provenance: vendor datasheet, as-built drawing, field verification, historian, import;
- `valid_from`, `valid_to`, revision, status (`draft/verified/approved/superseded`), verifier;
- quality rule dan completeness score per standards/equipment profile.

Hindari `any` di contract frontend dan JSONB tanpa schema/version. JSONB dapat dipakai sebagai storage optimization setelah canonical definition dan validation tersedia.

### 5.5 Asset Documents

Minimum lifecycle:

- document number, title, type, discipline, revision, status, effective date, source, owner, confidentiality;
- document dapat terhubung ke banyak asset dan satu asset ke banyak document;
- immutable version, checksum, size, MIME hasil server-side detection, upload actor/time;
- workflow draft → review → approved/as-built → superseded/obsolete;
- retention/disposition/legal hold sesuai policy tenant;
- object key berprefix tenant dan environment, encryption, short-lived signed URL, malware scan/quarantine;
- download/preview permission dan audit event;
- integrasi DMS melalui external reference tanpa memaksa SEMAR menjadi source of truth.

## 6. Urutan delivery yang baru

Risk/RBI (`FE-05`) dan fitur prediksi ditunda sampai data foundation memenuhi gate. Setiap task di bawah adalah vertical slice; tidak boleh membuat UI sample sebagai bukti selesai.

### AM-00 — Product baseline, standards profile, dan gap assessment

Status: **complete untuk technical discovery**; business decisions tetap menunggu meeting.

Output: dokumen ini, audit readiness, standards layering, benchmark Cenosco, backlog dan decision log.

### SAAS-01 — Tenant context dan authorization gate

Status: **complete** (tenant context, route authorization, relationship checks, dan negative/boundary tests; lihat changelog/handoff untuk bukti).

- helper context Asset diganti dengan typed verified context tanpa fallback default tenant/user;
- granular permission view/create/update/delete/import/export diterapkan pada route Asset;
- tenant ownership pada relationship Asset diperiksa dan negative/boundary tests ditambahkan;
- tenant boundary untuk file/cache/job dan RLS defense-in-depth tetap perlu diputuskan/diperluas pada task terkait.

Exit tercapai untuk cakupan SAAS-01 yang diuji; perluas tenant boundary ke file/cache/job dan domain lain pada task terkait.

### AM-01 — Asset Taxonomy, Class-Specific Attributes & Canonical Contract

Status: **next**.

- sepakati taxonomy dan vocabulary `asset/equipment/component`, class-specific attributes, dan public ID;
- buat OpenAPI contract dan generated/validated DTO mapping;
- inventory endpoint frontend, tandai `implemented/planned/remove`;
- buat versioned SQL migrations dengan FK/unique/check/index;
- hapus response guessing dan `any` dari vertical slice Registry.

Exit: FE–BE contract test lulus untuk list/get/create/update/retire dan error envelope.

### AM-02 — Asset Registry production vertical slice

Status: **queued setelah AM-01**.

- implement lifecycle, server pagination/search/filter, optimistic locking, audit, data quality;
- implement staged import dry-run dan export asynchronous/idempotent;
- test happy/error/permission/tenant/concurrency paths;
- E2E: create → view → edit → retire dan Tenant A tidak melihat Tenant B.

### AM-03 — Multi-aspect hierarchy

Status: **queued setelah AM-02**.

- typed relations dan designation scheme;
- location/function/product views;
- cycle/orphan/cross-tenant/type constraints;
- move impact preview, history, bulk validation, large-tree performance test.

### AM-04 — Technical schema dan governed values

Status: **queued setelah AM-03**.

- schema registry, units, validation, provenance, revision/approval;
- equipment profile pertama dipilih dari hasil meeting;
- completeness/data quality dashboard berbasis rule nyata;
- siapkan input snapshot yang bisa dikonsumsi calculation engine tanpa memasukkan rumus terlebih dahulu.

### AM-05 — Document and evidence lifecycle

Status: **queued setelah AM-04**.

- metadata/version/link/workflow/retention schema;
- tenant-scoped object storage, scanning, checksum, signed URL, permission, audit;
- DMS external-reference adapter contract;
- negative tests untuk cross-tenant upload/link/download/delete.

### AM-06 — Integration dan operational readiness

Status: **queued setelah AM-05**.

- SAP/Maximo/DMS/historian mapping, idempotency dan reconciliation;
- outbox/event contract;
- quota/rate limit/observability/performance/backup-restore drill;
- UAT dan traceability matrix terhadap requirements profile.

### ENG-01 — Equipment-specific integrity ruleset

Status: **blocked sampai AM-04 dan SME approval**.

Ruleset pertama ditentukan berdasarkan industri dan asset class yang dipilih. Setiap hasil kalkulasi wajib menyimpan method/standard edition, formula version, input snapshot + unit, output, warning/assumption, timestamp, software version, reviewer, dan approval state. Jangan menyebut angka kalender `design life - age` sebagai remaining safe life.

## 7. Quality gates per task

Minimum gate teknis:

```powershell
# frontend
docker exec semar-frontend pnpm typecheck
docker exec semar-frontend pnpm test:run
docker exec semar-frontend pnpm build

# backend
docker exec semar-backend go test ./...
docker exec semar-backend go vet ./...

# runtime
curl.exe -s http://localhost:4073/health
```

Tambahan per Asset slice:

- OpenAPI/DTO contract test;
- migration up/down atau documented forward-fix strategy;
- Tenant A/B negative integration tests;
- authenticated E2E terhadap backend dan database nyata, bukan service mock saja;
- audit event assertion;
- test data minimal dua tenant dan dua site;
- performance budget untuk registry search dan hierarchy tree disepakati sebelum load test.

## 8. Decision log untuk meeting dengan bos/SME

Jangan mengunci schema equipment-specific sebelum pertanyaan ini dijawab:

1. Industri pertama: refinery/petrochemical, upstream/offshore, pipeline, mining, power, atau lainnya?
2. Asset/equipment class pertama dan critical user journey apa?
3. Apakah SEMAR source of truth atau membaca master dari SAP/Maximo/EAM?
4. Struktur resmi perusahaan memakai tag/designation scheme apa?
5. Standards/codes edition mana yang diwajibkan kontrak/regulator dan siapa SME approver?
6. Criticality method: corporate matrix, consequence category, atau metode lain?
7. Dokumen disimpan di SEMAR atau DMS existing? Retention, data residency, dan klasifikasi aksesnya apa?
8. Apakah mobile/offline field execution masuk MVP?
9. Tenant model: satu perusahaan, site sebagai tenant, atau perusahaan dengan banyak site/business unit?
10. Kebutuhan integrasi, volume asset/document, jumlah concurrent user, serta target availability/p95?
11. Perlu certification/compliance claim atau cukup alignment dan evidence export?
12. Siapa data owner, data steward, approver, dan accountable person untuk setiap class?

SAAS-01 sudah selesai. Sambil menunggu meeting untuk keputusan business profile, AM-01 contract/schema dan infrastructure test dapat dikerjakan karena tidak mengunci pilihan metodologi engineering.

## 9. Instruksi agent berikutnya

Agent harus membaca berurutan:

1. [Agent Execution Playbook](./AGENT_EXECUTION_PLAYBOOK.md);
2. dokumen ini;
3. file hotspot yang tercantum pada task aktif saja;
4. [Development Workflow](./DEVELOPMENT_WORKFLOW.md) untuk command Docker.

Prompt kelanjutan yang disarankan:

> Lanjutkan AM-01 — Asset Taxonomy, Class-Specific Attributes & Canonical Contract — sesuai `docs/AGENT_EXECUTION_PLAYBOOK.md` dan dokumen ini. Jangan mengerjakan Risk/RBI atau menambah placeholder. Definisikan taxonomy serta attributes per class dengan migration versioned dan kontrak FE–BE yang tervalidasi; tambahkan tests, jalankan quality gates, lalu update changelog dan handoff.
