import React, { useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ContentTypeData,
  ContentTypeFormData as SharedContentTypeFormData, // Use alias to avoid conflict with local if any
  ContentTypeField, // Import for schema
} from '../../../types/contentType';

// Zod schema for individual fields (basic version, can be expanded)
const fieldSchema = z.object({
  id: z.string(), // Keep id for existing fields when editing
  name: z.string().min(1, 'Field name is required'),
  apiKey: z
    .string()
    .min(1, 'Field API key is required')
    .regex(/^[a-zA-Z0-9_]+$/, 'Field API Key can only contain letters, numbers, and underscores'),
  type: z.enum([
    'text',
    'textarea',
    'number',
    'boolean',
    'date',
    'datetime',
    'media',
    'relation',
    'json',
  ]),
  isRequired: z.boolean().optional(),
  isList: z.boolean().optional(),
  // Add other validations as per ContentTypeField
});

// Zod schema for validation, now including fields
const contentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  apiKey: z
    .string()
    .min(1, 'API Key is required')
    .regex(/^[a-z0-9_]+$/, 'API Key must be lowercase alphanumeric with underscores')
    .max(50, 'API Key must be 50 characters or less'),
  description: z.string().max(255, 'Description must be 255 characters or less').optional(),
  fields: z.array(fieldSchema), // Array of fields, default is handled by useForm's defaultValues
});

// Use the imported Omit type for form data
type LocalContentTypeFormData = SharedContentTypeFormData; // Alias for clarity if needed, or use SharedContentTypeFormData directly

interface ContentTypeFormProps {
  initialData?: ContentTypeData | null; // For editing, use the full type
  onSubmit: (data: LocalContentTypeFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

const ContentTypeForm: React.FC<ContentTypeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocalContentTypeFormData>({
    resolver: zodResolver(contentTypeSchema) as any,
    defaultValues: {
      name: '',
      apiKey: '',
      description: '',
      fields: [], // Default fields to empty array
    },
  });

  useEffect(() => {
    if (initialData) {
      // Ensure fields are part of the reset if they exist on initialData
      const { id, createdAt, updatedAt, ...formData } = initialData;
      reset({
        ...formData, // name, apiKey, description
        fields: initialData.fields || [], // Ensure fields is an array
      });
    } else {
      reset({ name: '', apiKey: '', description: '', fields: [] });
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<LocalContentTypeFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {initialData ? 'Edit Content Type' : 'Create New Content Type'}
      </Typography>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Content Type Name"
                required
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isSubmitting}
              />
            )}
          />
          <Controller
            name="apiKey"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="API Key (e.g., blog_posts)"
                required
                fullWidth
                error={!!errors.apiKey}
                helperText={
                  errors.apiKey?.message || 'Lowercase alphanumeric and underscores only.'
                }
                disabled={isSubmitting || !!initialData} // API key usually not editable after creation
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description (Optional)"
                multiline
                rows={3}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={isSubmitting}
              />
            )}
          />

          {submitError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={onCancel} disabled={isSubmitting} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : initialData ? (
                'Save Changes'
              ) : (
                'Create Type'
              )}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default ContentTypeForm;
