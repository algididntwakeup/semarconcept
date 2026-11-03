// platform/frontend-mui/src/services/flocService.ts
import apiClient from './apiClient';
import type { FlocNode } from '../types/floc';

const unwrapApiData = <T,>(value: unknown): T => {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data: T }).data;
  }
  return value as T;
};

export const MOCK_FLOC_TREE: FlocNode[] = [
  {
    id: 1,
    tenant_id: 1,
    code: 'CORP-REK',
    description: 'PT Reksolindo Energy Corp',
    level: 1,
    is_active: true,
    installed_equipment_count: 0,
    path: 'PT Reksolindo Energy Corp',
    equipments: [],
    children: [
      {
        id: 2,
        tenant_id: 1,
        parent_id: 1,
        code: 'REG-WJ',
        description: 'Upstream Oil & Gas - West Java',
        level: 2,
        is_active: true,
        installed_equipment_count: 0,
        path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java',
        equipments: [],
        children: [
          {
            id: 3,
            tenant_id: 1,
            parent_id: 2,
            code: 'SITE-JTB',
            description: 'Jatibarang Onshore Field',
            level: 3,
            is_active: true,
            installed_equipment_count: 0,
            path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field',
            equipments: [],
            children: [
              {
                id: 4,
                tenant_id: 1,
                parent_id: 3,
                code: 'AREA-AGB',
                description: 'Gathering Station Akasia Bagus',
                level: 4,
                is_active: true,
                installed_equipment_count: 0,
                path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field > Gathering Station Akasia Bagus',
                equipments: [],
                children: [
                  {
                    id: 6,
                    tenant_id: 1,
                    parent_id: 4,
                    code: 'JI-JL-AG-11-PW',
                    description: 'Produced Water Treatment System',
                    level: 5,
                    is_active: true,
                    installed_equipment_count: 2,
                    path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field > Gathering Station Akasia Bagus > Produced Water Treatment System',
                    equipments: [
                      {
                        id: 101,
                        tag_number: 'P-101A',
                        name: 'Produced Water Charge Pump A',
                        asset_class: 'Pump',
                        asset_type: 'Centrifugal',
                        status: 'Installed',
                        criticality: 4,
                      },
                      {
                        id: 102,
                        tag_number: 'P-101B',
                        name: 'Produced Water Charge Pump B (Standby)',
                        asset_class: 'Pump',
                        asset_type: 'Centrifugal',
                        status: 'Installed',
                        criticality: 3,
                      },
                    ],
                    children: [
                      {
                        id: 10,
                        tenant_id: 1,
                        parent_id: 6,
                        code: 'JI-JL-AG-11-PW-PKG',
                        description: 'Produced Water Separator Package',
                        level: 6,
                        is_active: true,
                        installed_equipment_count: 1,
                        path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field > Gathering Station Akasia Bagus > Produced Water Treatment System > Produced Water Separator Package',
                        equipments: [
                          {
                            id: 103,
                            tag_number: 'V-102',
                            name: 'Produced Water Degasser Vessel',
                            asset_class: 'Pressure Vessel',
                            asset_type: 'Horizontal',
                            status: 'Installed',
                            criticality: 5,
                          },
                        ],
                        children: [
                          {
                            id: 14,
                            tenant_id: 1,
                            parent_id: 10,
                            code: 'JI-JL-AG-11-P101A',
                            description: 'Produced Water Charge Pump Skid A',
                            level: 7,
                            is_active: true,
                            installed_equipment_count: 1,
                            path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field > Gathering Station Akasia Bagus > Produced Water Treatment System > Produced Water Separator Package > Produced Water Charge Pump Skid A',
                            equipments: [
                              {
                                id: 104,
                                tag_number: 'M-101A',
                                name: 'Electric Motor Drive 75kW',
                                asset_class: 'Electrical',
                                asset_type: 'Induction Motor',
                                status: 'Installed',
                                criticality: 3,
                              },
                            ],
                            children: [
                              {
                                id: 17,
                                tenant_id: 1,
                                parent_id: 14,
                                code: 'JI-JL-AG-11-P101A-SEAL',
                                description: 'Mechanical Seal Cartridge Assembly',
                                level: 8,
                                is_active: true,
                                installed_equipment_count: 0,
                                path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field > Gathering Station Akasia Bagus > Produced Water Treatment System > Produced Water Separator Package > Produced Water Charge Pump Skid A > Mechanical Seal Cartridge Assembly',
                                equipments: [],
                                children: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: 7,
                    tenant_id: 1,
                    parent_id: 4,
                    code: 'JI-JL-AG-11-IS',
                    description: 'Inlet Separation System',
                    level: 5,
                    is_active: true,
                    installed_equipment_count: 1,
                    path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field > Gathering Station Akasia Bagus > Inlet Separation System',
                    equipments: [
                      {
                        id: 105,
                        tag_number: 'V-101',
                        name: 'High Pressure Inlet Slug Catcher',
                        asset_class: 'Pressure Vessel',
                        asset_type: 'Slug Catcher',
                        status: 'Installed',
                        criticality: 5,
                      },
                    ],
                    children: [
                      {
                        id: 11,
                        tenant_id: 1,
                        parent_id: 7,
                        code: 'JI-JL-AG-11-V101',
                        description: 'Slug Catcher Manifold & Boot',
                        level: 6,
                        is_active: true,
                        installed_equipment_count: 0,
                        path: 'PT Reksolindo Energy Corp > Upstream Oil & Gas - West Java > Jatibarang Onshore Field > Gathering Station Akasia Bagus > Inlet Separation System > Slug Catcher Manifold & Boot',
                        equipments: [],
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const flocService = {
  /**
   * Fetches the entire nested FLOC tree (ISO 14224 L1-L8) with installed equipment counts
   */
  async getFlocTree(): Promise<FlocNode[]> {
    try {
      const response = await apiClient.get('/functional-locations/tree');
      const data = unwrapApiData<FlocNode[]>(response.data);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return MOCK_FLOC_TREE;
    } catch {
      // Fallback for tests or disconnected client
      return MOCK_FLOC_TREE;
    }
  },
};

