import apiClient from './apiClient';

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  assetId: string;
  assetName: string;
  location: string;
  inspector: string;
  inspectionDate: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  photos: number;
  attachments: number;
  dueDate?: string;
  assignedTo?: string;
  resolution?: string;
  resolvedDate?: string;
}

export interface InspectionPlan {
  id: string;
  planNumber: string;
  title: string;
  assetTag: string;
  assetName: string;
  inspectionType: string;
  frequency: string;
  lastInspectionDate: string;
  nextInspectionDate: string;
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Overdue';
  assignedTeam: string;
  standard: string;
}

export interface InspectionTask {
  id: string;
  taskNumber: string;
  planId: string;
  assetTag: string;
  title: string;
  technique: 'Ultrasonic (UT)' | 'Visual (VT)' | 'Magnetic Particle (MT)' | 'Radiography (RT)' | 'Eddy Current (ET)';
  assignedInspector: string;
  dueDate: string;
  status: 'Pending' | 'In-Progress' | 'Completed';
  findingsCount: number;
}

// Fallback Realistic Inspection Data (ISO 14224 / API 510/570/653)
const MOCK_FINDINGS: Finding[] = [
  {
    id: 'FND-2026-001',
    title: 'Severe Localized Wall Thinning on Elbow 3',
    description: 'Ultrasonic measurement recorded 3.2mm remaining wall thickness (Minimum allowable: 4.5mm) due to flow-accelerated corrosion.',
    severity: 'critical',
    category: 'Corrosion',
    assetId: 'AST-P101-ELB',
    assetName: 'Crude Distillation Unit Piping - 8"-P-101',
    location: 'Refinery Area A - Unit 01',
    inspector: 'Budi Santoso (API 570 Certified)',
    inspectionDate: '2026-08-25',
    status: 'open',
    priority: 'urgent',
    photos: 4,
    attachments: 2,
    dueDate: '2026-09-10',
    assignedTo: 'Mechanical Integrity Team'
  },
  {
    id: 'FND-2026-002',
    title: 'Flange Gasket Leakage & Minor Crevice Corrosion',
    description: 'Trace leakage detected during pressurized gas sniffing. Visual inspection shows pitting around bolt holes.',
    severity: 'high',
    category: 'Mechanical',
    assetId: 'AST-V202',
    assetName: 'High Pressure Gas Separator V-202',
    location: 'Gas Processing Plant - Train 2',
    inspector: 'Ahmad Fauzi',
    inspectionDate: '2026-08-28',
    status: 'in_progress',
    priority: 'high',
    photos: 3,
    attachments: 1,
    dueDate: '2026-09-15',
    assignedTo: 'Turnaround Team'
  },
  {
    id: 'FND-2026-003',
    title: 'Surface Paint Degradation and Atmospheric Rusting',
    description: 'Coating breakdown covering approx 15% surface area on storage tank external shell plate #3.',
    severity: 'medium',
    category: 'Coating',
    assetId: 'AST-TK501',
    assetName: 'Diesel Storage Tank TK-501',
    location: 'Tank Farm South',
    inspector: 'Reza Pratama',
    inspectionDate: '2026-08-15',
    status: 'open',
    priority: 'normal',
    photos: 6,
    attachments: 1,
    dueDate: '2026-10-01',
    assignedTo: 'Painting & Blasting Contractor'
  },
  {
    id: 'FND-2026-004',
    title: 'Minor Vibration Anomaly on Bearing Housing',
    description: 'Vibration velocity peak at 4.2 mm/s RMS (Alarm threshold: 4.5 mm/s). Recommended lubrication review.',
    severity: 'low',
    category: 'Vibration',
    assetId: 'AST-P301A',
    assetName: 'Main Boiler Feedwater Pump P-301A',
    location: 'Utilities & Power Generation',
    inspector: 'Vibration Specialist Team',
    inspectionDate: '2026-08-10',
    status: 'resolved',
    priority: 'low',
    photos: 2,
    attachments: 3,
    resolvedDate: '2026-08-18',
    resolution: 'Bearing greased and re-aligned. Baseline vibration returned to 1.8 mm/s.'
  }
];

const MOCK_PLANS: InspectionPlan[] = [
  {
    id: 'PLN-001',
    planNumber: 'IP-2026-CDU-01',
    title: 'Annual RBI Ultrasonic Survey - CDU Unit',
    assetTag: 'CDU-UNIT-01',
    assetName: 'Atmospheric Distillation Column & Overhead System',
    inspectionType: 'Ultrasonic Thickness (UTM)',
    frequency: 'Annual',
    lastInspectionDate: '2025-09-10',
    nextInspectionDate: '2026-09-10',
    status: 'Scheduled',
    assignedTeam: 'NDT Level II Inspection Team',
    standard: 'API 510 / API 570'
  },
  {
    id: 'PLN-002',
    planNumber: 'IP-2026-TK-04',
    title: 'Storage Tank Floor Acoustic Emission & MFL Scan',
    assetTag: 'TK-501',
    assetName: 'Crude Oil Storage Tank 50,000 m³',
    inspectionType: 'Magnetic Flux Leakage (MFL)',
    frequency: '5-Year Cycle',
    lastInspectionDate: '2021-08-15',
    nextInspectionDate: '2026-08-15',
    status: 'Overdue',
    assignedTeam: 'Specialized Tank Inspection Partner',
    standard: 'API 653'
  },
  {
    id: 'PLN-003',
    planNumber: 'IP-2026-HEX-12',
    title: 'Heat Exchanger Bundle Eddy Current Testing (ECT)',
    assetTag: 'E-102A/B',
    assetName: 'Feed Preheater Shell & Tube Exchangers',
    inspectionType: 'Eddy Current (ECT)',
    frequency: 'Turnaround Inspection',
    lastInspectionDate: '2024-04-20',
    nextInspectionDate: '2026-10-15',
    status: 'Scheduled',
    assignedTeam: 'Integrity Engineering Unit',
    standard: 'ASME Sec VIII / API 510'
  }
];

export const inspectionService = {
  async getFindings(params?: any): Promise<{ data: Finding[]; total: number }> {
    try {
      const res = await apiClient.get('/inspections/findings', { params });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback
    }
    return { data: MOCK_FINDINGS, total: MOCK_FINDINGS.length };
  },

  async getPlans(params?: any): Promise<{ data: InspectionPlan[]; total: number }> {
    try {
      const res = await apiClient.get('/inspections/plans', { params });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback
    }
    return { data: MOCK_PLANS, total: MOCK_PLANS.length };
  },

  async createFinding(finding: Partial<Finding>): Promise<Finding> {
    try {
      const res = await apiClient.post('/inspections/findings', finding);
      if (res.data?.data) return res.data.data;
    } catch {
      // Fallback
    }
    const newFinding: Finding = {
      id: `FND-${Date.now()}`,
      title: finding.title || 'New Inspection Finding',
      description: finding.description || '',
      severity: finding.severity || 'medium',
      category: finding.category || 'General',
      assetId: finding.assetId || 'AST-001',
      assetName: finding.assetName || 'General Asset',
      location: finding.location || 'Site Plant',
      inspector: finding.inspector || 'Inspection Staff',
      inspectionDate: new Date().toISOString().split('T')[0],
      status: 'open',
      priority: finding.priority || 'normal',
      photos: 0,
      attachments: 0,
    };
    MOCK_FINDINGS.unshift(newFinding);
    return newFinding;
  }
};
