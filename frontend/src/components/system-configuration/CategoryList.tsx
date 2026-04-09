import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CategoryData } from '../../types/systemConfiguration';

interface CategoryListProps {
  categories: CategoryData[];
  loading: boolean;
  error: string | null;
  onEdit: (category: CategoryData) => void;
  onDelete: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!categories || categories.length === 0) {
    return <Typography>No categories found. Add one using the form above.</Typography>;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table aria-label="category list table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {category.name}
              </TableCell>
              <TableCell>{category.description || '-'}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edit Category">
                  <IconButton
                    onClick={() => onEdit(category)}
                    color="primary"
                    aria-label={`edit category ${category.name}`}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Category">
                  <IconButton
                    onClick={() => onDelete(category.id)}
                    color="error"
                    aria-label={`delete category ${category.name}`}
                  >
                    <DeleteIcon />
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

export default CategoryList;
