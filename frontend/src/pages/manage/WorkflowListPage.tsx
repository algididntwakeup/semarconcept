import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchWorkflows, deleteWorkflow, toggleWorkflowStatus } from '../../store/slices/workflowSlice'; // To be created

// Placeholder type matching backend model (simplified)
interface WorkflowInfo {
  id: number; // Assuming uint maps to number
  name: string;
  description: string;
  entityType: string;
  isActive: boolean;
  stageCount?: number; // Example derived info
  transitionCount?: number; // Example derived info
}

const WorkflowListPage: React.FC = () => {
  // const navigate = useNavigate();
  // const dispatch = useDispatch<AppDispatch>();
  // const { workflows, loading, error } = useSelector((state: RootState) => state.workflow); // To be created

  // Placeholder state
  const [workflows, setWorkflows] = useState<WorkflowInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // dispatch(fetchWorkflows());
    // Mock fetch
    setTimeout(() => {
      setWorkflows([
        { id: 1, name: 'Content Approval', description: 'Standard draft, review, publish flow for content entries.', entityType: 'content_entry', isActive: true, stageCount: 3, transitionCount: 3 },
        { id: 2, name: 'User Onboarding', description: 'Workflow for new user registration steps.', entityType: 'user', isActive: false, stageCount: 2, transitionCount: 1 },
      ]);
      setIsLoading(false);
    }, 600);
  }, []); // dispatch

  const handleAddNew = () => {
    // navigate('/manage/workflows/new');
    console.log('Navigate to new workflow page');
  };

  const handleEdit = (id: number) => {
    // navigate(`/manage/workflows/edit/${id}`);
    console.log('Navigate to edit workflow page:', id);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the workflow "${name}"? This cannot be undone.`)) {
      console.log('Deleting workflow:', id);
      setError(null);
      // TODO: dispatch(deleteWorkflow(id));
      // Mock delete
      setWorkflows(prev => prev.filter(wf => wf.id !== id));
    }
  };

   const handleToggleStatus = (id: number, currentStatus: boolean) => {
     console.log(`Toggling status for workflow ${id} from ${currentStatus}`);
     setError(null);
     // TODO: dispatch(toggleWorkflowStatus({id, isActive: !currentStatus}));
     // Mock toggle
     setWorkflows(prev => prev.map(wf => wf.id === id ? {...wf, isActive: !currentStatus} : wf));
   };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Workflow Definitions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Create Workflow
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 0 }}>
        <TableContainer>
          <Table stickyHeader aria-label="workflow definitions table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Stages</TableCell>
                <TableCell align="center">Transitions</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : workflows.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No workflow definitions found.
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((wf) => (
                  <TableRow hover key={wf.id}>
                    <TableCell component="th" scope="row">{wf.name}</TableCell>
                    <TableCell>{wf.entityType}</TableCell>
                    <TableCell>{wf.description}</TableCell>
                    <TableCell align="center">{wf.stageCount ?? '-'}</TableCell>
                    <TableCell align="center">{wf.transitionCount ?? '-'}</TableCell>
                    <TableCell align="center">
                       <Switch
                        checked={wf.isActive}
                        onChange={() => handleToggleStatus(wf.id, wf.isActive)}
                        inputProps={{ 'aria-label': `toggle ${wf.name} status` }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Workflow">
                        <IconButton size="small" onClick={() => handleEdit(wf.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                       <Tooltip title="Delete Workflow">
                        <IconButton size="small" color="error" onClick={() => handleDelete(wf.id, wf.name)} sx={{ ml: 1 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default WorkflowListPage;