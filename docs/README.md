# Dokumentasi SEMAR AIMS

Dokumen ini adalah sumber arah pengembangan. Status implementasi harus dibuktikan oleh kode dan quality gate; fitur yang baru direncanakan tidak boleh ditulis sebagai fitur selesai.

## Mulai dari sini

1. [Agent Execution Playbook](./AGENT_EXECUTION_PLAYBOOK.md) — entry point ringkas, task aktif, aturan kerja, dan handoff.
2. [SEMAR AIMS Architecture & Engineering Plan](./SEMAR_AIMS_ARCHITECTURE_PLAN.md) — visi, arsitektur target, snapshot kondisi aktual, serta strategi frontend/backend.
3. [Asset Management Re-Engineering Plan](./ASSET_MANAGEMENT_REENGINEERING_PLAN.md) — detail domain, standards profile, backlog Asset-first, dan decision log.
4. [Development Workflow](./DEVELOPMENT_WORKFLOW.md) — command Docker, validasi, dan troubleshooting Windows.
5. [Changelog](./changelogs.md) — perubahan yang benar-benar sudah diterapkan.

Referensi tambahan: [SEMAR Framework](../SEMAR_FRAMEWORK.md) serta standar di `docs/standards/`.

## Arti status

- **Implemented**: ada di kode dan pemeriksaan relevan lulus.
- **Partial**: ada sebagian, tetapi kontrak, test, atau integrasinya belum lengkap.
- **Planned**: target desain; belum boleh dijadikan asumsi runtime.
- **Blocked**: tidak boleh dilanjutkan sebelum dependency atau quality gate diselesaikan.

## Aturan dokumentasi

Perbarui dokumen kanonis yang relevan dan changelog dalam perubahan yang sama; jangan membuat dokumen baru jika informasinya cukup menjadi bagian dari dokumen yang sudah ada. Klaim “build bersih”, “production-ready”, atau “sesuai standar” wajib menyertakan pemeriksaan yang lulus.
