// platform/frontend-mui/src/types/asset.ts
/**
 * Asset Management Type Definitions
 * Based on Reksolindo Enterprise Asset Management System UI/UX Design Guide v2.0
 */

/**
 * Asset Hierarchy Levels
 * Flexible hierarchy: Site → Unit → Asset → Component
 * Assets use self-referencing parent_id for ISO 55000 compliance
 */
export type AssetHierarchyLevel = 'site' | 'unit' | 'asset' | 'equipment' | 'component';

/**
 * Asset Status Enumeration
 */
export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'decommissioned' | 'planned';

/**
 * Asset Criticality Level (1-5 scale)
 */
export type CriticalityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Integrity Status Enumeration
 */
export type IntegrityStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

/**
 * Asset Types based on industrial equipment categories
 */
export type AssetType = 
  | 'pressure_vessel'
  | 'heat_exchanger'
  | 'pump'
  | 'compressor'
  | 'valve'
  | 'pipe'
  | 'tank'
  | 'reactor'
  | 'turbine'
  | 'boiler'
  | 'cooling_tower'
  | 'motor'
  | 'transformer'
  | 'instrumentation'
  | 'structure'
  | 'location'
  | 'facility'
  | 'area'
  | 'system'
  | 'other';

/**
 * Inspection Strategy Types
 */
export type InspectionStrategy = 'rbi' | 'fixed' | 'condition' | 'predictive';

/**
 * Technical Specifications Interface
 */
export interface TechnicalSpecifications {
  designPressure?: number; // bar
  designTemperature?: number; // °C
  operatingPressure?: number; // bar
  operatingTemperature?: number; // °C
  material?: string;
  designThickness?: number; // mm
  currentThickness?: number; // mm
  volume?: number; // m³
  diameter?: number; // mm
  length?: number; // mm
  weight?: number; // kg
  capacity?: number;
  flowRate?: number; // m³/h
  power?: number; // kW
  voltage?: number; // V
  frequency?: number; // Hz
  efficiency?: number; // %
  manufacturingYear?: number;
  commissioningDate?: string;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  designLife?: number; // years
  remainingLife?: number; // years
  [key: string]: any; // Allow additional custom specifications
}

/**
 * Location Information Interface
 */
export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  address?: string;
  building?: string;
  floor?: string;
  room?: string;
  coordinates?: string;
  description?: string;
}

/**
 * Asset Health Metrics
 */
export interface AssetHealth {
  overallScore: number; // 0-100
  mechanicalHealth: number;
  corrosionHealth: number;
  operationalHealth: number;
  safetyHealth: number;
  environmentalHealth: number;
  lastAssessmentDate: string;
  assessedBy: string;
  notes?: string;
}

/**
 * Risk Assessment Data
 */
export interface RiskAssessment {
  id: string;
  probabilityOfFailure: number; // 1-5 scale
  consequenceOfFailure: number; // 1-5 scale
  riskScore: number; // calculated: PoF * CoF
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  assessmentDate: string;
  assessedBy: string;
  methodology: string;
  degradationMechanisms: string[];
  nextAssessmentDate: string;
  mitigationMeasures?: string[];
  notes?: string;
}

/**
 * Maintenance Information
 */
export interface MaintenanceInfo {
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceFrequency?: number; // months
  maintenanceType?: 'preventive' | 'corrective' | 'predictive' | 'condition_based';
  maintenanceStrategy?: string;
  workOrderCount?: number;
  averageDowntime?: number; // hours
  maintenanceCost?: number;
  totalCostYear?: number;
  vendor?: string;
  spareParts?: string[];
}

/**
 * Compliance Information
 */
export interface ComplianceInfo {
  standards: string[]; // e.g., ['ASME VIII', 'API 510']
  regulations: string[];
  certifications: string[];
  lastAuditDate?: string;
  nextAuditDate?: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending' | 'expired';
  findings?: string[];
  corrective_actions?: string[];
}

/**
 * Document Reference
 */
export interface DocumentReference {
  id: string;
  name: string;
  type: 'drawing' | 'manual' | 'certificate' | 'report' | 'photo' | 'other';
  url: string;
  size?: number;
  uploadDate: string;
  uploadedBy: string;
  version?: string;
  tags?: string[];
}

/**
 * Base Asset Interface
 */
export interface BaseAsset {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  tagNumber: string;
  type: AssetType;
  hierarchyLevel: AssetHierarchyLevel;
  status: AssetStatus;
  criticality: CriticalityLevel;
  integrityStatus: IntegrityStatus;
  
  // Hierarchy relationships
  parentId?: string; // ID of parent asset in hierarchy
  childrenIds?: string[]; // IDs of child assets
  hierarchyPath?: string; // Full path like "Site A / Unit 1 / Equipment 101"
  
  // Location
  location: LocationInfo;
  
  // Technical data
  specifications: TechnicalSpecifications;
  
  // Health and risk
  health?: AssetHealth;
  riskAssessment?: RiskAssessment;
  
  // Maintenance
  maintenance?: MaintenanceInfo;
  
  // Compliance
  compliance?: ComplianceInfo;
  
  // Inspection
  inspectionStrategy: InspectionStrategy;
  inspectionFrequency: number; // months
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  
  // Additional fields
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  cost?: number;
  
  // Safety and environmental
  safetyCritical: boolean;
  environmentallyCritical: boolean;
  
  // Documents
  documents?: DocumentReference[];
  
  // Custom fields for tenant-specific requirements
  customFields?: { [key: string]: any };
  
  // Flags
  isActive: boolean;
  isTemplate: boolean;
  
  // Tags and categories
  tags?: string[];
  categories?: string[];
  
  // Image/photo
  imageUrl?: string;
  thumbnailUrl?: string;
}

/**
 * Site-specific asset interface
 */
export interface Site extends BaseAsset {
  hierarchyLevel: 'site';
  unitCount?: number;
  totalEquipmentCount?: number;
  totalComponentCount?: number;
  siteManager?: string;
  operatingCompany?: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Unit-specific asset interface
 */
export interface Unit extends BaseAsset {
  hierarchyLevel: 'unit';
  siteId: string;
  equipmentCount?: number;
  componentCount?: number;
  unitType?: string;
  operatingProcedure?: string;
  capacity?: number;
  processDescription?: string;
}

/**
 * Equipment/Asset-specific interface (ISO 55000)
 * Supports self-referencing hierarchy via parentId
 */
export interface Equipment extends BaseAsset {
  hierarchyLevel: 'equipment' | 'asset';
  siteId?: string;
  unitId?: string;
  parentAssetId?: string; // Self-referencing parent asset ID
  componentCount?: number;
  equipmentFunction?: string;
  operatingConditions?: {
    pressure: number;
    temperature: number;
    flowRate?: number;
  };
  performanceParameters?: { [key: string]: number };
}

/**
 * Component-specific asset interface
 */
export interface Component extends BaseAsset {
  hierarchyLevel: 'component';
  siteId: string;
  unitId: string;
  equipmentId: string;
  componentFunction?: string;
  failureMode?: string[];
  wearMechanism?: string[];
}

/**
 * Union type for all asset types
 */
export type Asset = Site | Unit | Equipment | Component;

/**
 * Asset creation/update payload
 */
export interface AssetFormData {
  name: string;
  description?: string;
  tagNumber: string;
  type: AssetType;
  hierarchyLevel: AssetHierarchyLevel;
  parentId?: string;
  criticality: CriticalityLevel;
  inspectionStrategy: InspectionStrategy;
  inspectionFrequency: number;
  specifications: Partial<TechnicalSpecifications>;
  location: Partial<LocationInfo>;
  safetyCritical: boolean;
  environmentallyCritical: boolean;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  customFields?: { [key: string]: any };
  tags?: string[];
  categories?: string[];
}

/**
 * Asset search/filter parameters
 */
export interface AssetSearchParams {
  search?: string;
  type?: AssetType[];
  status?: AssetStatus[];
  criticality?: CriticalityLevel[];
  integrityStatus?: IntegrityStatus[];
  hierarchyLevel?: AssetHierarchyLevel[];
  parentId?: string;
  siteId?: string;
  unitId?: string;
  equipmentId?: string;
  tags?: string[];
  categories?: string[];
  inspectionDue?: boolean;
  maintenanceDue?: boolean;
  riskLevel?: string[];
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Asset list response
 */
export interface AssetListResponse {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Asset hierarchy node for tree navigation
 */
export interface AssetHierarchyNode {
  id: string;
  name: string;
  tagNumber: string;
  type: AssetType;
  hierarchyLevel: AssetHierarchyLevel;
  status: AssetStatus;
  criticality: CriticalityLevel;
  integrityStatus: IntegrityStatus;
  alertCount: number;
  dueInspections: number;
  children?: AssetHierarchyNode[];
  parentId?: string;
  hasChildren: boolean;
}

/**
 * Asset performance metrics
 */
export interface AssetMetrics {
  availability: number; // %
  reliability: number; // %
  utilization: number; // %
  efficiency: number; // %
  mtbf: number; // Mean Time Between Failures (hours)
  mttr: number; // Mean Time To Repair (hours)
  totalCost: number;
  maintenanceCost: number;
  operatingCost: number;
  energyConsumption: number;
  emissions: number;
  safetyIncidents: number;
  environmentalIncidents: number;
  period: {
    start: string;
    end: string;
  };
}

/**
 * Asset timeline event
 */
export interface AssetTimelineEvent {
  id: string;
  assetId: string;
  type: 'inspection' | 'maintenance' | 'modification' | 'incident' | 'installation' | 'retirement';
  title: string;
  description: string;
  date: string;
  createdBy: string;
  status?: string;
  details?: { [key: string]: any };
  attachments?: DocumentReference[];
}

/**
 * Asset import/export interfaces
 */
export interface AssetImportData {
  file: File;
  mapping: { [csvColumn: string]: keyof AssetFormData };
  options: {
    skipDuplicates: boolean;
    updateExisting: boolean;
    validateOnly: boolean;
  };
}

export interface AssetExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields: (keyof Asset)[];
  filters?: AssetSearchParams;
  includeChildren?: boolean;
  includeDocuments?: boolean;
}

/**
 * Asset statistics for dashboard
 */
export interface AssetStatistics {
  total: number;
  byStatus: { [key in AssetStatus]: number };
  byType: { [key in AssetType]: number };
  byCriticality: { [key in CriticalityLevel]: number };
  byIntegrity: { [key in IntegrityStatus]: number };
  byHierarchyLevel: { [key in AssetHierarchyLevel]: number };
  inspectionsDue: number;
  maintenanceDue: number;
  criticalAlerts: number;
  averageHealth: number;
  totalValue: number;
}

/**
 * Asset audit log entry
 */
export interface AssetAuditLog {
  id: string;
  assetId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  userId: string;
  userName: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: { [key: string]: any };
  ipAddress?: string;
  userAgent?: string;
}