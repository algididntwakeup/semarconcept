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
// import { fetchReportTemplates, deleteReportTemplate, toggleTemplateStatus } from '../../store/slices/reportSlice'; // To be created

// Placeholder type matching backend model (simplified)
interface ReportTemplateInfo {
  id: number; // Assuming uint maps to number
  name: string;
  description: string;
  dataSource: string;
  outputType: string;
  isActive: boolean;
}

const ReportTemplateListPage: React.FC = () => {
  // const navigate = useNavigate();
  // const dispatch = useDispatch<AppDispatch>();
  // const { templates, loading, error } = useSelector((state: RootState) => state.report); // To be created

  // Placeholder state
  const [templates, setTemplates] = useState<ReportTemplateInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // dispatch(fetchReportTemplates());
    // Mock fetch
    setTimeout(() => {
      setTemplates([
        { id: 1, name: 'User List Export', description: 'Exports active users to CSV.', dataSource: 'users', outputType: 'csv', isActive: true },
        { id: 2, name: 'Monthly Sales Report', description: 'PDF report summarizing monthly sales.', dataSource: 'orders', outputType: 'pdf', isActive: true },
        { id: 3, name: 'Content Audit Log', description: 'Detailed log of content changes.', dataSource: 'audit_log', outputType: 'csv', isActive: false },
      ]);
      setIsLoading(false);
    }, 600);
  }, []); // dispatch

  const handleAddNew = () => {
    // navigate('/reporting/templates/new');
    console.log('Navigate to new report template page');
  };

  const handleEdit = (id: number) => {
    // navigate(`/reporting/templates/edit/${id}`);
    console.log('Navigate to edit report template page:', id);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the report template "${name}"?`)) {
      console.log('Deleting report template:', id);
      setError(null);
      // TODO: dispatch(deleteReportTemplate(id));
      // Mock delete
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

   const handleToggleStatus = (id: number, currentStatus: boolean) => {
     console.log(`Toggling status for template ${id} from ${currentStatus}`);
     setError(null);
     // TODO: dispatch(toggleTemplateStatus({id, isActive: !currentStatus}));
     // Mock toggle
     setTemplates(prev => prev.map(t => t.id === id ? {...t, isActive: !currentStatus} : t));
   };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Report Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Create Template
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 0 }}>
        <TableContainer>
          <Table stickyHeader aria-label="report templates table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Data Source</TableCell>
                <TableCell>Output Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No report templates found.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((tmpl) => (
                  <TableRow hover key={tmpl.id}>
                    <TableCell component="th" scope="row">{tmpl.name}</TableCell>
                    <TableCell>{tmpl.dataSource}</TableCell>
                    <TableCell>{tmpl.outputType.toUpperCase()}</TableCell>
                    <TableCell>{tmpl.description}</TableCell>
                    <TableCell align="center">
                       <Switch
                        checked={tmpl.isActive}
                        onChange={() => handleToggleStatus(tmpl.id, tmpl.isActive)}
                        inputProps={{ 'aria-label': `toggle ${tmpl.name} status` }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Template">
                        <IconButton size="small" onClick={() => handleEdit(tmpl.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                       <Tooltip title="Delete Template">
                        <IconButton size="small" color="error" onClick={() => handleDelete(tmpl.id, tmpl.name)} sx={{ ml: 1 }}>
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

export default ReportTemplateListPage;