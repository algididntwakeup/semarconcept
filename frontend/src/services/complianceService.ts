import apiClient from './apiClient';

export interface ComplianceStandard {
  id: string;
  code: string;
  title: string;
  organization: 'ISO' | 'API' | 'IEC' | 'ASME';
  version: string;
  description: string;
  category: 'Asset Reliability' | 'Pressure Vessels & Piping' | 'Risk Inspection' | 'Functional Safety';
  complianceLevel: number; // percentage
  status: 'Compliant' | 'Partially-Compliant' | 'Non-Compliant';
  lastAuditDate: string;
  mandatoryRequirementsCount: number;
}

export interface ComplianceAudit {
  id: string;
  auditNumber: string;
  title: string;
  standardCode: string;
  leadAuditor: string;
  auditDate: string;
  status: 'Completed' | 'In-Progress' | 'Scheduled';
  score: number;
  openFindingsCount: number;
}

const MOCK_STANDARDS: ComplianceStandard[] = [
  {
    id: 'STD-01',
    code: 'ISO 14224:2016',
    title: 'Petroleum, petrochemical and natural gas industries — Collection and exchange of reliability and maintenance data for equipment',
    organization: 'ISO',
    version: '2016 (Ed. 3)',
    description: 'Menstandarisasi taksonomi 9 level, boundary peralatan, failure mechanisms, failure modes, dan data pemeliharaan.',
    category: 'Asset Reliability',
    complianceLevel: 96.5,
    status: 'Compliant',
    lastAuditDate: '2026-06-15',
    mandatoryRequirementsCount: 42
  },
  {
    id: 'STD-02',
    code: 'API RP 580 / 581',
    title: 'Risk-Based Inspection (RBI) Methodology and Base Resource Document',
    organization: 'API',
    version: '2020 (4th Ed)',
    description: 'Metodologi kalkulasi probability of failure (PoF) dan consequence of failure (CoF) kuantitatif dan semi-kuantitatif.',
    category: 'Risk Inspection',
    complianceLevel: 94.0,
    status: 'Compliant',
    lastAuditDate: '2026-07-20',
    mandatoryRequirementsCount: 38
  },
  {
    id: 'STD-03',
    code: 'ISO 55001:2014',
    title: 'Asset management — Management systems — Requirements',
    organization: 'ISO',
    version: '2014',
    description: 'Kerangka kerja tata kelola manajemen aset fisik perusahaan di industri berat.',
    category: 'Asset Reliability',
    complianceLevel: 91.2,
    status: 'Compliant',
    lastAuditDate: '2026-05-10',
    mandatoryRequirementsCount: 50
  },
  {
    id: 'STD-04',
    code: 'API 579-1 / ASME FFS-1',
    title: 'Fitness-For-Service (FFS) Assessment for Flawed Equipment',
    organization: 'API',
    version: '2021',
    description: 'Prosedur evaluasi integritas struktural bejana tekan, perpipaan, dan tangki penimbun yang mengalami degradasi.',
    category: 'Pressure Vessels & Piping',
    complianceLevel: 88.5,
    status: 'Partially-Compliant',
    lastAuditDate: '2026-08-01',
    mandatoryRequirementsCount: 29
  }
];

export const complianceService = {
  async getStandards(params?: any): Promise<{ data: ComplianceStandard[]; total: number }> {
    try {
      const res = await apiClient.get('/compliance/standards', { params });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback
    }
    return { data: MOCK_STANDARDS, total: MOCK_STANDARDS.length };
  }
};
