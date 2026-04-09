import React, { useState, useEffect } from 'react';
import {
  Box,
  // Grid, // Removed unused import
  // Card, // Removed unused import
  // CardMedia, // Removed unused import
  // CardContent, // Removed unused import
  Typography,
  // CardActions, // Removed unused import
  Button,
  CircularProgress,
  Alert,
  // Pagination, // Removed unused import
  Tooltip,
  IconButton,
  Container, // Ensure Container is imported
  Paper, // Ensure Paper is imported
  List,
  ListItem,
  ListItemText,
  // ListItemIcon, // Removed unused import
  ListItemSecondaryAction,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Divider,
  SelectChangeEvent, // Import SelectChangeEvent
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PowerIcon from '@mui/icons-material/Power'; // For Test Connection
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchIntegrations, configureIntegration, testIntegrationConnection, toggleIntegration } from '../../store/slices/integrationSlice'; // To be created

// Matches backend/app/integrations/integration.go
interface ConfigurationField {
  Name: string;
  Label: string;
  Type: 'text' | 'password' | 'select' | 'boolean'; // Extend as needed
  Required: boolean;
  Description: string;
  DefaultValue?: string;
  Options?: { Label: string; Value: string }[];
}

// Info about an integration listed in the UI
interface IntegrationInfo {
  name: string;
  description: string;
  enabled: boolean;
  configurable: boolean; // Indicates if GetConfigurationFields returns anything
  configFields?: ConfigurationField[]; // Loaded when configure is clicked
  // Add status like 'configured', 'error'?
}

const IntegrationsPage: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>();
  // const { integrations, loading, error, configuring } = useSelector((state: RootState) => state.integrations); // To be created

  // Placeholder state
  const [integrations, setIntegrations] = useState<IntegrationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationInfo | null>(null);
  const [configFormData, setConfigFormData] = useState<Record<string, string | boolean>>({});
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnectionResult, setTestConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // dispatch(fetchIntegrations());
    // Mock fetch
    setTimeout(() => {
      setIntegrations([
        {
          name: 'Example REST API',
          description: 'Connects to a sample REST service.',
          enabled: false,
          configurable: true,
          configFields: [
            {
              Name: 'endpoint_url',
              Label: 'API Endpoint URL',
              Type: 'text',
              Required: true,
              Description: 'The base URL of the API.',
              DefaultValue: 'https://api.example.com/v1',
            },
            {
              Name: 'api_key',
              Label: 'API Key',
              Type: 'password',
              Required: true,
              Description: 'Your secret API key.',
            },
            {
              Name: 'timeout',
              Label: 'Timeout (seconds)',
              Type: 'text',
              Required: false,
              Description: 'Request timeout duration.',
              DefaultValue: '30',
            },
          ],
        },
        {
          name: 'Webhook Listener',
          description: 'Receives incoming webhooks.',
          enabled: true,
          configurable: false,
        }, // Example non-configurable
        {
          name: 'File Processor',
          description: 'Processes files from a specific directory.',
          enabled: false,
          configurable: true,
          configFields: [
            {
              Name: 'input_directory',
              Label: 'Input Directory',
              Type: 'text',
              Required: true,
              Description: 'Path to watch for files.',
            },
            {
              Name: 'processed_directory',
              Label: 'Processed Directory',
              Type: 'text',
              Required: true,
              Description: 'Path to move processed files.',
            },
            {
              Name: 'use_polling',
              Label: 'Use Polling',
              Type: 'boolean',
              Required: false,
              Description: 'Check directory periodically instead of using file system events.',
              DefaultValue: 'false',
            },
          ],
        },
      ]);
      setIsLoading(false);
    }, 800);
  }, []); // dispatch

  const handleToggleIntegration = (integrationName: string, currentStatus: boolean) => {
    console.log(`Toggling integration ${integrationName} from ${currentStatus}`);
    setError(null);
    // TODO: Dispatch action to enable/disable via backend
    // Mock toggle:
    setIntegrations((prev) =>
      prev.map((i) => (i.name === integrationName ? { ...i, enabled: !currentStatus } : i))
    );
  };

  const handleOpenConfigDialog = (integration: IntegrationInfo) => {
    setSelectedIntegration(integration);
    // TODO: Fetch current config values for this integration if needed
    // Initialize form data based on configFields and potentially fetched values
    const initialData: Record<string, string | boolean> = {};
    integration.configFields?.forEach((field) => {
      initialData[field.Name] = field.DefaultValue ?? (field.Type === 'boolean' ? false : '');
      // Override with fetched current value if available
    });
    setConfigFormData(initialData);
    setTestConnectionResult(null); // Clear previous test result
    setIsConfigDialogOpen(true);
  };

  const handleCloseConfigDialog = () => {
    setIsConfigDialogOpen(false);
    setSelectedIntegration(null);
    setConfigFormData({});
    setTestConnectionResult(null);
  };

  // Updated handler to accept SelectChangeEvent as well
  const handleConfigFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<unknown>,
    fieldType: string
  ) => {
    const target = event.target as HTMLInputElement; // Common properties like name, value exist on both
    const name = target.name;
    const value = target.value;
    const checked = target.checked; // Only relevant for Checkbox

    if (name) {
      // Ensure name attribute is present
      setConfigFormData((prev) => ({
        ...prev,
        [name]: fieldType === 'boolean' ? checked : value,
      }));
    }
  };

  const handleTestConnection = async () => {
    if (!selectedIntegration) return;
    console.log('Testing connection for:', selectedIntegration.name);
    setIsTestingConnection(true);
    setTestConnectionResult(null);
    setError(null);
    // TODO: Dispatch action to test connection via backend
    // try {
    //   const result = await dispatch(testIntegrationConnection({name: selectedIntegration.name, config: configFormData })).unwrap();
    //   setTestConnectionResult({ success: true, message: 'Connection successful!' });
    // } catch (err: any) {
    //   setTestConnectionResult({ success: false, message: `Connection failed: ${err.message || 'Unknown error'}` });
    // } finally {
    //   setIsTestingConnection(false);
    // }
    // Mock test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Simulate success or failure randomly for demo
    const success = Math.random() > 0.3;
    setTestConnectionResult({
      success: success,
      message: success ? 'Connection successful!' : 'Connection failed: Invalid credentials (mock)',
    });
    setIsTestingConnection(false);
  };

  const handleSaveConfig = async () => {
    if (!selectedIntegration) return;
    console.log('Saving config for:', selectedIntegration.name, configFormData);
    setIsSavingConfig(true);
    setError(null);
    setTestConnectionResult(null);
    // TODO: Dispatch action to save config via backend
    // try {
    //   await dispatch(configureIntegration({name: selectedIntegration.name, config: configFormData })).unwrap();
    //   handleCloseConfigDialog();
    //   // Optionally refetch integrations list or update local state
    // } catch (err: any) {
    //   setError(`Failed to save configuration: ${err.message || 'Unknown error'}`);
    // } finally {
    //   setIsSavingConfig(false);
    // }
    // Mock save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSavingConfig(false);
    handleCloseConfigDialog();
  };

  const renderConfigField = (field: ConfigurationField) => {
    const fieldName = field.Name;
    const value = configFormData[fieldName];

    switch (field.Type) {
      case 'password':
        return (
          <TextField
            key={fieldName}
            name={fieldName}
            label={field.Label}
            type="password"
            fullWidth
            required={field.Required}
            value={(value as string) || ''}
            onChange={(e) => handleConfigFormChange(e, field.Type)}
            helperText={field.Description}
            margin="normal"
            disabled={isSavingConfig}
          />
        );
      case 'boolean':
        return (
          <FormControlLabel
            key={fieldName}
            control={
              <Checkbox
                name={fieldName}
                checked={!!value} // Ensure boolean value
                onChange={(e) => handleConfigFormChange(e, field.Type)}
                disabled={isSavingConfig}
              />
            }
            label={field.Label}
            sx={{ display: 'block', mt: 1 }}
          />
        );
      case 'select': // Example - needs field.Options
        return (
          <FormControl
            fullWidth
            margin="normal"
            required={field.Required}
            disabled={isSavingConfig}
            key={fieldName}
          >
            <InputLabel>{field.Label}</InputLabel>
            <Select
              name={fieldName}
              value={(value as string) || ''}
              label={field.Label}
              onChange={(e) => handleConfigFormChange(e as SelectChangeEvent<unknown>, field.Type)} // Cast event type here
            >
              {(field.Options || []).map((opt) => (
                <MenuItem key={opt.Value} value={opt.Value}>
                  {opt.Label}
                </MenuItem>
              ))}
            </Select>
            {field.Description && (
              <Typography variant="caption" sx={{ ml: 2, mt: 0.5 }} color="textSecondary">
                {field.Description}
              </Typography>
            )}
          </FormControl>
        );
      case 'text':
      default:
        return (
          <TextField
            key={fieldName}
            name={fieldName}
            label={field.Label}
            type="text"
            fullWidth
            required={field.Required}
            value={(value as string) || ''}
            onChange={(e) => handleConfigFormChange(e, field.Type)}
            helperText={field.Description}
            margin="normal"
            disabled={isSavingConfig}
          />
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Application Integrations
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : integrations.length === 0 ? (
        <Typography sx={{ textAlign: 'center', p: 3 }}>No integrations available.</Typography>
      ) : (
        <Paper>
          <List disablePadding>
            {integrations.map((integration, index) => (
              <React.Fragment key={integration.name}>
                <ListItem>
                  <ListItemText primary={integration.name} secondary={integration.description} />
                  <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {integration.configurable && (
                      <Tooltip title="Configure">
                        <IconButton
                          edge="end"
                          aria-label="configure"
                          onClick={() => handleOpenConfigDialog(integration)}
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={integration.enabled ? 'Disable' : 'Enable'}>
                      <Switch
                        edge="end"
                        checked={integration.enabled}
                        onChange={() =>
                          handleToggleIntegration(integration.name, integration.enabled)
                        }
                        inputProps={{ 'aria-label': `toggle ${integration.name}` }}
                      />
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < integrations.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onClose={handleCloseConfigDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Configure: {selectedIntegration?.name || ''}</DialogTitle>
        <DialogContent dividers>
          {selectedIntegration?.configFields && selectedIntegration.configFields.length > 0 ? (
            <Box component="form" noValidate>
              {selectedIntegration.configFields.map(renderConfigField)}
            </Box>
          ) : (
            <Typography color="textSecondary">
              This integration requires no configuration.
            </Typography>
          )}

          {/* Test Connection Area */}
          {selectedIntegration?.configurable && ( // Only show if configurable
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="outlined"
                startIcon={isTestingConnection ? <CircularProgress size={20} /> : <PowerIcon />}
                onClick={handleTestConnection}
                disabled={isTestingConnection || isSavingConfig}
              >
                Test Connection
              </Button>
              {testConnectionResult && (
                <Alert
                  severity={testConnectionResult.success ? 'success' : 'error'}
                  icon={
                    testConnectionResult.success ? (
                      <CheckCircleIcon fontSize="inherit" />
                    ) : (
                      <ErrorIcon fontSize="inherit" />
                    )
                  }
                  sx={{ mt: 2 }}
                >
                  {testConnectionResult.message}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfigDialog} disabled={isSavingConfig} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfig}
            variant="contained"
            disabled={isSavingConfig || !selectedIntegration?.configurable} // Disable if not configurable
          >
            {isSavingConfig ? <CircularProgress size={24} /> : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IntegrationsPage;
