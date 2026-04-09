import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
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
  Paper
} from '@mui/material';
import {
  Backup as BackupIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  Check as CheckIcon
} from '@mui/icons-material';

// Define backup types
export enum BackupType {
  FULL = 'full',
  PARTIAL = 'partial',
  CONFIGURATION = 'configuration',
  DATA_ONLY = 'data_only'
}

// Define backup storage locations
export enum BackupStorageLocation {
  LOCAL = 'local',
  CLOUD = 'cloud',
  REMOTE_SERVER = 'remote_server'
}

// Define backup compression types
export enum BackupCompressionType {
  NONE = 'none',
  GZIP = 'gzip',
  ZIP = 'zip',
  TAR_GZ = 'tar.gz'
}

// Define backup encryption types
export enum BackupEncryptionType {
  NONE = 'none',
  AES_256 = 'aes_256',
  RSA = 'rsa'
}

interface BackupFormProps {
  onBackupCreate?: (backupConfig: BackupConfig) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// Define backup configuration interface
export interface BackupConfig {
  name: string;
  description?: string;
  type: BackupType;
  storageLocation: BackupStorageLocation;
  compressionType: BackupCompressionType;
  encryptionType: BackupEncryptionType;
  encryptionPassword?: string;
  includeContent: boolean;
  includeUsers: boolean;
  includeSettings: boolean;
  includeDashboards: boolean;
  includeMedia: boolean;
  includeWorkflows: boolean;
  remoteServerUrl?: string;
  remoteServerUsername?: string;
  remoteServerPassword?: string;
  cloudProvider?: string;
  cloudRegion?: string;
  cloudBucket?: string;
  cloudAccessKey?: string;
  cloudSecretKey?: string;
}

/**
 * BackupForm component
 * 
 * This component provides a form for creating system backups with various
 * configuration options such as backup type, storage location, and content selection.
 */
const BackupForm: React.FC<BackupFormProps> = ({
  onBackupCreate,
  isLoading = false,
  error = null
}) => {
  // Default backup configuration
  const defaultBackupConfig: BackupConfig = {
    name: `Backup_${new Date().toISOString().split('T')[0]}`,
    type: BackupType.FULL,
    storageLocation: BackupStorageLocation.LOCAL,
    compressionType: BackupCompressionType.GZIP,
    encryptionType: BackupEncryptionType.NONE,
    includeContent: true,
    includeUsers: true,
    includeSettings: true,
    includeDashboards: true,
    includeMedia: true,
    includeWorkflows: true
  };
  
  // State for backup configuration
  const [backupConfig, setBackupConfig] = useState<BackupConfig>(defaultBackupConfig);
  const [activeStep, setActiveStep] = useState(0);
  const [backupSuccess, setBackupSuccess] = useState(false);
  
  // Steps for the backup process
  const steps = ['Backup Type', 'Content Selection', 'Storage Options', 'Review & Create'];
  
  // Handle input change
  const handleInputChange = (field: keyof BackupConfig, value: any) => {
    setBackupConfig({
      ...backupConfig,
      [field]: value
    });
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (field: keyof BackupConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setBackupConfig({
      ...backupConfig,
      [field]: event.target.checked
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
  
  // Handle backup creation
  const handleCreateBackup = async () => {
    if (onBackupCreate) {
      try {
        await onBackupCreate(backupConfig);
        setBackupSuccess(true);
        setActiveStep(steps.length);
      } catch (error) {
        // Error is handled by the parent component
      }
    }
  };
  
  // Handle reset form
  const handleReset = () => {
    setBackupConfig(defaultBackupConfig);
    setActiveStep(0);
    setBackupSuccess(false);
  };
  
  // Render backup type step
  const renderBackupTypeStep = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <TextField
          label="Backup Name"
          value={backupConfig.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          fullWidth
          required
          error={!backupConfig.name}
          helperText={!backupConfig.name ? 'Backup name is required' : ''}
        />
      </Grid>
      
      <Grid size={12}>
        <TextField
          label="Description"
          value={backupConfig.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel id="backup-type-label">Backup Type</InputLabel>
          <Select
            labelId="backup-type-label"
            value={backupConfig.type}
            label="Backup Type"
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <MenuItem value={BackupType.FULL}>Full Backup</MenuItem>
            <MenuItem value={BackupType.PARTIAL}>Partial Backup</MenuItem>
            <MenuItem value={BackupType.CONFIGURATION}>Configuration Only</MenuItem>
            <MenuItem value={BackupType.DATA_ONLY}>Data Only</MenuItem>
          </Select>
          <FormHelperText>
            {backupConfig.type === BackupType.FULL && 'Backs up all system data and configuration'}
            {backupConfig.type === BackupType.PARTIAL && 'Backs up selected components only'}
            {backupConfig.type === BackupType.CONFIGURATION && 'Backs up system configuration only'}
            {backupConfig.type === BackupType.DATA_ONLY && 'Backs up content data only'}
          </FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel id="compression-type-label">Compression</InputLabel>
          <Select
            labelId="compression-type-label"
            value={backupConfig.compressionType}
            label="Compression"
            onChange={(e) => handleInputChange('compressionType', e.target.value)}
          >
            <MenuItem value={BackupCompressionType.NONE}>None</MenuItem>
            <MenuItem value={BackupCompressionType.GZIP}>GZIP</MenuItem>
            <MenuItem value={BackupCompressionType.ZIP}>ZIP</MenuItem>
            <MenuItem value={BackupCompressionType.TAR_GZ}>TAR.GZ</MenuItem>
          </Select>
          <FormHelperText>
            Compression reduces backup size but may increase backup time
          </FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
  
  // Render content selection step
  const renderContentSelectionStep = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="subtitle1" gutterBottom>
          Select Content to Include in Backup
        </Typography>
        <FormHelperText>
          Select the components you want to include in the backup
        </FormHelperText>
      </Grid>
      
      <Grid size={12}>
        <FormGroup>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={backupConfig.includeContent}
                    onChange={handleCheckboxChange('includeContent')}
                    disabled={backupConfig.type === BackupType.CONFIGURATION}
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
                    checked={backupConfig.includeUsers}
                    onChange={handleCheckboxChange('includeUsers')}
                    disabled={backupConfig.type === BackupType.DATA_ONLY}
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
                    checked={backupConfig.includeSettings}
                    onChange={handleCheckboxChange('includeSettings')}
                    disabled={backupConfig.type === BackupType.DATA_ONLY}
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
                    checked={backupConfig.includeDashboards}
                    onChange={handleCheckboxChange('includeDashboards')}
                    disabled={backupConfig.type === BackupType.CONFIGURATION}
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
                    checked={backupConfig.includeMedia}
                    onChange={handleCheckboxChange('includeMedia')}
                    disabled={backupConfig.type === BackupType.CONFIGURATION}
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
                    checked={backupConfig.includeWorkflows}
                    onChange={handleCheckboxChange('includeWorkflows')}
                    disabled={backupConfig.type === BackupType.DATA_ONLY}
                  />
                }
                label="Workflows"
              />
              <FormHelperText>
                Content workflow definitions and states
              </FormHelperText>
            </Grid>
          </Grid>
        </FormGroup>
      </Grid>
      
      {backupConfig.type === BackupType.PARTIAL && (
        <Grid size={12}>
          <Alert severity="info">
            <AlertTitle>Partial Backup</AlertTitle>
            You've selected a partial backup. Please ensure you've selected all the components you need.
            Restoring partial backups may require additional configuration.
          </Alert>
        </Grid>
      )}
    </Grid>
  );
  
  // Render storage options step
  const renderStorageOptionsStep = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <FormControl fullWidth>
          <InputLabel id="storage-location-label">Storage Location</InputLabel>
          <Select
            labelId="storage-location-label"
            value={backupConfig.storageLocation}
            label="Storage Location"
            onChange={(e) => handleInputChange('storageLocation', e.target.value)}
          >
            <MenuItem value={BackupStorageLocation.LOCAL}>Local Storage</MenuItem>
            <MenuItem value={BackupStorageLocation.CLOUD}>Cloud Storage</MenuItem>
            <MenuItem value={BackupStorageLocation.REMOTE_SERVER}>Remote Server</MenuItem>
          </Select>
          <FormHelperText>
            {backupConfig.storageLocation === BackupStorageLocation.LOCAL && 'Store backup on the local server'}
            {backupConfig.storageLocation === BackupStorageLocation.CLOUD && 'Store backup in cloud storage (S3, Azure, etc.)'}
            {backupConfig.storageLocation === BackupStorageLocation.REMOTE_SERVER && 'Store backup on a remote server via SFTP/SCP'}
          </FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid size={12}>
        <FormControl fullWidth>
          <InputLabel id="encryption-type-label">Encryption</InputLabel>
          <Select
            labelId="encryption-type-label"
            value={backupConfig.encryptionType}
            label="Encryption"
            onChange={(e) => handleInputChange('encryptionType', e.target.value)}
          >
            <MenuItem value={BackupEncryptionType.NONE}>None</MenuItem>
            <MenuItem value={BackupEncryptionType.AES_256}>AES-256</MenuItem>
            <MenuItem value={BackupEncryptionType.RSA}>RSA</MenuItem>
          </Select>
          <FormHelperText>
            Encryption secures your backup but requires a password for restoration
          </FormHelperText>
        </FormControl>
      </Grid>
      
      {backupConfig.encryptionType !== BackupEncryptionType.NONE && (
        <Grid size={12}>
          <TextField
            label="Encryption Password"
            value={backupConfig.encryptionPassword || ''}
            onChange={(e) => handleInputChange('encryptionPassword', e.target.value)}
            fullWidth
            type="password"
            required={backupConfig.encryptionType !== BackupEncryptionType.NONE}
            error={backupConfig.encryptionType !== BackupEncryptionType.NONE && !backupConfig.encryptionPassword}
            helperText={
              backupConfig.encryptionType !== BackupEncryptionType.NONE && !backupConfig.encryptionPassword
                ? 'Encryption password is required'
                : 'Keep this password safe. You will need it to restore the backup.'
            }
          />
        </Grid>
      )}
      
      {backupConfig.storageLocation === BackupStorageLocation.REMOTE_SERVER && (
        <>
          <Grid size={12}>
            <TextField
              label="Remote Server URL"
              value={backupConfig.remoteServerUrl || ''}
              onChange={(e) => handleInputChange('remoteServerUrl', e.target.value)}
              fullWidth
              required={backupConfig.storageLocation === BackupStorageLocation.REMOTE_SERVER}
              placeholder="sftp://example.com/backups"
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Username"
              value={backupConfig.remoteServerUsername || ''}
              onChange={(e) => handleInputChange('remoteServerUsername', e.target.value)}
              fullWidth
              required={backupConfig.storageLocation === BackupStorageLocation.REMOTE_SERVER}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Password"
              value={backupConfig.remoteServerPassword || ''}
              onChange={(e) => handleInputChange('remoteServerPassword', e.target.value)}
              fullWidth
              type="password"
              required={backupConfig.storageLocation === BackupStorageLocation.REMOTE_SERVER}
            />
          </Grid>
        </>
      )}
      
      {backupConfig.storageLocation === BackupStorageLocation.CLOUD && (
        <>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="cloud-provider-label">Cloud Provider</InputLabel>
              <Select
                labelId="cloud-provider-label"
                value={backupConfig.cloudProvider || 'aws'}
                label="Cloud Provider"
                onChange={(e) => handleInputChange('cloudProvider', e.target.value)}
              >
                <MenuItem value="aws">Amazon S3</MenuItem>
                <MenuItem value="azure">Azure Blob Storage</MenuItem>
                <MenuItem value="gcp">Google Cloud Storage</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Cloud Region"
              value={backupConfig.cloudRegion || ''}
              onChange={(e) => handleInputChange('cloudRegion', e.target.value)}
              fullWidth
              placeholder="us-east-1"
            />
          </Grid>
          
          <Grid size={12}>
            <TextField
              label="Bucket Name"
              value={backupConfig.cloudBucket || ''}
              onChange={(e) => handleInputChange('cloudBucket', e.target.value)}
              fullWidth
              required={backupConfig.storageLocation === BackupStorageLocation.CLOUD}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Access Key"
              value={backupConfig.cloudAccessKey || ''}
              onChange={(e) => handleInputChange('cloudAccessKey', e.target.value)}
              fullWidth
              required={backupConfig.storageLocation === BackupStorageLocation.CLOUD}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Secret Key"
              value={backupConfig.cloudSecretKey || ''}
              onChange={(e) => handleInputChange('cloudSecretKey', e.target.value)}
              fullWidth
              type="password"
              required={backupConfig.storageLocation === BackupStorageLocation.CLOUD}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
  
  // Render review step
  const renderReviewStep = () => (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="subtitle1" gutterBottom>
          Review Backup Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Please review your backup configuration before creating the backup.
        </Typography>
      </Grid>
      
      <Grid size={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Backup Name</Typography>
              <Typography variant="body2">{backupConfig.name}</Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Backup Type</Typography>
              <Typography variant="body2">
                {backupConfig.type === BackupType.FULL && 'Full Backup'}
                {backupConfig.type === BackupType.PARTIAL && 'Partial Backup'}
                {backupConfig.type === BackupType.CONFIGURATION && 'Configuration Only'}
                {backupConfig.type === BackupType.DATA_ONLY && 'Data Only'}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Storage Location</Typography>
              <Typography variant="body2">
                {backupConfig.storageLocation === BackupStorageLocation.LOCAL && 'Local Storage'}
                {backupConfig.storageLocation === BackupStorageLocation.CLOUD && `Cloud Storage (${backupConfig.cloudProvider})`}
                {backupConfig.storageLocation === BackupStorageLocation.REMOTE_SERVER && `Remote Server (${backupConfig.remoteServerUrl})`}
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Compression & Encryption</Typography>
              <Typography variant="body2">
                {backupConfig.compressionType === BackupCompressionType.NONE ? 'No Compression' : `Compression: ${backupConfig.compressionType}`}
                {', '}
                {backupConfig.encryptionType === BackupEncryptionType.NONE ? 'No Encryption' : `Encryption: ${backupConfig.encryptionType}`}
              </Typography>
            </Grid>
            
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2">Included Content</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {backupConfig.includeContent && (
                  <Chip label="Content" size="small" color="primary" variant="outlined" />
                )}
                {backupConfig.includeUsers && (
                  <Chip label="Users & Permissions" size="small" color="primary" variant="outlined" />
                )}
                {backupConfig.includeSettings && (
                  <Chip label="System Settings" size="small" color="primary" variant="outlined" />
                )}
                {backupConfig.includeDashboards && (
                  <Chip label="Dashboards" size="small" color="primary" variant="outlined" />
                )}
                {backupConfig.includeMedia && (
                  <Chip label="Media Files" size="small" color="primary" variant="outlined" />
                )}
                {backupConfig.includeWorkflows && (
                  <Chip label="Workflows" size="small" color="primary" variant="outlined" />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
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
        Backup Created Successfully
      </Typography>
      <Typography variant="body1" paragraph>
        Your backup has been created and stored in the specified location.
      </Typography>
      <Button
        variant="outlined"
        onClick={handleReset}
        sx={{ mt: 2 }}
      >
        Create Another Backup
      </Button>
    </Box>
  );
  
  // Get step content based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBackupTypeStep();
      case 1:
        return renderContentSelectionStep();
      case 2:
        return renderStorageOptionsStep();
      case 3:
        return renderReviewStep();
      case 4:
        return renderSuccessStep();
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Card>
      <CardHeader
        title="Create System Backup"
        subheader="Configure and create a system backup"
        avatar={<BackupIcon />}
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
        
        {getStepContent(backupSuccess ? steps.length : activeStep)}
        
        {!backupSuccess && (
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
                disabled={
                  (activeStep === 0 && !backupConfig.name) ||
                  (activeStep === 2 && 
                   ((backupConfig.encryptionType !== BackupEncryptionType.NONE && !backupConfig.encryptionPassword) ||
                    (backupConfig.storageLocation === BackupStorageLocation.REMOTE_SERVER && 
                     (!backupConfig.remoteServerUrl || !backupConfig.remoteServerUsername || !backupConfig.remoteServerPassword)) ||
                    (backupConfig.storageLocation === BackupStorageLocation.CLOUD && 
                     (!backupConfig.cloudBucket || !backupConfig.cloudAccessKey || !backupConfig.cloudSecretKey))))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateBackup}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                Create Backup
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BackupForm;