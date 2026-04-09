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

interface AnalyticsCustomReportsPageData {
  id: string;
  name: string;
  status: string;
  lastUpdated: string;
}

const mockData: AnalyticsCustomReportsPageData[] = [
  { id: '1', name: 'Item 1', status: 'Active', lastUpdated: '2025-01-15' },
  { id: '2', name: 'Item 2', status: 'Inactive', lastUpdated: '2025-01-14' },
  { id: '3', name: 'Item 3', status: 'Pending', lastUpdated: '2025-01-13' },
];

const AnalyticsCustomReportsPage: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Custom Reports
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Create and manage custom analytics reports and dashboards.
      </Typography>

      

      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Manage Custom Reports
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

export default AnalyticsCustomReportsPage;
