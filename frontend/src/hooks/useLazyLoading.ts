/**
 * Lazy Loading Hooks
 * 
 * This file provides React hooks for lazy loading data in the application.
 * It includes hooks for pagination, infinite scrolling, and on-demand loading.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import lazyLoadService from '../services/lazyLoad.service';
import { PaginationOptions, InfiniteScrollOptions, LazyLoadOptions } from '../services/lazyLoad.service';

/**
 * Hook for paginated data loading
 * 
 * @param fetchFn Function to fetch data for a specific page
 * @param options Pagination options
 * @returns Pagination state and controls
 */
export function usePagination<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; totalItems: number }>,
  options: PaginationOptions = {}
) {
  const {
    page: initialPage = 1,
    pageSize: initialPageSize = 10,
    totalItems: initialTotalItems = 0,
    cacheKey,
    cacheTTL
  } = options;
  
  // State for pagination
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch data when page or pageSize changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await lazyLoadService.fetchPaginatedData(
          fetchFn,
          page,
          pageSize,
          cacheKey,
          cacheTTL
        );
        
        setData(result.data);
        setTotalItems(result.totalItems);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchFn, page, pageSize, cacheKey, cacheTTL]);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);
  
  // Refresh data
  const refresh = useCallback(() => {
    // Re-fetch current page
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await lazyLoadService.fetchPaginatedData(
          fetchFn,
          page,
          pageSize,
          cacheKey,
          cacheTTL
        );
        
        setData(result.data);
        setTotalItems(result.totalItems);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchFn, page, pageSize, cacheKey, cacheTTL]);
  
  return {
    data,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    refresh
  };
}

/**
 * Hook for infinite scroll data loading
 * 
 * @param fetchFn Function to fetch data for a specific page
 * @param options Infinite scroll options
 * @returns Infinite scroll state and controls
 */
export function useInfiniteScroll<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: InfiniteScrollOptions = {}
) {
  const {
    initialPage = 1,
    pageSize = 10,
    threshold = 100,
    cacheKey,
    cacheTTL
  } = options;
  
  // State for infinite scroll
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Ref for the observer
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Ref for the last element
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }, {
      rootMargin: `0px 0px ${threshold}px 0px`
    });
    
    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, threshold]);
  
  // Fetch data when page changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await lazyLoadService.fetchInfiniteData(
          fetchFn,
          page,
          pageSize,
          cacheKey,
          cacheTTL
        );
        
        setData((prevData) => (
          page === initialPage 
            ? result.data 
            : [...prevData, ...result.data]
        ));
        setHasMore(result.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchFn, page, pageSize, initialPage, cacheKey, cacheTTL]);
  
  // Reset data and fetch first page
  const reset = useCallback(() => {
    setPage(initialPage);
    setData([]);
    setHasMore(true);
  }, [initialPage]);
  
  // Refresh data
  const refresh = useCallback(() => {
    reset();
    // The page change will trigger a new fetch
  }, [reset]);
  
  return {
    data,
    loading,
    error,
    hasMore,
    lastElementRef,
    refresh,
    reset
  };
}

/**
 * Hook for lazy loading data on demand
 * 
 * @param fetchFn Function to fetch data
 * @param options Lazy load options
 * @returns Lazy load state and controls
 */
export function useLazyLoad<T>(
  fetchFn: () => Promise<T>,
  options: LazyLoadOptions = {}
) {
  const {
    cacheKey,
    cacheTTL,
    loadingDelay = 0
  } = options;
  
  // State for lazy load
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(false);
  
  // Load data function
  const load = useCallback(async () => {
    // If already loaded, return the data
    if (loaded) {
      return data;
    }
    
    // Set loading state with delay if specified
    if (loadingDelay > 0) {
      const timeoutId = setTimeout(() => {
        if (!loaded) {
          setLoading(true);
        }
      }, loadingDelay);
      
      // Clear timeout if load completes before delay
      const clearLoadingTimeout = () => clearTimeout(timeoutId);
      setTimeout(clearLoadingTimeout, loadingDelay + 100);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const result = await lazyLoadService.fetchLazyData(
        fetchFn,
        cacheKey,
        cacheTTL
      );
      
      setData(result);
      setLoaded(true);
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [fetchFn, loaded, data, cacheKey, cacheTTL, loadingDelay]);
  
  // Reset data and loaded state
  const reset = useCallback(() => {
    setData(null);
    setLoaded(false);
    setError(null);
  }, []);
  
  // Refresh data
  const refresh = useCallback(async () => {
    reset();
    return load();
  }, [reset, load]);
  
  return {
    data,
    loading,
    error,
    loaded,
    load,
    reset,
    refresh
  };
}