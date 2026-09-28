# Equipment Master UI

Frontend Equipment Master lives at `/risk/equipment-master` under the Risk Based Inspection module.

## Reusable interactions

- `StatCard` receives metric title/count and an `onClick` handler.
- `StatDetailModal` loads matching equipment from the paginated asset API and provides tag search, lifecycle filtering, and sorting by tag, equipment name, or class/type.
- `AssetDataGrid` renders tag/equipment, description, class/type, lifecycle status, and a row-action menu.
- `RowActions` exposes Manage asset, Add component, View timeline, Edit, and Delete asset actions.
- `LifecycleDropdown` invokes `PUT /api/v1/assets/:id/lifecycle` with an action value: `Install`, `Send to repair`, `Retire`, or `Condemn`.

Lifecycle mutations invalidate the Equipment Master asset list and lifecycle statistics queries. Row details and timeline are displayed in the Equipment Master detail dialog; component creation navigates to Asset Hierarchy.

## Verification

Use `pnpm typecheck`, the focused Equipment Master component tests, relevant ESLint checks, and `pnpm build` from `frontend/`.
