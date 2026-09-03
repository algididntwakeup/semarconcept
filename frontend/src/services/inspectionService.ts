// platform/frontend-mui/src/services/inspectionService.ts
import apiClient from './apiClient';
import {
  Finding,
  FindingFormData,
  InspectionPlan,
  InspectionPlanFormData,
  InspectionTask,
  InspectionSearchParams,
  InspectionStatistics,
} from '../features/inspection/types';

// Re-export domain types for backward compatibility
export type {
  Finding,
  FindingFormData,
  InspectionPlan,
  InspectionPlanFormData,
  InspectionTask,
  InspectionSearchParams,
  InspectionStatistics,
};

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
    assignedTo: 'Mechanical Integrity Team',
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
    assignedTo: 'Turnaround Team',
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
    assignedTo: 'Painting & Blasting Contractor',
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
    resolution: 'Bearing greased and re-aligned. Baseline vibration returned to 1.8 mm/s.',
  },
];

const MOCK_PLANS: InspectionPlan[] = [
  {
    id: 'PLN-001',
    planNumber: 'IP-2026-CDU-01',
    title: 'Annual RBI Ultrasonic Survey - CDU Unit',
    name: 'Annual RBI Ultrasonic Survey - CDU Unit',
    assetTag: 'CDU-UNIT-01',
    assetName: 'Atmospheric Distillation Column & Overhead System',
    inspectionType: 'Ultrasonic Thickness (UTM)',
    frequency: 'Annual',
    lastInspectionDate: '2025-09-10',
    nextInspectionDate: '2026-09-10',
    nextDue: '2026-09-10',
    status: 'Active',
    priority: 'High',
    assignedTeam: 'NDT Level II Inspection Team',
    standard: 'API 510 / API 570',
    completionRate: 95,
  },
  {
    id: 'PLN-002',
    planNumber: 'IP-2026-TK-04',
    title: 'Storage Tank Floor Acoustic Emission & MFL Scan',
    name: 'Storage Tank Floor Acoustic Emission & MFL Scan',
    assetTag: 'TK-501',
    assetName: 'Crude Oil Storage Tank 50,000 m³',
    inspectionType: 'Magnetic Flux Leakage (MFL)',
    frequency: '5-Year Cycle',
    lastInspectionDate: '2021-08-15',
    nextInspectionDate: '2026-08-15',
    nextDue: '2026-08-15',
    status: 'Overdue',
    priority: 'Critical',
    assignedTeam: 'Specialized Tank Inspection Partner',
    standard: 'API 653',
    completionRate: 88,
  },
  {
    id: 'PLN-003',
    planNumber: 'IP-2026-HEX-12',
    title: 'Heat Exchanger Bundle Eddy Current Testing (ECT)',
    name: 'Heat Exchanger Bundle Eddy Current Testing (ECT)',
    assetTag: 'E-102A/B',
    assetName: 'Feed Preheater Shell & Tube Exchangers',
    inspectionType: 'Eddy Current (ECT)',
    frequency: 'Turnaround Inspection',
    lastInspectionDate: '2024-04-20',
    nextInspectionDate: '2026-10-15',
    nextDue: '2026-10-15',
    status: 'Scheduled',
    priority: 'Medium',
    assignedTeam: 'Integrity Engineering Unit',
    standard: 'ASME Sec VIII / API 510',
    completionRate: 40,
  },
];

const MOCK_TASKS: InspectionTask[] = [
  {
    id: 'TASK-001',
    taskNumber: 'TASK-001',
    planId: 'PLN-001',
    assetTag: 'CDU-P101',
    asset: 'Pump A-101',
    title: 'Visual Inspection - Pump A-101',
    technique: 'Visual Inspection',
    type: 'Visual Inspection',
    assignedInspector: 'John Doe',
    assignee: 'John Doe',
    dueDate: '2026-06-15',
    status: 'In Progress',
    priority: 'High',
    progress: 65,
    findingsCount: 1,
  },
  {
    id: 'TASK-002',
    taskNumber: 'TASK-002',
    planId: 'PLN-001',
    assetTag: 'CDU-P102',
    asset: 'Compressor C-205',
    title: 'Quarterly Compressor Vibration Check',
    technique: 'Ultrasonic (UT)',
    type: 'Ultrasonic (UT)',
    assignedInspector: 'Ahmad Fauzi',
    assignee: 'Ahmad Fauzi',
    dueDate: '2026-07-01',
    status: 'Scheduled',
    priority: 'Critical',
    progress: 10,
    findingsCount: 0,
  },
  {
    id: 'TASK-003',
    taskNumber: 'TASK-003',
    planId: 'PLN-002',
    assetTag: 'TK-501-P',
    asset: 'Pipe D-410',
    title: 'Thickness Measurement - Pipe D-410',
    technique: 'Thickness Measurement',
    type: 'Thickness Measurement',
    assignedInspector: 'Bob Wilson',
    assignee: 'Bob Wilson',
    dueDate: '2026-06-10',
    status: 'Completed',
    priority: 'Low',
    progress: 100,
    findingsCount: 2,
  },
];

export const inspectionService = {
  async getFindings(params?: InspectionSearchParams): Promise<{ data: Finding[]; total: number }> {
    try {
      const res = await apiClient.get('/inspections/findings', { params });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback to mock data with client-side filtering
    }

    let result = [...MOCK_FINDINGS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.assetName.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
    }
    if (params?.severity && params.severity !== 'all') {
      result = result.filter((f) => f.severity === params.severity);
    }
    if (params?.status && params.status !== 'all') {
      result = result.filter((f) => f.status === params.status);
    }

    return { data: result, total: result.length };
  },

  async getFindingById(id: string): Promise<Finding> {
    try {
      const res = await apiClient.get(`/inspections/findings/${id}`);
      if (res.data?.data) return res.data.data;
    } catch {
      // Fallback
    }

    const found = MOCK_FINDINGS.find((f) => f.id === id);
    if (!found) {
      throw new Error(`Finding not found: ${id}`);
    }
    return found;
  },

  async createFinding(finding: Partial<FindingFormData>): Promise<Finding> {
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
      dueDate: finding.dueDate,
      assignedTo: finding.assignedTo,
    };
    MOCK_FINDINGS.unshift(newFinding);
    return newFinding;
  },

  async updateFinding(id: string, update: Partial<FindingFormData>): Promise<Finding> {
    try {
      const res = await apiClient.put(`/inspections/findings/${id}`, update);
      if (res.data?.data) return res.data.data;
    } catch {
      // Fallback
    }

    const index = MOCK_FINDINGS.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new Error(`Finding not found: ${id}`);
    }
    MOCK_FINDINGS[index] = { ...MOCK_FINDINGS[index], ...update };
    return MOCK_FINDINGS[index];
  },

  async deleteFinding(id: string): Promise<void> {
    try {
      await apiClient.delete(`/inspections/findings/${id}`);
      return;
    } catch {
      // Fallback
    }

    const index = MOCK_FINDINGS.findIndex((f) => f.id === id);
    if (index !== -1) {
      MOCK_FINDINGS.splice(index, 1);
    }
  },

  async getPlans(params?: InspectionSearchParams): Promise<{ data: InspectionPlan[]; total: number }> {
    try {
      const res = await apiClient.get('/inspections/plans', { params });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback
    }

    let result = [...MOCK_PLANS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.assetName.toLowerCase().includes(q) ||
          p.assetTag.toLowerCase().includes(q)
      );
    }
    if (params?.status && params.status !== 'all') {
      result = result.filter((p) => p.status === params.status);
    }

    return { data: result, total: result.length };
  },

  async getPlanById(id: string): Promise<InspectionPlan> {
    try {
      const res = await apiClient.get(`/inspections/plans/${id}`);
      if (res.data?.data) return res.data.data;
    } catch {
      // Fallback
    }

    const found = MOCK_PLANS.find((p) => p.id === id);
    if (!found) {
      throw new Error(`Inspection plan not found: ${id}`);
    }
    return found;
  },

  async createPlan(plan: Partial<InspectionPlanFormData>): Promise<InspectionPlan> {
    try {
      const res = await apiClient.post('/inspections/plans', plan);
      if (res.data?.data) return res.data.data;
    } catch {
      // Fallback
    }

    const newPlan: InspectionPlan = {
      id: `PLN-${Date.now()}`,
      planNumber: plan.planNumber || `IP-2026-${Date.now().toString().slice(-4)}`,
      title: plan.title || 'New Inspection Plan',
      name: plan.title || 'New Inspection Plan',
      assetTag: plan.assetTag || 'TAG-001',
      assetName: plan.assetName || 'General Equipment',
      inspectionType: plan.inspectionType || 'Visual Inspection',
      frequency: plan.frequency || 'Annual',
      lastInspectionDate: new Date().toISOString().split('T')[0],
      nextInspectionDate: plan.nextInspectionDate || '2026-12-31',
      nextDue: plan.nextInspectionDate || '2026-12-31',
      status: 'Active',
      priority: plan.priority || 'Medium',
      assignedTeam: plan.assignedTeam || 'NDT Team',
      standard: plan.standard || 'API 510',
      completionRate: 0,
    };
    MOCK_PLANS.unshift(newPlan);
    return newPlan;
  },

  async getTasks(params?: InspectionSearchParams): Promise<{ data: InspectionTask[]; total: number }> {
    try {
      const res = await apiClient.get('/inspections/tasks', { params });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback
    }

    let result = [...MOCK_TASKS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.asset && t.asset.toLowerCase().includes(q)) ||
          (t.assetTag && t.assetTag.toLowerCase().includes(q))
      );
    }
    if (params?.status && params.status !== 'all') {
      result = result.filter((t) => t.status === params.status);
    }

    return { data: result, total: result.length };
  },

  async getStatistics(params?: Record<string, any>): Promise<InspectionStatistics> {
    try {
      const res = await apiClient.get('/inspections/statistics', { params });
      if (res.data?.data) return res.data.data;
    } catch {
      // Fallback
    }

    return {
      totalPlans: MOCK_PLANS.length,
      activePlans: MOCK_PLANS.filter((p) => p.status === 'Active' || p.status === 'Scheduled').length,
      overduePlans: MOCK_PLANS.filter((p) => p.status === 'Overdue').length,
      totalFindings: MOCK_FINDINGS.length,
      criticalFindings: MOCK_FINDINGS.filter((f) => f.severity === 'critical').length,
      openFindings: MOCK_FINDINGS.filter((f) => f.status === 'open' || f.status === 'in_progress').length,
      resolvedFindings: MOCK_FINDINGS.filter((f) => f.status === 'resolved' || f.status === 'closed').length,
      complianceRate: 94.2,
    };
  },
};

export default inspectionService;
