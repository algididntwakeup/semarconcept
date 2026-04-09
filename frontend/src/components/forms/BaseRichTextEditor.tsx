import React from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { Box, FormHelperText, Typography } from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface BaseRichTextEditorProps<T extends FieldValues>
  extends Omit<ReactQuillProps, 'value' | 'onChange'> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  rules?: object;
  helperText?: React.ReactNode;
}

const BaseRichTextEditor = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  helperText,
  ...rest
}: BaseRichTextEditorProps<T>) => {
  return (
    <Box sx={{ my: 2 }}>
      {' '}
      {/* Add margin */}
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <>
            <Box
              sx={{
                '& .ql-editor': { minHeight: '150px' }, // Set min height
                '& .ql-toolbar': {
                  borderTopLeftRadius: (theme) => theme.shape.borderRadius,
                  borderTopRightRadius: (theme) => theme.shape.borderRadius,
                  borderColor: error ? 'error.main' : 'rgba(0, 0, 0, 0.23)', // Match TextField border
                },
                '& .ql-container': {
                  borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
                  borderBottomRightRadius: (theme) => theme.shape.borderRadius,
                  borderColor: error ? 'error.main' : 'rgba(0, 0, 0, 0.23)', // Match TextField border
                  '&:hover': {
                    borderColor: error ? 'error.main' : 'text.primary', // Match TextField hover
                  },
                  '&.ql-container.ql-snow.ql-disabled': {
                    backgroundColor: (theme) => theme.palette.action.disabledBackground,
                  }, // Added comma
                },
              }}
            >
              <ReactQuill
                theme="snow"
                {...field}
                {...rest}
                readOnly={rest.readOnly} // Ensure readOnly is passed correctly
              />
            </Box>
            {error && (
              <FormHelperText error sx={{ mx: '14px', mt: '3px' }}>
                {error.message}
              </FormHelperText>
            )}
            {!error && helperText && (
              <FormHelperText sx={{ mx: '14px', mt: '3px' }}>{helperText}</FormHelperText>
            )}
          </>
        )}
      />
    </Box>
  );
};

export default BaseRichTextEditor;
