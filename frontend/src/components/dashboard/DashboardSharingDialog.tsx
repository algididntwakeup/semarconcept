import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Share as ShareIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Public as PublicIcon,
  Lock as LockIcon
} from '@mui/icons-material';

// Define permission levels
enum PermissionLevel {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin'
}

// Define permission level labels
const permissionLabels = {
  [PermissionLevel.VIEWER]: 'Viewer',
  [PermissionLevel.EDITOR]: 'Editor',
  [PermissionLevel.ADMIN]: 'Admin'
};

// Define permission level descriptions
const permissionDescriptions = {
  [PermissionLevel.VIEWER]: 'Can view the dashboard',
  [PermissionLevel.EDITOR]: 'Can edit the dashboard',
  [PermissionLevel.ADMIN]: 'Can manage sharing and delete the dashboard'
};

// Define user or group share
interface ShareTarget {
  id: string;
  name: string;
  email?: string;
  type: 'user' | 'group';
  permission: PermissionLevel;
}

interface DashboardSharingDialogProps {
  open: boolean;
  onClose: () => void;
  dashboardId: string;
  dashboardName: string;
  onShare?: (targets: ShareTarget[], isPublic: boolean, publicLink: string) => Promise<void>;
}

/**
 * DashboardSharingDialog component
 * 
 * This component displays a dialog for sharing dashboards with users or groups.
 * It allows setting different permission levels and generating public links.
 */
const DashboardSharingDialog: React.FC<DashboardSharingDialogProps> = ({
  open,
  onClose,
  dashboardId,
  dashboardName,
  onShare
}) => {
  // Mock users and groups - in a real app, these would come from an API
  const [users] = useState([
    { id: 'user1', name: 'John Doe', email: 'john.doe@example.com', type: 'user' },
    { id: 'user2', name: 'Jane Smith', email: 'jane.smith@example.com', type: 'user' },
    { id: 'user3', name: 'Bob Johnson', email: 'bob.johnson@example.com', type: 'user' },
    { id: 'user4', name: 'Alice Williams', email: 'alice.williams@example.com', type: 'user' }
  ]);
  
  const [groups] = useState([
    { id: 'group1', name: 'Administrators', type: 'group' },
    { id: 'group2', name: 'Editors', type: 'group' },
    { id: 'group3', name: 'Viewers', type: 'group' },
    { id: 'group4', name: 'Marketing Team', type: 'group' }
  ]);
  
  // State for sharing targets
  const [shareTargets, setShareTargets] = useState<ShareTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<PermissionLevel>(PermissionLevel.VIEWER);
  
  // State for public sharing
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [publicLink, setPublicLink] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate public link when isPublic changes
  useEffect(() => {
    if (isPublic) {
      // In a real app, this would be an API call to generate a secure link
      setPublicLink(`https://dashboard.example.com/public/${dashboardId}?token=${Math.random().toString(36).substring(2, 15)}`);
    } else {
      setPublicLink('');
    }
  }, [isPublic, dashboardId]);
  
  // Handle adding a new share target
  const handleAddTarget = () => {
    if (!selectedTarget) return;
    
    // Check if target is already in the list
    if (shareTargets.some(target => target.id === selectedTarget.id)) {
      setError(`${selectedTarget.name} is already in the sharing list`);
      return;
    }
    
    // Add target to the list
    setShareTargets([
      ...shareTargets,
      {
        id: selectedTarget.id,
        name: selectedTarget.name,
        email: selectedTarget.email,
        type: selectedTarget.type,
        permission: selectedPermission
      }
    ]);
    
    // Reset selection
    setSelectedTarget(null);
    setError(null);
  };
  
  // Handle removing a share target
  const handleRemoveTarget = (id: string) => {
    setShareTargets(shareTargets.filter(target => target.id !== id));
  };
  
  // Handle changing permission for a share target
  const handleChangePermission = (id: string, permission: PermissionLevel) => {
    setShareTargets(
      shareTargets.map(target => 
        target.id === id ? { ...target, permission } : target
      )
    );
  };
  
  // Handle copying public link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  
  // Handle save
  const handleSave = async () => {
    if (onShare) {
      setLoading(true);
      setError(null);
      
      try {
        await onShare(shareTargets, isPublic, publicLink);
        onClose();
      } catch (err) {
        setError('Failed to save sharing settings');
      } finally {
        setLoading(false);
      }
    } else {
      onClose();
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShareIcon sx={{ mr: 1 }} />
          Share Dashboard: {dashboardName}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Add users or groups */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add Users or Groups
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Autocomplete
              sx={{ flex: 1 }}
              options={[...users, ...groups]}
              getOptionLabel={(option) => `${option.name}${option.email ? ` (${option.email})` : ''}`}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  {option.type === 'user' ? (
                    <PersonAddIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  ) : (
                    <GroupAddIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  )}
                  {option.name}
                  {option.email && (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({option.email})
                    </Typography>
                  )}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search users or groups"
                  variant="outlined"
                />
              )}
              value={selectedTarget}
              onChange={(_, newValue) => setSelectedTarget(newValue)}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="permission-label">Permission</InputLabel>
              <Select
                labelId="permission-label"
                value={selectedPermission}
                label="Permission"
                onChange={(e) => setSelectedPermission(e.target.value as PermissionLevel)}
              >
                <MenuItem value={PermissionLevel.VIEWER}>{permissionLabels[PermissionLevel.VIEWER]}</MenuItem>
                <MenuItem value={PermissionLevel.EDITOR}>{permissionLabels[PermissionLevel.EDITOR]}</MenuItem>
                <MenuItem value={PermissionLevel.ADMIN}>{permissionLabels[PermissionLevel.ADMIN]}</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              onClick={handleAddTarget}
              disabled={!selectedTarget}
              startIcon={selectedTarget?.type === 'user' ? <PersonAddIcon /> : <GroupAddIcon />}
            >
              Add
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Shared with list */}
          <Typography variant="subtitle2" gutterBottom>
            Shared with
          </Typography>
          
          {shareTargets.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              This dashboard is not shared with anyone
            </Typography>
          ) : (
            <List>
              {shareTargets.map((target) => (
                <ListItem
                  key={target.id}
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveTarget(target.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {target.type === 'user' ? (
                          <PersonAddIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        ) : (
                          <GroupAddIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        )}
                        {target.name}
                        {target.email && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({target.email})
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <FormControl size="small" sx={{ mt: 1, minWidth: 120 }}>
                        <Select
                          value={target.permission}
                          onChange={(e) => handleChangePermission(target.id, e.target.value as PermissionLevel)}
                          size="small"
                        >
                          <MenuItem value={PermissionLevel.VIEWER}>{permissionLabels[PermissionLevel.VIEWER]}</MenuItem>
                          <MenuItem value={PermissionLevel.EDITOR}>{permissionLabels[PermissionLevel.EDITOR]}</MenuItem>
                          <MenuItem value={PermissionLevel.ADMIN}>{permissionLabels[PermissionLevel.ADMIN]}</MenuItem>
                        </Select>
                      </FormControl>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Public sharing */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Public Access
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isPublic ? (
                  <PublicIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                ) : (
                  <LockIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                )}
                {isPublic ? 'Public dashboard (anyone with the link can view)' : 'Private dashboard'}
              </Box>
            }
          />
          
          {isPublic && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Share this link with anyone to give them view access to this dashboard:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TextField
                  fullWidth
                  value={publicLink}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="outlined"
                  startIcon={linkCopied ? <CheckIcon /> : <CopyIcon />}
                  onClick={handleCopyLink}
                  sx={{ ml: 1, minWidth: 120 }}
                  color={linkCopied ? 'success' : 'primary'}
                >
                  {linkCopied ? 'Copied' : 'Copy'}
                </Button>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Anyone with this link will be able to view this dashboard, but they won't be able to edit it.
              </Alert>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Permission explanation */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Permission Levels
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.values(PermissionLevel).map((permission) => (
              <Box key={permission} sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  label={permissionLabels[permission]}
                  size="small"
                  sx={{ minWidth: 80 }}
                />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {permissionDescriptions[permission]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <ShareIcon />}
        >
          Save Sharing Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardSharingDialog;