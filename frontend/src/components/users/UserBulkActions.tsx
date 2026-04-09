// platform/frontend-mui/src/components/users/UserBulkActions.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import { User, UserActionRequest } from '../../types/user.types';
import { useUserMutations } from '../../hooks/useUsers';

interface UserBulkActionsProps {
  open: boolean;
  onClose: () => void;
  selectedUsers: string[];
  users: User[];
  onSuccess?: () => void;
}

const UserBulkActions: React.FC<UserBulkActionsProps> = ({
  open,
  onClose,
  selectedUsers,
  users,
  onSuccess,
}) => {
  const [action, setAction] = useState<string>('');
  const [reason, setReason] = useState('');
  const { bulkAction, loading } = useUserMutations();

  const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id));

  const handleSubmit = async () => {
    if (!action || selectedUsers.length === 0) return;

    const actionData: UserActionRequest = {
      user_ids: selectedUsers,
      action: action as any,
    };

    if (reason.trim()) {
      actionData.reason = reason.trim();
    }

    await bulkAction(actionData);
    onClose();
    onSuccess?.();
  };

  const handleClose = () => {
    setAction('');
    setReason('');
    onClose();
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'activate':
        return 'Activate selected users and restore their access';
      case 'suspend':
        return 'Suspend selected users and revoke their access temporarily';
      case 'delete':
        return 'Permanently delete selected users and all their data';
      case 'reset_password':
        return 'Reset passwords for selected users and send new credentials via email';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      case 'suspended': return 'default';
      default: return 'default';
    }
  };

  const requiresReason = action === 'suspend' || action === 'delete';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Bulk Action for {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Users:
          </Typography>
          <List dense>
            {selectedUserObjects.map((user) => (
              <ListItem key={user.id} divider>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                  secondary={user.email}
                />
                <Chip
                  label={user.status}
                  size="small"
                  color={getStatusColor(user.status)}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            label="Action"
          >
            <MenuItem value="activate">Activate Users</MenuItem>
            <MenuItem value="suspend">Suspend Users</MenuItem>
            <MenuItem value="reset_password">Reset Passwords</MenuItem>
            <MenuItem value="delete">Delete Users</MenuItem>
          </Select>
        </FormControl>

        {action && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {getActionDescription(action)}
          </Alert>
        )}

        {requiresReason && (
          <TextField
            fullWidth
            label="Reason"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for this action..."
            required={action === 'delete'}
            helperText={action === 'delete' ? 'Reason is required for deletion' : 'Optional reason for this action'}
          />
        )}

        {action === 'delete' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Warning:</strong> This action cannot be undone. All user data will be permanently deleted.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading || 
            !action || 
            selectedUsers.length === 0 ||
            (action === 'delete' && !reason.trim())
          }
          color={action === 'delete' ? 'error' : 'primary'}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : `${action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserBulkActions;