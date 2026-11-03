// platform/frontend-mui/src/types/floc.ts

/** Installed equipment on a functional location */
export interface InstalledEquipment {
  id: number;
  tag_number: string;
  name: string;
  asset_class: string;
  asset_type: string;
  status: string;
  criticality?: number | null;
}

/** Functional Location node in ISO 14224 hierarchy (L1-L8) */
export interface FlocNode {
  id: number;
  tenant_id: number;
  parent_id?: number | null;
  code: string;
  description: string;
  level: number;
  is_active: boolean;
  installed_equipment_count: number;
  path?: string;
  equipments?: InstalledEquipment[];
  installed_equipments?: InstalledEquipment[];
  children?: FlocNode[];
}

export type FlocTreeResponse = FlocNode[];

