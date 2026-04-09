import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CategoryData } from '../../types/systemConfiguration';

// Form data type, excluding 'id'
export type CategoryFormData = Omit<CategoryData, 'id'>;

// Zod schema for validation
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name is too long'),
  description: z.string().max(255, 'Description is too long').optional(),
});

interface CategoryFormProps {
  initialData?: CategoryData | null; // For editing
  onSubmit: (data: CategoryFormData) => Promise<void> | void;
  onCancel?: () => void; // Optional: if form is in a dialog/modal
  isSubmitting?: boolean;
  submitError?: string | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }, // isDirty can be used to enable/disable save button
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
      });
    } else {
      reset({ name: '', description: '' }); // Reset for new form
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<CategoryFormData> = (data) => {
    onSubmit(data);
  };

  return (
    // Removed Paper, assuming parent component handles layout
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Category Name"
              required
              fullWidth
              autoFocus={!initialData} // Autofocus only for new category
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isSubmitting}
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
          <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
            {submitError}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: onCancel ? 'space-between' : 'flex-end',
            gap: 1,
            mt: 2,
          }}
        >
          {onCancel && (
            <Button onClick={onCancel} disabled={isSubmitting} color="inherit">
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || !isDirty} // Disable if not dirty (no changes)
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : initialData ? (
              'Save Changes'
            ) : (
              'Add Category'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryForm;
