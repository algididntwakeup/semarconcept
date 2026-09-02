# SEMAR Re-Engineering Walkthrough

Dokumen ini adalah handoff ringkas. Detail authoritative berada di [`docs/`](./docs/README.md).

## Yang sudah berjalan

- Dev stack Docker dengan hot reload untuk React/Vite dan Go/Air.
- Frontend merespons pada `http://localhost:3000`.
- Backend health pada `http://localhost:4072/health` melaporkan database sehat.
- Dashboard canonical berada di `/dashboard` dengan redirect legacy.
- Menu dashboard dan icon disinkronkan ke database existing saat startup.
- Primary navbar mendukung touch scroll dan active-item centering.
- Setiap root module memiliki main/landing page sehingga user tidak langsung dilempar ke child page pertama.
- Agent berikutnya dapat mulai dari `docs/AGENT_EXECUTION_PLAYBOOK.md` tanpa mengulang audit penuh.

## Yang belum selesai

- TypeScript repository belum bersih.
- Tiga frontend test masih gagal.
- Backend test suite belum mengikuti interface produksi terbaru.
- TanStack Query, modular monolith boundary, calculation engine, dan outbox adalah target, belum implementasi selesai.

## Urutan kerja berikutnya

1. Selesaikan baseline frontend dan backend sampai seluruh quality gate hijau.
2. Tambahkan route/menu contract tests.
3. Konsolidasikan frontend API/state melalui Asset Registry vertical slice.
4. Konsolidasikan backend database lifecycle dan tenant contract.
5. Lanjutkan Inspection, Maintenance, Compliance, lalu Integrity/RBI.

Jalankan stack dan pemeriksaan menggunakan [Development Workflow](./docs/DEVELOPMENT_WORKFLOW.md).
