# Backend Re-Engineering Plan

**Status awal:** runtime hidup, tetapi suite test dan data-layer contract belum stabil.  
**Strategi:** modular monolith melalui vertical slice; tidak melakukan big-bang rewrite.

## Target boundary

- `platform`: config, database, cache, HTTP, observability, auth primitives.
- `iam`: user, role, permission, session, SSO.
- `asset`: hierarchy, taxonomy, equipment, component, inspection point.
- `inspection`: plan, execution, finding, measurement.
- `maintenance`: strategy, work order, schedule, history.
- `integrity`: degradation, corrosion, remaining life, FFS/RBI calculation.
- `compliance`: requirement, evidence, audit, certification.
- `analytics`: read model/reporting; bukan owner formula engineering.

Setiap context memiliki application use case, domain model, ports, adapters, dan HTTP transport. Context lain tidak mengakses tabel internal langsung.

## Fase 0 — Pulihkan safety net (P0)

- Perbaiki test yang tertinggal dari constructor/interface produksi.
- Pisahkan unit dan integration test dengan environment eksplisit.
- Tambahkan lint/static analysis dan migration smoke test.
- Hilangkan log klaim “all errors fixed”; log harus faktual.

Exit: `go test ./...` hijau dan server smoke test lulus.

## Fase 1 — Satu lifecycle database (P0)

- Pilih satu `*sql.DB` sebagai pool owner; GORM dan SQLX dapat menjadi adapter di atas pool sama selama migrasi.
- Inject dependency dari composition root; hentikan global DB state.
- Definisikan transaction manager lintas repository dalam satu context.
- Ganti AutoMigrate produksi dengan versioned migration; AutoMigrate hanya dev sementara.
- Tetapkan timeout, pool limit, health, dan shutdown behavior.

Exit: satu pool, transaksi use-case teruji, migration up/down tervalidasi.

## Fase 2 — API dan tenant contract (P0)

- Publikasikan OpenAPI aktual.
- Normalisasi plural lowercase `/api/v1/assets`; endpoint lama memakai compatibility window dan deprecation header.
- Tenant identity berasal dari token/session tervalidasi, bukan body pilihan client.
- Tambahkan negative cross-tenant tests untuk list/get/update/delete dan relationship.
- Standardisasi pagination, filtering, sorting, idempotency, dan validation errors.

Exit: contract test frontend/backend lulus dan endpoint tenant kritis memiliki negative test.

## Fase 3 — Vertical slice Asset (P0/P1)

- Pindahkan Site -> Unit -> Asset -> Component -> Inspection Point ke boundary `asset`.
- Satukan vocabulary `asset/equipment` dalam glossary dan API.
- Terapkan optimistic locking/version untuk update sensitif.
- Bentuk audit trail konsisten.

Exit: Asset end-to-end menjadi template context lain.

## Fase 4 — Calculation engine (P1)

Engine harus pure, deterministic, dan terversi. Setiap hasil menyimpan formula/ruleset version, input snapshot dan unit, output/rounding/warning/applicability, timestamp, actor/source, dan reference standard.

Mulai dari corrosion rate dan remaining life, lalu PoF/CoF/RBI setelah data contract dan domain review siap. Golden dataset, boundary cases, unit conversion, dan approval engineer wajib. Jangan mengklaim compliance API/ISO hanya karena nama formula tersedia.

## Fase 5 — Events dan integrasi (P1)

- Transactional outbox dalam transaksi state bisnis.
- Worker idempotent, retry/backoff, delivery state, dan dead-letter handling.
- Adapter ERP/CMMS/IoT memakai public event/contract, bukan tabel domain.

## Fase 6 — Security dan operations (P1/P2)

- Secret rotation, distributed rate limit, upload scanning, backup/restore drill.
- Structured logs dengan request/tenant correlation tanpa token/PII sensitif.
- Metrics latency, error rate, DB pool, queue lag, cache, calculation failure.
- Load test asset search, hierarchy, dashboard read model, dan ingestion.

## Larangan sementara

- Jangan menambah pola DB ketiga.
- Jangan menambah endpoint tanpa tenant/permission decision.
- Jangan memindahkan seluruh folder sebelum slice acuan lulus.
- Jangan mengaktifkan formula engineering tanpa provenance dan golden test.
