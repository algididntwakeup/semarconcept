import React, { useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  // Paper, // Removed unused import
  // CircularProgress, // Removed unused import
  // Alert, // Removed unused import
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ContentTypeField, ContentTypeFieldFormData } from '../../../types/contentType'; // Import shared types

// Supported field types - must match ContentTypeField.type
const fieldTypeOptions: { value: ContentTypeField['type']; label: string }[] = [
  { value: 'text', label: 'Text (Single Line)' },
  { value: 'textarea', label: 'Text (Multi-Line)' },
  // { value: 'richtext', label: 'Rich Text' }, // Assuming richtext is a variation of textarea or a custom component
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean (True/False)' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'media', label: 'Media (Image, File)' },
  { value: 'relation', label: 'Relation' },
  { value: 'json', label: 'JSON' },
];

// Zod schema for validation, aligned with ContentTypeField
const fieldSchema = z.object({
  name: z.string().min(1, 'Field Name is required').max(100),
  apiKey: z
    .string()
    .min(1, 'API Key is required')
    .regex(/^[a-zA-Z0-9_]+$/, 'API Key must be lowercase alphanumeric with underscores')
    .max(50, 'API Key must be 50 characters or less'),
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
  isRequired: z.boolean().optional().default(false), // Default to false
  isList: z.boolean().optional().default(false), // Default to false
  // Add validation for other fields from ContentTypeField as they are implemented in the form
});

// Use the imported Omit type for form data
type LocalFieldFormData = ContentTypeFieldFormData;

interface FieldFormProps {
  initialData?: ContentTypeField | null; // For editing
  onSubmit: (data: LocalFieldFormData) => void; // Parent handles async
  onCancel: () => void;
  // isSubmitting?: boolean; // Parent might handle submission state
  // submitError?: string | null;
}

const FieldForm: React.FC<FieldFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  // isSubmitting,
  // submitError,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocalFieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: '',
      apiKey: '',
      type: 'text', // Default type
      isRequired: false,
      isList: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      const { id, ...formData } = initialData; // Exclude id from form data
      reset({
        ...formData,
        isRequired: initialData.isRequired || false, // Ensure boolean
        isList: initialData.isList || false, // Ensure boolean
      });
    } else {
      reset({ name: '', apiKey: '', type: 'text', isRequired: false, isList: false });
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<LocalFieldFormData> = (data) => {
    onSubmit(data); // Parent component handles the async logic and state
  };

  return (
    // Using Box instead of Paper, assuming it's within another Paper/Dialog
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Typography variant="subtitle1" gutterBottom>
        {initialData ? 'Edit Field' : 'Add New Field'}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Field Name"
              required
              fullWidth
              autoFocus // Focus on name field first
              error={!!errors.name}
              helperText={errors.name?.message}
              // disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="apiKey"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="API Key"
              required
              fullWidth
              error={!!errors.apiKey}
              helperText={errors.apiKey?.message || 'Lowercase alphanumeric and underscores only.'}
              // disabled={isSubmitting || !!initialData} // API key might be editable for fields
            />
          )}
        />
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth required error={!!errors.type}>
              <InputLabel id="field-type-label">Field Type</InputLabel>
              <Select
                labelId="field-type-label"
                label="Field Type"
                {...field}
                // disabled={isSubmitting}
              >
                {fieldTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                  {errors.type.message as string}
                </Typography>
              )}
            </FormControl>
          )}
        />
        <Controller
          name="isRequired"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  color="primary"
                  // disabled={isSubmitting}
                />
              }
              label="Required Field"
            />
          )}
        />
        <Controller
          name="isList"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  color="primary"
                  // disabled={isSubmitting}
                />
              }
              label="Is List (Allow Multiple Values)"
            />
          )}
        />
        {/* Placeholder for type-specific options */}
        {/* e.g., if type === 'relation', show dropdown for target content type */}

        {/* {submitError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {submitError}
          </Alert>
        )} */}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button onClick={onCancel} color="inherit" /* disabled={isSubmitting} */>
            Cancel
          </Button>
          <Button type="submit" variant="contained" /* disabled={isSubmitting} */>
            {/* {isSubmitting ? <CircularProgress size={24} /> : (initialData ? 'Save Field' : 'Add Field')} */}
            {initialData ? 'Save Field' : 'Add Field'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FieldForm;
