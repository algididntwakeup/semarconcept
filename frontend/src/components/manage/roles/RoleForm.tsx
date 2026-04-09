import React, { useEffect } from 'react';
import { Box, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

// Define Role type (should match RoleDetailPage)
interface RoleFormData {
  name: string;
  description: string;
}

// Define Role type including ID (for initial data)
interface Role extends RoleFormData {
  id: string;
  permissions: string[];
}

interface RoleFormProps {
  initialData: Role | null; // Pass null for creating a new role
  onSubmit: (data: RoleFormData) => Promise<void>; // Async submit handler
  isSubmitting: boolean; // Flag to disable form during submission
  submitError: string | null; // Error message from submission
}

const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
      });
    } else {
      reset({ name: '', description: '' });
    }
  }, [initialData, reset]);

  // Type the submit handler data
  const handleFormSubmit: SubmitHandler<RoleFormData> = (data) => {
    onSubmit(data);
  };

  return (
    // Use react-hook-form's handleSubmit
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Role name is required' }}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="name"
            label="Role Name"
            autoComplete="off"
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={isSubmitting}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        // No specific rules for description, but can add maxLength etc. if needed
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            multiline
            rows={3}
            error={!!errors.description} // Although no rules, good practice to include
            helperText={errors.description?.message}
            disabled={isSubmitting}
          />
        )}
      />
      {submitError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {submitError}
        </Alert>
      )}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <CircularProgress size={24} />
        ) : initialData ? (
          'Save Changes'
        ) : (
          'Create Role'
        )}
      </Button>
    </Box>
  );
};

export default RoleForm;
