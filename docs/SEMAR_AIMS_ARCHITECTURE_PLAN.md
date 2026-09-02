# SEMAR AIMS Architecture Plan

**SEMAR — Solution to Enhance Managing Asset Reliability**  
**Dokumen arah:** 2 September 2026

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

Feature-oriented React application dengan app shell, route manifest, database-driven navigation, satu API client, TanStack Query untuk server state, Redux minimal untuk client-global state, dan design tokens tunggal. Detail migrasi ada di [Frontend Re-Engineering Plan](./FRONTEND_REENGINEERING_PLAN.md).

### Backend

Go modular monolith dengan composition root, satu database pool lifecycle, versioned migration, context-local transactions, OpenAPI contract, tenant-safe repositories, calculation engine, dan transactional outbox. Detail ada di [Backend Re-Engineering Plan](./BACKEND_REENGINEERING_PLAN.md).

### Data dan integration

- PostgreSQL menjadi source of truth transaksional.
- Redis untuk distributed ephemeral state/cache yang memiliki invalidation policy.
- File/object storage menyimpan evidence dengan metadata tenant dan checksum.
- Outbox menyalurkan domain/integration events secara idempotent.
- Analytics read model dapat diturunkan dari event atau controlled ETL.

## 6. Status aktual vs target

| Capability | Aktual | Target berikutnya |
| --- | --- | --- |
| Local runtime | Dev Compose hot reload aktif | percepat cold start dan tambah CI parity |
| Navigation | dashboard contract diperbaiki | contract/accessibility tests |
| Frontend quality | typecheck/test merah | baseline hijau |
| Backend quality | runtime sehat, tests merah | perbaiki test contracts |
| Data layer | GORM + SQLX/pool ganda | satu pool lifecycle |
| Tenant isolation | filter tersebar | centralized context + negative tests |
| AIMS calculation | helper/analytics parsial | versioned engine + golden dataset |
| Events/integration | interface parsial | transactional outbox |

Snapshot rinci ada di [Codebase Analysis](./CODEBASE_ANALYSIS.md).

## 7. Roadmap berbasis gate

### Gate A — Stabil (minggu 1–3)

- Frontend typecheck/test/build hijau.
- Backend `go test ./...` hijau.
- Docker dev and smoke tests repeatable.
- Route/menu/API contract terdokumentasi.

### Gate B — Foundation (minggu 4–7)

- Satu frontend API client dan server-state pattern.
- Satu backend DB lifecycle dan versioned migration.
- Tenant negative tests.
- Asset Registry vertical slice selesai.

### Gate C — AIMS workflow (minggu 8–14)

- Inspection dan Maintenance vertical slices.
- Audit trail dan evidence lifecycle.
- Compliance linkage.

### Gate D — Engineering intelligence (setelah data siap)

- Versioned calculation engine.
- Golden datasets dan domain approval.
- Integrity/RBI recommendations dan analytics read model.
- Outbox/integration hardening.

Tanggal adalah estimasi; gate tidak boleh dilewati hanya karena kalender.

## 8. Non-functional gates

- Security: tenant isolation, RBAC, session/secret policy, audit evidence.
- Reliability: idempotency, retry semantics, backup/restore drill.
- Performance: budgets untuk route bundle, API p95, DB pool, hierarchy/search.
- Accessibility: keyboard, touch, focus, label, contrast pada critical workflows.
- Operability: health/readiness, structured logs, correlation ID, metrics, runbook.

## 9. Definition of product-ready

Sebuah capability hanya “ready” bila contract terdokumentasi, happy/error/permission/tenant path diuji, observability tersedia, migration/rollback ditentukan, dan user acceptance untuk workflow domain selesai.
