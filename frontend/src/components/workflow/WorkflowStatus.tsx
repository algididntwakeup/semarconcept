import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Chip,
  Typography,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Paper,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Publish as PublishIcon,
  Archive as ArchiveIcon,
  Edit as EditIcon,
  RateReview as ReviewIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { websocketSubscribe, websocketUnsubscribe } from '../../store/middleware/websocketMiddleware';
import { RootState } from '../../store';

// Define workflow status types
export enum WorkflowStatusType {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  REJECTED = 'rejected'
}

// Define workflow status colors
const statusColors: Record<WorkflowStatusType, string> = {
  [WorkflowStatusType.DRAFT]: 'default',
  [WorkflowStatusType.REVIEW]: 'info',
  [WorkflowStatusType.APPROVED]: 'success',
  [WorkflowStatusType.PUBLISHED]: 'primary',
  [WorkflowStatusType.ARCHIVED]: 'secondary',
  [WorkflowStatusType.REJECTED]: 'error'
};

// Define workflow transition options based on current status
const transitionOptions: Record<WorkflowStatusType, WorkflowStatusType[]> = {
  [WorkflowStatusType.DRAFT]: [WorkflowStatusType.REVIEW],
  [WorkflowStatusType.REVIEW]: [WorkflowStatusType.APPROVED, WorkflowStatusType.REJECTED],
  [WorkflowStatusType.APPROVED]: [WorkflowStatusType.PUBLISHED, WorkflowStatusType.REJECTED],
  [WorkflowStatusType.PUBLISHED]: [WorkflowStatusType.ARCHIVED],
  [WorkflowStatusType.ARCHIVED]: [WorkflowStatusType.DRAFT],
  [WorkflowStatusType.REJECTED]: [WorkflowStatusType.DRAFT]
};

// Define workflow status labels
const statusLabels: Record<WorkflowStatusType, string> = {
  [WorkflowStatusType.DRAFT]: 'Draft',
  [WorkflowStatusType.REVIEW]: 'In Review',
  [WorkflowStatusType.APPROVED]: 'Approved',
  [WorkflowStatusType.PUBLISHED]: 'Published',
  [WorkflowStatusType.ARCHIVED]: 'Archived',
  [WorkflowStatusType.REJECTED]: 'Rejected'
};

interface WorkflowStatusProps {
  contentId: string;
  contentType: string;
  initialStatus: WorkflowStatusType;
  onStatusChange?: (newStatus: WorkflowStatusType, comment: string) => Promise<void>;
  readOnly?: boolean;
  showHistory?: boolean;
}

/**
 * WorkflowStatus component
 * 
 * This component displays the current workflow status of a content item
 * and allows transitioning to other statuses. It also subscribes to
 * real-time updates via WebSocket.
 */
const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  contentId,
  contentType,
  initialStatus,
  onStatusChange,
  readOnly = false,
  showHistory = true
}) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<WorkflowStatusType>(initialStatus);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  // Transition dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [targetStatus, setTargetStatus] = useState<WorkflowStatusType | null>(null);
  const [comment, setComment] = useState<string>('');
  
  // History dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = useState<boolean>(false);
  
  // Mock workflow history data - in a real app, this would come from an API
  const [workflowHistory] = useState([
    {
      id: '1',
      fromStatus: WorkflowStatusType.DRAFT,
      toStatus: WorkflowStatusType.REVIEW,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      user: {
        id: '1',
        name: 'John Doe',
        avatar: null
      },
      comment: 'Initial submission for review'
    },
    {
      id: '2',
      fromStatus: WorkflowStatusType.REVIEW,
      toStatus: WorkflowStatusType.REJECTED,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      user: {
        id: '2',
        name: 'Jane Smith',
        avatar: null
      },
      comment: 'Needs more details in the introduction section'
    },
    {
      id: '3',
      fromStatus: WorkflowStatusType.REJECTED,
      toStatus: WorkflowStatusType.DRAFT,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      user: {
        id: '1',
        name: 'John Doe',
        avatar: null
      },
      comment: 'Moving back to draft for revisions'
    },
    {
      id: '4',
      fromStatus: WorkflowStatusType.DRAFT,
      toStatus: WorkflowStatusType.REVIEW,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      user: {
        id: '1',
        name: 'John Doe',
        avatar: null
      },
      comment: 'Resubmitting with requested changes'
    },
    {
      id: '5',
      fromStatus: WorkflowStatusType.REVIEW,
      toStatus: WorkflowStatusType.APPROVED,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      user: {
        id: '3',
        name: 'Bob Johnson',
        avatar: null
      },
      comment: 'Approved with minor suggestions'
    }
  ]);
  
  // Subscribe to workflow updates when component mounts
  useEffect(() => {
    if (!readOnly) {
      dispatch(websocketSubscribe('workflow', `${contentType}:${contentId}`));
      
      // Unsubscribe when component unmounts
      return () => {
        dispatch(websocketUnsubscribe('workflow', `${contentType}:${contentId}`));
      };
    }
  }, [dispatch, contentId, contentType, readOnly]);
  
  // Listen for WebSocket messages about this content item
  const messages = useSelector((state: RootState) => 
    state.websocket.messages.filter(
      msg => 
        msg.type === 'update' && 
        msg.entity === 'workflow' && 
        msg.data?.contentId === contentId && 
        msg.data?.contentType === contentType
    )
  );
  
  // Update status when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.data?.toState) {
        setStatus(latestMessage.data.toState as WorkflowStatusType);
      }
    }
  }, [messages]);
  
  // Handle menu open
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle transition option click
  const handleTransitionClick = (newStatus: WorkflowStatusType) => {
    setTargetStatus(newStatus);
    setDialogOpen(true);
    handleMenuClose();
  };
  
  // Handle transition dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setTargetStatus(null);
    setComment('');
  };
  
  // Handle transition confirm
  const handleTransitionConfirm = async () => {
    if (!targetStatus || !onStatusChange) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onStatusChange(targetStatus, comment);
      setStatus(targetStatus);
      handleDialogClose();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle history button click
  const handleHistoryClick = () => {
    setHistoryDialogOpen(true);
  };
  
  // Get status icon based on status type
  const getStatusIcon = (statusType: WorkflowStatusType) => {
    switch (statusType) {
      case WorkflowStatusType.DRAFT:
        return <EditIcon />;
      case WorkflowStatusType.REVIEW:
        return <ReviewIcon />;
      case WorkflowStatusType.APPROVED:
        return <CheckCircleIcon />;
      case WorkflowStatusType.PUBLISHED:
        return <PublishIcon />;
      case WorkflowStatusType.ARCHIVED:
        return <ArchiveIcon />;
      case WorkflowStatusType.REJECTED:
        return <CancelIcon />;
      default:
        return <HistoryIcon />;
    }
  };
  
  // Format date for display
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
  
  // Render workflow status chip
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Chip
        label={statusLabels[status]}
        color={statusColors[status] as any}
        variant="outlined"
      />
      
      {!readOnly && (
        <>
          <Button
            size="small"
            endIcon={<MoreVertIcon />}
            onClick={handleMenuClick}
            disabled={loading}
          >
            Change Status
          </Button>
          
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
          >
            {transitionOptions[status]?.map((option) => (
              <MenuItem 
                key={option} 
                onClick={() => handleTransitionClick(option)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {statusLabels[status]}
                  </Typography>
                  <ArrowForwardIcon sx={{ mx: 1 }} fontSize="small" />
                  <Typography variant="body2">
                    {statusLabels[option]}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
          
          <Dialog open={dialogOpen} onClose={handleDialogClose}>
            <DialogTitle>
              Change Status to {targetStatus ? statusLabels[targetStatus] : ''}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Comment"
                fullWidth
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                variant="outlined"
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button 
                onClick={handleTransitionConfirm} 
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      
      {showHistory && (
        <>
          <Button
            size="small"
            startIcon={<HistoryIcon />}
            onClick={handleHistoryClick}
          >
            History
          </Button>
          
          <Dialog
            open={historyDialogOpen}
            onClose={() => setHistoryDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1 }} />
                Workflow History
              </Box>
            </DialogTitle>
            <DialogContent>
              {workflowHistory.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No workflow history available for this content.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ position: 'relative', mt: 2, mb: 2 }}>
                  {/* Timeline line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '20px',
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      bgcolor: 'divider',
                      zIndex: 0
                    }}
                  />
                  
                  {/* Timeline entries */}
                  {workflowHistory.map((entry, index) => (
                    <Box
                      key={entry.id}
                      sx={{
                        display: 'flex',
                        mb: index < workflowHistory.length - 1 ? 4 : 0,
                        position: 'relative'
                      }}
                    >
                      {/* Status icon */}
                      <Avatar
                        sx={{
                          bgcolor: `${statusColors[entry.toStatus]}.main`,
                          width: 40,
                          height: 40,
                          mr: 2,
                          zIndex: 1
                        }}
                      >
                        {getStatusIcon(entry.toStatus)}
                      </Avatar>
                      
                      {/* Content */}
                      <Box sx={{ flex: 1 }}>
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, bgcolor: 'background.paper' }}
                        >
                          {/* Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1">
                              {statusLabels[entry.fromStatus]} → {statusLabels[entry.toStatus]}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(entry.timestamp)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* User info */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar
                              sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}
                            >
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="body2">
                              {entry.user.name}
                            </Typography>
                          </Box>
                          
                          {/* Comment */}
                          {entry.comment && (
                            <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
                              <Typography variant="body2">
                                {entry.comment}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default WorkflowStatus;