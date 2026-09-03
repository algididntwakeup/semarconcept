import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Typography,
  Alert,
  Stack
} from '@mui/material';
import { useAnnouncer, useLiveRegion } from '../../hooks/useAccessibility';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'checkbox' | 'radio' | 'select' | 'textarea';
  required?: boolean;
  helperText?: string;
  errorText?: string;
  options?: Array<{ value: string; label: string }>;
  value?: string | boolean | string[];
  placeholder?: string;
  autoComplete?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
}

export interface AccessibleFormProps {
  /**
   * Form title
   */
  title: string;
  
  /**
   * Form description
   */
  description?: string;
  
  /**
   * Form fields
   */
  fields: FormField[];
  
  /**
   * Function to handle form submission
   */
  onSubmit: (values: Record<string, string | boolean | string[]>) => void;
  
  /**
   * Submit button text
   */
  submitText?: string;
  
  /**
   * Cancel button text
   */
  cancelText?: string;
  
  /**
   * Function to handle cancel button click
   */
  onCancel?: () => void;
  
  /**
   * Whether the form is loading
   */
  loading?: boolean;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Success message to display
   */
  success?: string;
  
  /**
   * ID for the form
   */
  id?: string;
}

/**
 * AccessibleForm component
 * 
 * An accessible form component that follows best practices for accessibility:
 * - Provides proper labels and ARIA attributes
 * - Includes error messages and validation
 * - Announces form submission status to screen readers
 * - Supports keyboard navigation
 * - Includes proper focus management
 */
const AccessibleForm: React.FC<AccessibleFormProps> = ({
  title,
  description,
  fields,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  loading = false,
  error,
  success,
  id = 'accessible-form'
}) => {
  // State for form values
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>(() => {
    // Initialize values from fields
    const initialValues: Record<string, string | boolean | string[]> = {};
    fields.forEach((field) => {
      initialValues[field.id] = field.value !== undefined ? field.value : '';
    });
    return initialValues;
  });
  
  // State for field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Use announcer hook
  const { announce } = useAnnouncer();
  
  // Use live region hook for form status
  const { liveRegionRef, updateContent } = useLiveRegion('polite');
  
  // Ref for the first field
  const firstFieldRef = useRef<HTMLInputElement>(null);
  
  // Ref for the submit button
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  
  // Handle field change
  const handleChange = (
    fieldId: string,
    event: { target: { value: unknown; checked?: boolean } }
  ) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    
    let value: string | boolean | string[];
    
    if (field.type === 'checkbox') {
      value = event.target.checked ?? false;
    } else if (field.type === 'select' && (event.target as { value: unknown }).value instanceof Array) {
      value = (event.target as { value: string[] }).value;
    } else {
      value = (event.target as { value: string }).value;
    }
    
    setValues((prevValues) => ({
      ...prevValues,
      [fieldId]: value
    }));
    
    // Clear error for this field
    if (fieldErrors[fieldId]) {
      setFieldErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    fields.forEach((field) => {
      // Skip validation for disabled fields
      if (field.disabled) return;
      
      const value = values[field.id];
      
      // Required field validation
      if (field.required && (value === '' || value === undefined || value === null)) {
        errors[field.id] = field.errorText || `${field.label} is required`;
        isValid = false;
      }
      
      // Email validation
      if (field.type === 'email' && typeof value === 'string' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.id] = field.errorText || 'Please enter a valid email address';
        isValid = false;
      }
      
      // Pattern validation
      if (field.pattern && typeof value === 'string' && value && !new RegExp(field.pattern).test(value)) {
        errors[field.id] = field.errorText || `Please enter a valid ${field.label.toLowerCase()}`;
        isValid = false;
      }
      
      // Number range validation
      if (field.type === 'number' && typeof value === 'string' && value) {
        const numValue = parseFloat(value);
        if (field.min !== undefined && numValue < field.min) {
          errors[field.id] = field.errorText || `Value must be at least ${field.min}`;
          isValid = false;
        }
        if (field.max !== undefined && numValue > field.max) {
          errors[field.id] = field.errorText || `Value must be at most ${field.max}`;
          isValid = false;
        }
      }
    });
    
    setFieldErrors(errors);
    
    if (!isValid) {
      // Announce validation errors
      announce(`Form has ${Object.keys(errors).length} validation errors. Please correct them and try again.`);
      
      // Focus the first field with an error
      const firstErrorField = fields.find((field) => errors[field.id]);
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField.id);
        if (errorElement) {
          errorElement.focus();
        }
      }
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Submit form
    onSubmit(values);
    
    // Update live region with submission status
    updateContent('Form submitted successfully. Please wait for processing.');
  };
  
  // Render form fields
  const renderField = (field: FormField) => {
    const {
      id,
      label,
      type,
      required,
      helperText,
      options,
      placeholder,
      autoComplete,
      multiline,
      rows,
      disabled,
      fullWidth = true,
      min,
      max,
      step
    } = field;
    
    const error = !!fieldErrors[id];
    const errorText = fieldErrors[id];
    const value = values[id];
    
    switch (type) {
      case 'checkbox':
        return (
          <FormControl key={id} fullWidth={fullWidth} margin="normal" error={error}>
            <FormControlLabel
              control={
                <Checkbox
                  id={id}
                  name={id}
                  checked={Boolean(value)}
                  onChange={(e) => handleChange(id, e)}
                  disabled={disabled}
                  inputProps={{ 'aria-describedby': `${id}-helper-text` }}
                />
              }
              label={
                <Typography component="span">
                  {label}
                  {required && <Typography component="span" color="error">*</Typography>}
                </Typography>
              }
            />
            {(helperText || errorText) && (
              <FormHelperText id={`${id}-helper-text`}>
                {error ? errorText : helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
        
      case 'radio':
        return (
          <FormControl key={id} fullWidth={fullWidth} margin="normal" error={error}>
            <FormLabel id={`${id}-label`} required={required}>
              {label}
            </FormLabel>
            <RadioGroup
              aria-labelledby={`${id}-label`}
              name={id}
              value={value as string}
              onChange={(e) => handleChange(id, e)}
            >
              {options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio disabled={disabled} />}
                  label={option.label}
                  disabled={disabled}
                />
              ))}
            </RadioGroup>
            {(helperText || errorText) && (
              <FormHelperText id={`${id}-helper-text`}>
                {error ? errorText : helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
        
      case 'select':
        return (
          <FormControl key={id} fullWidth={fullWidth} margin="normal" error={error}>
            <InputLabel id={`${id}-label`} required={required}>
              {label}
            </InputLabel>
            <Select
              labelId={`${id}-label`}
              id={id}
              name={id}
              value={value as string}
              onChange={(e) => handleChange(id, e)}
              label={label}
              disabled={disabled}
              aria-describedby={`${id}-helper-text`}
            >
              {options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(helperText || errorText) && (
              <FormHelperText id={`${id}-helper-text`}>
                {error ? errorText : helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
        
      default:
        return (
          <TextField
            key={id}
            id={id}
            name={id}
            label={label}
            type={type}
            value={value as string}
            onChange={(e) => handleChange(id, e)}
            required={required}
            error={error}
            helperText={error ? errorText : helperText}
            placeholder={placeholder}
            autoComplete={autoComplete}
            multiline={multiline}
            rows={rows}
            disabled={disabled}
            fullWidth={fullWidth}
            margin="normal"
            inputProps={{
              min,
              max,
              step,
              'aria-describedby': `${id}-helper-text`
            }}
            inputRef={fields[0].id === id ? firstFieldRef : undefined}
          />
        );
    }
  };
  
  return (
    <Box component="section" aria-labelledby={`${id}-title`}>
      <Typography id={`${id}-title`} variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" paragraph>
          {description}
        </Typography>
      )}
      
      {(error || success) && (
        <Box mb={2}>
          {error && (
            <Alert severity="error" aria-live="assertive">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" aria-live="polite">
              {success}
            </Alert>
          )}
        </Box>
      )}
      
      <Box
        component="form"
        id={id}
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={`${id}-status`}
      >
        {fields.map(renderField)}
        
        <Box mt={3}>
          <Stack direction="row" spacing={2}>
            {onCancel && (
              <Button
                type="button"
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              ref={submitButtonRef}
            >
              {submitText}
            </Button>
          </Stack>
        </Box>
      </Box>
      
      {/* Hidden live region for status announcements */}
      <div
        ref={liveRegionRef}
        id={`${id}-status`}
        className="sr-only"
      />
    </Box>
  );
};

export default AccessibleForm;
