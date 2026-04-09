import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConfigurations,
  addNewConfiguration,
  updateExistingConfiguration,
  deleteExistingConfiguration,
  // Assuming RootState is defined in your store setup, e.g., store/index.ts
  // and specific selectors might be in the slice or created here.
  // For now, we'll select directly or assume they are part of a RootState type.
} from '../../store/slices/configurationSlice';
import { RootState, AppDispatch } from '../../store'; // Adjust path if your store is elsewhere
import {
  Typography,
  Container,
  Paper,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ConfigurationList from '../../components/manage/system-config/ConfigurationList';
import ConfigurationForm from '../../components/manage/system-config/ConfigurationForm';
import {
  ConfigurationItemData as SharedConfigurationItemData,
  CategoryData,
} from '../../types/systemConfiguration';

// This interface represents the structure of configuration items from the Redux store
interface ReduxStoreConfigurationItem {
  id: string;
  key: string;
  value: string;
  category: string; // Assumed to be the category ID in the Redux store
  description?: string;
  isEncrypted: boolean;
  // Add other fields if present in the Redux state
}

// Type for form data, aligning with ConfigurationForm's expectation
type ConfigurationFormData = Omit<
  SharedConfigurationItemData,
  'id' | 'valuePlaceholder' | 'categoryId'
> & {
  category: string; // This will hold the categoryId from the form's 'category' field
};

// Mock service for categories (replace with actual Redux selector or service)
const mockCategoryService = {
  fetchCategories: async (): Promise<CategoryData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const storedCategories = localStorage.getItem('mockCategories');
    if (storedCategories) {
      return JSON.parse(storedCategories);
    }
    return [
      { id: 'cat1', name: 'General', description: 'General settings' },
      { id: 'cat_api', name: 'API Configuration', description: 'API related settings' },
      { id: 'cat_ui', name: 'UI Settings', description: 'User Interface settings' },
    ];
  },
};

const SystemConfigurationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    configurations: reduxConfigurationsUntyped,
    loading: configurationsLoading,
    error: configurationsError,
  } = useSelector((state: RootState) => state.configurations);

  const reduxConfigurations: ReduxStoreConfigurationItem[] =
    reduxConfigurationsUntyped as ReduxStoreConfigurationItem[];

  const [selectedConfig, setSelectedConfig] = useState<SharedConfigurationItemData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [
    availableCategories,
    setAvailableCategories,
  ] = useState<{ label: string; value: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchConfigurations());
    mockCategoryService
      .fetchCategories()
      .then((cats) => {
        setAvailableCategories(
          cats.map((c) => ({ label: c.name, value: c.id }))
        );
        setCategoriesLoading(false);
      })
      .catch(() => {
        setCategoriesLoading(false);
        // console.error("Failed to load categories for form");
      });
  }, [dispatch]);
  const handleAddNew = () => {
    setSelectedConfig(null);
    setIsFormOpen(true);
    setSubmitError(null);
  };

  const handleEdit = (config: SharedConfigurationItemData) => {
    // config is already SharedConfigurationItemData from configurationsForList
    setSelectedConfig(config);
    setIsFormOpen(true);
    setSubmitError(null);
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true); // Indicate general submission start
    setSubmitError(null);
    try {
      await dispatch(deleteExistingConfiguration(id)).unwrap();
      // Optionally: show success notification
    } catch (err: unknown) {
      console.error('Failed to delete configuration:', err);
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setSubmitError((err as { message: string }).message || 'Failed to delete configuration.');
      } else {
        setSubmitError('An unknown error occurred while deleting configuration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (data: ConfigurationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Ensure isEncrypted is a boolean, defaulting to false if undefined (though Zod should ensure it's boolean)
      const isEncryptedValue = typeof data.isEncrypted === 'boolean' ? data.isEncrypted : false;

      const payloadForRedux: Omit<ReduxStoreConfigurationItem, 'id'> = {
        key: data.key,
        value: data.value,
        category: data.category, // This is categoryId
        isEncrypted: isEncryptedValue,
        description: data.description,
      };

      if (selectedConfig) {
        await dispatch(
          updateExistingConfiguration({ id: selectedConfig.id, configData: payloadForRedux })
        ).unwrap();
      } else {
        await dispatch(addNewConfiguration(payloadForRedux)).unwrap();
      }
      setIsFormOpen(false);
      setSelectedConfig(null);
    } catch (err: unknown) {
      console.error('Submission failed:', err);
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setSubmitError((err as { message: string }).message || 'Failed to save configuration.');
      } else {
        setSubmitError('An unknown error occurred while saving configuration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedConfig(null); // Clear selection when closing
  };

  // Display general loading or error for the list
  // Only show list loading if form isn't open
  if (configurationsLoading === 'pending' && !isFormOpen) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Loading configurations...</Typography>
      </Container>
    );
  }

  if (configurationsError && !isFormOpen) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Error loading configurations: {configurationsError}</Alert>
      </Container>
    );
  }

  // Prepare configurations for the list, mapping Redux items to SharedConfigurationItemData.
  const configurationsForList: SharedConfigurationItemData[] = reduxConfigurations.map(
    (config: ReduxStoreConfigurationItem): SharedConfigurationItemData => ({
      id: config.id,
      key: config.key,
      value: config.value,
      categoryId: config.category, // Map Redux 'category' (ID) to 'categoryId'
      isEncrypted: config.isEncrypted,
      description: config.description,
      valuePlaceholder: config.isEncrypted ? '********' : undefined,
    })
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          System Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          disabled={isFormOpen} // Disable if form is already open
        >
          Add New
        </Button>
      </Box>

      {isFormOpen ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectedConfig ? 'Edit Configuration' : 'Add New Configuration'}
          </Typography>
          <ConfigurationForm
            initialData={selectedConfig} // This should be SharedConfigurationItemData
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
            categories={availableCategories} // Pass fetched categories
          />
          <Button onClick={handleFormClose} sx={{ mt: 1 }} disabled={isSubmitting}>
            Cancel
          </Button>
        </Paper>
      ) : categoriesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ConfigurationList
          configurations={configurationsForList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={configurationsLoading === 'pending'}
        />
      )}
    </Container>
  );
};

export default SystemConfigurationPage;
