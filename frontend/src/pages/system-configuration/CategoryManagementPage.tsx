import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  // DialogActions, // Removed as it's not used
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryList from '../../components/system-configuration/CategoryList';
import CategoryForm, { CategoryFormData } from '../../components/system-configuration/CategoryForm';
import { CategoryData } from '../../types/systemConfiguration';

// Mock API service (replace with actual service calls)
const mockApiService = {
  fetchCategories: async (): Promise<CategoryData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Retrieve from localStorage or return a default mock
    const storedCategories = localStorage.getItem('mockCategories');
    if (storedCategories) {
      return JSON.parse(storedCategories);
    }
    return [
      { id: 'cat1', name: 'General', description: 'General system settings' },
      { id: 'cat2', name: 'Appearance', description: 'UI theme and layout settings' },
      { id: 'cat3', name: 'Security', description: 'Security-related configurations' },
    ];
  },
  addCategory: async (data: CategoryFormData): Promise<CategoryData> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newCategory: CategoryData = { ...data, id: `cat${Date.now()}` };
    // Persist to localStorage
    const categories = await mockApiService.fetchCategories();
    const updatedCategories = [...categories, newCategory];
    localStorage.setItem('mockCategories', JSON.stringify(updatedCategories));
    return newCategory;
  },
  updateCategory: async (id: string, data: CategoryFormData): Promise<CategoryData> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const categories = await mockApiService.fetchCategories();
    const categoryIndex = categories.findIndex((cat) => cat.id === id);
    if (categoryIndex === -1) throw new Error('Category not found');
    const updatedCategory = { ...categories[categoryIndex], ...data };
    categories[categoryIndex] = updatedCategory;
    localStorage.setItem('mockCategories', JSON.stringify(categories));
    return updatedCategory;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let categories = await mockApiService.fetchCategories();
    categories = categories.filter((cat) => cat.id !== id);
    localStorage.setItem('mockCategories', JSON.stringify(categories));
  },
};

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await mockApiService.fetchCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenForm = (category?: CategoryData) => {
    setEditingCategory(category || null);
    setIsFormOpen(true);
    setSubmitError(null); // Clear previous submit errors
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (editingCategory) {
        await mockApiService.updateCategory(editingCategory.id, data);
      } else {
        await mockApiService.addCategory(data);
      }
      handleCloseForm();
      loadCategories(); // Refresh list
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Optional: Add a confirmation dialog here
    if (window.confirm('Are you sure you want to delete this category?')) {
      setIsLoading(true); // Indicate activity
      try {
        await mockApiService.deleteCategory(categoryId);
        loadCategories(); // Refresh list
      } catch (err) {
        setError('Failed to delete category.'); // Show error on main page for this
        console.error(err);
        setIsLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Category Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h6" gutterBottom component="div">
          Existing Categories
        </Typography>
        {isLoading && categories.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <CategoryList
            categories={categories}
            loading={isLoading && categories.length > 0} // Show spinner over list if loading more
            error={null} // Main error is handled above list
            onEdit={handleOpenForm}
            onDelete={handleDeleteCategory}
          />
        )}
      </Paper>

      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          {/* Conditionally render form or a message if needed */}
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </DialogContent>
        {/* Actions can be part of CategoryForm or here */}
        {/* <DialogActions>
          <Button onClick={handleCloseForm} color="inherit">Cancel</Button>
          <Button onClick={() => document.getElementById('category-form-submit-button')?.click()} color="primary">
            {editingCategory ? 'Save Changes' : 'Add Category'}
          </Button>
        </DialogActions> */}
      </Dialog>
    </Container>
  );
};

export default CategoryManagementPage;