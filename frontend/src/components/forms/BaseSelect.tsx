import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectProps,
} from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface Option {
  label: string;
  value: string | number;
}

interface BaseSelectProps<T extends FieldValues>
  extends Omit<SelectProps, 'name' | 'value' | 'error' | 'helperText'> {
  // Add helperText to Omit
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: Option[];
  rules?: object;
  helperText?: React.ReactNode; // Explicitly add helperText prop
}

const BaseSelect = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  rules,
  // helperText is destructured below from rest
  ...props // Rename rest to props for clarity
}: BaseSelectProps<T>) => {
  // Destructure helperText from props to prevent passing it to Select
  const { helperText, ...rest } = props;
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error} margin="normal" variant="outlined">
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            labelId={`${name}-label`}
            id={name}
            label={label}
            {...field}
            {...rest} // Spread the remaining rest props
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
          {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}{' '}
          {/* Use destructured helperText */}
        </FormControl>
      )}
    />
  );
};

export default BaseSelect;
