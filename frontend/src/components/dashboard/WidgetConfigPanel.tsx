import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  DataUsage as DataIcon,
  Palette as StyleIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { Widget } from './DashboardGrid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`widget-config-tabpanel-${index}`}
      aria-labelledby={`widget-config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Define widget types
export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  KPI = 'kpi',
  TEXT = 'text',
  IMAGE = 'image',
  IFRAME = 'iframe',
  CUSTOM = 'custom'
}

// Define chart types
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter'
}

// Define data source types
export enum DataSourceType {
  API = 'api',
  DATABASE = 'database',
  STATIC = 'static',
  REALTIME = 'realtime'
}

interface WidgetConfigPanelProps {
  open: boolean;
  onClose: () => void;
  widget?: Widget;
  onSave?: (widget: Widget) => Promise<void>;
  availableDataSources?: Array<{
    id: string;
    name: string;
    type: DataSourceType;
  }>;
}

/**
 * WidgetConfigPanel component
 * 
 * This component provides a configuration panel for dashboard widgets.
 * It allows users to configure widget settings, data sources, and appearance.
 */
const WidgetConfigPanel: React.FC<WidgetConfigPanelProps> = ({
  open,
  onClose,
  widget,
  onSave,
  availableDataSources = []
}) => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Widget state
  const [widgetConfig, setWidgetConfig] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Initialize widget config when widget changes
  useEffect(() => {
    if (widget) {
      setWidgetConfig({
        ...widget,
        settings: {
          ...widget.settings
        }
      });
    } else {
      setWidgetConfig(null);
    }
  }, [widget]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle text field change
  const handleTextChange = (field: string, value: string) => {
    if (!widgetConfig) return;
    
    setWidgetConfig({
      ...widgetConfig,
      [field]: value
    });
  };
  
  // Handle settings change
  const handleSettingsChange = (field: string, value: any) => {
    if (!widgetConfig) return;
    
    setWidgetConfig({
      ...widgetConfig,
      settings: {
        ...widgetConfig.settings,
        [field]: value
      }
    });
  };
  
  // Handle save
  const handleSave = async () => {
    if (!widgetConfig || !onSave) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onSave(widgetConfig);
      onClose();
    } catch (err) {
      setError('Failed to save widget configuration');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };
  
  // Render widget preview
  const renderWidgetPreview = () => {
    if (!widgetConfig) return null;
    
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          height: 300,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2">
            {widgetConfig.title || 'Widget Preview'}
          </Typography>
          <Chip
            label={widgetConfig.type}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Widget preview not available
          </Typography>
        </Box>
      </Paper>
    );
  };
  
  if (!widgetConfig) {
    return null;
  }
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Widget Configuration: {widgetConfig.title}
          </Box>
          <Box>
            <IconButton
              color={previewMode ? 'primary' : 'default'}
              onClick={togglePreviewMode}
              sx={{ mr: 1 }}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: previewMode ? 6 : 12 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="widget configuration tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                icon={<SettingsIcon />} 
                label="General" 
                id="widget-config-tab-0"
                aria-controls="widget-config-tabpanel-0"
              />
              <Tab 
                icon={<DataIcon />} 
                label="Data Source" 
                id="widget-config-tab-1"
                aria-controls="widget-config-tabpanel-1"
              />
              <Tab 
                icon={<StyleIcon />} 
                label="Appearance" 
                id="widget-config-tab-2"
                aria-controls="widget-config-tabpanel-2"
              />
              <Tab 
                icon={<CodeIcon />} 
                label="Advanced" 
                id="widget-config-tab-3"
                aria-controls="widget-config-tabpanel-3"
              />
            </Tabs>
            
            {/* General Settings Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    label="Widget Title"
                    value={widgetConfig.title}
                    onChange={(e) => handleTextChange('title', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="widget-type-label">Widget Type</InputLabel>
                    <Select
                      labelId="widget-type-label"
                      value={widgetConfig.type}
                      label="Widget Type"
                      onChange={(e) => handleTextChange('type', e.target.value)}
                    >
                      {Object.values(WidgetType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {widgetConfig.type === WidgetType.CHART && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel id="chart-type-label">Chart Type</InputLabel>
                      <Select
                        labelId="chart-type-label"
                        value={widgetConfig.settings?.chartType || ChartType.LINE}
                        label="Chart Type"
                        onChange={(e) => handleSettingsChange('chartType', e.target.value)}
                      >
                        {Object.values(ChartType).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                <Grid size={12}>
                  <TextField
                    label="Description"
                    value={widgetConfig.settings?.description || ''}
                    onChange={(e) => handleSettingsChange('description', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={widgetConfig.settings?.autoRefresh || false}
                        onChange={(e) => handleSettingsChange('autoRefresh', e.target.checked)}
                      />
                    }
                    label="Auto Refresh"
                  />
                  
                  {widgetConfig.settings?.autoRefresh && (
                    <FormControl sx={{ ml: 3, minWidth: 120 }}>
                      <InputLabel id="refresh-interval-label">Interval</InputLabel>
                      <Select
                        labelId="refresh-interval-label"
                        value={widgetConfig.settings?.refreshInterval || 60}
                        label="Interval"
                        onChange={(e) => handleSettingsChange('refreshInterval', e.target.value)}
                        size="small"
                      >
                        <MenuItem value={30}>30 seconds</MenuItem>
                        <MenuItem value={60}>1 minute</MenuItem>
                        <MenuItem value={300}>5 minutes</MenuItem>
                        <MenuItem value={600}>10 minutes</MenuItem>
                        <MenuItem value={1800}>30 minutes</MenuItem>
                        <MenuItem value={3600}>1 hour</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Data Source Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <FormControl fullWidth>
                    <InputLabel id="data-source-type-label">Data Source Type</InputLabel>
                    <Select
                      labelId="data-source-type-label"
                      value={widgetConfig.settings?.dataSourceType || DataSourceType.API}
                      label="Data Source Type"
                      onChange={(e) => handleSettingsChange('dataSourceType', e.target.value)}
                    >
                      {Object.values(DataSourceType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select the type of data source for this widget</FormHelperText>
                  </FormControl>
                </Grid>
                
                {widgetConfig.settings?.dataSourceType === DataSourceType.API && (
                  <>
                    <Grid size={12}>
                      <TextField
                        label="API Endpoint"
                        value={widgetConfig.settings?.apiEndpoint || ''}
                        onChange={(e) => handleSettingsChange('apiEndpoint', e.target.value)}
                        fullWidth
                        placeholder="https://api.example.com/data"
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel id="api-method-label">Method</InputLabel>
                        <Select
                          labelId="api-method-label"
                          value={widgetConfig.settings?.apiMethod || 'GET'}
                          label="Method"
                          onChange={(e) => handleSettingsChange('apiMethod', e.target.value)}
                        >
                          <MenuItem value="GET">GET</MenuItem>
                          <MenuItem value="POST">POST</MenuItem>
                          <MenuItem value="PUT">PUT</MenuItem>
                          <MenuItem value="DELETE">DELETE</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={widgetConfig.settings?.useAuthentication || false}
                            onChange={(e) => handleSettingsChange('useAuthentication', e.target.checked)}
                          />
                        }
                        label="Use Authentication"
                      />
                    </Grid>
                    
                    {widgetConfig.settings?.apiMethod !== 'GET' && (
                      <Grid size={12}>
                        <TextField
                          label="Request Body"
                          value={widgetConfig.settings?.requestBody || ''}
                          onChange={(e) => handleSettingsChange('requestBody', e.target.value)}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder='{"key": "value"}'
                        />
                      </Grid>
                    )}
                  </>
                )}
                
                {widgetConfig.settings?.dataSourceType === DataSourceType.DATABASE && (
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel id="data-source-label">Data Source</InputLabel>
                      <Select
                        labelId="data-source-label"
                        value={widgetConfig.settings?.dataSourceId || ''}
                        label="Data Source"
                        onChange={(e) => handleSettingsChange('dataSourceId', e.target.value)}
                      >
                        {availableDataSources.map((source) => (
                          <MenuItem key={source.id} value={source.id}>
                            {source.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                {widgetConfig.settings?.dataSourceType === DataSourceType.STATIC && (
                  <Grid size={12}>
                    <TextField
                      label="Static Data (JSON)"
                      value={widgetConfig.settings?.staticData || ''}
                      onChange={(e) => handleSettingsChange('staticData', e.target.value)}
                      fullWidth
                      multiline
                      rows={6}
                      placeholder='{"labels": ["Jan", "Feb", "Mar"], "datasets": [{"label": "Sales", "data": [10, 20, 30]}]}'
                    />
                  </Grid>
                )}
                
                {widgetConfig.settings?.dataSourceType === DataSourceType.REALTIME && (
                  <Grid size={12}>
                    <Alert severity="info">
                      This widget will receive real-time updates via WebSocket connection.
                      Make sure you have configured the WebSocket connection in the application settings.
                    </Alert>
                    
                    <TextField
                      label="Channel/Topic"
                      value={widgetConfig.settings?.realtimeChannel || ''}
                      onChange={(e) => handleSettingsChange('realtimeChannel', e.target.value)}
                      fullWidth
                      sx={{ mt: 2 }}
                      placeholder="dashboard:updates"
                    />
                  </Grid>
                )}
                
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Data Transformation
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={widgetConfig.settings?.useTransformation || false}
                        onChange={(e) => handleSettingsChange('useTransformation', e.target.checked)}
                      />
                    }
                    label="Apply data transformation"
                  />
                  
                  {widgetConfig.settings?.useTransformation && (
                    <TextField
                      label="Transformation Function (JavaScript)"
                      value={widgetConfig.settings?.transformationFunction || ''}
                      onChange={(e) => handleSettingsChange('transformationFunction', e.target.value)}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="function transform(data) {\n  // Transform data here\n  return data;\n}"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Appearance Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="theme-label">Theme</InputLabel>
                    <Select
                      labelId="theme-label"
                      value={widgetConfig.settings?.theme || 'default'}
                      label="Theme"
                      onChange={(e) => handleSettingsChange('theme', e.target.value)}
                    >
                      <MenuItem value="default">Default</MenuItem>
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={widgetConfig.settings?.showTitle || true}
                        onChange={(e) => handleSettingsChange('showTitle', e.target.checked)}
                      />
                    }
                    label="Show Title"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={widgetConfig.settings?.showBorder || true}
                        onChange={(e) => handleSettingsChange('showBorder', e.target.checked)}
                      />
                    }
                    label="Show Border"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={widgetConfig.settings?.showShadow || true}
                        onChange={(e) => handleSettingsChange('showShadow', e.target.checked)}
                      />
                    }
                    label="Show Shadow"
                  />
                </Grid>
                
                {widgetConfig.type === WidgetType.CHART && (
                  <>
                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Chart Options
                      </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={widgetConfig.settings?.showLegend || true}
                            onChange={(e) => handleSettingsChange('showLegend', e.target.checked)}
                          />
                        }
                        label="Show Legend"
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={widgetConfig.settings?.showTooltip || true}
                            onChange={(e) => handleSettingsChange('showTooltip', e.target.checked)}
                          />
                        }
                        label="Show Tooltip"
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={widgetConfig.settings?.showGrid || true}
                            onChange={(e) => handleSettingsChange('showGrid', e.target.checked)}
                          />
                        }
                        label="Show Grid"
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={widgetConfig.settings?.isAnimated || true}
                            onChange={(e) => handleSettingsChange('isAnimated', e.target.checked)}
                          />
                        }
                        label="Enable Animation"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </TabPanel>
            
            {/* Advanced Tab */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Advanced Configuration
                  </Typography>
                  <FormHelperText>
                    These settings are for advanced users. Incorrect configuration may cause the widget to malfunction.
                  </FormHelperText>
                </Grid>
                
                <Grid size={12}>
                  <TextField
                    label="Custom CSS"
                    value={widgetConfig.settings?.customCss || ''}
                    onChange={(e) => handleSettingsChange('customCss', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder=".widget-container { background-color: #f5f5f5; }"
                  />
                </Grid>
                
                <Grid size={12}>
                  <TextField
                    label="Custom JavaScript"
                    value={widgetConfig.settings?.customJs || ''}
                    onChange={(e) => handleSettingsChange('customJs', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="function initWidget() { console.log('Widget initialized'); }"
                  />
                </Grid>
                
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={widgetConfig.settings?.enableCache || false}
                        onChange={(e) => handleSettingsChange('enableCache', e.target.checked)}
                      />
                    }
                    label="Enable Caching"
                  />
                  
                  {widgetConfig.settings?.enableCache && (
                    <FormControl sx={{ ml: 3, minWidth: 120 }}>
                      <InputLabel id="cache-duration-label">Cache Duration</InputLabel>
                      <Select
                        labelId="cache-duration-label"
                        value={widgetConfig.settings?.cacheDuration || 300}
                        label="Cache Duration"
                        onChange={(e) => handleSettingsChange('cacheDuration', e.target.value)}
                        size="small"
                      >
                        <MenuItem value={60}>1 minute</MenuItem>
                        <MenuItem value={300}>5 minutes</MenuItem>
                        <MenuItem value={600}>10 minutes</MenuItem>
                        <MenuItem value={1800}>30 minutes</MenuItem>
                        <MenuItem value={3600}>1 hour</MenuItem>
                        <MenuItem value={86400}>1 day</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Grid>
                
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={widgetConfig.settings?.debugMode || false}
                        onChange={(e) => handleSettingsChange('debugMode', e.target.checked)}
                      />
                    }
                    label="Debug Mode"
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </Grid>
          
          {/* Preview Panel */}
          {previewMode && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Preview
                </Typography>
                
                <Box sx={{ flexGrow: 1 }}>
                  {renderWidgetPreview()}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WidgetConfigPanel;