import React, { useState, useRef } from 'react';
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
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

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
      id={`dashboard-export-import-tabpanel-${index}`}
      aria-labelledby={`dashboard-export-import-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface DashboardExportImportProps {
  open: boolean;
  onClose: () => void;
  dashboards?: Array<{
    id: string;
    name: string;
    description?: string;
    widgetCount: number;
    lastModified: string;
  }>;
  onExport?: (dashboardIds: string[], includeData: boolean) => Promise<string>;
  onImport?: (jsonData: string, replaceExisting: boolean) => Promise<void>;
}

/**
 * DashboardExportImport component
 * 
 * This component provides a UI for exporting and importing dashboards.
 * It allows users to export selected dashboards to JSON and import dashboards from JSON.
 */
const DashboardExportImport: React.FC<DashboardExportImportProps> = ({
  open,
  onClose,
  dashboards = [],
  onExport,
  onImport
}) => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Export state
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);
  const [includeData, setIncludeData] = useState(true);
  const [exportJson, setExportJson] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Import state
  const [importJson, setImportJson] = useState<string>('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [parsedImport, setParsedImport] = useState<any>(null);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle dashboard selection
  const handleDashboardSelection = (dashboardId: string) => {
    setSelectedDashboards(prev => {
      if (prev.includes(dashboardId)) {
        return prev.filter(id => id !== dashboardId);
      } else {
        return [...prev, dashboardId];
      }
    });
  };
  
  // Handle select all dashboards
  const handleSelectAll = () => {
    if (selectedDashboards.length === dashboards.length) {
      setSelectedDashboards([]);
    } else {
      setSelectedDashboards(dashboards.map(d => d.id));
    }
  };
  
  // Handle export
  const handleExport = async () => {
    if (!onExport || selectedDashboards.length === 0) return;
    
    setExportLoading(true);
    setExportError(null);
    
    try {
      const json = await onExport(selectedDashboards, includeData);
      setExportJson(json);
    } catch (err) {
      setExportError('Failed to export dashboards');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle download JSON
  const handleDownloadJson = () => {
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboards-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportJson(content);
      
      try {
        const parsed = JSON.parse(content);
        setParsedImport(parsed);
        setImportError(null);
      } catch (err) {
        setImportError('Invalid JSON file');
        setParsedImport(null);
      }
    };
    reader.readAsText(file);
  };
  
  // Handle import
  const handleImport = async () => {
    if (!onImport || !importJson) return;
    
    setImportLoading(true);
    setImportError(null);
    setImportSuccess(false);
    
    try {
      await onImport(importJson, replaceExisting);
      setImportSuccess(true);
      setImportJson('');
      setParsedImport(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setImportError('Failed to import dashboards');
    } finally {
      setImportLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
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
            {tabValue === 0 ? <ExportIcon sx={{ mr: 1 }} /> : <ImportIcon sx={{ mr: 1 }} />}
            Dashboard {tabValue === 0 ? 'Export' : 'Import'}
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard export import tabs">
          <Tab 
            icon={<ExportIcon />} 
            label="Export" 
            id="dashboard-export-import-tab-0"
            aria-controls="dashboard-export-import-tabpanel-0"
          />
          <Tab 
            icon={<ImportIcon />} 
            label="Import" 
            id="dashboard-export-import-tab-1"
            aria-controls="dashboard-export-import-tabpanel-1"
          />
        </Tabs>
        
        {/* Export Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="subtitle1" gutterBottom>
            Select Dashboards to Export
          </Typography>
          
          {dashboards.length === 0 ? (
            <Alert severity="info">
              <AlertTitle>No Dashboards</AlertTitle>
              You don't have any dashboards to export.
            </Alert>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedDashboards.length === dashboards.length}
                      indeterminate={selectedDashboards.length > 0 && selectedDashboards.length < dashboards.length}
                      onChange={handleSelectAll}
                    />
                  }
                  label={`Select All (${selectedDashboards.length}/${dashboards.length})`}
                />
              </Box>
              
              <Paper variant="outlined" sx={{ mb: 3, maxHeight: 300, overflow: 'auto' }}>
                <List>
                  {dashboards.map((dashboard) => (
                    <ListItem key={dashboard.id} divider>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedDashboards.includes(dashboard.id)}
                          onChange={() => handleDashboardSelection(dashboard.id)}
                        />
                      </ListItemIcon>
                      <ListItemIcon>
                        <DashboardIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={dashboard.name}
                        secondary={
                          <Box component="span">
                            <Typography variant="body2" component="span">
                              {dashboard.widgetCount} widgets
                            </Typography>
                            <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                              Last modified: {formatDate(dashboard.lastModified)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeData}
                      onChange={(e) => setIncludeData(e.target.checked)}
                    />
                  }
                  label="Include widget data (increases export size)"
                />
                <Tooltip title="Widget data includes the actual data displayed in charts, tables, etc. Without this, only the widget configuration will be exported.">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={exportLoading ? <CircularProgress size={20} /> : <ExportIcon />}
                onClick={handleExport}
                disabled={selectedDashboards.length === 0 || exportLoading}
                sx={{ mb: 3 }}
              >
                Export Selected Dashboards
              </Button>
              
              {exportError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {exportError}
                </Alert>
              )}
              
              {exportJson && (
                <>
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Export Result
                  </Typography>
                  
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <TextField
                      label="Exported JSON"
                      multiline
                      rows={8}
                      value={exportJson}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                        <IconButton onClick={handleCopyToClipboard}>
                          {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={handleDownloadJson}
                  >
                    Download JSON
                  </Button>
                </>
              )}
            </>
          )}
        </TabPanel>
        
        {/* Import Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle1" gutterBottom>
            Import Dashboards from JSON
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Import Information</AlertTitle>
            <Typography variant="body2">
              You can import dashboards that were previously exported from this system.
              The import will create new dashboards or update existing ones if they have the same ID.
            </Typography>
          </Alert>
          
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<ImportIcon />}
            >
              Select JSON File
              <input
                type="file"
                hidden
                accept=".json,application/json"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
            </Button>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Or paste JSON directly:
            </Typography>
            
            <TextField
              label="Dashboard JSON"
              multiline
              rows={8}
              value={importJson}
              onChange={(e) => {
                setImportJson(e.target.value);
                try {
                  if (e.target.value) {
                    const parsed = JSON.parse(e.target.value);
                    setParsedImport(parsed);
                    setImportError(null);
                  } else {
                    setParsedImport(null);
                  }
                } catch (err) {
                  setImportError('Invalid JSON');
                  setParsedImport(null);
                }
              }}
              fullWidth
              error={!!importError}
              helperText={importError}
              sx={{ mt: 2 }}
            />
          </Box>
          
          {parsedImport && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Import Preview
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <InfoIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {parsedImport.dashboards?.length || 0} dashboard(s) will be imported
                  </Typography>
                </Box>
                
                {parsedImport.dashboards?.length > 0 && (
                  <List dense>
                    {parsedImport.dashboards.map((dashboard: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={dashboard.name || `Dashboard ${index + 1}`}
                          secondary={`${dashboard.widgets?.length || 0} widgets`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                    />
                  }
                  label="Replace existing dashboards with the same ID"
                />
                <Tooltip title="If checked, existing dashboards with the same ID will be replaced. If unchecked, they will be skipped.">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {replaceExisting && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <AlertTitle>Warning</AlertTitle>
                  <Typography variant="body2">
                    Existing dashboards with the same ID will be replaced. This action cannot be undone.
                  </Typography>
                </Alert>
              )}
            </>
          )}
          
          {importSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Success</AlertTitle>
              Dashboards were successfully imported.
            </Alert>
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={importLoading ? <CircularProgress size={20} /> : <ImportIcon />}
            onClick={handleImport}
            disabled={!parsedImport || importLoading}
          >
            Import Dashboards
          </Button>
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardExportImport;