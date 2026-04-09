import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Search } from '@mui/icons-material';

interface MaintenanceHistoryPageData {
  id: string;
  name: string;
  status: string;
  lastUpdated: string;
}

const mockData: MaintenanceHistoryPageData[] = [
  { id: '1', name: 'Item 1', status: 'Active', lastUpdated: '2025-01-15' },
  { id: '2', name: 'Item 2', status: 'Inactive', lastUpdated: '2025-01-14' },
  { id: '3', name: 'Item 3', status: 'Pending', lastUpdated: '2025-01-13' },
];

const MaintenanceHistoryPage: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Maintenance History
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        View and analyze historical maintenance records and trends.
      </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h3" color="primary">
                {mockData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Active Items
              </Typography>
              <Typography variant="h3" color="success.main">
                {mockData.filter(item => item.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Pending Items
              </Typography>
              <Typography variant="h3" color="warning.main">
                {mockData.filter(item => item.status === 'Pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Inactive Items
              </Typography>
              <Typography variant="h3" color="error.main">
                {mockData.filter(item => item.status === 'Inactive').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Manage Maintenance History
        </Typography>
        <Box>
          <Button variant="outlined" startIcon={<Search />} sx={{ mr: 1 }}>
            Search
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            Add New
          </Button>
        </Box>
      </Paper>

            <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    color={
                      row.status === 'Active' ? 'success' :
                      row.status === 'Pending' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{row.lastUpdated}</TableCell>
                <TableCell align="right">
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MaintenanceHistoryPage;
