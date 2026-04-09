import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Paper, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchContentTypes, deleteContentType } from '../../store/slices/contentTypeSlice'; // To be created
import ContentTypeList from '../../components/manage/content-types/ContentTypeList'; // Will use this
import { ContentTypeData } from '../../types/contentType'; // Use the new type

// Mock API service (replace with actual service calls or Redux)
const mockContentTypeApiService = {
  fetchContentTypes: async (): Promise<ContentTypeData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const storedData = localStorage.getItem('mockContentTypes');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return [
      {
        id: '1',
        name: 'Blog Post',
        apiKey: 'blog_posts',
        description: 'Standard blog articles',
        fields: [
          { id: 'f1', name: 'Title', apiKey: 'title', type: 'text', isRequired: true },
          { id: 'f2', name: 'Body', apiKey: 'body', type: 'textarea' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Product',
        apiKey: 'products',
        description: 'E-commerce products',
        fields: [
          {
            id: 'p1',
            name: 'Product Name',
            apiKey: 'product_name',
            type: 'text',
            isRequired: true,
          },
          { id: 'p2', name: 'Price', apiKey: 'price', type: 'number', isRequired: true },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  },
  deleteContentType: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let types = await mockContentTypeApiService.fetchContentTypes();
    types = types.filter((type) => type.id !== id);
    localStorage.setItem('mockContentTypes', JSON.stringify(types));
    console.log(`Mock deleted content type with id: ${id}`);
  },
};

const ContentTypeListPage: React.FC = () => {
  const navigate = useNavigate();
  // const dispatch = useDispatch<AppDispatch>();
  // const { contentTypes, loading, error } = useSelector((state: RootState) => state.contentTypes);

  const [contentTypes, setContentTypes] = useState<ContentTypeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [deleteError, setDeleteError] = useState<string | null>(null); // Can be merged into general 'error'

  const loadContentTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await mockContentTypeApiService.fetchContentTypes();
      setContentTypes(data);
    } catch (err) {
      setError('Failed to load content types.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContentTypes();
  }, []);

  const handleAddNew = () => {
    navigate('/manage/content-types/new');
  };

  const handleEdit = (contentTypeId: string) => {
    navigate(`/manage/content-types/edit/${contentTypeId}`);
  };

  const handleDelete = async (contentTypeId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this content type and all its entries? This action cannot be undone.'
      )
    ) {
      setIsLoading(true); // Indicate activity
      // setDeleteError(null);
      setError(null);
      try {
        await mockContentTypeApiService.deleteContentType(contentTypeId);
        loadContentTypes(); // Refresh list
      } catch (err) {
        let message = 'Failed to delete content type.';
        if (err instanceof Error) {
          message = err.message;
        } else if (typeof err === 'string') {
          message = err;
        }
        setError(message);
        console.error(err);
        setIsLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Content Types
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>
          Add New Type
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        {isLoading && contentTypes.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : !isLoading && contentTypes.length === 0 && !error ? (
          <Typography>No content types found. Click "Add New Type" to create one.</Typography>
        ) : (
          <ContentTypeList
            contentTypes={contentTypes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            // Pass isLoading for individual row actions if needed, or rely on main page loading state
          />
        )}
      </Paper>
    </Container>
  );
};

export default ContentTypeListPage;
