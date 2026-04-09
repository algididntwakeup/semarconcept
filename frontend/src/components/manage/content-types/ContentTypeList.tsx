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
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ContentTypeData } from '../../../types/contentType'; // Use the shared type

interface ContentTypeListProps {
  contentTypes: ContentTypeData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean; // Optional loading state for the list itself
}

const ContentTypeList: React.FC<ContentTypeListProps> = ({
  contentTypes,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return <Typography sx={{ textAlign: 'center', my: 2 }}>Loading...</Typography>;
  }

  if (!contentTypes || contentTypes.length === 0) {
    return <Typography sx={{ textAlign: 'center', my: 2 }}>No content types found.</Typography>;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }} aria-label="content types table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>API Key</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="center">Fields</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contentTypes.map((contentType) => (
            <TableRow
              key={contentType.id}
              sx={{ '&amp;:last-child td, &amp;:last-child th': { border: 0 } }}
              hover
            >
              <TableCell component="th" scope="row">
                {contentType.name}
              </TableCell>
              <TableCell>
                <Box component="code" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {contentType.apiKey}
                </Box>
              </TableCell>
              <TableCell>{contentType.description || '-'}</TableCell>
              <TableCell align="center">{contentType.fields?.length || 0}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edit Content Type">
                  <IconButton onClick={() => onEdit(contentType.id)} size="small" color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Content Type">
                  <IconButton
                    onClick={() => onDelete(contentType.id)}
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                  >
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

export default ContentTypeList;
