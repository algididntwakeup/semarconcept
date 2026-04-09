import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Checkbox,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Upload as UploadIcon,
  Backup as BackupIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  CloudDownload as CloudDownloadIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { BackupEncryptionType, BackupStorageLocation } from './BackupForm';

interface RestoreFormProps {
  onRestore?: (restoreConfig: RestoreConfig) => Promise<void>;
  availableBackups?: BackupInfo[];
  isLoading?: boolean;
  error?: string | null;
}

// Define backup info interface
export interface BackupInfo {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  size: string;
  type: string;
  location: BackupStorageLocation;
  encryptionType: BackupEncryptionType;
}

// Define restore configuration interface
export interface RestoreConfig {
  backupId?: string;
  backupFile?: File;
  restoreMethod: 'select' | 'upload' | 'remote';
  encryptionPassword?: string;
  remoteUrl?: string;
  remoteUsername?: string;
  remotePassword?: string;
  restoreOptions: {
    restoreContent: boolean;
    restoreUsers: boolean;
    restoreSettings: boolean;
    restoreDashboards: boolean;
    restoreMedia: boolean;
    restoreWorkflows: boolean;
    overwriteExisting: boolean;
    createBackupBeforeRestore: boolean;
  };
}

/**
 * RestoreForm component
 * 
 * This component provides a form for restoring the system from a backup.
 * Users can select from available backups, upload a backup file, or specify a remote backup.
 */
const RestoreForm: React.FC<RestoreFormProps> = ({
  onRestore,
  availableBackups = [],
  isLoading = false,
  error = null
}) => {
  // Default restore configuration
  const defaultRestoreConfig: RestoreConfig = {
    restoreMethod: 'select',
    restoreOptions: {
      restoreContent: true,
      restoreUsers: true,
      restoreSettings: true,
      restoreDashboards: true,
      restoreMedia: true,
      restoreWorkflows: true,
      overwriteExisting: false,
      createBackupBeforeRestore: true
    }
  };
  
  // State for restore configuration
  const [restoreConfig, setRestoreConfig] = useState<RestoreConfig>(defaultRestoreConfig);
  const [activeStep, setActiveStep] = useState(0);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Steps for the restore process
  const steps = ['Select Backup', 'Restore Options', 'Confirm & Restore'];
  
  // Handle input change
  const handleInputChange = (field: keyof RestoreConfig, value: any) => {
    setRestoreConfig({
      ...restoreConfig,
      [field]: value
    });
  };
  
  // Handle restore options change
  const handleRestoreOptionChange = (field: keyof RestoreConfig['restoreOptions']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRestoreConfig({
      ...restoreConfig,
      restoreOptions: {
        ...restoreConfig.restoreOptions,
        [field]: event.target.checked
      }
    });
  };
  
  // Handle backup selection
  const handleBackupSelection = (backup: BackupInfo) => {
    setSelectedBackup(backup);
    setRestoreConfig({
      ...restoreConfig,
      backupId: backup.id
    });
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setRestoreConfig({
        ...restoreConfig,
        backupFile: file
      });
    }
  };
  
  // Handle restore method change
  const handleRestoreMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const method = event.target.value as RestoreConfig['restoreMethod'];
    setRestoreConfig({
      ...restoreConfig,
      restoreMethod: method,
      backupId: method === 'select' ? selectedBackup?.id : undefined,
      backupFile: method === 'upload' ? restoreConfig.backupFile : undefined,
      remoteUrl: method === 'remote' ? restoreConfig.remoteUrl : undefined,
      remoteUsername: method === 'remote' ? restoreConfig.remoteUsername : undefined,
      remotePassword: method === 'remote' ? restoreConfig.remotePassword : undefined
    });
  };
  
  // Handle next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle restore
  const handleRestore = async () => {
    if (onRestore) {
      try {
        await onRestore(restoreConfig);
        setRestoreSuccess(true);
        setActiveStep(steps.length);
      } catch (error) {
        // Error is handled by the parent component
      }
    }
  };
  
  // Handle reset form
  const handleReset = () => {
    setRestoreConfig(defaultRestoreConfig);
    setActiveStep(0);
    setRestoreSuccess(false);
    setSelectedBackup(null);
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Render select backup step
  const renderSelectBackupStep = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="restore-method"
            name="restore-method"
            value={restoreConfig.restoreMethod}
            onChange={handleRestoreMethodChange}
          >
            <FormControlLabel
              value="select"
              control={<Radio />}
              label="Select from available backups"
            />
            <FormControlLabel
              value="upload"
              control={<Radio />}
              label="Upload backup file"
            />
            <FormControlLabel
              value="remote"
              control={<Radio />}
              label="Restore from remote location"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      
      {restoreConfig.restoreMethod === 'select' && (
        <Grid size={12}>
          {availableBackups.length === 0 ? (
            <Alert severity="info">
              <AlertTitle>No Backups Available</AlertTitle>
              There are no backups available for restore. Please upload a backup file or specify a remote backup.
            </Alert>
          ) : (
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List>
                {availableBackups.map((backup) => (
                  <ListItem
                    key={backup.id}
                    button
                    selected={selectedBackup?.id === backup.id}
                    onClick={() => handleBackupSelection(backup)}
                    divider
                  >
                    <ListItemIcon>
                      <BackupIcon color={selectedBackup?.id === backup.id ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={backup.name}
                      secondary={
                        <Box component="span">
                          <Typography variant="body2" component="span">
                            {backup.type} • {backup.size}
                          </Typography>
                          <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                            Created: {formatDate(backup.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    {backup.encryptionType !== BackupEncryptionType.NONE && (
                      <ListItemSecondaryAction>
                        <IconButton edge="end" disabled>
                          <InfoIcon color="action" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          
          {selectedBackup?.encryptionType !== BackupEncryptionType.NONE && (
            <TextField
              label="Encryption Password"
              value={restoreConfig.encryptionPassword || ''}
              onChange={(e) => handleInputChange('encryptionPassword', e.target.value)}
              type="password"
              fullWidth
              required
              margin="normal"
              error={!restoreConfig.encryptionPassword}
              helperText={
                !restoreConfig.encryptionPassword
                  ? 'Password is required for encrypted backups'
                  : 'Enter the password used to encrypt this backup'
              }
            />
          )}
        </Grid>
      )}
      
      {restoreConfig.restoreMethod === 'upload' && (
        <Grid size={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, border: '2px dashed', borderColor: 'divider', borderRadius: 1 }}>
            <UploadIcon fontSize="large" color="action" sx={{ mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Upload Backup File
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Select a backup file from your computer to restore
            </Typography>
            <Button
              variant="contained"
              component="label"
              startIcon={<FolderIcon />}
            >
              Select File
              <input
                type="file"
                hidden
                accept=".zip,.gz,.tar,.tar.gz,.bak,.backup"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
            </Button>
            
            {uploadedFileName && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <CheckIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {uploadedFileName}
                </Typography>
              </Box>
            )}
          </Box>
          
          <TextField
            label="Encryption Password (if encrypted)"
            value={restoreConfig.encryptionPassword || ''}
            onChange={(e) => handleInputChange('encryptionPassword', e.target.value)}
            type="password"
            fullWidth
            margin="normal"
            helperText="Leave blank if the backup is not encrypted"
          />
        </Grid>
      )}
      
      {restoreConfig.restoreMethod === 'remote' && (
        <Grid size={12}>
          <TextField
            label="Remote Backup URL"
            value={restoreConfig.remoteUrl || ''}
            onChange={(e) => handleInputChange('remoteUrl', e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="sftp://example.com/backups/backup.tar.gz"
            error={!restoreConfig.remoteUrl}
            helperText={!restoreConfig.remoteUrl ? 'Remote URL is required' : ''}
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Username"
                value={restoreConfig.remoteUsername || ''}
                onChange={(e) => handleInputChange('remoteUsername', e.target.value)}
                fullWidth
                required
                error={!restoreConfig.remoteUsername}
                helperText={!restoreConfig.remoteUsername ? 'Username is required' : ''}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Password"
                value={restoreConfig.remotePassword || ''}
                onChange={(e) => handleInputChange('remotePassword', e.target.value)}
                type="password"
                fullWidth
                required
                error={!restoreConfig.remotePassword}
                helperText={!restoreConfig.remotePassword ? 'Password is required' : ''}
              />
            </Grid>
          </Grid>
          
          <TextField
            label="Encryption Password (if encrypted)"
            value={restoreConfig.encryptionPassword || ''}
            onChange={(e) => handleInputChange('encryptionPassword', e.target.value)}
            type="password"
            fullWidth
            margin="normal"
            helperText="Leave blank if the backup is not encrypted"
          />
        </Grid>
      )}
    </Grid>
  );
  
  // Render restore options step
  const renderRestoreOptionsStep = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="subtitle1" gutterBottom>
          Restore Options
        </Typography>
        <FormHelperText>
          Select what components you want to restore and how to handle existing data
        </FormHelperText>
      </Grid>
      
      <Grid size={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Components to Restore
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreConfig.restoreOptions.restoreContent}
                    onChange={handleRestoreOptionChange('restoreContent')}
                  />
                }
                label="Content"
              />
              <FormHelperText>
                All content items, including pages, posts, and custom content types
              </FormHelperText>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreConfig.restoreOptions.restoreUsers}
                    onChange={handleRestoreOptionChange('restoreUsers')}
                  />
                }
                label="Users & Permissions"
              />
              <FormHelperText>
                User accounts, roles, and permission settings
              </FormHelperText>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreConfig.restoreOptions.restoreSettings}
                    onChange={handleRestoreOptionChange('restoreSettings')}
                  />
                }
                label="System Settings"
              />
              <FormHelperText>
                Global system configuration and settings
              </FormHelperText>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreConfig.restoreOptions.restoreDashboards}
                    onChange={handleRestoreOptionChange('restoreDashboards')}
                  />
                }
                label="Dashboards"
              />
              <FormHelperText>
                Dashboard layouts, widgets, and configurations
              </FormHelperText>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreConfig.restoreOptions.restoreMedia}
                    onChange={handleRestoreOptionChange('restoreMedia')}
                  />
                }
                label="Media Files"
              />
              <FormHelperText>
                Uploaded images, documents, and other media files
              </FormHelperText>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreConfig.restoreOptions.restoreWorkflows}
                    onChange={handleRestoreOptionChange('restoreWorkflows')}
                  />
                }
                label="Workflows"
              />
              <FormHelperText>
                Content workflow definitions and states
              </FormHelperText>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid size={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Restore Behavior
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={restoreConfig.restoreOptions.overwriteExisting}
                onChange={handleRestoreOptionChange('overwriteExisting')}
              />
            }
            label="Overwrite existing data"
          />
          <FormHelperText>
            If checked, existing data will be overwritten. If unchecked, the restore will skip items that already exist.
          </FormHelperText>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={restoreConfig.restoreOptions.createBackupBeforeRestore}
                  onChange={handleRestoreOptionChange('createBackupBeforeRestore')}
                />
              }
              label="Create backup before restore"
            />
            <FormHelperText>
              Creates a backup of the current system state before performing the restore operation (recommended)
            </FormHelperText>
          </Box>
        </Paper>
      </Grid>
      
      <Grid size={12}>
        <Alert severity="warning">
          <AlertTitle>Warning</AlertTitle>
          Restoring from a backup will replace data in your system. This operation cannot be undone.
          Make sure you have selected the correct backup and options before proceeding.
        </Alert>
      </Grid>
    </Grid>
  );
  
  // Render confirm step
  const renderConfirmStep = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="subtitle1" gutterBottom>
          Confirm Restore Operation
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Please review your restore configuration before proceeding. This operation cannot be undone.
        </Typography>
      </Grid>
      
      <Grid size={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="subtitle2">Backup Source</Typography>
              <Typography variant="body2">
                {restoreConfig.restoreMethod === 'select' && selectedBackup && `Selected Backup: ${selectedBackup.name}`}
                {restoreConfig.restoreMethod === 'upload' && uploadedFileName && `Uploaded File: ${uploadedFileName}`}
                {restoreConfig.restoreMethod === 'remote' && restoreConfig.remoteUrl && `Remote URL: ${restoreConfig.remoteUrl}`}
              </Typography>
            </Grid>
            
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Components to Restore</Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {restoreConfig.restoreOptions.restoreContent && <li>Content</li>}
                {restoreConfig.restoreOptions.restoreUsers && <li>Users & Permissions</li>}
                {restoreConfig.restoreOptions.restoreSettings && <li>System Settings</li>}
                {restoreConfig.restoreOptions.restoreDashboards && <li>Dashboards</li>}
                {restoreConfig.restoreOptions.restoreMedia && <li>Media Files</li>}
                {restoreConfig.restoreOptions.restoreWorkflows && <li>Workflows</li>}
              </Box>
            </Grid>
            
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Restore Behavior</Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                <li>
                  {restoreConfig.restoreOptions.overwriteExisting
                    ? 'Overwrite existing data'
                    : 'Skip existing data'}
                </li>
                <li>
                  {restoreConfig.restoreOptions.createBackupBeforeRestore
                    ? 'Create backup before restore'
                    : 'No backup before restore'}
                </li>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid size={12}>
        <Alert severity="warning">
          <AlertTitle>Important Notice</AlertTitle>
          <Typography variant="body2">
            This operation will restore data from the selected backup. Depending on your selections,
            this may overwrite existing content, users, settings, and other data in your system.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {restoreConfig.restoreOptions.createBackupBeforeRestore
              ? 'A backup of the current system state will be created before the restore operation.'
              : 'You have chosen NOT to create a backup before restore. If something goes wrong, you may not be able to recover your current data.'}
          </Typography>
        </Alert>
      </Grid>
      
      {error && (
        <Grid size={12}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        </Grid>
      )}
    </Grid>
  );
  
  // Render success step
  const renderSuccessStep = () => (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Restore Completed Successfully
      </Typography>
      <Typography variant="body1" paragraph>
        Your system has been successfully restored from the backup.
      </Typography>
      <Button
        variant="outlined"
        onClick={handleReset}
        sx={{ mt: 2 }}
      >
        Perform Another Restore
      </Button>
    </Box>
  );
  
  // Get step content based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderSelectBackupStep();
      case 1:
        return renderRestoreOptionsStep();
      case 2:
        return renderConfirmStep();
      case 3:
        return renderSuccessStep();
      default:
        return 'Unknown step';
    }
  };
  
  // Check if current step is valid
  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        if (restoreConfig.restoreMethod === 'select') {
          return !!selectedBackup && 
                 (selectedBackup.encryptionType === BackupEncryptionType.NONE || 
                  !!restoreConfig.encryptionPassword);
        } else if (restoreConfig.restoreMethod === 'upload') {
          return !!restoreConfig.backupFile;
        } else if (restoreConfig.restoreMethod === 'remote') {
          return !!restoreConfig.remoteUrl && 
                 !!restoreConfig.remoteUsername && 
                 !!restoreConfig.remotePassword;
        }
        return false;
      case 1:
        return restoreConfig.restoreOptions.restoreContent ||
               restoreConfig.restoreOptions.restoreUsers ||
               restoreConfig.restoreOptions.restoreSettings ||
               restoreConfig.restoreOptions.restoreDashboards ||
               restoreConfig.restoreOptions.restoreMedia ||
               restoreConfig.restoreOptions.restoreWorkflows;
      case 2:
        return true;
      default:
        return false;
    }
  };
  
  return (
    <Card>
      <CardHeader
        title="Restore System"
        subheader="Restore your system from a backup"
        avatar={<RestoreIcon />}
      />
      <Divider />
      <CardContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(restoreSuccess ? steps.length : activeStep)}
        
        {!restoreSuccess && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                sx={{ mr: 1 }}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep) || isLoading}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleRestore}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
              >
                Restore System
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RestoreForm;