// platform/frontend-mui/src/pages/dashboard/DashboardCompliancePage.tsx
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
  VerifiedUser as VerifiedUserIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const DashboardCompliancePage: React.FC = () => {
  const theme = useTheme();

  // Sample data
  const complianceStats = {
    totalRequirements: 178,
    compliant: 142,
    nonCompliant: 23,
    pending: 13,
    overallScore: 80
  };

  const complianceRate = Math.round((complianceStats.compliant / complianceStats.totalRequirements) * 100);

  const recentActivities = [
    { 
      id: 'COMP-001', 
      title: 'API 570 Inspection Review', 
      type: 'Standard', 
      status: 'Compliant', 
      dueDate: '2025-06-15',
      priority: 'High'
    },
    { 
      id: 'COMP-002', 
      title: 'Environmental Audit', 
      type: 'Audit', 
      status: 'In Progress', 
      dueDate: '2025-06-20',
      priority: 'Medium'
    },
    { 
      id: 'COMP-003', 
      title: 'Safety Certification Renewal', 
      type: 'Certification', 
      status: 'Overdue', 
      dueDate: '2025-06-05',
      priority: 'Critical'
    },
    { 
      id: 'COMP-004', 
      title: 'Quality Management Review', 
      type: 'Standard', 
      status: 'Pending', 
      dueDate: '2025-06-25',
      priority: 'Low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'success';
      case 'In Progress': return 'info';
      case 'Overdue': return 'error';
      case 'Pending': return 'warning';
      case 'Non-Compliant': return 'error';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Standard': return <AssignmentIcon />;
      case 'Audit': return <AssessmentIcon />;
      case 'Certification': return <VerifiedUserIcon />;
      default: return <AssignmentIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Compliance Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Monitor compliance status, track audit activities, and manage certifications to ensure regulatory adherence.
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="primary">
                Total Requirements
              </Typography>
              <Typography variant="h3" color="primary">
                {complianceStats.totalRequirements}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All compliance items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="success.main">
                Compliant
              </Typography>
              <Typography variant="h3" color="success.main">
                {complianceStats.compliant}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {complianceRate}% compliance rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="error.main">
                Non-Compliant
              </Typography>
              <Typography variant="h3" color="error.main">
                {complianceStats.nonCompliant}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Require immediate action
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="warning.main">
                Pending Review
              </Typography>
              <Typography variant="h3" color="warning.main">
                {complianceStats.pending}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Awaiting assessment
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: '1.5rem' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom color="info.main">
                Overall Score
              </Typography>
              <Typography variant="h3" color="info.main">
                {complianceStats.overallScore}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Compliance rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Compliance Progress */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: 400, borderRadius: '1.5rem' }}>
            <Typography variant="h6" gutterBottom>
              Compliance Performance Overview
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Compliance Rate</Typography>
                <Typography variant="body2">{complianceRate}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={complianceRate} 
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
                Compliance Trends Chart Placeholder
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Compliance Activities */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: 400, borderRadius: '1.5rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Activities
              </Typography>
              <Button size="small" variant="outlined">
                View All
              </Button>
            </Box>
            <List sx={{ height: 320, overflow: 'auto' }}>
              {recentActivities.map((activity) => (
                <ListItem 
                  key={activity.id} 
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
                    <Avatar sx={{ width: 32, height: 32, bgcolor: getPriorityColor(activity.priority) + '.main' }}>
                      {getTypeIcon(activity.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {activity.title}
                        </Typography>
                        <Chip 
                          label={activity.status} 
                          size="small" 
                          color={getStatusColor(activity.status)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {activity.type} | Due: {activity.dueDate}
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
                  New Compliance Task
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AssessmentIcon />}
                  sx={{ py: 1.5 }}
                >
                  Schedule Audit
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<WarningIcon />}
                  sx={{ py: 1.5 }}
                >
                  View Non-Compliant
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<VerifiedUserIcon />}
                  sx={{ py: 1.5 }}
                >
                  Manage Certifications
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardCompliancePage;