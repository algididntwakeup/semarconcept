import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Slider, // Example control for cropping/resizing
  IconButton,
} from '@mui/material';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import CropIcon from '@mui/icons-material/Crop'; // Keep for potential future use
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
// import Cropper from 'react-cropper'; // Example library (needs installation)
// import 'cropperjs/dist/cropper.css'; // CSS for react-cropper
import { MediaItemData } from '../../../types/media'; // Import shared type

interface ImageEditorProps {
  open: boolean;
  onClose: () => void;
  mediaItem: MediaItemData | null;
  onSave: (editedData: Blob | null, filename: string) => Promise<void>; // Callback with edited image data
}

const ImageEditor: React.FC<ImageEditorProps> = ({ open, onClose, mediaItem, onSave }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [cropper, setCropper] = useState<any>(); // State for cropper instance
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleSave = async () => {
    if (!mediaItem /* || typeof cropper === 'undefined' */) {
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      // Simulate processing / getting data from cropper
      console.log('Simulating image save with zoom:', zoom, 'rotation:', rotation);
      // const editedBlob = await new Promise<Blob | null>((resolve) => {
      //   cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
      //     resolve(blob);
      //   });
      // });
      const editedBlob = null; // Placeholder
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate processing time

      await onSave(editedBlob, mediaItem.fileName);
      onClose(); // Close dialog on success
    } catch (err) {
      console.error('Failed to save edited image:', err);
      setError('Failed to save image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
    // cropper?.zoomTo(newValue as number);
  };

  const handleRotate = (angle: number) => {
    const newRotation = rotation + angle;
    setRotation(newRotation);
    // cropper?.rotate(angle);
  };

  // Reset state when dialog opens with a new item
  React.useEffect(() => {
    if (open) {
      setZoom(1);
      setRotation(0);
      setError(null);
      setIsProcessing(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Image: {mediaItem?.fileName || ''}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {mediaItem && mediaItem.mimeType.startsWith('image/') ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                height: 400,
                width: '100%',
                background: '#f0f0f0',
                mb: 2,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Placeholder for actual image editor/cropper */}
              <Typography
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'grey.600',
                }}
              >
                Image Editor / Cropper Area
              </Typography>
              {/* Example using react-cropper (requires installation) */}
              {/* <Cropper
                 style={{ height: '100%', width: '100%' }}
                 zoomTo={zoom}
                 initialAspectRatio={16 / 9}
                 preview=".img-preview" // Optional preview element class
                 src={mediaItem.url}
                 viewMode={1}
                 minCropBoxHeight={10}
                 minCropBoxWidth={10}
                 background={false}
                 responsive={true}
                 autoCropArea={1}
                 checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                 onInitialized={(instance) => {
                   setCropper(instance);
                 }}
                 guides={true}
                 rotateTo={rotation}
               /> */}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" sx={{ minWidth: '50px' }}>
                Zoom:
              </Typography>
              <Slider
                value={zoom}
                min={0.1}
                max={3}
                step={0.1}
                onChange={handleZoomChange}
                aria-labelledby="zoom-slider"
                valueLabelDisplay="auto"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ minWidth: '50px' }}>
                Rotate:
              </Typography>
              <IconButton onClick={() => handleRotate(-90)} aria-label="rotate left">
                <RotateLeftIcon />
              </IconButton>
              <IconButton onClick={() => handleRotate(90)} aria-label="rotate right">
                <RotateRightIcon />
              </IconButton>
              {/* Add Crop button if using react-cropper */}
              {/* <Button startIcon={<CropIcon />} onClick={() => cropper?.crop()} variant="outlined" size="small">Crop</Button> */}
            </Box>
          </Box>
        ) : (
          <Typography>Editing is only available for images.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isProcessing || !mediaItem?.mimeType.startsWith('image/')}
          variant="contained"
        >
          {isProcessing ? <CircularProgress size={24} /> : 'Save Image'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageEditor;
