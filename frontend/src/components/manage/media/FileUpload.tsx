import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone'; // Removed DropEvent as it's not directly used in the refined onDrop
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>; // Function to handle the actual upload logic
  acceptedFileTypes?: string; // e.g., 'image/*,application/pdf'
  maxFileSize?: number; // In bytes
  multiple?: boolean;
}

interface UploadableFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number; // 0-100
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  acceptedFileTypes = 'image/*', // Default to images
  maxFileSize = 5 * 1024 * 1024, // Default 5MB
  multiple = true,
}) => {
  const [filesToUpload, setFilesToUpload] = useState<UploadableFile[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setGlobalError(null);
      const newUploadableFiles: UploadableFile[] = acceptedFiles.map((file) => ({
        file,
        id: `${file.name}-${file.size}-${file.lastModified}`,
        status: 'pending',
      }));

      // Filter out already added files to prevent duplicates if user drops same file multiple times
      setFilesToUpload((prevFiles) => {
        const existingIds = new Set(prevFiles.map((f) => f.id));
        const trulyNewFiles = newUploadableFiles.filter((nf) => !existingIds.has(nf.id));
        return [...prevFiles, ...trulyNewFiles];
      });

      if (fileRejections.length > 0) {
        const errors = fileRejections
          .map(
            (rejection) =>
              `${rejection.file.name}: ${rejection.errors.map((e) => e.message).join(', ')}`
          )
          .join('\n');
        setGlobalError(`Some files were rejected:\n${errors}`);
      }
    },
    [] // Removed `acceptedFileTypes` and `maxFileSize` from deps as they are passed to useDropzone
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.split(',').reduce((acc, type) => ({ ...acc, [type.trim()]: [] }), {}),
    maxSize: maxFileSize,
    multiple, // Use the prop directly
  });

  const handleRemoveFile = (id: string) => {
    setFilesToUpload((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUploadClick = async () => {
    const filesToProcess = filesToUpload.filter((f) => f.status === 'pending');
    if (filesToProcess.length === 0) return;

    setGlobalError(null);
    // Mark pending files as uploading
    setFilesToUpload((prev) =>
      prev.map((f) => (f.status === 'pending' ? { ...f, status: 'uploading', progress: 0 } : f))
    );

    // This will call the onUpload prop for each file.
    // The onUpload prop should handle individual file progress and status updates.
    for (const uploadableFile of filesToProcess) {
      // Reset progress for retries, though full retry logic is more complex
      setFilesToUpload((prev) =>
        prev.map((f) => (f.id === uploadableFile.id ? { ...f, progress: 0, error: undefined } : f))
      );
      try {
        // The onUpload function is now responsible for the actual upload
        // and should ideally update progress via a callback or by returning a promise
        // that resolves/rejects upon completion.
        // For this example, we assume onUpload handles its own progress internally
        // or we simplify and just mark as success/error upon its completion.

        // A more advanced onUpload might take a progress callback:
        // await onUpload([uploadableFile.file], (progressEvent) => {
        //   const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        //   setFilesToUpload((prev) =>
        //     prev.map((f) => (f.id === uploadableFile.id ? { ...f, progress: percentCompleted } : f))
        //   );
        // });

        // Simplified: Call onUpload and wait for it to complete
        await onUpload([uploadableFile.file]); // Pass as an array of one file

        setFilesToUpload((prev) =>
          prev.map((f) =>
            f.id === uploadableFile.id ? { ...f, status: 'success', progress: 100 } : f
          )
        );
      } catch (error: unknown) {
        console.error('Upload failed for:', uploadableFile.file.name, error);
        setFilesToUpload((prev) =>
          prev.map((f) =>
            f.id === uploadableFile.id
              ? {
                  ...f,
                  status: 'error',
                  error: error instanceof Error ? error.message : String(error) || 'Upload failed',
                  progress: 0,
                }
              : f
          )
        );
      }
    }
  };

  const pendingFiles = filesToUpload.filter((f) => f.status === 'pending');

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          borderRadius: 1,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'transparent',
          mb: 2,
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
        {isDragActive ? (
          <Typography>Drop the files here ...</Typography>
        ) : (
          <Typography>Drag 'n' drop some files here, or click to select files</Typography>
        )}
        <Typography variant="caption" color="textSecondary">
          (Accepted: {acceptedFileTypes}, Max size: {maxFileSize / 1024 / 1024}MB)
        </Typography>
      </Box>

      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      {filesToUpload.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Files to Upload:
          </Typography>
          <List dense>
            {filesToUpload.map((uploadableFile) => (
              <ListItem
                key={uploadableFile.id}
                secondaryAction={
                  uploadableFile.status === 'pending' || uploadableFile.status === 'error' ? (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveFile(uploadableFile.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  ) : null
                }
              >
                <ListItemText
                  primary={uploadableFile.file.name}
                  secondary={
                    uploadableFile.status === 'uploading' ? (
                      <LinearProgress
                        variant="determinate"
                        value={uploadableFile.progress}
                        sx={{ width: '80%', mt: 0.5 }}
                      />
                    ) : uploadableFile.status === 'error' ? (
                      <Typography variant="caption" color="error">
                        Error: {uploadableFile.error}
                      </Typography>
                    ) : uploadableFile.status === 'success' ? (
                      <Typography variant="caption" color="success.main">
                        Uploaded
                      </Typography>
                    ) : (
                      'Pending'
                    )
                  }
                />
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            onClick={handleUploadClick}
            disabled={
              pendingFiles.length === 0 || filesToUpload.some((f) => f.status === 'uploading')
            }
            sx={{ mt: 1 }}
          >
            Upload {pendingFiles.length} {pendingFiles.length === 1 ? 'File' : 'Files'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
