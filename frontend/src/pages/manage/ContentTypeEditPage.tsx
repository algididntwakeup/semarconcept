import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  // Box, // Box is not directly used, Paper implies Box usually
  Paper,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  // TextField, // Will be handled by ContentTypeForm
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchContentTypeById, createContentType, updateExistingContentType } from '../../store/slices/contentTypeSlice';
import ContentTypeForm from '../../components/manage/content-types/ContentTypeForm';
import FieldManager from '../../components/manage/content-types/FieldManager';
import { ContentTypeData, ContentTypeField, ContentTypeFormData } from '../../types/contentType';

// Mock API service (replace with actual service calls or Redux)
const mockContentTypeApiService = {
  fetchContentTypeById: async (id: string): Promise<ContentTypeData | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const storedData = localStorage.getItem('mockContentTypes');
    if (storedData) {
      const types: ContentTypeData[] = JSON.parse(storedData);
      return types.find((type) => type.id === id) || null;
    }
    // Fallback mock if nothing in localStorage (e.g., for a new type or direct navigation)
    if (id === '1') {
      return {
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
      };
    }
    return null;
  },
  createContentType: async (data: ContentTypeFormData): Promise<ContentTypeData> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newId = `ct-${Date.now()}`;
    const newContentType: ContentTypeData = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const types = JSON.parse(localStorage.getItem('mockContentTypes') || '[]') as ContentTypeData[];
    types.push(newContentType);
    localStorage.setItem('mockContentTypes', JSON.stringify(types));
    return newContentType;
  },
  updateContentType: async (id: string, data: ContentTypeFormData): Promise<ContentTypeData> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const types = JSON.parse(localStorage.getItem('mockContentTypes') || '[]') as ContentTypeData[];
    const index = types.findIndex((type) => type.id === id);
    if (index === -1) throw new Error('Content type not found');
    types[index] = { ...types[index], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem('mockContentTypes', JSON.stringify(types));
    return types[index];
  },
};

const ContentTypeEditPage: React.FC = () => {
  const { id: contentTypeIdParam } = useParams<{ id: string }>(); // URL param for editing
  const navigate = useNavigate();
  // const dispatch = useDispatch<AppDispatch>();
  // const { currentContentType, loading, error: reduxError } = useSelector((state: RootState) => state.contentTypes);

  const [contentTypeData, setContentTypeData] = useState<ContentTypeData | null>(null);
  // Fields state will be managed within contentTypeData.fields
  const [isLoading, setIsLoading] = useState(!!contentTypeIdParam); // Load if ID is present
  const [currentTab, setCurrentTab] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNew = !contentTypeIdParam;

  useEffect(() => {
    if (contentTypeIdParam) {
      setIsLoading(true);
      mockContentTypeApiService
        .fetchContentTypeById(contentTypeIdParam)
        .then((data) => {
          setContentTypeData(data);
          if (!data) {
            setSubmitError(`Content type with ID ${contentTypeIdParam} not found.`);
          }
        })
        .catch((err) => {
          console.error(err);
          setSubmitError('Failed to load content type details.');
        })
        .finally(() => setIsLoading(false));
    } else {
      // For a new content type, initialize with empty/default values
      setContentTypeData({
        id: '', // Will be set on save
        name: '',
        apiKey: '',
        description: '',
        fields: [],
      });
      setIsLoading(false);
    }
  }, [contentTypeIdParam]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleFormSubmit = async (formData: ContentTypeFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let savedData;
      if (isNew) {
        savedData = await mockContentTypeApiService.createContentType(formData);
        navigate(`/manage/content-types/edit/${savedData.id}`, { replace: true }); // Navigate to edit page of new type
      } else if (contentTypeData) {
        savedData = await mockContentTypeApiService.updateContentType(contentTypeData.id, formData);
        setContentTypeData(savedData); // Update local state with saved data (e.g., new updatedAt)
      }
      // Optionally show success message
    } catch (err) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to save content type.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleFieldsChange = (updatedFields: ContentTypeField[]) => { // No longer directly used
  //   if (contentTypeData) {
  //     setContentTypeData((prevData) => (prevData ? { ...prevData, fields: updatedFields } : null));
  //   }
  // };

  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Loading Content Type...</Typography>
      </Container>
    );
  }

  if (!contentTypeData && !isNew) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{submitError || 'Content type not found.'}</Alert>
        <Button onClick={() => navigate('/manage/content-types')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Container>
    );
  }

  // This check is for when creating new, contentTypeData is initialized but not "loaded"
  if (!contentTypeData && isNew) {
    // This case should ideally not be hit if initialization in useEffect works
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="warning">Initializing new content type...</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isNew ? 'Create New Content Type' : `Edit Content Type: ${contentTypeData?.name || ''}`}
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="content type edit tabs">
          <Tab label="Details" />
          <Tab label="Fields" disabled={isNew && !contentTypeData?.id} />{' '}
          {/* Disable fields tab if new and not yet saved (no ID) */}
          <Tab label="Settings" disabled={isNew && !contentTypeData?.id} />
        </Tabs>
      </Paper>

      {currentTab === 0 && contentTypeData && (
        <ContentTypeForm
          initialData={contentTypeData}
          onSubmit={handleFormSubmit}
          onCancel={() => navigate('/manage/content-types')}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}

      {currentTab === 1 &&
        contentTypeData &&
        contentTypeData.id && ( // Only show if editing an existing type
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Manage Fields
            </Typography>
            <FieldManager
              contentTypeId={contentTypeData.id}
              fields={contentTypeData.fields}
              setFields={(newFieldsOrUpdater) => {
                if (contentTypeData) {
                  setContentTypeData((prevData) => {
                    if (!prevData) return null;
                    const updatedFieldsValue =
                      typeof newFieldsOrUpdater === 'function'
                        ? newFieldsOrUpdater(prevData.fields)
                        : newFieldsOrUpdater;
                    return { ...prevData, fields: updatedFieldsValue };
                  });
                }
              }}
            />
          </Paper>
        )}

      {currentTab === 2 && contentTypeData && contentTypeData.id && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Content Type Settings
          </Typography>
          <Typography>
            Additional settings for this content type (ID: {contentTypeData.id}) will go here.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ContentTypeEditPage;
