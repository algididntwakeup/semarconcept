# SEMAR AIMS Architecture & Engineering Plan

**SEMAR — Solution to Enhance Managing Asset Reliability**  
**Snapshot gabungan:** 28 September 2026

## 1. Tujuan produk

SEMAR adalah platform Asset Integrity Management System untuk mengubah data aset, inspeksi, pemeliharaan, degradasi, risiko, dan compliance menjadi keputusan engineering yang traceable. Acuan ISO 14224 dan ISO 55000/55001 dipakai sebagai vocabulary/governance reference; kepatuhan tidak boleh diklaim sebelum evidence dan assessment tersedia.

Outcome produk:

- single source of truth untuk hierarchy dan technical data aset;
- inspection/maintenance loop yang dapat diaudit;
- perhitungan integrity/risk yang repeatable dan terversi;
- prioritas kerja berdasarkan risk, condition, dan remaining life;
- bukti compliance yang terhubung ke aset, pekerjaan, dan keputusan.

## 2. Prinsip arsitektur

1. **Traceability first** — setiap keputusan dapat dilacak ke input, versi rule/formula, actor, dan waktu.
2. **Tenant isolation by construction** — tenant context wajib pada auth, query, event, cache, file, dan test.
3. **Modular monolith first** — boundary domain tegas, deployment tetap sederhana; service extraction hanya berdasarkan bukti kebutuhan.
4. **Contract before UI** — OpenAPI, error model, units, permission, dan lifecycle disepakati sebelum halaman dianggap selesai.
5. **Incremental replacement** — re-engineering lewat vertical slice, bukan rewrite serentak.
6. **Measured claims** — target architecture dibedakan dari implemented state.

## 3. Domain map target

```text
IAM ───────────────┐
                   v
Asset Registry -> Inspection -> Integrity/Risk -> Recommendation
      |                |              |                 |
      +----------> Maintenance <------+                 v
      |                                               Compliance
      +---------------------> Analytics/Reporting <-----+

Platform services: tenant, audit, files, notification, workflow,
database, cache, observability, integration/outbox.
```

Ownership utama:

| Context | Owns | Tidak owns |
| --- | --- | --- |
| Asset | hierarchy, equipment, component, taxonomy | inspection result, work order |
| Inspection | plan, task, finding, measurement | formula risk final |
| Maintenance | strategy, schedule, work order, execution | asset master |
| Integrity/Risk | degradation, calculation, assessment, recommendation | raw master edits |
| Compliance | requirement, evidence, audit, certification | engineering formula |
| Analytics | read model dan report | transactional source of truth |
| IAM | identity, role, permission, session | domain business data |

## 4. Data-to-decision chain

```text
Raw observation
  -> validated measurement + unit + provenance
  -> contextualized asset/condition history
  -> versioned engineering calculation
  -> risk/remaining-life assessment
  -> approved recommendation
  -> work order / inspection plan
  -> execution evidence and feedback
```

Setiap transisi harus menyimpan source ID, tenant, timestamps, actor/system, status validasi, dan audit correlation ID.

## 5. Arsitektur aplikasi target

### Frontend

Feature-oriented React application dengan app shell, route manifest, database-driven navigation, satu API client, TanStack Query untuk server state, Redux minimal untuk client-global state, dan design tokens tunggal.

Aturan implementasi:

- Dependency mengalir `shared -> entities -> features -> app`; feature berintegrasi melalui public API atau route composition.
- React Router memiliki URL; route manifest menjadi kontrak route, permission, dan landing destination. Database menu adalah navigasi runtime; fallback JSON hanya degraded mode.
- Seluruh network call memakai satu API client dengan auth, tenant header, refresh, CSRF, dan error normalization.
- TanStack Query memiliki seluruh server state; Redux dibatasi pada session, tenant aktif, preferensi shell, dan state UI sementara.
- MUI adalah primitive utama selama migrasi; Tailwind untuk utility/layout. Hindari token dan icon registry ganda.
- Migrasi per vertical slice dengan loading/error/empty state, permission, tenant behavior, dan test yang terlihat.

Tahapan frontend: (0) jaga baseline typecheck/test/build; (1) selaraskan shell, routing, menu, dan deep-link access; (2) konsolidasikan API client dan server-state ownership; (3) bangun tokens/primitives dan batas feature; (4) migrasikan workflow secara vertikal; (5) tetapkan bundle, accessibility, observability, dan performance budget.

### Backend

Go modular monolith dengan composition root, satu database pool lifecycle, versioned migration, context-local transactions, OpenAPI contract, tenant-safe repositories, calculation engine, dan transactional outbox.

Aturan implementasi:

- Context platform, IAM, asset, inspection, maintenance, integrity, compliance, dan analytics memiliki use case serta boundary sendiri; context lain tidak membaca tabel internal langsung.
- Satu `*sql.DB` menjadi pool owner; adapter GORM/SQLX berbagi pool selama transisi. Operasi multi-repository memakai transaction manager.
- Tenant berasal dari identity yang tervalidasi, bukan pilihan tenant dari payload client. Read, write, relationship, file, cache, job, event, dan audit wajib membawa scope tenant.
- API memiliki OpenAPI/error/pagination contract; perubahan breaking memakai compatibility window.
- Calculation harus deterministik dan terversi, menyimpan input/unit/provenance/output/warning/approval, serta diuji dengan golden dataset.
- Integrasi asinkron memakai transactional outbox, worker idempotent, retry/backoff, dan dead-letter handling.

Tahapan backend: (0) pulihkan test dan smoke gate; (1) satu lifecycle DB dan versioned migrations; (2) API dan tenant contract; (3) Asset vertical slice; (4) calculation engine; (5) outbox/integrasi; (6) security dan operational readiness.

### Data dan integration

- PostgreSQL menjadi source of truth transaksional.
- Redis untuk distributed ephemeral state/cache yang memiliki invalidation policy.
- File/object storage menyimpan evidence dengan metadata tenant dan checksum.
- Outbox menyalurkan domain/integration events secara idempotent.
- Analytics read model dapat diturunkan dari event atau controlled ETL.

## 6. Status aktual vs target

| Capability | Aktual | Target berikutnya |
| --- | --- | --- |
| Local runtime | Dev Compose dengan Vite/Air hot reload tersedia; runtime harus dicek sebelum mengandalkan status lama | pertahankan smoke check dan CI parity |
| Navigation | dashboard, module landing, route manifest, permission-aware navigation tersedia | tambah contract/accessibility/E2E untuk mencegah route-menu drift |
| Frontend quality | baseline typecheck/test/build dan slice Equipment Master terverifikasi pada task terkait; status dapat berubah | jalankan gate yang relevan sebelum handoff |
| Frontend data | TanStack Query aktif untuk Asset/Inspection; beberapa legacy feature masih direct service, sample, atau fallback | contract nyata dan hapus production fallback per slice |
| Backend quality | test suite dipulihkan; SAAS-01 menambah tenant/boundary tests | lanjutkan integration/contract tests dengan database nyata |
| Data layer | satu pool GORM + SQLX dan transaction manager tersedia | versioned migration, domain constraints, dan transaksi teruji |
| API contract | route/DTO legacy masih drift, termasuk asset naming/envelope dan endpoint frontend yang belum ada | OpenAPI inventory, typed DTO, compatibility window (AM-01) |
| Tenant isolation | SAAS-01: verified context, middleware, granular Asset RBAC, relationship checks, dan negative/boundary tests diterapkan | perluas ke domain/file/cache/job boundary; evaluasi RLS |
| Asset Management | Registry/Equipment Master UI dan sebagian backend tersedia; hierarchy multi-aspect, Technical Data governed, Documents, import/export, integrasi belum production-complete | jalur AM-01 s/d AM-06; UI bukan bukti readiness end-to-end |
| Design system | MUI, Tailwind, Emotion, serta ikon MUI/Lucide masih bercampur | tetapkan token/ownership bertahap, jangan rewrite serentak |
| AIMS calculation | helper/analytics parsial; belum ada ruleset engineering terversi dengan golden dataset | mulai setelah schema Asset dan SME approval |
| Events/integration | interface parsial; transactional outbox belum terbukti | outbox dan worker idempotent |
| Security/operations | logging rahasia plaintext dan health noise telah diperbaiki pada audit sebelumnya; audit menyeluruh tetap perlu | review token/PII, backup/restore, rate limits, metrics, dan file boundary |

Snapshot dan gap utama dirangkum di atas; keputusan domain dan acceptance criteria Asset ada di [Asset Management Re-Engineering Plan](./ASSET_MANAGEMENT_REENGINEERING_PLAN.md). Verifikasi status terhadap kode dan changelog sebelum menggunakan snapshot ini sebagai bukti. Beberapa audit terdahulu adalah snapshot bertanggal dan tidak boleh dibaca sebagai status runtime real-time.

## 7. Roadmap berbasis gate

### Gate A — Stabil (minggu 1–3)

- Frontend typecheck/test/build hijau.
- Backend `go test ./...` hijau.
- Docker dev and smoke tests repeatable.
- Route/menu/API contract terdokumentasi.

### Gate B — Foundation (minggu 4–7)

- Satu frontend API client dan server-state pattern.
- Satu backend DB lifecycle dan versioned migration.
- Tenant negative tests dan tenant-aware file/cache/job boundary.
- Asset contract, versioned schema, Registry, multi-aspect hierarchy, Technical Data, dan Documents selesai bertahap.
- Detail execution ada di [Asset Management Re-Engineering Plan](./ASSET_MANAGEMENT_REENGINEERING_PLAN.md).

### Gate C — AIMS workflow (minggu 8–14)

- Inspection dan Maintenance vertical slices tanpa mock/fallback production path.
- Audit trail dan evidence lifecycle.
- Compliance linkage.
- Risk/RBI baru dimulai setelah technical schema dan input provenance Asset lolos gate.

### Gate D — Engineering intelligence (setelah data siap)

- Versioned calculation engine.
- Golden datasets dan domain approval.
- Integrity/RBI recommendations dan analytics read model.
- Outbox/integration hardening.

Tanggal adalah estimasi; gate tidak boleh dilewati hanya karena kalender.

## 8. Quality gates dan definition of done

Quality gate minimum disesuaikan dengan dampak task:

- Frontend: `pnpm typecheck`, test terkait/`pnpm test:run`, `pnpm build`.
- Backend: `go test ./...`, `go vet ./...`.
- Runtime: health endpoint dan smoke test route/API yang berubah.
- Tenant-scoped endpoint: negative cross-tenant tests untuk data dan relationship terkait.
- Slice: contract, permission, loading/error state, migration/rollback plan, auditability, serta acceptance criteria domain.

Sebuah capability hanya “ready” bila contract terdokumentasi, happy/error/permission/tenant path diuji, observability tersedia, migration/rollback ditentukan, dan user acceptance untuk workflow domain selesai. Catat command dan hasil yang benar-benar dijalankan di changelog/handoff.

## 9. Non-functional gates

- Security: tenant isolation, RBAC, session/secret policy, audit evidence.
- Reliability: idempotency, retry semantics, backup/restore drill.
- Performance: budgets untuk route bundle, API p95, DB pool, hierarchy/search.
- Accessibility: keyboard, touch, focus, label, contrast pada critical workflows.
- Operability: health/readiness, structured logs, correlation ID, metrics, runbook.
