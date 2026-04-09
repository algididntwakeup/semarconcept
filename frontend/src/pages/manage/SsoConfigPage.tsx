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
  ListItemIcon, // Keep for icon display
  ListItemSecondaryAction,
  Switch,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  // Checkbox, // Removed unused import
  FormControlLabel, // Keep FormControlLabel
  Divider, // Keep Divider
  // Grid, // Removed unused import
  SelectChangeEvent, // Added missing import
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// import VpnKeyIcon from '@mui/icons-material/VpnKey'; // Removed unused import
import LockOpenIcon from '@mui/icons-material/LockOpen'; // OIDC
import SecurityIcon from '@mui/icons-material/Security'; // SAML
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchIdps, saveIdp, deleteIdp, toggleIdpStatus } from '../../store/slices/ssoSlice'; // To be created

// Placeholder type matching backend model (simplified)
interface IdentityProviderInfo {
  id: number;
  name: string;
  providerType: 'oidc' | 'saml';
  isEnabled: boolean;
  // Add config summary if needed, e.g., IssuerURL or EntityID
}

// Placeholder type for full config (matches backend model's JSON structure conceptually)
interface IdpConfiguration {
  // OIDC specific
  client_id?: string;
  client_secret?: string; // Handle securely - might not be fetched/displayed directly
  issuer_url?: string;
  scopes?: string[]; // Store as comma-separated string or array

  // SAML specific
  idp_metadata_url?: string;
  sp_entity_id?: string;
  acs_url?: string;
  slo_url?: string;
  allow_idp_initiated?: boolean;
  sp_private_key_ref?: string; // Reference to stored key
  sp_cert_ref?: string; // Reference to stored cert
}

const SsoConfigPage: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>();
  // const { idps, loading, error, saving } = useSelector((state: RootState) => state.sso); // To be created

  // Placeholder state
  const [idps, setIdps] = useState<IdentityProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIdp, setEditingIdp] = useState<IdentityProviderInfo | null>(null);
  const [formData, setFormData] = useState<
    Partial<IdentityProviderInfo & { configuration: Partial<IdpConfiguration> }>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []); // dispatch

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    // dispatch(fetchIdps());
    // Mock fetch
    setTimeout(() => {
      setIdps([
        {
          id: 1,
          name: 'Google Workspace',
          providerType: 'oidc',
          isEnabled: true,
        },
        {
          id: 2,
          name: 'Okta Production',
          providerType: 'saml',
          isEnabled: false,
        },
      ]);
      setIsLoading(false);
    }, 600);
  };

  const handleOpenForm = (idp: IdentityProviderInfo | null = null) => {
    setEditingIdp(idp);
    setError(null);
    // TODO: If editing, fetch full config details for the selected IdP
    // For now, initialize with defaults or existing basic info
    setFormData(
      idp
        ? { ...idp, configuration: {} }
        : { providerType: 'oidc', isEnabled: true, configuration: {} }
    );
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIdp(null);
    setFormData({});
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleConfigChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      configuration: {
        ...(prev.configuration || {}),
        [name]: value,
      },
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    console.log('Saving IdP config:', formData);
    setIsSaving(true);
    setError(null);
    // try {
    //   await dispatch(saveIdp(formData)).unwrap();
    //   handleCloseForm();
    //   fetchData(); // Refresh list
    // } catch (err: unknown) {
    //   setError((err as Error)?.message || 'Failed to save configuration');
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
    if (window.confirm(`Are you sure you want to delete the IdP configuration "${name}"?`)) {
      console.log('Deleting IdP config:', id);
      setError(null);
      // TODO: dispatch(deleteIdp(id));
      // Mock delete
      setIdps((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    console.log(`Toggling status for IdP ${id} from ${currentStatus}`);
    setError(null);
    // TODO: dispatch(toggleIdpStatus({id, isEnabled: !currentStatus}));
    // Mock toggle
    setIdps((prev) => prev.map((p) => (p.id === id ? { ...p, isEnabled: !currentStatus } : p)));
  };

  const renderOidcFields = () => (
    <React.Fragment>
      <TextField
        margin="normal"
        fullWidth
        required
        name="configuration.issuer_url"
        label="Issuer URL"
        value={formData.configuration?.issuer_url || ''}
        onChange={handleConfigChange}
        disabled={isSaving}
        helperText="e.g., https://accounts.google.com"
      />
      <TextField
        margin="normal"
        fullWidth
        required
        name="configuration.client_id"
        label="Client ID"
        value={formData.configuration?.client_id || ''}
        onChange={handleConfigChange}
        disabled={isSaving}
      />
      <TextField
        margin="normal"
        fullWidth
        required
        name="configuration.client_secret"
        label="Client Secret"
        type="password"
        value={formData.configuration?.client_secret || ''}
        onChange={handleConfigChange}
        disabled={isSaving}
        helperText="Stored securely on the backend"
      />
      <TextField
        margin="normal"
        fullWidth
        name="configuration.scopes"
        label="Scopes (comma-separated)"
        value={(formData.configuration?.scopes || ['openid', 'profile', 'email']).join(',')}
        onChange={handleConfigChange}
        disabled={isSaving}
        helperText="Default: openid, profile, email"
      />
    </React.Fragment>
  );

  const renderSamlFields = () => (
    <React.Fragment>
      <TextField
        margin="normal"
        fullWidth
        required
        name="configuration.idp_metadata_url"
        label="IdP Metadata URL"
        value={formData.configuration?.idp_metadata_url || ''}
        onChange={handleConfigChange}
        disabled={isSaving}
        helperText="URL to fetch IdP configuration"
      />
      <TextField
        margin="normal"
        fullWidth
        required
        name="configuration.sp_entity_id"
        label="SP Entity ID"
        value={formData.configuration?.sp_entity_id || ''}
        onChange={handleConfigChange}
        disabled={isSaving}
        helperText="Usually your application's base URL"
      />
      {/* Add fields for ACS URL, SLO URL, Key/Cert references etc. */}
      <FormControlLabel
        control={
          <Switch
            name="configuration.allow_idp_initiated"
            checked={!!formData.configuration?.allow_idp_initiated}
            onChange={handleInputChange} // Use handleInputChange for Switch
            disabled={isSaving}
          />
        }
        label="Allow IdP-Initiated Login"
        sx={{ mt: 1, display: 'block' }}
      />
    </React.Fragment>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Single Sign-On (SSO) Providers
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Provider
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
          ) : idps.length === 0 ? (
            <ListItem>
              <ListItemText primary="No SSO providers configured." />
            </ListItem>
          ) : (
            idps.map((idp, index) => (
              <React.Fragment key={idp.id}>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {idp.providerType === 'oidc' ? <LockOpenIcon /> : <SecurityIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={idp.name}
                    secondary={`Type: ${idp.providerType.toUpperCase()}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={idp.isEnabled ? 'Disable Provider' : 'Enable Provider'}>
                      <Switch
                        edge="end"
                        checked={idp.isEnabled}
                        onChange={() => handleToggleStatus(idp.id, idp.isEnabled)}
                        inputProps={{ 'aria-label': `toggle ${idp.name}` }}
                      />
                    </Tooltip>
                    <Tooltip title="Edit Configuration">
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenForm(idp)}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Provider">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(idp.id, idp.name)}
                        sx={{ ml: 1 }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < idps.length - 1 && <Divider component="li" variant="inset" />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIdp ? `Edit Provider: ${editingIdp.name}` : 'Add New SSO Provider'}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            fullWidth
            required
            name="name"
            label="Provider Name"
            value={formData.name || ''}
            onChange={handleInputChange}
            disabled={isSaving}
            helperText="A user-friendly name for this connection"
          />
          <FormControl margin="dense" fullWidth required disabled={isSaving || !!editingIdp}>
            {' '}
            {/* Don't allow changing type when editing */}
            <InputLabel id="provider-type-label">Provider Type</InputLabel>
            <Select
              labelId="provider-type-label"
              name="providerType"
              value={formData.providerType || 'oidc'}
              label="Provider Type"
              onChange={handleSelectChange}
            >
              <MenuItem value="oidc">OIDC (OpenID Connect)</MenuItem>
              <MenuItem value="saml">SAML 2.0</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Provider Configuration
          </Typography>

          {formData.providerType === 'oidc' && renderOidcFields()}
          {formData.providerType === 'saml' && renderSamlFields()}

          <Divider sx={{ my: 2 }} />
          <FormControlLabel
            control={
              <Switch
                name="isEnabled"
                checked={!!formData.isEnabled}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            }
            label="Enable this provider for login"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={isSaving} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? (
              <CircularProgress size={24} />
            ) : editingIdp ? (
              'Save Changes'
            ) : (
              'Add Provider'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SsoConfigPage;
