# Dokumentasi SEMAR AIMS

Dokumen ini adalah sumber arah pengembangan. Status implementasi harus dibuktikan oleh kode dan quality gate; fitur yang baru direncanakan tidak boleh ditulis sebagai fitur selesai.

## Mulai dari sini

1. [Agent Execution Playbook](./AGENT_EXECUTION_PLAYBOOK.md) — entry point, urutan task, gate, dan handoff untuk agent berikutnya.
2. [SEMAR AIMS Architecture Plan](./SEMAR_AIMS_ARCHITECTURE_PLAN.md) — visi produk, batas domain, arsitektur target, dan urutan delivery.
3. [Codebase Analysis](./CODEBASE_ANALYSIS.md) — snapshot kondisi aktual dan gap terverifikasi per 2 September 2026.
4. [Frontend Re-Engineering Plan](./FRONTEND_REENGINEERING_PLAN.md) — stabilisasi UI, routing/menu, server state, design system, dan testing.
5. [Backend Re-Engineering Plan](./BACKEND_REENGINEERING_PLAN.md) — data layer, API, multi-tenancy, calculation engine, dan outbox.
6. [Development Workflow](./DEVELOPMENT_WORKFLOW.md) — Docker development, hot reload, validasi, dan troubleshooting Windows.
7. [Changelog](./changelogs.md) — perubahan yang benar-benar sudah diterapkan.

Referensi tambahan: [SEMAR Framework](../SEMAR_FRAMEWORK.md) serta standar di `docs/standards/`.

## Arti status

- **Implemented**: ada di kode dan pemeriksaan relevan lulus.
- **Partial**: ada sebagian, tetapi kontrak, test, atau integrasinya belum lengkap.
- **Planned**: target desain; belum boleh dijadikan asumsi runtime.
- **Blocked**: tidak boleh dilanjutkan sebelum dependency atau quality gate diselesaikan.

## Aturan dokumentasi

Setiap perubahan arsitektural harus memperbarui analisis aktual, plan terkait, dan changelog dalam perubahan yang sama. Klaim “build bersih”, “production-ready”, atau “sesuai standar” wajib menyertakan pemeriksaan yang lulus.
