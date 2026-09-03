// platform/frontend-mui/src/features/inspection/types.ts

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type FindingPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  category: string;
  assetId: string;
  assetName: string;
  location: string;
  inspector: string;
  inspectionDate: string;
  status: FindingStatus;
  priority: FindingPriority;
  photos: number;
  attachments: number;
  dueDate?: string;
  assignedTo?: string;
  resolution?: string;
  resolvedDate?: string;
}

export interface FindingFormData {
  title: string;
  description: string;
  severity: FindingSeverity;
  category: string;
  assetId: string;
  assetName: string;
  location: string;
  inspector: string;
  priority: FindingPriority;
  dueDate?: string;
  assignedTo?: string;
}

export type PlanStatus = 'Scheduled' | 'In-Progress' | 'Completed' | 'Overdue' | 'Draft' | 'Active' | 'Paused' | 'Cancelled';
export type PlanPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface InspectionPlan {
  id: string;
  planNumber: string;
  title: string;
  name?: string; // Compatibility alias
  assetTag: string;
  assetName: string;
  inspectionType: string;
  frequency: string;
  lastInspectionDate: string;
  nextInspectionDate: string;
  nextDue?: string; // Compatibility alias
  status: PlanStatus;
  priority?: PlanPriority;
  assignedTeam: string;
  standard: string;
  completionRate?: number;
}

export interface InspectionPlanFormData {
  planNumber: string;
  title: string;
  assetTag: string;
  assetName: string;
  inspectionType: string;
  frequency: string;
  nextInspectionDate: string;
  assignedTeam: string;
  standard: string;
  priority?: PlanPriority;
}

export type TaskTechnique =
  | 'Ultrasonic (UT)'
  | 'Visual (VT)'
  | 'Magnetic Particle (MT)'
  | 'Radiography (RT)'
  | 'Eddy Current (ET)'
  | 'Thickness Measurement'
  | 'Visual Inspection';

export type TaskStatus = 'Pending' | 'In Progress' | 'In-Progress' | 'Scheduled' | 'Completed' | 'Overdue' | 'Not Started';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface InspectionTask {
  id: string;
  taskNumber?: string;
  planId?: string;
  assetTag?: string;
  asset?: string; // Compatibility alias
  title: string;
  technique?: TaskTechnique | string;
  type?: string; // Compatibility alias
  assignedInspector?: string;
  assignee?: string; // Compatibility alias
  dueDate: string;
  status: TaskStatus;
  priority?: TaskPriority;
  findingsCount?: number;
  progress?: number;
}

export interface InspectionSearchParams {
  search?: string;
  status?: string;
  severity?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface InspectionStatistics {
  totalPlans: number;
  activePlans: number;
  overduePlans: number;
  totalFindings: number;
  criticalFindings: number;
  openFindings: number;
  resolvedFindings: number;
  complianceRate: number;
}
