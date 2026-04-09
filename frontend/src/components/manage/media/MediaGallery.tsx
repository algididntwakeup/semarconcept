import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Pagination, // For handling many items
  Tooltip,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilePresentIcon from '@mui/icons-material/FilePresent'; // For non-image files
import { MediaItemData } from '../../../types/media'; // Import shared type

interface MediaGalleryProps {
  // Props for fetching/filtering media will be added later
  onSelectItem?: (item: MediaItemData) => void; // For use cases like selecting an image for a post
  onEditItem?: (item: MediaItemData) => void;
  onDeleteItem?: (id: string) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ onSelectItem, onEditItem, onDeleteItem }) => {
  // Placeholder state - replace with Redux/API call
  const [mediaItems, setMediaItems] = useState<MediaItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12; // Example

  useEffect(() => {
    // TODO: Fetch media items from API/store
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      // Simulate fetch
      const mockItems: MediaItemData[] = Array.from({ length: 25 }, (_, i) => ({
        id: `media-${i + 1}`,
        url:
          i % 3 === 0
            ? `/placeholder-files/document-${i + 1}.pdf` // Mock URL
            : `https://via.placeholder.com/300x200/text=Media+${i + 1}`,
        thumbnailUrl:
          i % 3 === 0 ? undefined : `https://via.placeholder.com/150x100/text=Thumb+${i + 1}`,
        fileName: i % 3 === 0 ? `document-${i + 1}.pdf` : `image-${i + 1}.jpg`,
        altText: i % 3 !== 0 ? `Placeholder Image ${i + 1}` : undefined,
        caption: i % 3 !== 0 ? `This is media item ${i + 1}` : undefined,
        mimeType: i % 3 === 0 ? 'application/pdf' : 'image/jpeg',
        size: (i + 1) * 50 * 1024, // Example size
        uploadedAt: new Date(Date.now() - i * 3600000).toISOString(),
        // width and height would typically come from backend metadata for images/videos
      }));
      setMediaItems(mockItems);
      setIsLoading(false);
    }, 1000);
  }, []); // Add dependencies like filters later

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // TODO: Fetch data for the new page
  };

  const handleDelete = (id: string) => {
    console.log('Deleting media item:', id);
    // TODO: Call API/dispatch action
    if (onDeleteItem) {
      onDeleteItem(id);
    }
    // Mock delete:
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEdit = (item: MediaItemData) => {
    console.log('Editing media item:', item.id);
    if (onEditItem) {
      onEditItem(item);
    }
    // TODO: Open edit modal/navigate
  };

  const handleSelect = (item: MediaItemData) => {
    console.log('Selecting media item:', item.id);
    if (onSelectItem) {
      onSelectItem(item);
    }
    // TODO: Indicate selection visually? Close modal?
  };

  const paginatedItems = mediaItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const pageCount = Math.ceil(mediaItems.length / itemsPerPage);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {mediaItems.length === 0 ? (
        <Typography sx={{ textAlign: 'center', p: 3 }}>No media items found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {paginatedItems.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              {/* Using type assertion as a workaround for persistent Grid typing issue */}
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component={item.mimeType.startsWith('image/') ? 'img' : 'div'}
                  sx={{
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: item.mimeType.startsWith('image/')
                      ? 'transparent'
                      : 'grey.200',
                  }}
                  image={
                    item.mimeType.startsWith('image/') ? item.thumbnailUrl || item.url : undefined
                  }
                  title={item.fileName}
                >
                  {!item.mimeType.startsWith('image/') && (
                    <FilePresentIcon sx={{ fontSize: 60, color: 'grey.500' }} />
                  )}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Tooltip title={item.fileName}>
                    <Typography gutterBottom variant="subtitle2" noWrap component="div">
                      {item.fileName}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary">
                    {(item.size / 1024).toFixed(1)} KB | {item.mimeType}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  {onSelectItem && (
                    <Button size="small" onClick={() => handleSelect(item)}>
                      Select
                    </Button>
                  )}
                  <Box>
                    {onEditItem && (
                      <Tooltip title="Edit Details">
                        <IconButton size="small" onClick={() => handleEdit(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDeleteItem && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={pageCount} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Box>
  );
};

export default MediaGallery;
