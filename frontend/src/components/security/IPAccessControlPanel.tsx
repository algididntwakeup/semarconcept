import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  AlertTitle,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  CheckCircle as AllowIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Define IP rule types
export enum IPRuleType {
  ALLOW = 'allow',
  DENY = 'deny'
}

// Define IP rule interface
export interface IPRule {
  id: string;
  ipAddress: string;
  type: IPRuleType;
  description?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

// Define IP access control settings interface
export interface IPAccessControlSettings {
  enabled: boolean;
  defaultPolicy: IPRuleType;
  rules: IPRule[];
}

interface IPAccessControlPanelProps {
  /**
   * Current IP access control settings
   */
  settings?: IPAccessControlSettings;
  
  /**
   * Function to save settings
   */
  onSaveSettings?: (settings: IPAccessControlSettings) => Promise<void>;
  
  /**
   * Function to add a new rule
   */
  onAddRule?: (rule: Omit<IPRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  /**
   * Function to update an existing rule
   */
  onUpdateRule?: (id: string, rule: Partial<IPRule>) => Promise<void>;
  
  /**
   * Function to delete a rule
   */
  onDeleteRule?: (id: string) => Promise<void>;
  
  /**
   * Whether the component is in loading state
   */
  isLoading?: boolean;
  
  /**
   * Error message to display
   */
  error?: string | null;
}

/**
 * IPAccessControlPanel component
 * 
 * This component provides a UI for managing IP-based access control.
 * It allows administrators to enable/disable IP filtering, set default policy,
 * and manage allow/deny rules for specific IP addresses or ranges.
 */
const IPAccessControlPanel: React.FC<IPAccessControlPanelProps> = ({
  settings,
  onSaveSettings,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  isLoading = false,
  error = null
}) => {
  // Default settings
  const defaultSettings: IPAccessControlSettings = {
    enabled: false,
    defaultPolicy: IPRuleType.DENY,
    rules: []
  };
  
  // State for settings
  const [currentSettings, setCurrentSettings] = useState<IPAccessControlSettings>(
    settings || defaultSettings
  );
  
  // State for new rule form
  const [newRule, setNewRule] = useState<Omit<IPRule, 'id' | 'createdAt' | 'updatedAt'>>({
    ipAddress: '',
    type: IPRuleType.ALLOW,
    description: '',
    active: true
  });
  
  // State for edit mode
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editedRule, setEditedRule] = useState<Partial<IPRule>>({});
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  
  // State for form validation
  const [ipAddressError, setIpAddressError] = useState<string | null>(null);
  
  // State for success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Update current settings when props change
  useEffect(() => {
    if (settings) {
      setCurrentSettings(settings);
    }
  }, [settings]);
  
  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [successMessage]);
  
  // Handle settings change
  const handleSettingsChange = (field: keyof IPAccessControlSettings, value: any) => {
    setCurrentSettings({
      ...currentSettings,
      [field]: value
    });
  };
  
  // Handle save settings
  const handleSaveSettings = async () => {
    if (onSaveSettings) {
      try {
        await onSaveSettings(currentSettings);
        setSuccessMessage('Settings saved successfully');
      } catch (error) {
        // Error is handled by the parent component
      }
    }
  };
  
  // Handle new rule change
  const handleNewRuleChange = (field: keyof Omit<IPRule, 'id' | 'createdAt' | 'updatedAt'>, value: any) => {
    setNewRule({
      ...newRule,
      [field]: value
    });
    
    // Validate IP address
    if (field === 'ipAddress') {
      validateIPAddress(value);
    }
  };
  
  // Handle add rule
  const handleAddRule = async () => {
    // Validate IP address
    if (!validateIPAddress(newRule.ipAddress)) {
      return;
    }
    
    if (onAddRule) {
      try {
        await onAddRule(newRule);
        setSuccessMessage('Rule added successfully');
        
        // Reset form
        setNewRule({
          ipAddress: '',
          type: IPRuleType.ALLOW,
          description: '',
          active: true
        });
      } catch (error) {
        // Error is handled by the parent component
      }
    }
  };
  
  // Handle edit rule
  const handleEditRule = (rule: IPRule) => {
    setEditingRuleId(rule.id);
    setEditedRule({
      ipAddress: rule.ipAddress,
      type: rule.type,
      description: rule.description,
      active: rule.active
    });
  };
  
  // Handle edited rule change
  const handleEditedRuleChange = (field: keyof IPRule, value: any) => {
    setEditedRule({
      ...editedRule,
      [field]: value
    });
    
    // Validate IP address
    if (field === 'ipAddress' && typeof value === 'string') {
      validateIPAddress(value);
    }
  };
  
  // Handle save edited rule
  const handleSaveEditedRule = async () => {
    if (editingRuleId && onUpdateRule) {
      // Validate IP address
      if (editedRule.ipAddress && !validateIPAddress(editedRule.ipAddress)) {
        return;
      }
      
      try {
        await onUpdateRule(editingRuleId, editedRule);
        setSuccessMessage('Rule updated successfully');
        setEditingRuleId(null);
        setEditedRule({});
      } catch (error) {
        // Error is handled by the parent component
      }
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditedRule({});
    setIpAddressError(null);
  };
  
  // Handle delete rule dialog
  const handleDeleteRuleDialog = (id: string) => {
    setRuleToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete rule
  const handleDeleteRule = async () => {
    if (ruleToDelete && onDeleteRule) {
      try {
        await onDeleteRule(ruleToDelete);
        setSuccessMessage('Rule deleted successfully');
      } catch (error) {
        // Error is handled by the parent component
      } finally {
        setDeleteDialogOpen(false);
        setRuleToDelete(null);
      }
    }
  };
  
  // Validate IP address or CIDR notation
  const validateIPAddress = (ipAddress: string): boolean => {
    // Regular expression for IPv4 address
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    
    // Regular expression for IPv6 address
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;
    
    // Check if the IP address is valid
    const isValid = ipv4Regex.test(ipAddress) || ipv6Regex.test(ipAddress);
    
    if (!isValid) {
      setIpAddressError('Invalid IP address or CIDR notation');
    } else {
      setIpAddressError(null);
    }
    
    return isValid;
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  return (
    <Card>
      <CardHeader
        title="IP Access Control"
        subheader="Manage IP-based access restrictions"
        avatar={<SecurityIcon />}
        action={
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Save Settings
          </Button>
        }
      />
      <Divider />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Success</AlertTitle>
            {successMessage}
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentSettings.enabled}
                  onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable IP Access Control"
            />
            
            <Tooltip title="When enabled, access to the application will be restricted based on IP address rules">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Default Policy:
            </Typography>
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="default-policy-label">Default Policy</InputLabel>
              <Select
                labelId="default-policy-label"
                value={currentSettings.defaultPolicy}
                label="Default Policy"
                onChange={(e) => handleSettingsChange('defaultPolicy', e.target.value)}
                disabled={!currentSettings.enabled}
              >
                <MenuItem value={IPRuleType.ALLOW}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AllowIcon color="success" sx={{ mr: 1 }} />
                    Allow All (Deny Listed)
                  </Box>
                </MenuItem>
                <MenuItem value={IPRuleType.DENY}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BlockIcon color="error" sx={{ mr: 1 }} />
                    Deny All (Allow Listed)
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title={
              currentSettings.defaultPolicy === IPRuleType.ALLOW
                ? "By default, all IP addresses will be allowed except those explicitly denied"
                : "By default, all IP addresses will be denied except those explicitly allowed"
            }>
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add New Rule
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <TextField
              label="IP Address / CIDR"
              value={newRule.ipAddress}
              onChange={(e) => handleNewRuleChange('ipAddress', e.target.value)}
              placeholder="e.g. 192.168.1.1 or 10.0.0.0/24"
              error={!!ipAddressError}
              helperText={ipAddressError}
              disabled={!currentSettings.enabled || isLoading}
              sx={{ flexGrow: 1 }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="rule-type-label">Rule Type</InputLabel>
              <Select
                labelId="rule-type-label"
                value={newRule.type}
                label="Rule Type"
                onChange={(e) => handleNewRuleChange('type', e.target.value)}
                disabled={!currentSettings.enabled || isLoading}
              >
                <MenuItem value={IPRuleType.ALLOW}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AllowIcon color="success" sx={{ mr: 1 }} />
                    Allow
                  </Box>
                </MenuItem>
                <MenuItem value={IPRuleType.DENY}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BlockIcon color="error" sx={{ mr: 1 }} />
                    Deny
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              value={newRule.description}
              onChange={(e) => handleNewRuleChange('description', e.target.value)}
              placeholder="Optional description"
              disabled={!currentSettings.enabled || isLoading}
              sx={{ flexGrow: 2 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddRule}
              disabled={!currentSettings.enabled || !newRule.ipAddress || !!ipAddressError || isLoading}
            >
              Add Rule
            </Button>
          </Box>
        </Box>
        
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              IP Rules
            </Typography>
            
            <Chip
              label={`${currentSettings.rules.length} Rules`}
              color="primary"
              variant="outlined"
            />
          </Box>
          
          {currentSettings.rules.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No IP rules have been added yet. Add rules to restrict or allow access from specific IP addresses.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>IP Address / CIDR</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentSettings.rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        {editingRuleId === rule.id ? (
                          <TextField
                            value={editedRule.ipAddress}
                            onChange={(e) => handleEditedRuleChange('ipAddress', e.target.value)}
                            error={!!ipAddressError}
                            helperText={ipAddressError}
                            size="small"
                            fullWidth
                          />
                        ) : (
                          rule.ipAddress
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRuleId === rule.id ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedRule.type}
                              onChange={(e) => handleEditedRuleChange('type', e.target.value)}
                            >
                              <MenuItem value={IPRuleType.ALLOW}>Allow</MenuItem>
                              <MenuItem value={IPRuleType.DENY}>Deny</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip
                            label={rule.type === IPRuleType.ALLOW ? 'Allow' : 'Deny'}
                            color={rule.type === IPRuleType.ALLOW ? 'success' : 'error'}
                            size="small"
                            icon={rule.type === IPRuleType.ALLOW ? <AllowIcon /> : <BlockIcon />}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRuleId === rule.id ? (
                          <TextField
                            value={editedRule.description}
                            onChange={(e) => handleEditedRuleChange('description', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        ) : (
                          rule.description || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRuleId === rule.id ? (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={editedRule.active}
                                onChange={(e) => handleEditedRuleChange('active', e.target.checked)}
                                size="small"
                              />
                            }
                            label={editedRule.active ? 'Active' : 'Inactive'}
                          />
                        ) : (
                          <Chip
                            label={rule.active ? 'Active' : 'Inactive'}
                            color={rule.active ? 'primary' : 'default'}
                            size="small"
                            variant={rule.active ? 'filled' : 'outlined'}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(rule.createdAt)}
                      </TableCell>
                      <TableCell>
                        {editingRuleId === rule.id ? (
                          <Box>
                            <IconButton
                              color="primary"
                              onClick={handleSaveEditedRule}
                              disabled={!!ipAddressError}
                              size="small"
                            >
                              <SaveIcon />
                            </IconButton>
                            <IconButton
                              color="default"
                              onClick={handleCancelEdit}
                              size="small"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditRule(rule)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteRuleDialog(rule.id)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete IP Rule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this IP rule? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteRule}
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default IPAccessControlPanel;