import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Alert,
  AlertTitle,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { BackupType, BackupStorageLocation, BackupCompressionType } from './BackupForm';

// Define schedule frequency types
export enum ScheduleFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

// Define days of week
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

// Define backup schedule interface
export interface BackupSchedule {
  id?: string;
  name: string;
  description?: string;
  enabled: boolean;
  frequency: ScheduleFrequency;
  hourlyInterval?: number;
  timeOfDay?: string;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  backupType: BackupType;
  storageLocation: BackupStorageLocation;
  compressionType: BackupCompressionType;
  retentionCount: number;
  includeContent: boolean;
  includeUsers: boolean;
  includeSettings: boolean;
  includeDashboards: boolean;
  includeMedia: boolean;
  includeWorkflows: boolean;
}

interface BackupScheduleFormProps {
  schedule?: BackupSchedule;
  onSave?: (schedule: BackupSchedule) => Promise<void>;
  onDelete?: (scheduleId: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * BackupScheduleForm component
 * 
 * This component provides a form for creating and editing backup schedules.
 * It allows users to configure automatic backups with various options.
 */
const BackupScheduleForm: React.FC<BackupScheduleFormProps> = ({
  schedule,
  onSave,
  onDelete,
  isLoading = false,
  error = null
}) => {
  // Default schedule
  const defaultSchedule: BackupSchedule = {
    name: 'Daily Backup',
    enabled: true,
    frequency: ScheduleFrequency.DAILY,
    timeOfDay: '00:00',
    backupType: BackupType.FULL,
    storageLocation: BackupStorageLocation.LOCAL,
    compressionType: BackupCompressionType.GZIP,
    retentionCount: 7,
    includeContent: true,
    includeUsers: true,
    includeSettings: true,
    includeDashboards: true,
    includeMedia: true,
    includeWorkflows: true
  };
  
  // State for schedule
  const [scheduleData, setScheduleData] = useState<BackupSchedule>(schedule || defaultSchedule);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Handle input change
  const handleInputChange = (field: keyof BackupSchedule, value: any) => {
    setScheduleData({
      ...scheduleData,
      [field]: value
    });
    
    // Reset save success when form is modified
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (field: keyof BackupSchedule) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleData({
      ...scheduleData,
      [field]: event.target.checked
    });
    
    // Reset save success when form is modified
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };
  
  // Handle day of week selection
  const handleDayOfWeekChange = (day: DayOfWeek) => {
    const currentDays = scheduleData.daysOfWeek || [];
    let newDays: DayOfWeek[];
    
    if (currentDays.includes(day)) {
      newDays = currentDays.filter(d => d !== day);
    } else {
      newDays = [...currentDays, day];
    }
    
    setScheduleData({
      ...scheduleData,
      daysOfWeek: newDays
    });
    
    // Reset save success when form is modified
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };
  
  // Handle save
  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave(scheduleData);
        setSaveSuccess(true);
      } catch (error) {
        // Error is handled by the parent component
      }
    }
  };
  
  // Handle delete confirm open
  const handleDeleteConfirmOpen = () => {
    setDeleteConfirmOpen(true);
  };
  
  // Handle delete confirm close
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (onDelete && scheduleData.id) {
      try {
        await onDelete(scheduleData.id);
        // Navigate back or show success message
      } catch (error) {
        // Error is handled by the parent component
      } finally {
        setDeleteConfirmOpen(false);
      }
    }
  };
  
  // Get frequency description
  const getFrequencyDescription = () => {
    switch (scheduleData.frequency) {
      case ScheduleFrequency.HOURLY:
        return `Every ${scheduleData.hourlyInterval || 1} hour(s)`;
      case ScheduleFrequency.DAILY:
        return `Every day at ${scheduleData.timeOfDay || '00:00'}`;
      case ScheduleFrequency.WEEKLY:
        if (!scheduleData.daysOfWeek || scheduleData.daysOfWeek.length === 0) {
          return 'No days selected';
        }
        const days = scheduleData.daysOfWeek
          .sort()
          .map(day => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day])
          .join(', ');
        return `Every ${days} at ${scheduleData.timeOfDay || '00:00'}`;
      case ScheduleFrequency.MONTHLY:
        return `Day ${scheduleData.dayOfMonth || 1} of each month at ${scheduleData.timeOfDay || '00:00'}`;
      case ScheduleFrequency.CUSTOM:
        return 'Custom schedule';
      default:
        return 'Unknown frequency';
    }
  };
  
  // Render days of week selection
  const renderDaysOfWeekSelection = () => {
    const days = [
      { value: DayOfWeek.MONDAY, label: 'M' },
      { value: DayOfWeek.TUESDAY, label: 'T' },
      { value: DayOfWeek.WEDNESDAY, label: 'W' },
      { value: DayOfWeek.THURSDAY, label: 'T' },
      { value: DayOfWeek.FRIDAY, label: 'F' },
      { value: DayOfWeek.SATURDAY, label: 'S' },
      { value: DayOfWeek.SUNDAY, label: 'S' }
    ];
    
    return (
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        {days.map((day) => (
          <Chip
            key={day.value}
            label={day.label}
            onClick={() => handleDayOfWeekChange(day.value)}
            color={(scheduleData.daysOfWeek || []).includes(day.value) ? 'primary' : 'default'}
            variant={(scheduleData.daysOfWeek || []).includes(day.value) ? 'filled' : 'outlined'}
          />
        ))}
      </Box>
    );
  };
  
  return (
    <Card>
      <CardHeader
        title={schedule ? 'Edit Backup Schedule' : 'Create Backup Schedule'}
        subheader="Configure automatic backup schedule"
        avatar={<ScheduleIcon />}
        action={
          schedule && (
            <Tooltip title="Delete Schedule">
              <IconButton color="error" onClick={handleDeleteConfirmOpen}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )
        }
      />
      <Divider />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Success</AlertTitle>
            Backup schedule saved successfully
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={12}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Schedule Name"
              value={scheduleData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
              error={!scheduleData.name}
              helperText={!scheduleData.name ? 'Schedule name is required' : ''}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={scheduleData.enabled}
                  onChange={handleCheckboxChange('enabled')}
                  color="primary"
                />
              }
              label={scheduleData.enabled ? 'Schedule Enabled' : 'Schedule Disabled'}
            />
          </Grid>
          
          <Grid size={12}>
            <TextField
              label="Description"
              value={scheduleData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          
          {/* Schedule Configuration */}
          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Schedule Configuration
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="frequency-label">Frequency</InputLabel>
              <Select
                labelId="frequency-label"
                value={scheduleData.frequency}
                label="Frequency"
                onChange={(e) => handleInputChange('frequency', e.target.value)}
              >
                <MenuItem value={ScheduleFrequency.HOURLY}>Hourly</MenuItem>
                <MenuItem value={ScheduleFrequency.DAILY}>Daily</MenuItem>
                <MenuItem value={ScheduleFrequency.WEEKLY}>Weekly</MenuItem>
                <MenuItem value={ScheduleFrequency.MONTHLY}>Monthly</MenuItem>
                <MenuItem value={ScheduleFrequency.CUSTOM}>Custom</MenuItem>
              </Select>
              <FormHelperText>
                {getFrequencyDescription()}
              </FormHelperText>
            </FormControl>
          </Grid>
          
          {scheduleData.frequency === ScheduleFrequency.HOURLY && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Interval (hours)"
                type="number"
                value={scheduleData.hourlyInterval || 1}
                onChange={(e) => handleInputChange('hourlyInterval', parseInt(e.target.value))}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 24 } }}
              />
            </Grid>
          )}
          
          {scheduleData.frequency !== ScheduleFrequency.HOURLY && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Time of Day"
                type="time"
                value={scheduleData.timeOfDay || '00:00'}
                onChange={(e) => handleInputChange('timeOfDay', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <TimeIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
          )}
          
          {scheduleData.frequency === ScheduleFrequency.WEEKLY && (
            <Grid size={12}>
              <Typography variant="subtitle2" gutterBottom>
                Days of Week
              </Typography>
              {renderDaysOfWeekSelection()}
            </Grid>
          )}
          
          {scheduleData.frequency === ScheduleFrequency.MONTHLY && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Day of Month"
                type="number"
                value={scheduleData.dayOfMonth || 1}
                onChange={(e) => handleInputChange('dayOfMonth', parseInt(e.target.value))}
                fullWidth
                InputProps={{ 
                  inputProps: { min: 1, max: 31 },
                  startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
          )}
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Retention Count"
              type="number"
              value={scheduleData.retentionCount}
              onChange={(e) => handleInputChange('retentionCount', parseInt(e.target.value))}
              fullWidth
              helperText="Number of backups to keep before deleting the oldest"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          
          {/* Backup Configuration */}
          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Backup Configuration
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="backup-type-label">Backup Type</InputLabel>
              <Select
                labelId="backup-type-label"
                value={scheduleData.backupType}
                label="Backup Type"
                onChange={(e) => handleInputChange('backupType', e.target.value)}
              >
                <MenuItem value={BackupType.FULL}>Full Backup</MenuItem>
                <MenuItem value={BackupType.PARTIAL}>Partial Backup</MenuItem>
                <MenuItem value={BackupType.CONFIGURATION}>Configuration Only</MenuItem>
                <MenuItem value={BackupType.DATA_ONLY}>Data Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="storage-location-label">Storage Location</InputLabel>
              <Select
                labelId="storage-location-label"
                value={scheduleData.storageLocation}
                label="Storage Location"
                onChange={(e) => handleInputChange('storageLocation', e.target.value)}
              >
                <MenuItem value={BackupStorageLocation.LOCAL}>Local Storage</MenuItem>
                <MenuItem value={BackupStorageLocation.CLOUD}>Cloud Storage</MenuItem>
                <MenuItem value={BackupStorageLocation.REMOTE_SERVER}>Remote Server</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="compression-type-label">Compression</InputLabel>
              <Select
                labelId="compression-type-label"
                value={scheduleData.compressionType}
                label="Compression"
                onChange={(e) => handleInputChange('compressionType', e.target.value)}
              >
                <MenuItem value={BackupCompressionType.NONE}>None</MenuItem>
                <MenuItem value={BackupCompressionType.GZIP}>GZIP</MenuItem>
                <MenuItem value={BackupCompressionType.ZIP}>ZIP</MenuItem>
                <MenuItem value={BackupCompressionType.TAR_GZ}>TAR.GZ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Content Selection */}
          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Content Selection
            </Typography>
          </Grid>
          
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scheduleData.includeContent}
                        onChange={handleCheckboxChange('includeContent')}
                        disabled={scheduleData.backupType === BackupType.CONFIGURATION}
                      />
                    }
                    label="Content"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scheduleData.includeUsers}
                        onChange={handleCheckboxChange('includeUsers')}
                        disabled={scheduleData.backupType === BackupType.DATA_ONLY}
                      />
                    }
                    label="Users & Permissions"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scheduleData.includeSettings}
                        onChange={handleCheckboxChange('includeSettings')}
                        disabled={scheduleData.backupType === BackupType.DATA_ONLY}
                      />
                    }
                    label="System Settings"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scheduleData.includeDashboards}
                        onChange={handleCheckboxChange('includeDashboards')}
                        disabled={scheduleData.backupType === BackupType.CONFIGURATION}
                      />
                    }
                    label="Dashboards"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scheduleData.includeMedia}
                        onChange={handleCheckboxChange('includeMedia')}
                        disabled={scheduleData.backupType === BackupType.CONFIGURATION}
                      />
                    }
                    label="Media Files"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scheduleData.includeWorkflows}
                        onChange={handleCheckboxChange('includeWorkflows')}
                        disabled={scheduleData.backupType === BackupType.DATA_ONLY}
                      />
                    }
                    label="Workflows"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Summary */}
          <Grid size={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Schedule Summary
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body2">
                  {scheduleData.enabled ? 'This schedule is enabled' : 'This schedule is disabled'}
                </Typography>
              </Box>
              <Typography variant="body2">
                <strong>Frequency:</strong> {getFrequencyDescription()}
              </Typography>
              <Typography variant="body2">
                <strong>Backup Type:</strong> {scheduleData.backupType.charAt(0).toUpperCase() + scheduleData.backupType.slice(1)}
              </Typography>
              <Typography variant="body2">
                <strong>Retention:</strong> Keep last {scheduleData.retentionCount} backups
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={isLoading || !scheduleData.name}
          >
            Save Schedule
          </Button>
        </Box>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <Alert
          severity="warning"
          action={
            <Box>
              <Button color="inherit" size="small" onClick={handleDeleteConfirmClose}>
                Cancel
              </Button>
              <Button
                color="error"
                size="small"
                onClick={handleDelete}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : null}
              >
                Delete
              </Button>
            </Box>
          }
          sx={{ m: 2 }}
        >
          <AlertTitle>Delete Schedule</AlertTitle>
          Are you sure you want to delete this backup schedule? This action cannot be undone.
        </Alert>
      )}
    </Card>
  );
};

export default BackupScheduleForm;