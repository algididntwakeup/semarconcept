# SEMAR (Solution to Enhance Managing Asset Reliability) - Project Overview

## Domain & Objective

- **Domain**: Asset Reliability Management / Asset Integrity Management System (AIMS) untuk industri berat/migas (mirip konsep Conesco, namun dengan scope lebih luas).
- **Goal**: Re-engineering dan modernisasi arsitektur software, peningkatan performa query/kalkulasi reliability, serta peningkatan UX frontend.

## Architecture & Structure

- `/backend`: [Sebutkan teknologi, misal: Golang / Ruby / PHP / dsb.] -> Menangani kalkulasi reliability, inspeksi aset, integrasi database, REST API.
- `/frontend`: [Sebutkan teknologi, misal: Next.js / React / Vue] -> Menangani visualisasi data inspeksi, form manajemen equipment, dashboard status.
- `/database` / `/migrations`: Skema aset industri, riwayat inspeksi, damage mechanisms.

## Workflow Rules

- Utamakan performa query data time-series/inspeksi.
- Jaga akurasi kalkulasi matematika dan standar kepatuhan teknis (ISO / API standards) Pastikan juga mengikuti ISO-14224-2016, ISO-55000-2014, ISO-55001-2014 dan ISO-55002-2014, API RB 580 dan API RP 581 sebagai dasar acuan.
- Gunakan arsitektur modular yang testable dan clean.
