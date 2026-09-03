import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip
} from '@mui/material';
import {
  VerifiedUser as VerifyIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CloudDownload as DownloadIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { BackupInfo } from './RestoreForm';
import type { SelectChangeEvent } from '@mui/material/Select';

interface VerificationResult {
  success: boolean;
  message: string;
  details?: {
    totalFiles: number;
    verifiedFiles: number;
    corruptedFiles: number;
    missingFiles: number;
    integrityChecks: Array<{
      name: string;
      passed: boolean;
      message?: string;
    }>;
  };
}

interface BackupVerificationPanelProps {
  backups?: BackupInfo[];
  onVerify?: (backupId: string) => Promise<VerificationResult>;
  onVerifyUpload?: (file: File) => Promise<VerificationResult>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * BackupVerificationPanel component
 * 
 * This component provides a UI for verifying the integrity of backups.
 * Users can select a backup from the list or upload a backup file for verification.
 */
const BackupVerificationPanel: React.FC<BackupVerificationPanelProps> = ({
  backups = [],
  onVerify,
  onVerifyUpload,
  isLoading = false,
  error = null
}) => {
  // State for verification
  const [selectedBackupId, setSelectedBackupId] = useState<string>('');
  const [verificationMethod, setVerificationMethod] = useState<'select' | 'upload'>('select');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Handle backup selection
  const handleBackupSelection = (event: SelectChangeEvent<string>) => {
    setSelectedBackupId(event.target.value);
  };
  
  // Handle verification method change
  const handleVerificationMethodChange = (method: 'select' | 'upload') => {
    setVerificationMethod(method);
    setVerificationResult(null);
    setActiveStep(0);
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };
  
  // Handle verification
  const handleVerify = async () => {
    try {
      let result: VerificationResult;
      
      if (verificationMethod === 'select' && selectedBackupId && onVerify) {
        result = await onVerify(selectedBackupId);
      } else if (verificationMethod === 'upload' && uploadedFile && onVerifyUpload) {
        result = await onVerifyUpload(uploadedFile);
      } else {
        return;
      }
      
      setVerificationResult(result);
      setActiveStep(1);
    } catch (error) {
      // Error is handled by the parent component
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
  
  // Get selected backup
  const getSelectedBackup = () => {
    return backups.find(backup => backup.id === selectedBackupId);
  };
  
  // Render verification steps
  const steps = [
    {
      label: 'Select Backup',
      description: 'Choose a backup to verify',
      content: (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant={verificationMethod === 'select' ? 'contained' : 'outlined'}
              onClick={() => handleVerificationMethodChange('select')}
              sx={{ mr: 1 }}
            >
              Select from Backups
            </Button>
            <Button
              variant={verificationMethod === 'upload' ? 'contained' : 'outlined'}
              onClick={() => handleVerificationMethodChange('upload')}
            >
              Upload Backup File
            </Button>
          </Box>
          
          {verificationMethod === 'select' && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="backup-select-label">Select Backup</InputLabel>
              <Select
                labelId="backup-select-label"
                value={selectedBackupId}
                label="Select Backup"
                onChange={handleBackupSelection}
                disabled={isLoading || backups.length === 0}
              >
                {backups.length === 0 ? (
                  <MenuItem value="" disabled>
                    No backups available
                  </MenuItem>
                ) : (
                  backups.map((backup) => (
                    <MenuItem key={backup.id} value={backup.id}>
                      {backup.name} ({formatDate(backup.createdAt)})
                    </MenuItem>
                  ))
                )}
              </Select>
              
              {selectedBackupId && (
                <Box sx={{ mt: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Backup Details
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Name"
                          secondary={getSelectedBackup()?.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AssignmentIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Type"
                          secondary={getSelectedBackup()?.type}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <DownloadIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Size"
                          secondary={getSelectedBackup()?.size}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Box>
              )}
            </FormControl>
          )}
          
          {verificationMethod === 'upload' && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<DownloadIcon />}
                fullWidth
                sx={{ height: 56 }}
              >
                Select Backup File
                <input
                  type="file"
                  hidden
                  accept=".zip,.gz,.tar,.tar.gz,.bak,.backup"
                  onChange={handleFileUpload}
                />
              </Button>
              
              {uploadedFile && (
                <Box sx={{ mt: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected File
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Name"
                          secondary={uploadedFile.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <DownloadIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Size"
                          secondary={`${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AssignmentIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Type"
                          secondary={uploadedFile.type || 'Unknown'}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={20} /> : <VerifyIcon />}
            onClick={handleVerify}
            disabled={
              isLoading ||
              (verificationMethod === 'select' && !selectedBackupId) ||
              (verificationMethod === 'upload' && !uploadedFile)
            }
            fullWidth
          >
            Verify Backup
          </Button>
        </Box>
      )
    },
    {
      label: 'Verification Results',
      description: 'Review the verification results',
      content: (
        <Box sx={{ mt: 2 }}>
          {verificationResult && (
            <>
              <Alert 
                severity={verificationResult.success ? 'success' : 'error'}
                sx={{ mb: 3 }}
              >
                <AlertTitle>
                  {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
                </AlertTitle>
                {verificationResult.message}
              </Alert>
              
              {verificationResult.details && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Verification Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Chip
                      icon={<InfoIcon />}
                      label={`Total Files: ${verificationResult.details.totalFiles}`}
                      variant="outlined"
                    />
                    <Chip
                      icon={<CheckIcon />}
                      label={`Verified: ${verificationResult.details.verifiedFiles}`}
                      color="success"
                      variant="outlined"
                    />
                    {verificationResult.details.corruptedFiles > 0 && (
                      <Chip
                        icon={<ErrorIcon />}
                        label={`Corrupted: ${verificationResult.details.corruptedFiles}`}
                        color="error"
                        variant="outlined"
                      />
                    )}
                    {verificationResult.details.missingFiles > 0 && (
                      <Chip
                        icon={<WarningIcon />}
                        label={`Missing: ${verificationResult.details.missingFiles}`}
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Integrity Checks
                  </Typography>
                  
                  <List>
                    {verificationResult.details.integrityChecks.map((check, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {check.passed ? (
                            <CheckIcon color="success" />
                          ) : (
                            <ErrorIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={check.name}
                          secondary={check.message}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
              
              <Button
                variant="outlined"
                onClick={() => {
                  setVerificationResult(null);
                  setActiveStep(0);
                }}
                startIcon={<SearchIcon />}
              >
                Verify Another Backup
              </Button>
            </>
          )}
        </Box>
      )
    }
  ];
  
  return (
    <Card>
      <CardHeader
        title="Backup Verification"
        subheader="Verify the integrity of your backups"
        avatar={<VerifyIcon />}
      />
      <Divider />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                {step.content}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default BackupVerificationPanel;
