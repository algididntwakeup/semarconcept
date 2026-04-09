import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  // Select, // Removed unused import
  // MenuItem, // Removed unused import
  // FormControl, // Removed unused import
  // InputLabel, // Removed unused import
  FormControlLabel,
  Divider,
  // SelectChangeEvent, // Removed unused import
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business'; // Icon for tenants
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchTenants, saveTenant, deleteTenant, toggleTenantStatus } from '../../store/slices/tenantSlice'; // To be created

// Placeholder type matching backend model
interface TenantInfo {
  id: number; // Or UUID if using UUIDs
  name: string;
  subdomain?: string;
  isActive: boolean;
  createdAt: string; // ISO string or Date
}

const TenantManagementPage: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>();
  // const { tenants, loading, error, saving } = useSelector((state: RootState) => state.tenant); // To be created

  // Placeholder state
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantInfo | null>(null);
  const [formData, setFormData] = useState<Partial<TenantInfo>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    // dispatch(fetchTenants());
    // Mock fetch
    setTimeout(() => {
      setTenants([
        {
          id: 1,
          name: 'Default Tenant',
          subdomain: '',
          isActive: true,
          createdAt: new Date(Date.now() - 100 * 3600 * 1000).toISOString(),
        },
        {
          id: 2,
          name: 'Customer A Inc.',
          subdomain: 'customera',
          isActive: true,
          createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
        },
        {
          id: 3,
          name: 'Beta Testers LLC',
          subdomain: 'beta',
          isActive: false,
          createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        },
      ]);
      setIsLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchData();
  }, []); // dispatch

  const handleOpenForm = (tenant: TenantInfo | null = null) => {
    setEditingTenant(tenant);
    setError(null);
    setFormData(tenant ? { ...tenant } : { isActive: true }); // Initialize form data
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTenant(null);
    setFormData({});
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    console.log('Saving Tenant:', formData);
    setIsSaving(true);
    setError(null);
    // try {
    //   await dispatch(saveTenant(formData)).unwrap();
    //   handleCloseForm();
    //   fetchData(); // Refresh list
    // } catch (err: unknown) {
    //   setError((err as Error)?.message || 'Failed to save tenant');
    // } finally {
    //   setIsSaving(false);
    // }
    // Mock save
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    handleCloseForm();
    fetchData(); // Refresh list
  };

  const handleDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the tenant "${name}"? This might affect associated users and data.`
      )
    ) {
      console.log('Deleting Tenant:', id);
      setError(null);
      // TODO: dispatch(deleteTenant(id));
      // Mock delete
      setTenants((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    console.log(`Toggling status for Tenant ${id} from ${currentStatus}`);
    setError(null);
    // TODO: dispatch(toggleTenantStatus({id, isActive: !currentStatus}));
    // Mock toggle
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !currentStatus } : t)));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tenant Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Tenant
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 0 }}>
        <List disablePadding>
          {isLoading ? (
            <ListItem>
              <ListItemText
                primary={<CircularProgress size={24} sx={{ mx: 'auto', display: 'block' }} />}
              />
            </ListItem>
          ) : tenants.length === 0 ? (
            <ListItem>
              <ListItemText primary="No tenants found." />
            </ListItem>
          ) : (
            tenants.map((tenant, index) => (
              <React.Fragment key={tenant.id}>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={tenant.name}
                    secondary={`Subdomain: ${
                      tenant.subdomain || '(none)'
                    } | Created: ${new Date(tenant.createdAt).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={tenant.isActive ? 'Deactivate Tenant' : 'Activate Tenant'}>
                      <Switch
                        edge="end"
                        checked={tenant.isActive}
                        onChange={() => handleToggleStatus(tenant.id, tenant.isActive)}
                        inputProps={{ 'aria-label': `toggle ${tenant.name}` }}
                      />
                    </Tooltip>
                    <Tooltip title="Edit Tenant">
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenForm(tenant)}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Tenant">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(tenant.id, tenant.name)}
                        sx={{ ml: 1 }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < tenants.length - 1 && <Divider component="li" variant="inset" />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTenant ? `Edit Tenant: ${editingTenant.name}` : 'Add New Tenant'}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            fullWidth
            required
            name="name"
            label="Tenant Name"
            value={formData.name || ''}
            onChange={handleInputChange}
            disabled={isSaving}
            autoFocus
          />
          <TextField
            margin="dense"
            fullWidth
            name="subdomain"
            label="Subdomain"
            value={formData.subdomain || ''}
            onChange={handleInputChange}
            disabled={isSaving}
            helperText="Unique identifier for subdomain access (optional, alphanumeric)"
          />
          {/* Add other tenant fields here if needed */}
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={!!formData.isActive}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            }
            label="Tenant is Active"
            sx={{ mt: 1, display: 'block' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={isSaving} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? (
              <CircularProgress size={24} />
            ) : editingTenant ? (
              'Save Changes'
            ) : (
              'Add Tenant'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TenantManagementPage;
