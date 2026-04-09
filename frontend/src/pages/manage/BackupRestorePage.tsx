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
  ListItemIcon,
  ListItemSecondaryAction,
  // Switch, // Removed unused import
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup'; // Backup Now
import RestoreIcon from '@mui/icons-material/Restore'; // Restore
// import DownloadIcon from '@mui/icons-material/Download'; // Removed unused import
import DeleteIcon from '@mui/icons-material/Delete'; // Delete Backup
import FolderZipIcon from '@mui/icons-material/FolderZip'; // Icon for backups
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { listBackups, createBackup, restoreBackup, deleteBackup } from '../../store/slices/backupSlice'; // To be created

// Placeholder type for backup file info
interface BackupInfo {
  filename: string;
  size: number; // In bytes
  createdAt: string; // ISO string or Date
  type: 'database' | 'filesystem' | 'full'; // Example types
}

const BackupRestorePage: React.FC = () => {
  // Renamed function
  // const dispatch = useDispatch<AppDispatch>();
  // const { backups, loading, error, actionInProgress } = useSelector((state: RootState) => state.backup); // To be created

  // Placeholder state
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null); // e.g., 'creating', 'restoring:filename', 'deleting:filename'

  const fetchData = () => { // Renamed function
    setIsLoading(true);
    setError(null);
    // dispatch(listBackups());
    // Mock fetch
    setTimeout(() => {
      setBackups([
        {
          filename: 'dump_2025-05-08_10_30_00.sql',
          size: 1024 * 1024 * 5,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          type: 'database',
        },
        {
          filename: 'uploads_2025-05-08_10_30_00.tar',
          size: 1024 * 1024 * 50,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          type: 'filesystem',
        },
        {
          filename: 'dump_2025-05-07_02_00_00.sql',
          size: 1024 * 1024 * 4.8,
          createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
          type: 'database',
        },
      ]);
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchData(); // Call renamed function
  }, []); // dispatch

  const handleCreateBackup = async () => {
    console.log('Creating new backup...');
    setError(null);
    setActionInProgress('creating');
    // try {
    //   await dispatch(createBackup()).unwrap();
    //   fetchData(); // Refresh list
    // } catch (err: unknown) {
    //   setError((err as Error)?.message || 'Failed to create backup');
    // } finally {
    //   setActionInProgress(null);
    // }
    // Mock create
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setActionInProgress(null);
    fetchData(); // Refresh list
  };

  const handleRestore = async (filename: string) => {
    if (
      window.confirm(
        `Are you sure you want to restore from backup "${filename}"? This will overwrite current data.`
      )
    ) {
      console.log('Restoring backup:', filename);
      setError(null);
      setActionInProgress(`restoring:${filename}`);
      // try {
      //   await dispatch(restoreBackup(filename)).unwrap();
      //   // Maybe show success message
      // } catch (err: unknown) {
      //   setError((err as Error)?.message || `Failed to restore backup ${filename}`);
      // } finally {
      //   setActionInProgress(null);
      // }
      // Mock restore
      await new Promise((resolve) => setTimeout(resolve, 10000));
      setActionInProgress(null);
    }
  };

  const handleDelete = async (filename: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the backup file "${filename}"? This cannot be undone.`
      )
    ) {
      console.log('Deleting backup:', filename);
      setError(null);
      setActionInProgress(`deleting:${filename}`);
      // try {
      //   await dispatch(deleteBackup(filename)).unwrap();
      //   fetchData(); // Refresh list
      // } catch (err: unknown) {
      //   setError((err as Error)?.message || `Failed to delete backup ${filename}`);
      // } finally {
      //   setActionInProgress(null);
      // }
      // Mock delete
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setBackups((prev) => prev.filter((b) => b.filename !== filename));
      setActionInProgress(null);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Backup & Restore
        </Typography>
        <Button
          variant="contained"
          startIcon={
            actionInProgress === 'creating' ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <BackupIcon />
            )
          }
          onClick={handleCreateBackup}
          disabled={!!actionInProgress}
        >
          Create Backup Now
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
          ) : backups.length === 0 ? (
            <ListItem>
              <ListItemText primary="No backups found." />
            </ListItem>
          ) : (
            backups
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((backup, index) => (
                <React.Fragment key={backup.filename}>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <FolderZipIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={backup.filename}
                      secondary={`Created: ${new Date(
                        backup.createdAt
                      ).toLocaleString()} | Size: ${formatBytes(backup.size)} | Type: ${
                        backup.type
                      }`}
                    />
                    <ListItemSecondaryAction>
                      {/* Add Download button if backend supports it */}
                      {/* <Tooltip title="Download Backup">
                        <IconButton edge="end" aria-label="download">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip> */}
                      <Tooltip title="Restore From This Backup">
                        <span>
                          {' '}
                          {/* Needed for tooltip on disabled button */}
                          <IconButton
                            edge="end"
                            aria-label="restore"
                            onClick={() => handleRestore(backup.filename)}
                            disabled={!!actionInProgress}
                            color="primary"
                            sx={{ ml: 1 }}
                          >
                            {actionInProgress === `restoring:${backup.filename}` ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <RestoreIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete Backup">
                        <span>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDelete(backup.filename)}
                            disabled={!!actionInProgress}
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            {actionInProgress === `deleting:${backup.filename}` ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < backups.length - 1 && <Divider component="li" variant="inset" />}
                </React.Fragment>
              ))
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default BackupRestorePage;
