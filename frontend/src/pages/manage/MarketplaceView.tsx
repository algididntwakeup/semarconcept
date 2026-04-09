import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchAvailableModules, installModule, /* updateModule */ } from '../../store/slices/marketplaceSlice'; // To be created

// Placeholder type for available modules (might differ from installed ModuleInfo)
interface AvailableModule {
  id: string; // Unique identifier in the marketplace
  name: string;
  version: string;
  description?: string;
  author?: string;
  // Add fields like iconUrl, tags, installedVersion, status ('installed', 'not_installed', 'update_available')
  status: 'installed' | 'not_installed' | 'update_available';
  installedVersion?: string;
}

const MarketplaceView: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>();
  // const { availableModules, loading, error, installing } = useSelector((state: RootState) => state.marketplace); // To be created

  // Placeholder state
  const [availableModules, setAvailableModules] = useState<AvailableModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installingModule, setInstallingModule] = useState<string | null>(null); // Track which module is being installed

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // dispatch(fetchAvailableModules());
    // Mock fetch
    setTimeout(() => {
      setAvailableModules([
        { id: 'mod-blog', name: 'BlogModule', version: '0.3', description: 'Adds blogging features', author: 'Rekso Dev', status: 'installed', installedVersion: '0.2' },
        { id: 'mod-shop', name: 'ShopModule', version: '0.1', description: 'Basic e-commerce', author: 'Rekso Dev', status: 'not_installed' },
        { id: 'mod-analytics', name: 'AnalyticsModule', version: '0.2', description: 'Basic analytics tracking', author: 'Community Contributor', status: 'not_installed' },
        { id: 'mod-core', name: 'Core', version: '1.0', description: 'Core application functionality', author: 'Rekso Dev', status: 'installed', installedVersion: '1.0' },
      ]);
      setIsLoading(false);
    }, 900);
  }, []); // dispatch

  const handleInstall = async (moduleId: string, moduleName: string) => {
    console.log(`Installing module: ${moduleName} (${moduleId})`);
    setError(null);
    setInstallingModule(moduleId);
    // try {
    //   await dispatch(installModule(moduleId)).unwrap();
    //   // Optionally refresh the list or update status locally
    // } catch (err: any) {
    //   setError(`Failed to install ${moduleName}: ${err.message || 'Unknown error'}`);
    // } finally {
    //   setInstallingModule(null);
    // }
    // Mock install
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAvailableModules(prev => prev.map(m => m.id === moduleId ? {...m, status: 'installed', installedVersion: m.version} : m));
    setInstallingModule(null);
  };

   const handleUpdate = async (moduleId: string, moduleName: string) => {
    console.log(`Updating module: ${moduleName} (${moduleId})`);
     setError(null);
     setInstallingModule(moduleId); // Use same state for update indication
    // try {
    //   await dispatch(updateModule(moduleId)).unwrap();
    // } catch (err: any) {
    //   setError(`Failed to update ${moduleName}: ${err.message || 'Unknown error'}`);
    // } finally {
    //   setInstallingModule(null);
    // }
     await new Promise(resolve => setTimeout(resolve, 2500));
     setAvailableModules(prev => prev.map(m => m.id === moduleId ? {...m, status: 'installed', installedVersion: m.version} : m));
     setInstallingModule(null);
   };


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Module Marketplace
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      ) : availableModules.length === 0 ? (
         <Typography sx={{ textAlign: 'center', p: 3 }}>No modules available in the marketplace.</Typography>
      ) : (
        <Grid container spacing={3}>
          {availableModules.map((mod) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {mod.name} <Chip label={`v${mod.version}`} size="small" variant="outlined" sx={{ ml: 1 }} />
                  </Typography>
                  {mod.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {mod.description}
                    </Typography>
                  )}
                   {mod.author && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      By: {mod.author}
                    </Typography>
                  )}
                   {mod.status === 'installed' && mod.installedVersion && mod.installedVersion !== mod.version && (
                     <Typography variant="caption" color="warning.main" display="block" sx={{mt: 1}}>
                       Installed: v{mod.installedVersion}
                     </Typography>
                   )}
                </CardContent>
                <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
                  {mod.status === 'not_installed' && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleInstall(mod.id, mod.name)}
                      disabled={installingModule === mod.id}
                    >
                      {installingModule === mod.id ? <CircularProgress size={20} sx={{mr: 1}} /> : null}
                      Install
                    </Button>
                  )}
                   {mod.status === 'installed' && mod.installedVersion !== mod.version && (
                     <Button
                       size="small"
                       variant="outlined"
                       color="warning"
                       onClick={() => handleUpdate(mod.id, mod.name)}
                       disabled={installingModule === mod.id}
                     >
                       {installingModule === mod.id ? <CircularProgress size={20} sx={{mr: 1}} /> : null}
                       Update to v{mod.version}
                     </Button>
                   )}
                   {mod.status === 'installed' && mod.installedVersion === mod.version && (
                      <Chip label="Installed" size="small" color="success" variant="outlined" />
                      // Add Uninstall button?
                   )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MarketplaceView;