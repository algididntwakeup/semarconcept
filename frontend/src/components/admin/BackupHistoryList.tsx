import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CloudDownload as CloudDownloadIcon,
  Info as InfoIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { BackupInfo } from './RestoreForm';
import { BackupStorageLocation, BackupEncryptionType } from './BackupForm';

interface BackupHistoryListProps {
  backups?: BackupInfo[];
  isLoading?: boolean;
  error?: string | null;
  onDownload?: (backupId: string) => Promise<void>;
  onRestore?: (backupId: string) => void;
  onDelete?: (backupId: string) => Promise<void>;
}

/**
 * BackupHistoryList component
 * 
 * This component displays a list of system backups with options to download,
 * restore, or delete each backup.
 */
const BackupHistoryList: React.FC<BackupHistoryListProps> = ({
  backups = [],
  isLoading = false,
  error = null,
  onDownload,
  onRestore,
  onDelete
}) => {
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBackups, setFilteredBackups] = useState<BackupInfo[]>(backups);
  
  // State for action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  
  // State for action status
  const [actionStatus, setActionStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  // Update filtered backups when backups or search term changes
  useEffect(() => {
    if (searchTerm) {
      setFilteredBackups(
        backups.filter(
          (backup) =>
            backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            backup.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            backup.type.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredBackups(backups);
    }
  }, [backups, searchTerm]);
  
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search term change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, backupId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedBackupId(backupId);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBackupId(null);
  };
  
  // Handle download
  const handleDownload = async () => {
    if (selectedBackupId && onDownload) {
      try {
        await onDownload(selectedBackupId);
        setActionStatus({
          type: 'success',
          message: 'Backup downloaded successfully'
        });
      } catch (error) {
        setActionStatus({
          type: 'error',
          message: 'Failed to download backup'
        });
      }
    }
    handleMenuClose();
  };
  
  // Handle restore
  const handleRestore = () => {
    if (selectedBackupId && onRestore) {
      onRestore(selectedBackupId);
    }
    handleMenuClose();
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedBackupId && onDelete) {
      setDeleteInProgress(true);
      try {
        await onDelete(selectedBackupId);
        setActionStatus({
          type: 'success',
          message: 'Backup deleted successfully'
        });
      } catch (error) {
        setActionStatus({
          type: 'error',
          message: 'Failed to delete backup'
        });
      } finally {
        setDeleteInProgress(false);
        setDeleteDialogOpen(false);
      }
    }
  };
  
  // Clear action status
  const clearActionStatus = () => {
    setActionStatus(null);
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
  
  // Get storage location label
  const getStorageLocationLabel = (location: BackupStorageLocation) => {
    switch (location) {
      case BackupStorageLocation.LOCAL:
        return 'Local';
      case BackupStorageLocation.CLOUD:
        return 'Cloud';
      case BackupStorageLocation.REMOTE_SERVER:
        return 'Remote';
      default:
        return 'Unknown';
    }
  };
  
  // Get encryption type label
  const getEncryptionTypeLabel = (encryptionType: BackupEncryptionType) => {
    switch (encryptionType) {
      case BackupEncryptionType.NONE:
        return 'None';
      case BackupEncryptionType.AES_256:
        return 'AES-256';
      case BackupEncryptionType.RSA:
        return 'RSA';
      default:
        return 'Unknown';
    }
  };
  
  // Get backup type color
  const getBackupTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full':
        return 'primary';
      case 'partial':
        return 'secondary';
      case 'configuration':
        return 'info';
      case 'data_only':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  return (
    <Card>
      <CardHeader
        title="Backup History"
        subheader={`${backups.length} backups available`}
        avatar={<HistoryIcon />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="Search backups..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ mr: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            <Tooltip title="Filter">
              <IconButton size="small">
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <Divider />
      
      {actionStatus && (
        <Alert 
          severity={actionStatus.type} 
          onClose={clearActionStatus}
          sx={{ mx: 2, mt: 2 }}
        >
          {actionStatus.message}
        </Alert>
      )}
      
      <CardContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : filteredBackups.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <BackupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No backups found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try a different search term' : 'Create a backup to see it here'}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Encryption</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBackups
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((backup) => (
                    <TableRow key={backup.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BackupIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {backup.name}
                            </Typography>
                            {backup.description && (
                              <Typography variant="caption" color="text.secondary">
                                {backup.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={backup.type}
                          size="small"
                          color={getBackupTypeColor(backup.type) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>{formatDate(backup.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStorageLocationLabel(backup.location)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {backup.encryptionType !== BackupEncryptionType.NONE ? (
                          <Tooltip title="This backup is encrypted">
                            <Chip
                              label={getEncryptionTypeLabel(backup.encryptionType)}
                              size="small"
                              color="warning"
                              variant="outlined"
                              icon={<InfoIcon fontSize="small" />}
                            />
                          </Tooltip>
                        ) : (
                          <Chip
                            label="None"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(event) => handleMenuOpen(event, backup.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredBackups.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </CardContent>
      
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDownload} disabled={!onDownload}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRestore} disabled={!onRestore}>
          <ListItemIcon>
            <RestoreIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Restore</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteDialogOpen} disabled={!onDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Backup</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this backup? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={deleteInProgress}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteInProgress}
            startIcon={deleteInProgress ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default BackupHistoryList;