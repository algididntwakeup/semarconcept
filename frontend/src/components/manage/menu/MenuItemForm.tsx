import React, { useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  // Paper, // Removed unused import
  CircularProgress,
  Alert,
  Autocomplete, // For icon selection & permissions
  // Checkbox, // For permissions?
  // FormControlLabel,
} from '@mui/material';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface MenuItemData {
  id: string | number;
  title: string;
  path: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  isVisible?: boolean;
  type?: string;
  slug?: string;
  permissions?: string[];
  parentId?: string | number | null;
  children?: MenuItemData[];
}

// Form data type (excluding id, children, parentId - parentId might be passed separately)
export type MenuItemFormData = Omit<MenuItemData, 'id' | 'children' | 'parentId'>;

// Zod schema for validation
const menuItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  path: z.string().min(1, 'Path is required').startsWith('/', 'Path must start with /'),
  icon: z.string().optional(),
  order: z.number().int().min(0, 'Order must be non-negative'),
  isActive: z.boolean(),
  isVisible: z.boolean(),
  type: z.string().min(1, 'Type is required'),
  slug: z.string().default(''),
  permissions: z.array(z.string()).optional(), // Assuming permissions are strings
});

interface MenuItemFormProps {
  initialData?: MenuItemData | null; // For editing
  parentId?: string | null; // To associate with parent if creating a child
  onSubmit: (data: MenuItemFormData) => Promise<void> | void; // Allow sync or async submit
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

// Mock list of available permissions - replace with actual data source
const MOCK_AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard' },
  { id: 'manage_users', label: 'Manage Users' },
  { id: 'edit_settings', label: 'Edit Settings' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'manage_content', label: 'Manage Content' },
  { id: 'manage_roles', label: 'Manage Roles' },
  { id: 'manage_permissions', label: 'Manage Permissions' },
  { id: 'access_audit_log', label: 'Access Audit Log' },
];

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  initialData,
  // parentId, // Not used directly in form fields yet
  onSubmit,
  onCancel,
  isSubmitting = false, // Default to false if not provided
  submitError,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch, // To get current permissions for Autocomplete
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: {
      title: '',
      path: '/',
      icon: '',
      order: 0,
      isActive: true,
      isVisible: true,
      type: 'item',
      slug: '',
      permissions: [],
    },
  });

  const currentPermissions = watch('permissions') || [];

  useEffect(() => {
    if (initialData) {
      // Exclude fields not in MenuItemFormData
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, children, parentId, ...formData } = initialData;
      reset(formData);
    } else {
      reset({ 
        title: '', 
        path: '/', 
        icon: '', 
        order: 0, 
        isActive: true, 
        isVisible: true, 
        type: 'item', 
        slug: '', 
        permissions: [] 
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<MenuItemFormData> = (data) => {
    // Convert order back to number if needed (react-hook-form might treat it as string)
    const processedData = {
      ...data,
      order: Number(data.order) || 0,
      permissions: data.permissions || [], // Ensure permissions is an array
    };
    onSubmit(processedData);
  };

  return (
    // Using Box instead of Paper, assuming it's within another Paper/Dialog
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Typography variant="subtitle1" gutterBottom>
        {initialData ? 'Edit Menu Item' : 'Add New Menu Item'}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              required
              fullWidth
              autoFocus
              error={!!errors.title}
              helperText={errors.title?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="path"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Path (e.g., /dashboard, /manage/users)"
              required
              fullWidth
              error={!!errors.path}
              helperText={errors.path?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Icon Name (Optional - e.g., Dashboard, People)"
              fullWidth
              error={!!errors.icon}
              helperText={errors.icon?.message || 'Use Material Icon names'}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="order"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Order Index"
              type="number"
              required
              fullWidth
              error={!!errors.order}
              helperText={errors.order?.message || 'Lower numbers appear first'}
              disabled={isSubmitting}
              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
            />
          )}
        />
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Autocomplete
              options={['item', 'collapse', 'group']}
              value={field.value}
              onChange={(_, newValue) => field.onChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Menu Type"
                  required
                  error={!!errors.type}
                  helperText={errors.type?.message}
                />
              )}
              disabled={isSubmitting}
            />
          )}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={[true, false]}
                getOptionLabel={(option) => (option ? 'Active' : 'Inactive')}
                value={field.value}
                onChange={(_, newValue) => field.onChange(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Status" fullWidth />
                )}
                disabled={isSubmitting}
                sx={{ flex: 1 }}
              />
            )}
          />
          <Controller
            name="isVisible"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={[true, false]}
                getOptionLabel={(option) => (option ? 'Visible' : 'Hidden')}
                value={field.value}
                onChange={(_, newValue) => field.onChange(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Visibility" fullWidth />
                )}
                disabled={isSubmitting}
                sx={{ flex: 1 }}
              />
            )}
          />
        </Box>

        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Slug (Optional)"
              placeholder="e.g. system-settings"
              fullWidth
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="permissions"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              id="menu-item-permissions"
              options={MOCK_AVAILABLE_PERMISSIONS.map((p) => p.id)} // Pass array of strings
              getOptionLabel={(optionId) =>
                MOCK_AVAILABLE_PERMISSIONS.find((p) => p.id === optionId)?.label || optionId
              }
              value={currentPermissions} // Use watched value
              onChange={(_, newValue) => {
                field.onChange(newValue); // newValue is an array of strings (permission IDs)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Permissions (Optional)"
                  placeholder="Select permissions"
                  error={!!errors.permissions}
                  helperText={errors.permissions?.message}
                />
              )}
              disabled={isSubmitting}
              fullWidth
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
              'Add Item'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MenuItemForm;
