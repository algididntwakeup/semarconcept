// platform/frontend-mui/src/pages/dashboard/DashboardMaintenancePage.tsx
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
  IconButton,
  Avatar
} from '@mui/material';
import {
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon
} from '@mui/icons-material';

const DashboardMaintenancePage: React.FC = () => {
  const theme = useTheme();

  // Sample data
  const maintenanceStats = {
    totalWorkOrders: 234,
    completed: 156,
    inProgress: 45,
    overdue: 18,
    scheduled: 15
  };

  const completionRate = Math.round((maintenanceStats.completed / maintenanceStats.totalWorkOrders) * 100);

  const recentWorkOrders = [
    { 
      id: 'WO-001', 
      asset: 'Pump A-101', 
      type: 'Preventive', 
      status: 'In Progress', 
      assignee: 'John Doe',
      priority: 'High',
      dueDate: '2025-06-11' 
    },
    { 
      id: 'WO-002', 
      asset: 'Tank B-205', 
      type: 'Corrective', 
      status: 'Completed', 
      assignee: 'Jane Smith',
      priority: 'Medium',
      dueDate: '2025-06-09' 
    },
    { 
      id: 'WO-003', 
      asset: 'Valve C-301', 
      type: 'Emergency', 
      status: 'Overdue', 
      assignee: 'Bob Wilson',
      priority: 'Critical',
      dueDate: '2025-06-08' 
    },
    { 
      id: 'WO-004', 
      asset: 'Motor E-511', 
      type: 'Predictive', 
      status: 'Scheduled', 
      assignee: 'Alice Brown',
      priority: 'Low',
      dueDate: '2025-06-13' 
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Maintenance Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Track maintenance work orders, monitor completion rates, and manage maintenance schedules for optimal asset performance.
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="primary">
                Total Work Orders
              </Typography>
              <Typography variant="h3" color="primary">
                {maintenanceStats.totalWorkOrders}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All maintenance activities
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
                {maintenanceStats.completed}
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
                {maintenanceStats.inProgress}
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
                {maintenanceStats.overdue}
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
                {maintenanceStats.scheduled}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Upcoming this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance Progress */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400, borderRadius: '1.5rem' }}>
            <Typography variant="h6" gutterBottom>
              Maintenance Performance Trends
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Overall Completion Rate</Typography>
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
                Maintenance Trend Chart Placeholder
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Work Orders */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 400, borderRadius: '1.5rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Work Orders
              </Typography>
              <Button size="small" variant="outlined">
                View All
              </Button>
            </Box>
            <List sx={{ height: 320, overflow: 'auto' }}>
              {recentWorkOrders.map((workOrder) => (
                <ListItem 
                  key={workOrder.id} 
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
                    <Avatar sx={{ width: 32, height: 32, bgcolor: getPriorityColor(workOrder.priority) + '.main' }}>
                      <BuildIcon fontSize="small" />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {workOrder.asset}
                        </Typography>
                        <Chip 
                          label={workOrder.status} 
                          size="small" 
                          color={getStatusColor(workOrder.status)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {workOrder.type} | Due: {workOrder.dueDate}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          Assigned: {workOrder.assignee}
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
                  startIcon={<AddIcon />}
                  sx={{ py: 1.5 }}
                >
                  Create Work Order
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  sx={{ py: 1.5 }}
                >
                  Schedule Maintenance
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<WarningIcon />}
                  sx={{ py: 1.5 }}
                >
                  View Overdue Tasks
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PersonIcon />}
                  sx={{ py: 1.5 }}
                >
                  Assign Resources
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardMaintenancePage;
