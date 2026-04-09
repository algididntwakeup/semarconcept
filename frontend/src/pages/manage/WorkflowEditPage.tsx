import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  // Divider, // Removed unused import
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  // Checkbox, // Removed unused import
  Chip, // Added missing import
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchWorkflowDefinition, saveWorkflowDefinition, /* other actions */ } from '../../store/slices/workflowSlice'; // To be created

// Placeholder types matching backend models (simplified)
interface WorkflowStageData {
  id: string | number; // Use string for temp IDs like 'new-1'
  name: string;
  description?: string;
  isInitial?: boolean;
  isFinal?: boolean;
  order: number;
}

interface WorkflowTransitionData {
  id: string | number;
  name: string;
  fromStageId: string | number;
  toStageId: string | number;
  // requiredRoleIds: string[]; // Example
}

interface WorkflowDefinition {
  id?: number; // Nullable for new workflows
  name: string;
  description: string;
  entityType: string;
  isActive: boolean;
  stages: WorkflowStageData[];
  transitions: WorkflowTransitionData[];
}

const WorkflowEditPage: React.FC = () => {
  // const { id: workflowIdParam } = useParams<{ id?: string }>(); // id might be 'new' or a number
  // const navigate = useNavigate();
  // const dispatch = useDispatch<AppDispatch>();
  // const { currentWorkflow, loading, error, saving } = useSelector((state: RootState) => state.workflow); // To be created

  const workflowIdParam = '1'; // Mock: '1' for edit, 'new' for create
  // NOTE: This comparison logic depends on how the route parameter is actually passed (e.g., from react-router)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isNew = workflowIdParam === 'new'; // Suppress warning for mock setup

  // Placeholder state
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew); // Only load if editing
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // TODO: Add state for managing stage/transition forms/modals

  useEffect(() => {
    setError(null);
    if (!isNew && workflowIdParam) {
      setIsLoading(true);
      // dispatch(fetchWorkflowDefinition(Number(workflowIdParam)));
      // Mock fetch for editing
      setTimeout(() => {
        setWorkflow({
          id: 1,
          name: 'Content Approval',
          description: 'Standard draft, review, publish flow for content entries.',
          entityType: 'content_entry',
          isActive: true,
          stages: [
            { id: 1, name: 'Draft', order: 1, isInitial: true },
            { id: 2, name: 'Review', order: 2 },
            { id: 3, name: 'Published', order: 3, isFinal: true },
          ],
          transitions: [
            { id: 1, name: 'Submit for Review', fromStageId: 1, toStageId: 2 },
            { id: 2, name: 'Approve & Publish', fromStageId: 2, toStageId: 3 },
            { id: 3, name: 'Reject', fromStageId: 2, toStageId: 1 },
          ],
        });
        setIsLoading(false);
      }, 700);
    } else {
      // Initialize for new workflow
      setWorkflow({
        name: '',
        description: '',
        entityType: '', // Maybe provide a select dropdown?
        isActive: true,
        stages: [],
        transitions: [],
      });
      setIsLoading(false);
    }
  }, [workflowIdParam, isNew]); // dispatch

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setWorkflow((prev) => (prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : null));
  };

  const handleSaveWorkflow = async () => {
    if (!workflow) return;
    console.log('Saving workflow:', workflow);
    setIsSaving(true);
    setError(null);
    // try {
    //   await dispatch(saveWorkflowDefinition(workflow)).unwrap();
    //   navigate('/manage/workflows'); // Redirect on success
    // } catch (err: unknown) { // Use unknown
    //   setError((err as Error)?.message || 'Failed to save workflow');
    // } finally {
    //   setIsSaving(false);
    // }
    // Mock save
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    // navigate('/manage/workflows');
    console.log('Workflow saved (mock)');
  };

  // --- Placeholder functions for Stage/Transition Management ---
  const handleAddStage = () => console.log('Add Stage clicked');
  const handleEditStage = (stage: WorkflowStageData) => console.log('Edit Stage:', stage);
  const handleDeleteStage = (stageId: string | number) => console.log('Delete Stage:', stageId);
  const handleMoveStage = (stageId: string | number, direction: 'up' | 'down') =>
    console.log(`Move Stage ${stageId} ${direction}`);

  const handleAddTransition = () => console.log('Add Transition clicked');
  const handleEditTransition = (transition: WorkflowTransitionData) =>
    console.log('Edit Transition:', transition);
  const handleDeleteTransition = (transitionId: string | number) =>
    console.log('Delete Transition:', transitionId);
  // --- End Placeholders ---

  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !workflow) {
    // Show error only if loading failed completely
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!workflow) {
    // Should not happen if not loading and no error, but good practice
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="info">Initializing workflow...</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton
          /* onClick={() => navigate('/manage/workflows')} */ aria-label="back to workflows"
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isNew ? 'Create New Workflow' : `Edit Workflow: ${workflow.name}`}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Workflow Details Form */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <TextField
              label="Workflow Name"
              name="name"
              fullWidth
              required
              value={workflow.name}
              onChange={handleInputChange}
              margin="normal"
              disabled={isSaving}
            />
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={workflow.description}
              onChange={handleInputChange}
              margin="normal"
              disabled={isSaving}
            />
            <TextField
              label="Entity Type"
              name="entityType"
              fullWidth
              required
              value={workflow.entityType}
              onChange={handleInputChange}
              margin="normal"
              disabled={isSaving || !isNew} // Don't allow changing entity type after creation
              helperText="e.g., content_entry, user"
            />
            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={workflow.isActive}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              }
              label="Active"
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>

        {/* Stages & Transitions */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Stages</Typography>
              <Button startIcon={<AddIcon />} onClick={handleAddStage} size="small">
                Add Stage
              </Button>
            </Box>
            <List dense disablePadding>
              {workflow.stages
                .sort((a, b) => a.order - b.order)
                .map((stage, index) => (
                  <ListItem key={stage.id} divider>
                    <ListItemText
                      primary={stage.name}
                      secondary={
                        <React.Fragment>
                          {stage.description}
                          <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                            {stage.isInitial && (
                              <Chip size="small" label="Initial" sx={{ mr: 0.5 }} />
                            )}
                            {stage.isFinal && <Chip size="small" label="Final" sx={{ mr: 0.5 }} />}
                          </Box>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Move Up">
                        <span>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleMoveStage(stage.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move Down">
                        <span>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleMoveStage(stage.id, 'down')}
                            disabled={index === workflow.stages.length - 1}
                            sx={{ ml: 0.5 }}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit Stage">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleEditStage(stage)}
                          sx={{ ml: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Stage">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDeleteStage(stage.id)}
                          sx={{ ml: 0.5 }}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              {workflow.stages.length === 0 && (
                <ListItem>
                  <ListItemText primary="No stages defined." />
                </ListItem>
              )}
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Transitions</Typography>
              <Button startIcon={<AddIcon />} onClick={handleAddTransition} size="small">
                Add Transition
              </Button>
            </Box>
            <List dense disablePadding>
              {workflow.transitions.map((trans) => (
                <ListItem key={trans.id} divider>
                  <ListItemText
                    primary={trans.name}
                    secondary={`From: ${workflow.stages.find((s) => s.id === trans.fromStageId)?.name || '?'} → To: ${workflow.stages.find((s) => s.id === trans.toStageId)?.name || '?'}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit Transition">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleEditTransition(trans)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Transition">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDeleteTransition(trans.id)}
                        sx={{ ml: 0.5 }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {workflow.transitions.length === 0 && (
                <ListItem>
                  <ListItemText primary="No transitions defined." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveWorkflow}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : isNew ? 'Create Workflow' : 'Save Changes'}
        </Button>
      </Box>

      {/* TODO: Add Modals/Dialogs for Stage and Transition forms */}
    </Container>
  );
};

export default WorkflowEditPage;
