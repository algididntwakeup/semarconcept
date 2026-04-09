import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

// Define a basic User type - replace with actual type from API/store later
interface UserFormData {
  id?: string; // Optional ID for edit mode
  name: string;
  email: string;
  role: string; // Assuming role is a simple string ID/name for now
  // Add other fields like password (for create), status, etc.
}

interface UserFormProps {
  initialData?: UserFormData | null; // Data for editing, null/undefined for creating
  onSubmit: (formData: UserFormData) => void; // Function to call on successful submission
  loading: boolean; // Loading state from parent
  error: string | null; // Error state from parent
}

// Example roles - replace with roles fetched from API
const availableRoles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'editor', name: 'Editor' },
  { id: 'member', name: 'Member' },
];

const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: '', // Default role or empty
    ...initialData, // Spread initial data if provided (for edit)
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Update form data if initialData changes (e.g., when data loads for edit)
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      // Reset form for 'new' user
      setFormData({ name: '', email: '', role: '' });
    }
  }, [initialData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    // Basic validation example
    if (!formData.name || !formData.email || !formData.role) {
      setFormError('Please fill in all required fields.');
      return;
    }
    // Add more specific validation (email format, password complexity if applicable)

    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {(error || formError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || formError}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        value={formData.name}
        onChange={handleChange}
        disabled={loading}
        autoFocus // Focus on name field initially
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        type="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
      />
      <FormControl fullWidth margin="normal" required disabled={loading}>
        <InputLabel id="role-select-label">Role</InputLabel>
        <Select
          labelId="role-select-label"
          id="role"
          name="role"
          value={formData.role}
          label="Role"
          onChange={handleChange}
        >
          <MenuItem value="" disabled>
            <em>Select a role...</em>
          </MenuItem>
          {availableRoles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Add Password field only for create mode? */}
      {/* Add Status field if applicable */}

      <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : initialData ? 'Save Changes' : 'Create User'}
      </Button>
    </Box>
  );
};

export default UserForm;
