import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface BaseInputProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'name' | 'error' | 'helperText'> {
  // Put helperText back in Omit
  name: Path<T>;
  control: Control<T>;
  label: string;
  rules?: object;
  helperText?: React.ReactNode; // Explicitly add helperText here
}
const BaseInput = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  helperText, // Use helperText directly
  ...rest
}: BaseInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...rest}
          label={label}
          variant="outlined"
          fullWidth
          error={!!error}
          helperText={error ? error.message : helperText} // Use passed helperText if no error
          margin="normal" // Added default margin
        />
      )}
    />
  );
};

export default BaseInput;
