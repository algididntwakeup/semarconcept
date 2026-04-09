// platform/frontend-mui/src/types/hierarchy.ts
/**
 * Asset Hierarchy Navigation Types
 * 4-level hierarchy: Site → Unit → Equipment → Component
 */

import { AssetHierarchyLevel, AssetStatus, AssetType, CriticalityLevel, IntegrityStatus } from './asset';

/**
 * Hierarchy navigation breadcrumb item
 */
export interface HierarchyBreadcrumb {
  id: string;
  name: string;
  tagNumber?: string;
  level: AssetHierarchyLevel;
  path: string;
  isActive?: boolean;
}

/**
 * Hierarchy tree node for navigation
 */
export interface HierarchyTreeNode {
  id: string;
  name: string;
  tagNumber?: string;
  type: AssetType;
  level: AssetHierarchyLevel;
  status: AssetStatus;
  criticality: CriticalityLevel;
  integrityStatus: IntegrityStatus;
  
  // Tree structure
  parentId?: string;
  children?: HierarchyTreeNode[];
  hasChildren: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
  
  // Counts and metrics
  childCount: number;
  alertCount: number;
  dueInspections: number;
  dueMaintenanceCount: number;
  
  // Display properties
  icon?: string;
  color?: string;
  description?: string;
  location?: string;
  
  // Metadata
  lastUpdated: string;
  createdAt: string;
}

/**
 * Hierarchy navigation context
 */
export interface HierarchyNavigationContext {
  currentLevel: AssetHierarchyLevel;
  currentNodeId?: string;
  breadcrumbs: HierarchyBreadcrumb[];
  selectedPath: string[];
  expandedNodes: Set<string>;
  filters: HierarchyFilters;
  sortOptions: HierarchySortOptions;
  viewMode: HierarchyViewMode;
}

/**
 * Hierarchy view modes
 */
export type HierarchyViewMode = 'tree' | 'grid' | 'list' | 'map';

/**
 * Hierarchy filters
 */
export interface HierarchyFilters {
  search?: string;
  status?: AssetStatus[];
  type?: AssetType[];
  criticality?: CriticalityLevel[];
  integrityStatus?: IntegrityStatus[];
  hasAlerts?: boolean;
  inspectionsDue?: boolean;
  maintenanceDue?: boolean;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Hierarchy sort options
 */
export interface HierarchySortOptions {
  field: 'name' | 'tagNumber' | 'criticality' | 'status' | 'lastUpdated' | 'alertCount';
  direction: 'asc' | 'desc';
  groupBy?: 'type' | 'status' | 'criticality' | 'location';
}

/**
 * Hierarchy statistics
 */
export interface HierarchyStatistics {
  totalNodes: number;
  nodesByLevel: {
    sites: number;
    units: number;
    equipment: number;
    components: number;
  };
  nodesByStatus: { [key in AssetStatus]: number };
  nodesByCriticality: { [key in CriticalityLevel]: number };
  nodesWithAlerts: number;
  nodesDueInspection: number;
  nodesDueMaintenance: number;
  averageHealth: number;
}

/**
 * Hierarchy path information
 */
export interface HierarchyPath {
  site?: HierarchyPathNode;
  unit?: HierarchyPathNode;
  equipment?: HierarchyPathNode;
  component?: HierarchyPathNode;
  fullPath: string;
  level: AssetHierarchyLevel;
}

/**
 * Individual path node
 */
export interface HierarchyPathNode {
  id: string;
  name: string;
  tagNumber?: string;
  type: AssetType;
  status: AssetStatus;
}

/**
 * Hierarchy search result
 */
export interface HierarchySearchResult {
  node: HierarchyTreeNode;
  path: HierarchyPath;
  relevanceScore: number;
  matchedFields: string[];
  snippet?: string;
}

/**
 * Hierarchy bulk operations
 */
export interface HierarchyBulkOperation {
  operation: 'update_status' | 'update_criticality' | 'assign_tags' | 'schedule_inspection' | 'delete';
  nodeIds: string[];
  parameters: {
    status?: AssetStatus;
    criticality?: CriticalityLevel;
    tags?: string[];
    inspectionDate?: string;
    notes?: string;
  };
}

/**
 * Hierarchy import/export options
 */
export interface HierarchyImportOptions {
  file: File;
  format: 'csv' | 'excel' | 'json';
  mapping: { [column: string]: string };
  options: {
    createMissing: boolean;
    updateExisting: boolean;
    preserveHierarchy: boolean;
    validateOnly: boolean;
  };
}

export interface HierarchyExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  levels: AssetHierarchyLevel[];
  includeMetrics: boolean;
  includeAlerts: boolean;
  filters?: HierarchyFilters;
  template?: 'standard' | 'detailed' | 'summary';
}

/**
 * Hierarchy validation result
 */
export interface HierarchyValidationResult {
  isValid: boolean;
  errors: HierarchyValidationError[];
  warnings: HierarchyValidationWarning[];
  orphanedNodes: string[];
  circularReferences: string[];
  duplicateTagNumbers: string[];
}

export interface HierarchyValidationError {
  nodeId: string;
  nodeName: string;
  errorType: 'missing_parent' | 'invalid_level' | 'duplicate_tag' | 'circular_reference';
  message: string;
  suggestion?: string;
}

export interface HierarchyValidationWarning {
  nodeId: string;
  nodeName: string;
  warningType: 'incomplete_data' | 'naming_convention' | 'performance';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

/**
 * Hierarchy performance metrics
 */
export interface HierarchyPerformanceMetrics {
  loadTime: number;
  nodeCount: number;
  memoryUsage: number;
  renderTime: number;
  searchTime?: number;
  filterTime?: number;
}

/**
 * Hierarchy drag and drop operation
 */
export interface HierarchyDragDropOperation {
  draggedNodeId: string;
  targetNodeId: string;
  operation: 'move_to_parent' | 'move_before' | 'move_after';
  validateOnly?: boolean;
}

/**
 * Hierarchy move operation result
 */
export interface HierarchyMoveResult {
  success: boolean;
  message: string;
  updatedNodes?: string[];
  conflicts?: {
    nodeId: string;
    conflict: string;
    suggestion: string;
  }[];
}

/**
 * Hierarchy expansion state
 */
export interface HierarchyExpansionState {
  expandedNodes: Set<string>;
  selectedNode?: string;
  lastExpandedLevel: AssetHierarchyLevel;
  autoExpand: boolean;
  expandOnSearch: boolean;
}

/**
 * Hierarchy keyboard navigation
 */
export interface HierarchyKeyboardNavigation {
  focusedNodeId?: string;
  navigableNodes: string[];
  keymap: {
    [key: string]: 'expand' | 'collapse' | 'select' | 'move_up' | 'move_down' | 'move_left' | 'move_right';
  };
}

/**
 * Hierarchy context menu options
 */
export interface HierarchyContextMenuOption {
  id: string;
  label: string;
  icon?: string;
  action: string;
  disabled?: boolean;
  divider?: boolean;
  submenu?: HierarchyContextMenuOption[];
  roles?: string[];
}

/**
 * Hierarchy tooltip information
 */
export interface HierarchyTooltipInfo {
  nodeId: string;
  title: string;
  content: {
    status: string;
    criticality: string;
    lastInspection?: string;
    nextInspection?: string;
    alerts?: string[];
    health?: number;
  };
  position: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Hierarchy visualization options
 */
export interface HierarchyVisualizationOptions {
  showIcons: boolean;
  showStatus: boolean;
  showCriticality: boolean;
  showAlerts: boolean;
  showCounts: boolean;
  showMetrics: boolean;
  colorCoding: 'status' | 'criticality' | 'health' | 'type' | 'none';
  iconSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
  animation: boolean;
}

/**
 * Hierarchy quick actions
 */
export interface HierarchyQuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: () => void;
  shortcut?: string;
  category: 'navigation' | 'edit' | 'view' | 'export';
  availability: {
    levels: AssetHierarchyLevel[];
    roles: string[];
    conditions?: string[];
  };
}

/**
 * Hierarchy preferences
 */
export interface HierarchyPreferences {
  defaultView: HierarchyViewMode;
  defaultSort: HierarchySortOptions;
  autoExpand: boolean;
  rememberExpansion: boolean;
  showTooltips: boolean;
  visualization: HierarchyVisualizationOptions;
  quickActions: string[]; // IDs of enabled quick actions
  customColumns?: string[];
  pageSize: number;
}

/**
 * Hierarchy state for Redux store
 */
export interface HierarchyState {
  // Data
  nodes: { [id: string]: HierarchyTreeNode };
  rootNodes: string[];
  statistics: HierarchyStatistics | null;
  
  // Navigation
  currentContext: HierarchyNavigationContext;
  expansionState: HierarchyExpansionState;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedNodes: string[];
  
  // Performance
  lastFetchTime: number;
  performanceMetrics: HierarchyPerformanceMetrics | null;
  
  // User preferences
  preferences: HierarchyPreferences;
  
  // Search
  searchResults: HierarchySearchResult[];
  isSearching: boolean;
  searchQuery: string;
}