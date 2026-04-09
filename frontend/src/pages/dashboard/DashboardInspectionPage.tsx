// platform/frontend-mui/src/pages/dashboard/DashboardInspectionPage.tsx
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  IconButton
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const DashboardInspectionPage: React.FC = () => {
  const theme = useTheme();

  // Sample data
  const inspectionStats = {
    total: 456,
    completed: 289,
    pending: 89,
    overdue: 34,
    scheduled: 44
  };

  const completionRate = Math.round((inspectionStats.completed / inspectionStats.total) * 100);

  const recentInspections = [
    { id: 'INS-001', asset: 'Pump A-101', type: 'Visual', status: 'Completed', date: '2025-06-09' },
    { id: 'INS-002', asset: 'Tank B-205', type: 'NDT', status: 'In Progress', date: '2025-06-10' },
    { id: 'INS-003', asset: 'Valve C-301', type: 'Functional', status: 'Overdue', date: '2025-06-08' },
    { id: 'INS-004', asset: 'Pipe D-410', type: 'Thickness', status: 'Scheduled', date: '2025-06-12' },
    { id: 'INS-005', asset: 'Motor E-511', type: 'Vibration', status: 'Completed', date: '2025-06-09' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Overdue': return 'error';
      case 'Scheduled': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon />;
      case 'In Progress': return <PlayArrowIcon />;
      case 'Overdue': return <CancelIcon />;
      case 'Scheduled': return <ScheduleIcon />;
      default: return <AssessmentIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Inspection Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Monitor inspection activities, track completion rates, and manage inspection schedules across all assets.
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="primary">
                Total Inspections
              </Typography>
              <Typography variant="h3" color="primary">
                {inspectionStats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All planned inspections
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="success.main">
                Completed
              </Typography>
              <Typography variant="h3" color="success.main">
                {inspectionStats.completed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {completionRate}% completion rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="info.main">
                In Progress
              </Typography>
              <Typography variant="h3" color="info.main">
                {inspectionStats.pending}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Currently active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="error.main">
                Overdue
              </Typography>
              <Typography variant="h3" color="error.main">
                {inspectionStats.overdue}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Require immediate attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="warning.main">
                Scheduled
              </Typography>
              <Typography variant="h3" color="warning.main">
                {inspectionStats.scheduled}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Upcoming this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Progress */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400, borderRadius: '1.5rem' }}>
            <Typography variant="h6" gutterBottom>
              Inspection Completion Progress
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Overall Progress</Typography>
                <Typography variant="body2">{completionRate}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={completionRate} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            
            <Box 
              sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: theme.palette.grey[50],
                borderRadius: 1
              }}
            >
              <Typography variant="body1" color="textSecondary">
                Inspection Trend Chart Placeholder
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Inspections */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 400, borderRadius: '1.5rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Inspections
              </Typography>
              <Button size="small" variant="outlined">
                View All
              </Button>
            </Box>
            <List sx={{ height: 320, overflow: 'auto' }}>
              {recentInspections.map((inspection) => (
                <ListItem 
                  key={inspection.id} 
                  sx={{ 
                    mb: 1, 
                    backgroundColor: theme.palette.grey[50], 
                    borderRadius: 1,
                    px: 2
                  }}
                  secondaryAction={
                    <IconButton edge="end" size="small">
                      <VisibilityIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {getStatusIcon(inspection.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {inspection.asset}
                        </Typography>
                        <Chip 
                          label={inspection.status} 
                          size="small" 
                          color={getStatusColor(inspection.status)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {inspection.type} | {inspection.date}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: '1.5rem' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AssessmentIcon />}
                  sx={{ py: 1.5 }}
                >
                  New Inspection Plan
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  sx={{ py: 1.5 }}
                >
                  Schedule Inspection
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<WarningIcon />}
                  sx={{ py: 1.5 }}
                >
                  View Overdue
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  sx={{ py: 1.5 }}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardInspectionPage;