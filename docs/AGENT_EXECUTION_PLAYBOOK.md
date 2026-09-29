# SEMAR Agent Execution Playbook

Entry point ringkas untuk agent yang melanjutkan pekerjaan SEMAR. Baca dokumen ini dahulu; buka referensi lanjutan hanya bila task membutuhkannya.

**Snapshot konteks:** 28 September 2026
**Task Asset berikutnya:** AM-01 — Asset Taxonomy, Class-Specific Attributes & Canonical Contract
**Catatan:** periksa `git status --short` dan kode aktual sebelum mengasumsikan status atau mengubah file.

## 1. Mulai task

1. Baca playbook ini dan `git status --short`; pertahankan perubahan yang sudah ada dan jangan reset workspace.
2. Untuk task Asset/tenant, baca [Asset Management Re-Engineering Plan](./ASSET_MANAGEMENT_REENGINEERING_PLAN.md).
3. Untuk arsitektur, audit snapshot, aturan FE/BE, dan quality gate, baca bagian terkait [SEMAR AIMS Architecture & Engineering Plan](./SEMAR_AIMS_ARCHITECTURE_PLAN.md).
4. Untuk command Docker dan troubleshooting Windows, baca [Development Workflow](./DEVELOPMENT_WORKFLOW.md).
5. Baca hanya hotspot kode dan dependency langsung. Jangan mengulang audit penuh kecuali bukti tidak cocok dengan implementasi.

Mulai dari status runtime bila task memerlukan stack lokal:

```powershell
git status --short
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs --tail 40 backend frontend
```

## 2. Prinsip wajib

- Selesaikan perubahan sebagai vertical slice dan compatibility path; hindari big-bang rewrite.
- Semua server state frontend dimiliki TanStack Query dan semua network call melalui API client kanonikal. Redux hanya untuk client-global state.
- Tenant berasal dari identity tervalidasi, bukan payload client. Setiap operasi dan relasi tenant-scoped wajib memiliki guard serta negative cross-tenant test.
- Backend memakai satu lifecycle/pool database; perubahan skema production memakai migration yang dapat ditinjau dan strategi rollback/forward-fix.
- Jangan menganggap UI, mock test, fallback service, atau sample lokal sebagai bukti backend production readiness.
- Jangan mengklaim kesesuaian ISO/API atau production-ready tanpa evidence, domain review, dan quality gate.
- Update changelog hanya untuk perubahan yang diterapkan dan diverifikasi; jangan menambah dokumen baru jika kontennya cocok ke dokumen kanonis.


## 3. Status dan prioritas yang diketahui

- Docker dev stack, route manifest/module landing, frontend quality baseline, TanStack Query untuk Asset Registry/Inspection, single DB pool, serta SAAS-01 tenant context/RBAC Asset telah dilaporkan selesai pada changelog/handoff terdahulu. Verifikasi lagi bila relevan dengan task.
- SAAS-01 menghapus fallback tenant/user `1`, menambahkan tenant middleware dan granular Asset RBAC, memvalidasi relasi lintas tenant, serta negative/boundary tests.
- Asset Registry dan Equipment Master memiliki UI, tetapi itu tidak menyelesaikan drift FE–BE, hierarchy multi-aspect, governed Technical Data, document lifecycle, import/export, atau operational readiness.
- Urutan aktif Asset: `AM-01 -> AM-02 -> AM-03 -> AM-04 -> AM-05 -> AM-06 -> ENG-01`. Rincian, acceptance criteria, standards profile, dan decision log berada di Asset plan.
- Risk/RBI dan rumus engineering tetap deferred sampai Asset technical data terversi dan disetujui SME. Jangan menyebut `design life - age` sebagai remaining safe life.
- Status yang tercatat adalah snapshot, bukan bukti runtime sekarang. Gunakan changelog dan kode aktual sebagai sumber verifikasi.

## 4. Quality gate dan handoff

```powershell
# frontend
docker exec semar-frontend pnpm typecheck
docker exec semar-frontend pnpm test:run
docker exec semar-frontend pnpm build

# backend
docker exec semar-backend go test ./...
docker exec semar-backend go vet ./...

# runtime bila stack terkait
curl.exe -s http://localhost:4073/health
```

Task tenant-scoped wajib menambahkan/menguji cross-tenant negative path. Task API/schema wajib menjalankan contract dan migration checks yang sesuai. Catat command yang benar-benar dijalankan dan hasilnya; jangan menyatakan gate lulus berdasarkan asumsi.

Format handoff:

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

Setelah task, perbarui changelog dan task/handoff aktif bila status prioritas berubah. Hindari menyalin ulang histori panjang ke playbook ini.
