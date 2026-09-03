// platform/frontend-mui/src/components/hierarchy/AssetHierarchyTree.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Badge,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Button,
  Collapse,
  Paper,
  Divider,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Correct TreeView imports from @mui/x-tree-view
import { SimpleTreeView as TreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandIcon from '@mui/icons-material/UnfoldMore';
import CollapseIcon from '@mui/icons-material/UnfoldLess';

// Asset type icons
import FactoryIcon from '@mui/icons-material/Factory';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SettingsIcon from '@mui/icons-material/Settings';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import BuildIcon from '@mui/icons-material/Build';

// Types
interface HierarchyTreeNode {
  id: string;
  name: string;
  tagNumber?: string;
  type: AssetType;
  level: AssetHierarchyLevel;
  status: string;
  alertCount: number;
  dueInspections: number;
  childCount: number;
  children?: HierarchyTreeNode[];
}

interface HierarchyFilters {
  search?: string;
  status?: string[];
}

interface HierarchySortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

type AssetHierarchyLevel = 'site' | 'unit' | 'equipment' | 'component';
type AssetType = 'site' | 'unit' | 'equipment' | 'component' | 'instrument' | 'valve' | 'pump' | 'tank';

/**
 * Styled components
 */
const StyledTreeView = styled(TreeView)(({ theme }) => ({
  flexGrow: 1,
  maxWidth: '100%',
  overflow: 'auto',
}));

const StyledTreeItem = styled(TreeItem, {
  shouldForwardProp: (prop) => prop !== 'level' && prop !== 'hasAlerts' && prop !== 'selected'
})<{
  level: AssetHierarchyLevel;
  hasAlerts?: boolean;
  selected?: boolean;
}>(({ theme, level, hasAlerts, selected }) => ({
  '& .MuiTreeItem-content': {
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    border: '1px solid transparent',
    margin: theme.spacing(0.25, 0),
    transition: 'all 0.2s ease',
    
    ...(selected && {
      backgroundColor: theme.palette.primary.main + '15',
      border: `1px solid ${theme.palette.primary.main}`,
    }),
    
    ...(hasAlerts && {
      borderLeft: `3px solid ${theme.palette.error.main}`,
    }),
    
    '&:hover': {
      backgroundColor: selected 
        ? theme.palette.primary.main + '25' 
        : theme.palette.action.hover,
    },
    
    '&.Mui-focused': {
      backgroundColor: selected 
        ? theme.palette.primary.main + '25' 
        : theme.palette.action.focus,
    },
  },
  
  '& .MuiTreeItem-label': {
    paddingLeft: theme.spacing(0.5),
    fontSize: level === 'site' ? '0.95rem' : '0.875rem',
    fontWeight: level === 'site' ? 600 : level === 'unit' ? 500 : 400,
  },
  
  '& .MuiTreeItem-group': {
    marginLeft: theme.spacing(2),
    borderLeft: `1px dashed ${theme.palette.divider}`,
    paddingLeft: theme.spacing(1),
  },
}));

const NodeContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: theme.spacing(1),
}));

const NodeInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0,
}));

const NodeIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  flexShrink: 0,
}));

const NodeText = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

const NodeActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: 'opacity 0.2s ease',
  
  '.MuiTreeItem-content:hover &': {
    opacity: 1,
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const TreeHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

/**
 * Get icon for asset type and hierarchy level
 */
const getNodeIcon = (type: AssetType, level: AssetHierarchyLevel) => {
  switch (level) {
    case 'site':
      return FactoryIcon;
    case 'unit':
      return PrecisionManufacturingIcon;
    case 'equipment':
      return SettingsIcon;
    case 'component':
      return DeviceHubIcon;
    default:
      return SettingsIcon;
  }
};

/**
 * Get status color for node
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    case 'maintenance':
      return 'warning';
    case 'decommissioned':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Asset Hierarchy Tree Props
 */
interface AssetHierarchyTreeProps {
  nodes: HierarchyTreeNode[];
  loading?: boolean;
  error?: string | null;
  expandedNodes?: string[];
  selectedNode?: string;
  filters?: HierarchyFilters;
  sortOptions?: HierarchySortOptions;
  onNodeSelect?: (nodeId: string, node: HierarchyTreeNode) => void;
  onNodeExpand?: (nodeId: string, expanded: boolean) => void;
  onNodeAction?: (action: string, node: HierarchyTreeNode) => void;
  onFiltersChange?: (filters: HierarchyFilters) => void;
  onRefresh?: () => void;
  showSearch?: boolean;
  showActions?: boolean;
  maxHeight?: number | string;
}

/**
 * Asset Hierarchy Tree Component
 */
export const AssetHierarchyTree: React.FC<AssetHierarchyTreeProps> = ({
  nodes = [],
  loading = false,
  error = null,
  expandedNodes = [],
  selectedNode,
  filters = {},
  sortOptions,
  onNodeSelect,
  onNodeExpand,
  onNodeAction,
  onFiltersChange,
  onRefresh,
  showSearch = true,
  showActions = true,
  maxHeight = 600,
}) => {
  // Local state
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    node: HierarchyTreeNode | null;
  } | null>(null);

  // Memoized filtered and sorted nodes
  const processedNodes = useMemo(() => {
    let filteredNodes = [...nodes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filterNodes = (nodeList: HierarchyTreeNode[]): HierarchyTreeNode[] => {
        return nodeList.reduce((acc: HierarchyTreeNode[], node) => {
          const matchesSearch = 
            node.name.toLowerCase().includes(query) ||
            node.tagNumber?.toLowerCase().includes(query);
          
          const filteredChildren = node.children ? filterNodes(node.children) : [];
          
          if (matchesSearch || filteredChildren.length > 0) {
            acc.push({
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children,
            });
          }
          
          return acc;
        }, []);
      };
      
      filteredNodes = filterNodes(filteredNodes);
    }

    // Apply other filters
    if (filters.status && filters.status.length > 0) {
      const filterByStatus = (nodeList: HierarchyTreeNode[]): HierarchyTreeNode[] => {
        return nodeList.reduce((acc: HierarchyTreeNode[], node) => {
          const matchesStatus = filters.status!.includes(node.status);
          const filteredChildren = node.children ? filterByStatus(node.children) : [];
          
          if (matchesStatus || filteredChildren.length > 0) {
            acc.push({
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children,
            });
          }
          
          return acc;
        }, []);
      };
      
      filteredNodes = filterByStatus(filteredNodes);
    }

    return filteredNodes;
  }, [nodes, searchQuery, filters]);

  // Event handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Debounced filter update
    const timeoutId = setTimeout(() => {
      onFiltersChange?.({
        ...filters,
        search: value || undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, onFiltersChange]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    onFiltersChange?.({
      ...filters,
      search: undefined,
    });
  }, [filters, onFiltersChange]);

  const handleNodeToggle = useCallback((_event: React.SyntheticEvent | null, nodeIds: string[]) => {
    // Find newly expanded/collapsed nodes
    const newlyExpanded = nodeIds.filter(id => !expandedNodes.includes(id));
    const newlyCollapsed = expandedNodes.filter(id => !nodeIds.includes(id));
    
    newlyExpanded.forEach(id => onNodeExpand?.(id, true));
    newlyCollapsed.forEach(id => onNodeExpand?.(id, false));
  }, [expandedNodes, onNodeExpand]);

  const handleNodeSelect = useCallback((_event: React.SyntheticEvent | null, nodeId: string | null) => {
    if (!nodeId) return;
    const node = findNodeById(processedNodes, nodeId);
    if (node) {
      onNodeSelect?.(nodeId, node);
    }
  }, [processedNodes, onNodeSelect]);

  const handleContextMenu = useCallback((event: React.MouseEvent, node: HierarchyTreeNode) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      node,
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleExpandAll = useCallback(() => {
    const allNodeIds: string[] = [];
    const collectIds = (nodeList: HierarchyTreeNode[]) => {
      nodeList.forEach(node => {
        allNodeIds.push(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(processedNodes);
    
    allNodeIds.forEach(id => onNodeExpand?.(id, true));
  }, [processedNodes, onNodeExpand]);

  const handleCollapseAll = useCallback(() => {
    expandedNodes.forEach(id => onNodeExpand?.(id, false));
  }, [expandedNodes, onNodeExpand]);

  // Helper function to find node by ID
  const findNodeById = (nodeList: HierarchyTreeNode[], id: string): HierarchyTreeNode | null => {
    for (const node of nodeList) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Render tree node
  const renderTreeNode = (node: HierarchyTreeNode): React.ReactNode => {
    const NodeIconComponent = getNodeIcon(node.type, node.level);
    const hasAlerts = node.alertCount > 0;

    return (
      <StyledTreeItem
        key={node.id}
        itemId={node.id}
        level={node.level}
        hasAlerts={hasAlerts}
        selected={selectedNode === node.id}
        onContextMenu={(event) => handleContextMenu(event, node)}
        label={
          <NodeContent>
            <NodeInfo>
              <NodeIcon>
                <NodeIconComponent 
                  sx={{ 
                    fontSize: 20,
                    color: hasAlerts ? 'error.main' : 'text.secondary' 
                  }} 
                />
              </NodeIcon>
              
              <NodeText>
                <Typography variant="body2" noWrap>
                  {node.name}
                </Typography>
                {node.tagNumber && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {node.tagNumber}
                  </Typography>
                )}
              </NodeText>

              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                {/* Status chip */}
                <Chip
                  label={node.status}
                  size="small"
                  variant="outlined"
                  color={getStatusColor(node.status) as any}
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />

                {/* Alert badge */}
                {hasAlerts && (
                  <Tooltip title={`${node.alertCount} alerts`}>
                    <Badge badgeContent={node.alertCount} color="error" max={99}>
                      <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    </Badge>
                  </Tooltip>
                )}

                {/* Due inspections */}
                {node.dueInspections > 0 && (
                  <Tooltip title={`${node.dueInspections} inspections due`}>
                    <Badge badgeContent={node.dueInspections} color="warning" max={99}>
                      <EventIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    </Badge>
                  </Tooltip>
                )}

                {/* Child count */}
                {node.childCount > 0 && (
                  <Chip
                    label={node.childCount}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 18, minWidth: 18 }}
                  />
                )}
              </Box>
            </NodeInfo>

            {showActions && (
              <NodeActions>
                <Tooltip title="Quick actions">
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleContextMenu(event as any, node);
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </NodeActions>
            )}
          </NodeContent>
        }
      >
        {node.children?.map(child => renderTreeNode(child))}
      </StyledTreeItem>
    );
  };

  return (
    <Paper elevation={1} sx={{ height: maxHeight, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <TreeHeader>
        <Typography variant="h6">Asset Hierarchy</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Expand all">
            <IconButton size="small" onClick={handleExpandAll}>
              <ExpandIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Collapse all">
            <IconButton size="small" onClick={handleCollapseAll}>
              <CollapseIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={onRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </TreeHeader>

      {/* Search */}
      {showSearch && (
        <SearchContainer>
          <TextField
            fullWidth
            size="small"
            placeholder="Search hierarchy..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleSearchClear}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </SearchContainer>
      )}

      {/* Loading */}
      {loading && <LinearProgress />}

      {/* Error */}
      {error && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button size="small" onClick={onRefresh} sx={{ mt: 1 }}>
            Retry
          </Button>
        </Box>
      )}

      {/* Tree */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {processedNodes.length > 0 ? (
          <StyledTreeView
            slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
            expandedItems={expandedNodes}
            selectedItems={selectedNode ?? null}
            onExpandedItemsChange={handleNodeToggle}
            onSelectedItemsChange={handleNodeSelect}
          >
            {processedNodes.map(node => renderTreeNode(node))}
          </StyledTreeView>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>
              {searchQuery ? 'No assets match your search' : 'No assets available'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: { minWidth: 180 }
        }}
      >
        <MenuItem onClick={() => {
          onNodeAction?.('view', contextMenu!.node);
          handleContextMenuClose();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          onNodeAction?.('edit', contextMenu!.node);
          handleContextMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Asset</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          onNodeAction?.('create_child', contextMenu!.node);
          handleContextMenuClose();
        }}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Child Asset</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => {
          onNodeAction?.('schedule_inspection', contextMenu!.node);
          handleContextMenuClose();
        }}>
          <ListItemIcon>
            <EventIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule Inspection</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          onNodeAction?.('schedule_maintenance', contextMenu!.node);
          handleContextMenuClose();
        }}>
          <ListItemIcon>
            <BuildIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule Maintenance</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => {
            onNodeAction?.('delete', contextMenu!.node);
            handleContextMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Asset</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default AssetHierarchyTree;
