// platform/frontend-mui/src/components/asset/AssetList.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Toolbar,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import GetAppIcon from '@mui/icons-material/GetApp';
import AddIcon from '@mui/icons-material/Add';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ClearIcon from '@mui/icons-material/Clear';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DeleteIcon from '@mui/icons-material/Delete';

import { Asset, AssetSearchParams } from '../../types/asset';
import { AssetCard } from './AssetCard';
import { VirtualScroll } from '../common/VirtualScroll';

/**
 * Styled components
 */
const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  minHeight: 64,
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const ViewContainer = styled(Box)<{ view: 'grid' | 'list' | 'table' }>(({ theme, view }) => ({
  padding: theme.spacing(2),
  
  ...(view === 'grid' && {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: theme.spacing(2),
    
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: theme.spacing(1.5),
    },
    
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
      gap: theme.spacing(1),
    },
  }),
  
  ...(view === 'list' && {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  }),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

/**
 * View mode type
 */
type ViewMode = 'grid' | 'list' | 'table';

/**
 * Sort option interface
 */
interface SortOption {
  field: string;
  label: string;
  order: 'asc' | 'desc';
}

/**
 * Asset List Props
 */
interface AssetListProps {
  assets: Asset[];
  loading?: boolean;
  error?: string | null;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  searchParams?: AssetSearchParams;
  selectedAssets?: string[];
  onSearchParamsChange?: (params: AssetSearchParams) => void;
  onAssetSelect?: (assetId: string, selected: boolean) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onAssetClick?: (asset: Asset) => void;
  onAssetEdit?: (asset: Asset) => void;
  onAssetDelete?: (asset: Asset) => void;
  onAssetView?: (asset: Asset) => void;
  onCreateAsset?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  showCreateButton?: boolean;
  showExportButton?: boolean;
  showBulkActions?: boolean;
  enableVirtualization?: boolean;
  itemHeight?: number;
}

/**
 * Sort options
 */
const sortOptions: SortOption[] = [
  { field: 'name', label: 'Name A-Z', order: 'asc' },
  { field: 'name', label: 'Name Z-A', order: 'desc' },
  { field: 'tagNumber', label: 'Tag Number A-Z', order: 'asc' },
  { field: 'tagNumber', label: 'Tag Number Z-A', order: 'desc' },
  { field: 'criticality', label: 'Criticality High-Low', order: 'desc' },
  { field: 'criticality', label: 'Criticality Low-High', order: 'asc' },
  { field: 'updatedAt', label: 'Recently Updated', order: 'desc' },
  { field: 'updatedAt', label: 'Oldest Updated', order: 'asc' },
];

/**
 * AssetList Component
 */
export const AssetList: React.FC<AssetListProps> = ({
  assets = [],
  loading = false,
  error = null,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  searchParams = {},
  selectedAssets = [],
  onSearchParamsChange,
  onAssetSelect,
  onSelectAll,
  onClearSelection,
  onAssetClick,
  onAssetEdit,
  onAssetDelete,
  onAssetView,
  onCreateAsset,
  onExport,
  onRefresh,
  showCreateButton = true,
  showExportButton = true,
  showBulkActions = true,
  enableVirtualization = false,
  itemHeight = 120,
}) => {
  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);

  // Derived state
  const hasSelection = selectedAssets.length > 0;
  const isAllSelected = assets.length > 0 && selectedAssets.length === assets.length;
  const isPartialSelection = hasSelection && !isAllSelected;

  // Memoized sort label
  const currentSortLabel = useMemo(() => {
    const option = sortOptions.find(opt => 
      opt.field === searchParams.sortBy && opt.order === searchParams.sortOrder
    );
    return option?.label || 'Name A-Z';
  }, [searchParams.sortBy, searchParams.sortOrder]);

  // Event handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Debounced search
    const timeoutId = setTimeout(() => {
      onSearchParamsChange?.({
        ...searchParams,
        search: value || undefined,
        page: 1, // Reset to first page
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchParams, onSearchParamsChange]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    onSearchParamsChange?.({
      ...searchParams,
      search: undefined,
      page: 1,
    });
  }, [searchParams, onSearchParamsChange]);

  const handleSortChange = useCallback((option: SortOption) => {
    onSearchParamsChange?.({
      ...searchParams,
      sortBy: option.field,
      sortOrder: option.order,
      page: 1,
    });
    setSortMenuAnchor(null);
  }, [searchParams, onSearchParamsChange]);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
    onSearchParamsChange?.({
      ...searchParams,
      page,
    });
  }, [searchParams, onSearchParamsChange]);

  const handleSelectAllToggle = useCallback(() => {
    if (isAllSelected) {
      onClearSelection?.();
    } else {
      onSelectAll?.();
    }
  }, [isAllSelected, onSelectAll, onClearSelection]);

  const handleBulkAction = useCallback((action: string) => {
    setBulkMenuAnchor(null);
    // Handle bulk actions based on action type
    console.log('Bulk action:', action, 'for assets:', selectedAssets);
  }, [selectedAssets]);

  // Render functions
  const renderAssetItem = useCallback((asset: Asset, index: number) => (
    <AssetCard
      key={asset.id}
      asset={asset}
      view={viewMode}
      selectable={showBulkActions}
      selected={selectedAssets.includes(asset.id)}
      onSelect={onAssetSelect}
      onClick={onAssetClick}
      onEdit={onAssetEdit}
      onDelete={onAssetDelete}
      onView={onAssetView}
    />
  ), [
    viewMode,
    showBulkActions,
    selectedAssets,
    onAssetSelect,
    onAssetClick,
    onAssetEdit,
    onAssetDelete,
    onAssetView,
  ]);

  const renderContent = () => {
    if (loading && assets.length === 0) {
      return (
        <EmptyState>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading assets...
          </Typography>
        </EmptyState>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={onRefresh}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      );
    }

    if (assets.length === 0) {
      return (
        <EmptyState>
          <Typography variant="h5" gutterBottom>
            No assets found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery ? 
              `No assets match your search "${searchQuery}"` : 
              'Get started by creating your first asset'
            }
          </Typography>
          {showCreateButton && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateAsset}
            >
              Create Asset
            </Button>
          )}
        </EmptyState>
      );
    }

    if (enableVirtualization && viewMode === 'list') {
      return (
        <VirtualScroll
          items={assets}
          itemHeight={itemHeight}
          renderItem={renderAssetItem}
          containerHeight={600}
        />
      );
    }

    return (
      <ViewContainer view={viewMode}>
        {assets.map((asset, index) => renderAssetItem(asset, index))}
      </ViewContainer>
    );
  };

  return (
    <Paper elevation={1}>
      {/* Toolbar */}
      <StyledToolbar>
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ minWidth: 250, flexGrow: { xs: 1, md: 0 } }}
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

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Selection info and bulk actions */}
        {hasSelection && (
          <>
            <Chip
              label={`${selectedAssets.length} selected`}
              onDelete={onClearSelection}
              color="primary"
              variant="outlined"
            />
            
            <Tooltip title="Bulk actions">
              <IconButton
                onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        {/* View mode buttons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Grid view">
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <GridViewIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="List view">
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Sort menu */}
        <Tooltip title="Sort options">
          <IconButton
            size="small"
            onClick={(e) => setSortMenuAnchor(e.currentTarget)}
          >
            <SortIcon />
          </IconButton>
        </Tooltip>

        {/* Filter menu */}
        <Tooltip title="Filter options">
          <IconButton
            size="small"
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {showExportButton && (
            <Tooltip title="Export assets">
              <IconButton size="small" onClick={onExport}>
                <GetAppIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Refresh">
            <IconButton size="small" onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {showCreateButton && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateAsset}
              size="small"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Create Asset
            </Button>
          )}
        </Box>
      </StyledToolbar>

      {/* Content */}
      {renderContent()}

      {/* Pagination */}
      {totalPages > 1 && !loading && assets.length > 0 && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 200 } }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Sort by</Typography>
        </MenuItem>
        <Divider />
        {sortOptions.map((option) => (
          <MenuItem
            key={`${option.field}-${option.order}`}
            onClick={() => handleSortChange(option)}
            selected={searchParams.sortBy === option.field && searchParams.sortOrder === option.order}
          >
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 250 } }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter options</Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <FormControlLabel
            control={<Checkbox size="small" />}
            label="Show only active"
          />
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={<Checkbox size="small" />}
            label="Critical assets only"
          />
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={<Checkbox size="small" />}
            label="Due for inspection"
          />
        </MenuItem>
      </Menu>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 200 } }}
      >
        <MenuItem onClick={() => handleBulkAction('export')}>
          <ListItemIcon>
            <GetAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Selected</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleBulkAction('status')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Update Status</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleBulkAction('tag')}>
          <ListItemIcon>
            <LocalOfferIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Tags</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={() => handleBulkAction('delete')}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Selected</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default AssetList;