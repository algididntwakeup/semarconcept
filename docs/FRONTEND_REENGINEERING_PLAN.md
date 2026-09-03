# Frontend Re-Engineering Plan

**Status:** Fase 0 selesai; FE-02/Fase 2 menjadi pekerjaan aktif.
**Prinsip:** vertical slice, quality gate lebih dulu, dan satu kontrak untuk routing, data, serta visual language.

## Target arsitektur

```text
src/
  app/                 bootstrap, router, providers, store client-global
  shell/               header, primary navigation, sidebar, breadcrumbs
  features/<feature>/  page, components, hooks, api, schema, tests
  entities/<entity>/   tipe dan UI domain reusable
  shared/              api client, UI primitives, tokens, utilities
```

Aturan dependency: `shared -> entities -> features -> app`. Feature tidak mengimpor internal feature lain; integrasi melalui public API atau route composition.

## Keputusan teknis

- React Router adalah owner URL dan nested layout.
- Database menu adalah sumber navigasi runtime; fallback JSON hanya degraded mode dan diuji terhadap route manifest.
- Satu Axios client menangani base URL, auth, refresh, CSRF, tenant header, serta error normalization.
- TanStack Query dipakai untuk server state setelah baseline hijau dan dependency ditambahkan eksplisit.
- Redux hanya untuk client-global state: session, tenant aktif, shell preference, dan transient notification.
- MUI menjadi component primitive utama selama migrasi. Tailwind dibatasi untuk layout/utility; token tidak boleh diduplikasi.
- Ikon melalui satu registry bernama stabil.

## Fase 0 — Baseline hijau (P0)

Status: **complete — 2 September 2026**. TypeScript 0 error, 25/25 test lulus, dan production build sukses.

- Perbaiki seluruh error TypeScript hasil audit.
- Perbaiki setup `@testing-library/jest-dom`, cleanup antar test, dan FileUpload tests.
- Pisahkan atau hapus debug/demo code yang tidak dipakai setelah import graph diverifikasi.
- Tambahkan scripts `typecheck`, `test:run`, dan `check`.
- Pastikan production build selesai dengan batas waktu wajar.

Exit: typecheck, unit test, dan production build lulus pada host dan container.

## Fase 1 — Shell, routing, navigation (P0)

- Canonical `/dashboard`; legacy overview hanya redirect.
- Dashboard children: Home, Asset, Inspection, Maintenance, Compliance.
- Primary navigation mendukung wheel, drag/touch, keyboard, dan active-item centering.
- Sidebar memakai ID/slug stabil dan icon registry.
- Route manifest menjadi contract test untuk route, fallback menu, dan seeded menu.
- Deep-link refresh dan unauthorized route eksplisit.
- Setiap root module memiliki landing page canonical agar user memilih workflow sebelum masuk ke child page.
- Landing destinations harus difilter berdasarkan user menu tree/permission.

Exit: test desktop/mobile/touch lulus; tidak ada missing icon atau orphan route.

## Fase 2 — Data access dan state ownership (P0)

- Konsolidasikan jalur config/API menjadi satu `shared/api`.
- Tetapkan response envelope dan error model bersama backend.
- Tambahkan TanStack Query provider dan query-key factory.
- Migrasikan Asset Registry list/detail/create/update sebagai slice pertama.
- Hapus asset server-state dari Redux setelah parity dan test lulus.

Exit: tidak ada direct Axios baru di component/page; invalidation dan loading/error state diuji.

## Fase 3 — Design system dan boundaries (P1)

- Token warna, spacing, typography, elevation, breakpoint.
- Primitives page header, data table, form field, empty/error/loading state, dialog, dan badge.
- Migrasi per fitur, bukan rewrite seluruh aplikasi sekaligus.
- Visual regression untuk shell dan halaman kritis.

## Fase 4 — AIMS workflows (P1)

Urutan: Asset Registry -> Inspection -> Maintenance -> Compliance -> Risk/RBI -> Analytics. Setiap slice wajib memiliki route, permission, API schema, state lengkap, audit metadata, dan test.

## Fase 5 — Performance dan operability (P2)

- Bundle budget per route dan lazy loading feature.
- WebSocket/SSE hanya untuk use case push.
- Error boundary, structured logging, web vitals, accessibility audit.
- Hapus dependency berdasarkan bundle/import analysis, bukan dugaan.

## Definition of done per slice

- Typecheck, test, dan build hijau.
- Route/menu/permission sinkron.
- Tidak ada mock data tersembunyi pada production path.
- Tenant dan error handling terlihat pada UI.
- API docs dan acceptance criteria diperbarui.
