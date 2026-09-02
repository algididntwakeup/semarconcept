// platform/frontend-mui/src/components/users/UserForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  User,
  UserFormData,
} from '../../types/user.types';
import { useRoles, useDepartments, useManagers } from '../../hooks/useUsers';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: User | null;
  loading?: boolean;
  title?: string;
}

const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  onSubmit,
  user = null,
  loading = false,
  title,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_id: '',
    role: '',
    department: '',
    location: '',
    manager_id: '',
    two_factor_enabled: false,
    send_welcome_email: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const { data: managers = [], isLoading: managersLoading } = useManagers();

  const isEditing = Boolean(user);
  const formTitle = title || (isEditing ? 'Edit User' : 'Create New User');

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        employee_id: user.employee_id || '',
        role: user.role || '',
        department: user.department || '',
        location: user.location || '',
        manager_id: user.manager_id || '',
        two_factor_enabled: user.two_factor_enabled || false,
        send_welcome_email: false, // Only for new users
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        employee_id: '',
        role: '',
        department: '',
        location: '',
        manager_id: '',
        two_factor_enabled: false,
        send_welcome_email: true,
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [user, open]);

  const handleInputChange = (field: keyof UserFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.employee_id.trim()) newErrors.employee_id = 'Employee ID is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitError(null);
      await onSubmit(formData);
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while saving the user');
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      employee_id: '',
      role: '',
      department: '',
      location: '',
      manager_id: '',
      two_factor_enabled: false,
      send_welcome_email: true,
    });
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  const isDataLoading = rolesLoading || departmentsLoading || managersLoading;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{formTitle}</DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {isDataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Personal Information */}
              <div className="md:col-span-2">
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
              </div>

              <div>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange('first_name')}
                  error={Boolean(errors.first_name)}
                  helperText={errors.first_name}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange('last_name')}
                  error={Boolean(errors.last_name)}
                  helperText={errors.last_name}
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={formData.employee_id}
                  onChange={handleInputChange('employee_id')}
                  error={Boolean(errors.employee_id)}
                  helperText={errors.employee_id}
                  placeholder="Enter employee ID"
                  required
                />
              </div>

              {/* Work Information */}
              <div className="md:col-span-2">
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Work Information
                </Typography>
              </div>

              <div>
                <FormControl 
                  fullWidth 
                  error={Boolean(errors.role)}
                >
                  <InputLabel>Role *</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleInputChange('role')}
                    label="Role *"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>
              </div>

              <div>
                <FormControl 
                  fullWidth 
                  error={Boolean(errors.department)}
                >
                  <InputLabel>Department *</InputLabel>
                  <Select
                    value={formData.department}
                    onChange={handleInputChange('department')}
                    label="Department *"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.department && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.department}
                    </Typography>
                  )}
                </FormControl>
              </div>

              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="Work Location"
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  error={Boolean(errors.location)}
                  helperText={errors.location}
                  placeholder="Enter work location"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <FormControl fullWidth>
                  <InputLabel>Manager</InputLabel>
                  <Select
                    value={formData.manager_id}
                    onChange={handleInputChange('manager_id')}
                    label="Manager"
                  >
                    <MenuItem value="">
                      <em>No Manager</em>
                    </MenuItem>
                    {managers.map((manager) => (
                      <MenuItem key={manager.id} value={manager.id}>
                        {manager.first_name} {manager.last_name} ({manager.department})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Security Settings */}
              <div className="md:col-span-2">
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Security Settings
                </Typography>
              </div>

              <div className="md:col-span-2">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.two_factor_enabled}
                      onChange={handleInputChange('two_factor_enabled')}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </div>

              {!isEditing && (
                <div className="md:col-span-2">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.send_welcome_email}
                        onChange={handleInputChange('send_welcome_email')}
                      />
                    }
                    label="Send welcome email with login instructions"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isDataLoading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;