import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchModules, enableModule, disableModule, /* other actions */ } from '../../store/slices/moduleSlice'; // To be created

// Define ModuleInfo type locally or import from module.ts
interface ModuleInfo {
  name: string;
  version: string;
  description?: string;
  enabled: boolean;
  // Add config schema identifier?
}

const ModuleManagementPage: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>();
  // const { modules, loading, error } = useSelector((state: RootState) => state.modules); // To be created

  // Placeholder state
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // dispatch(fetchModules());
    // Mock fetch
    setTimeout(() => {
      setModules([
        {
          name: 'Core',
          version: '1.0',
          description: 'Core application functionality',
          enabled: true,
        },
        {
          name: 'ReportingModule',
          version: '0.1',
          description: 'Adds reporting features',
          enabled: true,
        },
        {
          name: 'AnalyticsModule',
          version: '0.2',
          description: 'Basic analytics tracking',
          enabled: false,
        },
      ]);
      setIsLoading(false);
    }, 800);
  }, []); // dispatch

  const handleToggleModule = (moduleName: string, currentStatus: boolean) => {
    console.log(`Toggling module ${moduleName} from ${currentStatus}`);
    setError(null);
    // TODO: Dispatch enableModule/disableModule action
    // Mock toggle:
    setModules((prev) =>
      prev.map((m) => (m.name === moduleName ? { ...m, enabled: !currentStatus } : m))
    );
  };

  const handleConfigureModule = (moduleInfo: ModuleInfo) => {
    console.log('Configure module:', moduleInfo.name);
    setSelectedModule(moduleInfo);
    setIsConfigDialogOpen(true);
    // TODO: Fetch module-specific config schema/form structure
  };

  const handleCloseConfigDialog = () => {
    setIsConfigDialogOpen(false);
    setSelectedModule(null);
  };

  const handleSaveConfig = () => {
    console.log('Saving config for:', selectedModule?.name);
    // TODO: Implement save logic
    handleCloseConfigDialog();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Module Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 0 }}>
        {' '}
        {/* Remove padding for TableContainer */}
        <TableContainer>
          <Table stickyHeader aria-label="module management table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No modules found.
                  </TableCell>
                </TableRow>
              ) : (
                modules.map((mod) => (
                  <TableRow hover key={mod.name}>
                    <TableCell component="th" scope="row">
                      {mod.name}
                    </TableCell>
                    <TableCell>{mod.version}</TableCell>
                    <TableCell>{mod.description || '-'}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={mod.enabled}
                        onChange={() => handleToggleModule(mod.name, mod.enabled)}
                        inputProps={{ 'aria-label': `toggle ${mod.name} module` }}
                        size="small"
                        color={mod.enabled ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Configure Module">
                        <span>
                          {' '}
                          {/* Span needed for tooltip on disabled button */}
                          <IconButton
                            size="small"
                            onClick={() => handleConfigureModule(mod)}
                            disabled={!mod.enabled} // Example: only configure enabled modules
                          >
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {/* Add other actions like 'Uninstall' if applicable */}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onClose={handleCloseConfigDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Configure: {selectedModule?.name || ''}</DialogTitle>
        <DialogContent dividers>
          <Typography color="textSecondary">
            Module-specific configuration form will be loaded here based on the module's requirements.
          </Typography>
          {/* Placeholder for dynamic form */}
          <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', minHeight: '100px' }}>
            Dynamic Config Form Area
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfigDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveConfig} variant="contained">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModuleManagementPage;
