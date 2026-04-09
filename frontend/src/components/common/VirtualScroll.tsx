// platform/frontend-mui/src/components/common/VirtualScroll.tsx
import React, { useState, useEffect, useRef, useCallback, CSSProperties } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export interface VirtualScrollProps<T> {
  /**
   * Array of items to render
   */
  items: T[];
  
  /**
   * Function to render an item
   */
  renderItem: (item: T, index: number, style: CSSProperties) => React.ReactNode;
  
  /**
   * Height of the container in pixels
   */
  height: number;
  
  /**
   * Height of each item in pixels
   * Can be a fixed number or a function that returns the height for a specific item
   */
  itemHeight: number | ((item: T, index: number) => number);
  
  /**
   * Number of items to render outside the visible area (above and below)
   * Higher values reduce blank areas when scrolling fast but impact performance
   */
  overscan?: number;
  
  /**
   * Whether more items can be loaded
   */
  hasMore?: boolean;
  
  /**
   * Function to load more items
   */
  loadMore?: () => void;
  
  /**
   * Whether items are currently being loaded
   */
  loading?: boolean;
  
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Custom empty state component
   */
  emptyComponent?: React.ReactNode;
  
  /**
   * Custom error component
   */
  errorComponent?: React.ReactNode;
  
  /**
   * Error object
   */
  error?: Error | null;
  
  /**
   * Additional class name
   */
  className?: string;
  
  /**
   * Additional style
   */
  style?: CSSProperties;
  
  /**
   * Threshold in pixels to trigger loadMore when scrolling to the bottom
   */
  threshold?: number;
}

/**
 * VirtualScroll component
 * 
 * This component efficiently renders large lists by only rendering items that are visible
 * in the viewport, plus a configurable number of items above and below (overscan).
 * 
 * It also supports infinite scrolling by triggering a loadMore function when the user
 * scrolls near the bottom of the list.
 */
function VirtualScroll<T>({
  items,
  renderItem,
  height,
  itemHeight,
  overscan = 3,
  hasMore = false,
  loadMore,
  loading = false,
  loadingComponent,
  emptyComponent,
  errorComponent,
  error = null,
  className,
  style,
  threshold = 250
}: VirtualScrollProps<T>) {
  // Ref for the scroll container
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // State for scroll position
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate total height of all items
  const getItemHeight = useCallback(
    (item: T, index: number) => {
      return typeof itemHeight === 'function' ? itemHeight(item, index) : itemHeight;
    },
    [itemHeight]
  );
  
  // Calculate total height of all items
  const totalHeight = items.reduce(
    (height, item, index) => height + getItemHeight(item, index),
    0
  );
  
  // Handle scroll event
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop);
      
      // Check if we need to load more items
      if (
        hasMore &&
        !loading &&
        loadMore &&
        scrollRef.current.scrollHeight - scrollRef.current.scrollTop <=
          scrollRef.current.clientHeight + threshold
      ) {
        loadMore();
      }
    }
  }, [hasMore, loading, loadMore, threshold]);
  
  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);
  
  // Calculate visible items
  const getVisibleItems = useCallback(() => {
    if (!items.length) return [];
    
    let startIndex = 0;
    let endIndex = 0;
    let currentOffset = 0;
    
    // Find the first visible item
    for (let i = 0; i < items.length; i++) {
      const itemHeightValue = getItemHeight(items[i], i);
      if (currentOffset + itemHeightValue > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      currentOffset += itemHeightValue;
    }
    
    // Reset offset to the start of the first visible item
    currentOffset = 0;
    for (let i = 0; i < startIndex; i++) {
      currentOffset += getItemHeight(items[i], i);
    }
    
    // Find the last visible item
    for (let i = startIndex; i < items.length; i++) {
      const itemHeightValue = getItemHeight(items[i], i);
      if (currentOffset > scrollTop + height) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
      currentOffset += itemHeightValue;
    }
    
    // If we haven't found an end index, it means all remaining items fit in the viewport
    if (endIndex === 0) {
      endIndex = Math.min(items.length - 1, startIndex + Math.ceil(height / (typeof itemHeight === 'number' ? itemHeight : 50)) + overscan);
    }
    
    // Return the visible items with their offsets
    const visibleItems = [];
    let offsetTop = 0;
    
    for (let i = 0; i < items.length; i++) {
      const itemHeightValue = getItemHeight(items[i], i);
      
      if (i >= startIndex && i <= endIndex) {
        visibleItems.push({
          item: items[i],
          index: i,
          offsetTop
        });
      }
      
      offsetTop += itemHeightValue;
    }
    
    return visibleItems;
  }, [items, scrollTop, height, getItemHeight, overscan]);
  
  // Get visible items
  const visibleItems = getVisibleItems();
  
  // Render empty state
  if (items.length === 0 && !loading && !error) {
    return (
      <Box
        ref={scrollRef}
        className={className}
        style={{
          height,
          overflow: 'auto',
          position: 'relative',
          ...style
        }}
      >
        {emptyComponent || (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography variant="body1" color="textSecondary">
              No items to display
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box
        ref={scrollRef}
        className={className}
        style={{
          height,
          overflow: 'auto',
          position: 'relative',
          ...style
        }}
      >
        {errorComponent || (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography variant="body1" color="error">
              {error.message || 'An error occurred'}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
  
  return (
    <Box
      ref={scrollRef}
      className={className}
      style={{
        height,
        overflow: 'auto',
        position: 'relative',
        ...style
      }}
    >
      {/* Container with the total height of all items */}
      <Box style={{ height: totalHeight, position: 'relative' }}>
        {/* Render only visible items */}
        {visibleItems.map(({ item, index, offsetTop }) => (
          <Box
            key={index}
            style={{
              position: 'absolute',
              top: offsetTop,
              left: 0,
              right: 0,
              height: getItemHeight(item, index)
            }}
          >
            {renderItem(item, index, {
              width: '100%',
              height: '100%'
            })}
          </Box>
        ))}
      </Box>
      
      {/* Loading indicator */}
      {loading && (
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {loadingComponent || <CircularProgress size={24} />}
        </Box>
      )}
    </Box>
  );
}

export default VirtualScroll;