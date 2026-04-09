// platform/frontend-mui/src/components/asset/AssetCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  CardMedia,
  LinearProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';
import BuildIcon from '@mui/icons-material/Build';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Asset icons
import FactoryIcon from '@mui/icons-material/Factory';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SettingsIcon from '@mui/icons-material/Settings';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';

import { Asset, AssetType, AssetStatus, CriticalityLevel, IntegrityStatus } from '../../types/asset';

/**
 * Styled components for enhanced visual design
 */
const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'view' && prop !== 'selected' && prop !== 'critical'
})<{
  view: 'grid' | 'list';
  selected?: boolean;
  critical?: boolean;
}>(({ theme, view, selected, critical }) => ({
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  boxShadow: selected 
    ? `0 4px 12px ${theme.palette.primary.main}25` 
    : critical 
      ? `0 2px 8px ${theme.palette.error.main}25`
      : theme.shadows[1],
  
  '&:hover': {
    transform: view === 'grid' ? 'translateY(-2px)' : 'none',
    boxShadow: selected 
      ? `0 8px 20px ${theme.palette.primary.main}35` 
      : critical
        ? `0 4px 12px ${theme.palette.error.main}35`
        : theme.shadows[4],
  },

  ...(view === 'list' && {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  }),

  ...(critical && {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
}));

const StatusIndicator = styled(Box)<{ status: AssetStatus; integrity: IntegrityStatus }>(({ theme, status, integrity }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'inactive': return theme.palette.grey[500];
      case 'maintenance': return theme.palette.warning.main;
      case 'decommissioned': return theme.palette.error.main;
      case 'planned': return theme.palette.info.main;
      default: return theme.palette.grey[400];
    }
  };

  const getIntegrityColor = () => {
    switch (integrity) {
      case 'excellent': return theme.palette.success.main;
      case 'good': return theme.palette.success.light;
      case 'fair': return theme.palette.warning.main;
      case 'poor': return theme.palette.error.light;
      case 'critical': return theme.palette.error.main;
      default: return theme.palette.grey[400];
    }
  };

  return {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    display: 'flex',
    gap: theme.spacing(0.5),
    zIndex: 1,
    '& .status-dot': {
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: getStatusColor(),
      border: `2px solid ${theme.palette.background.paper}`,
    },
    '& .integrity-dot': {
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: getIntegrityColor(),
      border: `2px solid ${theme.palette.background.paper}`,
    },
  };
});

const CriticalityStars = styled(Box)<{ level: CriticalityLevel }>(({ theme, level }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.25),
  '& .star': {
    width: 12,
    height: 12,
    color: theme.palette.warning.main,
  },
  '& .star.empty': {
    color: theme.palette.grey[300],
  },
}));

const HealthBar = styled(Box)<{ value: number }>(({ theme, value }) => {
  const getHealthColor = () => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& .health-bar': {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.palette.grey[200],
      overflow: 'hidden',
      '& .health-fill': {
        height: '100%',
        backgroundColor: getHealthColor(),
        width: `${value}%`,
        transition: 'width 0.3s ease',
      },
    },
  };
});

/**
 * Asset Card Component Props
 */
interface AssetCardProps {
  asset: Asset;
  view?: 'grid' | 'list';
  selectable?: boolean;
  selected?: boolean;
  showActions?: boolean;
  showMetrics?: boolean;
  onClick?: (asset: Asset) => void;
  onSelect?: (assetId: string, selected: boolean) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
  onView?: (asset: Asset) => void;
}

/**
 * Get asset type icon
 */
const getAssetTypeIcon = (type: AssetType, level: string) => {
  if (level === 'site') return FactoryIcon;
  if (level === 'unit') return PrecisionManufacturingIcon;
  if (level === 'equipment') return SettingsIcon;
  if (level === 'component') return DeviceHubIcon;
  
  // Fallback based on asset type
  switch (type) {
    case 'pressure_vessel':
    case 'tank':
    case 'reactor':
      return FactoryIcon;
    case 'pump':
    case 'compressor':
    case 'turbine':
      return PrecisionManufacturingIcon;
    default:
      return SettingsIcon;
  }
};

/**
 * Format asset type display name
 */
const formatAssetType = (type: AssetType): string => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

/**
 * Format status display
 */
const formatStatus = (status: AssetStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Format integrity status
 */
const formatIntegrity = (integrity: IntegrityStatus): string => {
  return integrity.charAt(0).toUpperCase() + integrity.slice(1);
};

/**
 * Get date variant for styling
 */
const getDateVariant = (dateString: string | undefined): 'success' | 'warning' | 'error' => {
  if (!dateString) return 'error';
  
  const date = new Date(dateString);
  const now = new Date();
  const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return 'error'; // Overdue
  if (daysUntil <= 30) return 'warning'; // Due soon
  return 'success'; // Future
};

/**
 * AssetCard Component
 */
export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  view = 'grid',
  selectable = false,
  selected = false,
  showActions = true,
  showMetrics = true,
  onClick,
  onSelect,
  onEdit,
  onDelete,
  onView,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const AssetIcon = getAssetTypeIcon(asset.type, asset.hierarchyLevel);
  const isCritical = asset.criticality >= 4;

  const handleCardClick = (event: React.MouseEvent) => {
    if (event.target instanceof HTMLElement) {
      // Don't trigger card click if clicking on actions or checkbox
      if (event.target.closest('.asset-card-actions') || event.target.closest('.asset-card-checkbox')) {
        return;
      }
    }
    onClick?.(asset);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(asset.id, event.target.checked);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    handleMenuClose();
    action();
  };

  return (
    <StyledCard
      view={view}
      selected={selected}
      critical={isCritical}
      onClick={handleCardClick}
    >
      {/* Status indicators */}
      <StatusIndicator status={asset.status} integrity={asset.integrityStatus}>
        <Tooltip title={`Status: ${formatStatus(asset.status)}`}>
          <div className="status-dot" />
        </Tooltip>
        <Tooltip title={`Integrity: ${formatIntegrity(asset.integrityStatus)}`}>
          <div className="integrity-dot" />
        </Tooltip>
      </StatusIndicator>

      {/* Selection checkbox */}
      {selectable && (
        <Box 
          className="asset-card-checkbox"
          sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8, 
            zIndex: 2 
          }}
        >
          <Checkbox
            checked={selected}
            onChange={handleSelectChange}
            size="small"
            sx={{
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
        </Box>
      )}

      {view === 'grid' ? (
        // Grid view layout
        <>
          {/* Asset image or icon */}
          {asset.imageUrl ? (
            <CardMedia
              component="img"
              height="160"
              image={asset.imageUrl}
              alt={asset.name}
              sx={{ objectFit: 'cover' }}
            />
          ) : (
            <Box
              sx={{
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.100',
                color: 'grey.500',
              }}
            >
              <AssetIcon sx={{ fontSize: 48 }} />
            </Box>
          )}

          <CardContent sx={{ pb: 1 }}>
            {/* Header */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" component="h3" noWrap title={asset.name}>
                {asset.name}
              </Typography>
              <Chip
                label={asset.tagNumber}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  mt: 0.5 
                }}
              />
            </Box>

            {/* Asset type and location */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formatAssetType(asset.type)}
              </Typography>
              {asset.location?.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {asset.location.address}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Criticality and Health */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Criticality
                </Typography>
                <CriticalityStars level={asset.criticality}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiberManualRecordIcon
                      key={star}
                      className={`star ${star <= asset.criticality ? '' : 'empty'}`}
                    />
                  ))}
                </CriticalityStars>
              </Box>

              {asset.health && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Health Index
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {asset.health.overallScore}%
                    </Typography>
                  </Box>
                  <HealthBar value={asset.health.overallScore}>
                    <div className="health-bar">
                      <div className="health-fill" />
                    </div>
                  </HealthBar>
                </Box>
              )}
            </Box>

            {/* Key metrics */}
            {showMetrics && (
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EventIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Next Inspection
                    </Typography>
                  </Box>
                  {asset.nextInspectionDate && (
                    <Chip
                      label={new Date(asset.nextInspectionDate).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                      color={getDateVariant(asset.nextInspectionDate)}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Box>

                {asset.specifications?.remainingLife && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingDownIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Remaining Life
                      </Typography>
                    </Box>
                    <Typography variant="caption" fontWeight="medium">
                      {asset.specifications.remainingLife} years
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Alerts and notifications */}
            {(asset.health?.overallScore && asset.health.overallScore < 60) && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<WarningIcon />}
                  label="Health Alert"
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            )}
          </CardContent>
        </>
      ) : (
        // List view layout
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: 1 }}>
          {/* Asset icon/image */}
          <Avatar
            sx={{ 
              width: 48, 
              height: 48, 
              mr: 2,
              bgcolor: 'grey.100',
              color: 'grey.600'
            }}
            src={asset.thumbnailUrl}
          >
            <AssetIcon />
          </Avatar>

          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap>
                  {asset.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {asset.tagNumber} • {formatAssetType(asset.type)}
                </Typography>
              </Box>

              {/* Status and criticality */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                <CriticalityStars level={asset.criticality}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiberManualRecordIcon
                      key={star}
                      className={`star ${star <= asset.criticality ? '' : 'empty'}`}
                      sx={{ fontSize: 10 }}
                    />
                  ))}
                </CriticalityStars>

                <Chip
                  label={formatStatus(asset.status)}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', minWidth: 'auto' }}
                />

                {asset.health && (
                  <Typography variant="caption" color="text.secondary">
                    {asset.health.overallScore}%
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Additional info for list view */}
            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              {asset.location?.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {asset.location.address}
                  </Typography>
                </Box>
              )}

              {asset.nextInspectionDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Next: {new Date(asset.nextInspectionDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Actions */}
      {showActions && (
        <CardActions 
          className="asset-card-actions"
          sx={{ 
            justifyContent: 'flex-end', 
            pt: 0,
            ...(view === 'list' && {
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
            })
          }}
        >
          <Tooltip title="More actions">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              aria-label="asset actions"
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 160,
                '& .MuiMenuItem-root': {
                  fontSize: '0.875rem',
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {onView && (
              <MenuItem onClick={() => handleAction(() => onView(asset))}>
                <ListItemIcon>
                  <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Details</ListItemText>
              </MenuItem>
            )}
            
            {onEdit && (
              <MenuItem onClick={() => handleAction(() => onEdit(asset))}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Asset</ListItemText>
              </MenuItem>
            )}

            <MenuItem onClick={() => handleAction(() => {})}>
              <ListItemIcon>
                <BuildIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Schedule Inspection</ListItemText>
            </MenuItem>

            <Divider />

            {onDelete && (
              <MenuItem 
                onClick={() => handleAction(() => onDelete(asset))}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete Asset</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </CardActions>
      )}
    </StyledCard>
  );
};

export default AssetCard;