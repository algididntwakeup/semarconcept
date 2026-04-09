import React, { useEffect } from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material'; // Removed TextField
import { useForm, SubmitHandler } from 'react-hook-form'; // Removed Controller
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseInput from '../../forms/BaseInput'; // Import BaseInput

// Define Zod schema for validation
const permissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Permission name is required')
    .regex(/^[a-z0-9_]+:[a-z0-9_]+$/i, "Use format 'module:action' (e.g., users:read)"),
  description: z.string().min(1, 'Description is required'),
  // category: z.string().optional(), // Add other fields as needed
});

// Infer the type from the schema
type PermissionFormData = z.infer<typeof permissionSchema>;

// Define Permission type including ID (for initial data) - Keep this if needed for initialData prop
interface Permission extends PermissionFormData {
  id: string;
}

interface PermissionFormProps {
  initialData: Permission | null; // Pass null for creating a new permission
  onSubmit: (data: PermissionFormData) => Promise<void>; // Expects PermissionFormData
  isSubmitting: boolean;
  submitError: string | null;
}

const PermissionForm: React.FC<PermissionFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    // formState: { errors }, // errors are handled by BaseInput via control
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema), // Use Zod resolver
    // Default values can be inferred or set in reset
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        // category: initialData.category || '',
      });
    } else {
      reset({ name: '', description: '' /*, category: '' */ });
    }
  }, [initialData, reset]);

  // Type the submit handler data
  const handleFormSubmit: SubmitHandler<PermissionFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
      <BaseInput<PermissionFormData>
        name="name"
        control={control}
        label="Permission Name (Identifier)"
        required
        helperText="Use format 'module:action' (e.g., users:read)"
        disabled={isSubmitting}
        autoComplete="off"
      />
      <BaseInput<PermissionFormData>
        name="description"
        control={control}
        label="Description"
        required
        multiline
        rows={3}
        disabled={isSubmitting}
      />
      {/* TODO: Add category field if needed */}
      {/* <TextField margin="normal" fullWidth id="category" label="Category (Optional)" name="category" value={formData.category || ''} onChange={handleChange} disabled={isSubmitting} /> */}
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
          'Create Permission'
        )}
      </Button>
    </Box>
  );
};

export default PermissionForm;
