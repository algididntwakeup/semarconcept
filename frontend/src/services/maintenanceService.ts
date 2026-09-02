import apiClient from './apiClient';

export interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  assetTag: string;
  assetName: string;
  type: 'Corrective' | 'Preventive' | 'Emergency' | 'Inspection Follow-up';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Approved' | 'In-Progress' | 'Waiting-Parts' | 'Completed' | 'Closed';
  assignedTo: string;
  estimatedHours: number;
  actualHours?: number;
  createdDate: string;
  dueDate: string;
  completionDate?: string;
  costEstimate: number;
}

export interface MaintenancePlan {
  id: string;
  planCode: string;
  title: string;
  equipmentClass: string;
  interval: string;
  taskCount: number;
  assignedRole: string;
  complianceStandard: string;
  status: 'Active' | 'Under-Review' | 'Draft';
}

const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-2026-001',
    orderNumber: 'WO-CDU-9021',
    title: 'Replacement of Thinning Elbow Piping 8"-P-101',
    assetTag: 'AST-P101-ELB',
    assetName: 'Crude Distillation Unit Piping - 8"-P-101',
    type: 'Inspection Follow-up',
    priority: 'Urgent',
    status: 'In-Progress',
    assignedTo: 'Welding Specialist Team A',
    estimatedHours: 16,
    createdDate: '2026-08-26',
    dueDate: '2026-09-08',
    costEstimate: 45000000
  },
  {
    id: 'WO-2026-002',
    orderNumber: 'WO-PM-2026-088',
    title: 'Quarterly Lubrication & Mechanical Seal Flush',
    assetTag: 'AST-P301A',
    assetName: 'Main Boiler Feedwater Pump P-301A',
    type: 'Preventive',
    priority: 'Medium',
    status: 'Approved',
    assignedTo: 'Rotating Equipment Technician',
    estimatedHours: 4,
    createdDate: '2026-08-28',
    dueDate: '2026-09-12',
    costEstimate: 8500000
  },
  {
    id: 'WO-2026-003',
    orderNumber: 'WO-TK-501-REP',
    title: 'External Coating Touch-up & Primer Application',
    assetTag: 'AST-TK501',
    assetName: 'Diesel Storage Tank TK-501',
    type: 'Corrective',
    priority: 'Low',
    status: 'Waiting-Parts',
    assignedTo: 'Painting Subcontractor',
    estimatedHours: 32,
    createdDate: '2026-08-20',
    dueDate: '2026-09-30',
    costEstimate: 22000000
  }
];

export const maintenanceService = {
  async getWorkOrders(params?: any): Promise<{ data: WorkOrder[]; total: number }> {
    try {
      const res = await apiClient.get('/maintenance/work-orders', { params });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback
    }
    return { data: MOCK_WORK_ORDERS, total: MOCK_WORK_ORDERS.length };
  },

  async updateWorkOrderStatus(id: string, status: WorkOrder['status']): Promise<boolean> {
    try {
      await apiClient.patch(`/maintenance/work-orders/${id}/status`, { status });
      return true;
    } catch {
      const wo = MOCK_WORK_ORDERS.find(w => w.id === id);
      if (wo) wo.status = status;
      return true;
    }
  }
};
