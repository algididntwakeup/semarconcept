import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  // Box, // Removed unused Box import
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfigurationItemData as SharedConfigurationItemData } from '../../../types/systemConfiguration';

interface ConfigurationListProps {
  configurations: SharedConfigurationItemData[];
  onEdit: (config: SharedConfigurationItemData) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean; // Optional loading state
}

const ConfigurationList: React.FC<ConfigurationListProps> = ({
  configurations,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return <Typography>Loading configurations...</Typography>; // Simple loading indicator
  }

  if (!configurations || configurations.length === 0) {
    return <Typography>No configurations found.</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="configuration table">
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {configurations.map((config) => (
            <TableRow key={config.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {config.key}
              </TableCell>
              <TableCell>
                {config.isEncrypted ? config.valuePlaceholder || '********' : config.value}
              </TableCell>
              <TableCell>{config.categoryId}</TableCell>
              {/* This will display the ID. Parent should provide name or a map for lookup. */}
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton onClick={() => onEdit(config)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => onDelete(config.id)} size="small" sx={{ ml: 1 }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ConfigurationList;
