import apiClient from './apiClient';

export interface RiskItem {
  id: string;
  riskNumber: string;
  title: string;
  assetTag: string;
  assetName: string;
  consequenceScore: 1 | 2 | 3 | 4 | 5; // 1=Negligible, 5=Catastrophic
  probabilityScore: 1 | 2 | 3 | 4 | 5; // 1=Very Low, 5=Very High
  riskScore: number; // Consequence * Probability
  riskLevel: 'Low' | 'Medium' | 'Medium High' | 'High' | 'Critical';
  damageMechanism: string; // API 571 damage mechanism
  consequenceCategory: 'Safety' | 'Environmental' | 'Financial' | 'Operational';
  mitigationStrategy: string;
  assessmentDate: string;
  status: 'Open' | 'Mitigating' | 'Accepted' | 'Closed';
}

export interface DegradationRate {
  assetTag: string;
  assetName: string;
  component: string;
  nominalThickness: number; // mm
  measuredThickness: number; // mm
  minimumRequiredThickness: number; // t_min mm
  corrosionRate: number; // mm/year
  estimatedRemainingLife: number; // years
  halfLifeDate: string;
  damageMechanism: string;
  healthIndex: number;
}

const MOCK_RISKS: RiskItem[] = [
  {
    id: 'RSK-2026-001',
    riskNumber: 'RBI-CDU-01',
    title: 'High Temperature Sulfidic Corrosion on CDU Overhead',
    assetTag: 'CDU-V-101',
    assetName: 'Crude Distillation Column Overhead Separator',
    consequenceScore: 5,
    probabilityScore: 4,
    riskScore: 20,
    riskLevel: 'Critical',
    damageMechanism: 'API 571 - Sulfidation (4.4.2)',
    consequenceCategory: 'Safety',
    mitigationStrategy: 'Execute Cladding Inspection & Ultrasonic scan every 6 months. Upgrade metallurgy to SS 316L in next Turnaround.',
    assessmentDate: '2026-08-20',
    status: 'Mitigating'
  },
  {
    id: 'RSK-2026-002',
    riskNumber: 'RBI-TK-02',
    title: 'External Corrosion Under Insulation (CUI) on Pipe Rack',
    assetTag: 'PIP-8-HYD-201',
    assetName: 'High Pressure Hydrogen Line 8"',
    consequenceScore: 5,
    probabilityScore: 3,
    riskScore: 15,
    riskLevel: 'High',
    damageMechanism: 'API 571 - Corrosion Under Insulation (4.3.3)',
    consequenceCategory: 'Safety',
    mitigationStrategy: 'Pulsed Eddy Current (PEC) screening and strip insulation for visual evaluation.',
    assessmentDate: '2026-08-18',
    status: 'Open'
  },
  {
    id: 'RSK-2026-003',
    riskNumber: 'RBI-HEX-07',
    title: 'Chloride Stress Corrosion Cracking (Cl-SCC)',
    assetTag: 'E-201A',
    assetName: 'Kerosene Hydrotreater Feed Effluent Exchanger',
    consequenceScore: 4,
    probabilityScore: 3,
    riskScore: 12,
    riskLevel: 'High',
    damageMechanism: 'API 571 - Chloride Stress Corrosion Cracking (4.5.1)',
    consequenceCategory: 'Financial',
    mitigationStrategy: 'Conduct Dye Penetrant (PT) inspection on weld seams during turnaround.',
    assessmentDate: '2026-08-10',
    status: 'Mitigating'
  },
  {
    id: 'RSK-2026-004',
    riskNumber: 'RBI-PMP-11',
    title: 'Cavitation & Erosion on Impeller Vanes',
    assetTag: 'P-105B',
    assetName: 'Slurry Circulation Pump B',
    consequenceScore: 3,
    probabilityScore: 2,
    riskScore: 6,
    riskLevel: 'Medium',
    damageMechanism: 'API 571 - Erosion / Cavitation (4.2.14)',
    consequenceCategory: 'Operational',
    mitigationStrategy: 'Vibration monitoring & spare impeller availability.',
    assessmentDate: '2026-07-29',
    status: 'Accepted'
  },
  {
    id: 'RSK-2026-005',
    riskNumber: 'RBI-FLT-09',
    title: 'Atmospheric Corrosion on Tank Roof Structure',
    assetTag: 'TK-502',
    assetName: 'Water Storage Tank TK-502',
    consequenceScore: 2,
    probabilityScore: 1,
    riskScore: 2,
    riskLevel: 'Low',
    damageMechanism: 'API 571 - Atmospheric Corrosion (4.3.2)',
    consequenceCategory: 'Environmental',
    mitigationStrategy: 'Re-coat with epoxy barrier paint in Q4 2026.',
    assessmentDate: '2026-07-15',
    status: 'Closed'
  }
];

const MOCK_DEGRADATION: DegradationRate[] = [
  {
    assetTag: 'CDU-V-101',
    assetName: 'Distillation Column Top Section',
    component: 'Top Shell Ring #1',
    nominalThickness: 16.0,
    measuredThickness: 11.2,
    minimumRequiredThickness: 8.5,
    corrosionRate: 0.35,
    estimatedRemainingLife: 7.7,
    halfLifeDate: '2030-05-15',
    damageMechanism: 'Sulfidation & H2S',
    healthIndex: 78.4
  },
  {
    assetTag: 'PIP-8-HYD-201',
    assetName: 'Hydrogen Line 8" Sch 80',
    component: 'Elbow 90° E-04',
    nominalThickness: 12.7,
    measuredThickness: 7.8,
    minimumRequiredThickness: 6.2,
    corrosionRate: 0.42,
    estimatedRemainingLife: 3.8,
    halfLifeDate: '2028-04-10',
    damageMechanism: 'CUI & Wet H2S',
    healthIndex: 61.2
  },
  {
    assetTag: 'E-201A',
    assetName: 'Hydrotreater Exchanger',
    component: 'Channel Head Cover',
    nominalThickness: 25.4,
    measuredThickness: 23.1,
    minimumRequiredThickness: 18.0,
    corrosionRate: 0.15,
    estimatedRemainingLife: 34.0,
    halfLifeDate: '2043-09-01',
    damageMechanism: 'Chloride Pitting',
    healthIndex: 92.5
  }
];

export const riskService = {
  async getRiskMatrixItems(params?: any): Promise<{ data: RiskItem[]; total: number }> {
    try {
      const res = await apiClient.get('/risk/matrix', { params });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback
    }
    return { data: MOCK_RISKS, total: MOCK_RISKS.length };
  },

  async getDegradationRates(params?: any): Promise<{ data: DegradationRate[]; total: number }> {
    try {
      const res = await apiClient.get('/risk/degradation', { params });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback
    }
    return { data: MOCK_DEGRADATION, total: MOCK_DEGRADATION.length };
  },

  calculateRiskScore(probability: number, consequence: number): { score: number; level: RiskItem['riskLevel'] } {
    const score = probability * consequence;
    if (score >= 20) return { score, level: 'Critical' };
    if (score >= 12) return { score, level: 'High' };
    if (score >= 8) return { score, level: 'Medium High' };
    if (score >= 4) return { score, level: 'Medium' };
    return { score, level: 'Low' };
  }
};
