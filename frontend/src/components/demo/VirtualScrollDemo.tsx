import React, { useState, useEffect, CSSProperties } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import VirtualScroll from '../common/VirtualScroll';
import { useInfiniteScroll } from '../../hooks/useLazyLoading';

// Demo item interface
interface DemoItem {
  id: number;
  title: string;
  description: string;
  height: number;
  color: string;
}

// Generate random items for demo
const generateItems = (count: number, startIndex = 0): DemoItem[] => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'
  ];
  
  return Array.from({ length: count }).map((_, index) => {
    const itemIndex = startIndex + index;
    return {
      id: itemIndex,
      title: `Item ${itemIndex}`,
      description: `This is a description for item ${itemIndex}. It can be of variable length to demonstrate different item heights.${
        itemIndex % 3 === 0 ? ' This item has extra content to make it taller.' : ''
      }${
        itemIndex % 5 === 0 ? ' Even more content is added to this item to demonstrate variable heights.' : ''
      }`,
      height: Math.floor(Math.random() * 3) * 50 + 100, // Random height: 100, 150, or 200
      color: colors[itemIndex % colors.length]
    };
  });
};

// Mock API function to fetch items
const fetchItems = (page: number, pageSize: number): Promise<{ data: DemoItem[]; hasMore: boolean }> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const startIndex = (page - 1) * pageSize;
      const items = generateItems(pageSize, startIndex);
      
      // Simulate end of data after 500 items
      const hasMore = startIndex + pageSize < 500;
      
      resolve({ data: items, hasMore });
    }, 800); // Simulate network delay
  });
};

/**
 * VirtualScrollDemo component
 * 
 * This component demonstrates the VirtualScroll component with various configuration options.
 */
const VirtualScrollDemo: React.FC = () => {
  // State for demo configuration
  const [itemCount, setItemCount] = useState(100);
  const [itemHeight, setItemHeight] = useState<number | 'variable'>(100);
  const [containerHeight, setContainerHeight] = useState(400);
  const [overscan, setOverscan] = useState(3);
  const [useInfinite, setUseInfinite] = useState(true);
  
  // State for static items (when not using infinite scroll)
  const [staticItems, setStaticItems] = useState<DemoItem[]>([]);
  
  // Use infinite scroll hook
  const {
    data: infiniteItems,
    loading,
    error,
    hasMore,
    lastElementRef,
    refresh
  } = useInfiniteScroll<DemoItem>(fetchItems, {
    pageSize: 20,
    threshold: 200
  });
  
  // Generate static items when not using infinite scroll
  useEffect(() => {
    if (!useInfinite) {
      setStaticItems(generateItems(itemCount));
    }
  }, [useInfinite, itemCount]);
  
  // Get the items to display
  const items = useInfinite ? infiniteItems : staticItems;
  
  // Render an item
  const renderItem = (item: DemoItem, index: number, style: CSSProperties) => {
    const isLastItem = useInfinite && index === items.length - 1;
    
    return (
      <Paper
        ref={isLastItem ? lastElementRef : undefined}
        elevation={2}
        style={{
          ...style,
          padding: 16,
          margin: 8,
          backgroundColor: item.color + '22', // Add transparency
          borderLeft: `4px solid ${item.color}`,
          overflow: 'hidden'
        }}
      >
        <Typography variant="h6" gutterBottom>
          {item.title}
        </Typography>
        <Typography variant="body2">
          {item.description}
        </Typography>
        <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="textSecondary">
            ID: {item.id}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Height: {item.height}px
          </Typography>
        </Box>
      </Paper>
    );
  };
  
  // Get item height function
  const getItemHeight = (item: DemoItem) => {
    return itemHeight === 'variable' ? item.height : itemHeight;
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Virtual Scroll Demo
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          This demo showcases the VirtualScroll component, which efficiently renders large lists by only
          rendering items that are visible in the viewport.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useInfinite}
                  onChange={(e) => setUseInfinite(e.target.checked)}
                  color="primary"
                />
              }
              label="Use Infinite Scrolling"
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={useInfinite ? refresh : () => setStaticItems(generateItems(itemCount))}
              startIcon={<CircularProgress size={16} sx={{ opacity: loading ? 1 : 0 }} />}
              disabled={loading}
            >
              Reload Data
            </Button>
          </Grid>
          
          {!useInfinite && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Item Count"
                type="number"
                value={itemCount}
                onChange={(e) => setItemCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 0)))}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 1000 } }}
                helperText="Number of items to render (1-1000)"
              />
            </Grid>
          )}
          
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="item-height-label">Item Height</InputLabel>
              <Select
                labelId="item-height-label"
                value={itemHeight}
                onChange={(e) => setItemHeight(e.target.value as number | 'variable')}
                label="Item Height"
              >
                <MenuItem value="variable">Variable</MenuItem>
                <MenuItem value={80}>Small (80px)</MenuItem>
                <MenuItem value={100}>Medium (100px)</MenuItem>
                <MenuItem value={150}>Large (150px)</MenuItem>
                <MenuItem value={200}>Extra Large (200px)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography gutterBottom>Container Height: {containerHeight}px</Typography>
            <Slider
              value={containerHeight}
              onChange={(_, value) => setContainerHeight(value as number)}
              min={200}
              max={800}
              step={50}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography gutterBottom>Overscan: {overscan}</Typography>
            <Slider
              value={overscan}
              onChange={(_, value) => setOverscan(value as number)}
              min={0}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ height: containerHeight, border: '1px solid #ddd', borderRadius: 1 }}>
          <VirtualScroll
            items={items}
            renderItem={renderItem}
            height={containerHeight}
            itemHeight={itemHeight === 'variable' ? getItemHeight : itemHeight as number}
            overscan={overscan}
            hasMore={useInfinite && hasMore}
            loadMore={useInfinite ? () => {} : undefined} // The hook handles loading more
            loading={loading}
            error={error}
            loadingComponent={
              <Box display="flex" alignItems="center">
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2">Loading more items...</Typography>
              </Box>
            }
            emptyComponent={
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No items to display
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={useInfinite ? refresh : () => setStaticItems(generateItems(itemCount))}
                >
                  Load Items
                </Button>
              </Box>
            }
          />
        </Box>
        
        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            {items.length} items loaded
            {useInfinite && hasMore && ', scroll down to load more'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VirtualScrollDemo;