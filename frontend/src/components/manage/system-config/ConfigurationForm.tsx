import React, { useEffect } from 'react';
import { Box, Button, CircularProgress, Alert, Switch, FormControlLabel } from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseInput from '../../forms/BaseInput';
import BaseSelect from '../../forms/BaseSelect'; // Assuming categories might be predefined
import { ConfigurationItemData as SharedConfigurationItemData } from '../../../types/systemConfiguration';

// Zod schema for validation
const configurationSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Key can only contain letters, numbers, underscores, and dots'),
  value: z.string().min(1, 'Value is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  isEncrypted: z.boolean(),
});

// Infer the type from the schema
type ConfigurationFormData = z.infer<typeof configurationSchema>;

interface ConfigurationFormProps {
  initialData: SharedConfigurationItemData | null;
  onSubmit: (data: ConfigurationFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  // Example categories - replace with actual data fetching if needed
  categories?: { label: string; value: string }[];
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  submitError,
  categories = [], // Default to empty array
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch, // To watch the isEncrypted value
  } = useForm<ConfigurationFormData>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      key: '',
      value: '',
      category: '',
      description: '',
      isEncrypted: false,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      // If encrypted, don't populate the value field with the actual encrypted string.
      // The user should enter a new value if they wish to change it.
      // The placeholder is for display purposes in lists, not for form input.
      const formValue = initialData.isEncrypted ? '' : initialData.value;
      reset({
        ...initialData,
        value: formValue, // Use empty string for encrypted value input
        category: initialData.categoryId, // Map categoryId to category for the form
      });
    } else {
      reset({
        key: '',
        value: '',
        category: '', // This should be categoryId in the form if using the shared type directly
        description: '',
        isEncrypted: false,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<ConfigurationFormData> = (data) => {
    onSubmit(data);
  };

  const isEncrypted = watch('isEncrypted');

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
      <BaseInput<ConfigurationFormData>
        name="key"
        control={control}
        label="Configuration Key"
        required
        disabled={isSubmitting || !!initialData} // Disable key editing for existing items
        helperText="Unique identifier (e.g., app.setting.name)"
      />
      <BaseInput<ConfigurationFormData>
        name="value"
        control={control}
        label={isEncrypted && initialData ? 'New Value (leave blank to keep current)' : 'Value'}
        required={!isEncrypted || !initialData} // Not required if editing an encrypted value and leaving it unchanged
        disabled={isSubmitting}
        type={isEncrypted ? 'password' : 'text'} // Mask if encrypted
        placeholder={isEncrypted && initialData ? 'Enter new value to change' : ''}
      />
      <FormControlLabel
        control={
          <Switch
            checked={isEncrypted}
            // When toggling, if it becomes encrypted, we might want to clear the value
            // or handle it based on UX requirements. For now, just toggle.
            onChange={(e) => {
              const newIsEncrypted = e.target.checked;
              const currentValue = watch('value');
              reset({
                ...watch(),
                isEncrypted: newIsEncrypted,
                // If switching to encrypted and there's a plain value,
                // user might expect it to be the value to encrypt.
                // If switching from encrypted to plain, the current (empty)
                // value field would require input.
                value: newIsEncrypted && initialData && initialData.isEncrypted ? '' : currentValue,
              });
            }}
            name="isEncrypted"
            color="primary"
            disabled={isSubmitting}
          />
        }
        label="Encrypt Value"
        sx={{ mt: 1, display: 'block' }}
      />
      <BaseSelect<ConfigurationFormData>
        name="category" // This field in the form corresponds to 'categoryId' in SharedConfigurationItemData
        control={control}
        label="Category"
        options={categories} // Pass categories here
        required
        disabled={isSubmitting}
        helperText="Group related settings"
      />
      <BaseInput<ConfigurationFormData>
        name="description"
        control={control}
        label="Description (Optional)"
        multiline
        rows={3}
        disabled={isSubmitting}
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
          'Create Configuration'
        )}
      </Button>
    </Box>
  );
};

export default ConfigurationForm;
