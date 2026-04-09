/**
 * Lazy Loading Service
 * 
 * This service provides utilities for lazy loading data in the application.
 * It includes functions for pagination, infinite scrolling, and on-demand loading.
 */

import cacheService from './cache.service';

// Pagination options interface
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  totalItems?: number;
  cacheKey?: string;
  cacheTTL?: number;
}

// Infinite scroll options interface
export interface InfiniteScrollOptions {
  initialPage?: number;
  pageSize?: number;
  threshold?: number;
  cacheKey?: string;
  cacheTTL?: number;
}

// Lazy load options interface
export interface LazyLoadOptions {
  cacheKey?: string;
  cacheTTL?: number;
  loadingDelay?: number;
}

/**
 * Lazy Loading Service
 */
class LazyLoadService {
  /**
   * Fetch paginated data with caching
   * 
   * @param fetchFn Function to fetch data for a specific page
   * @param page Current page
   * @param pageSize Items per page
   * @param cacheKey Optional cache key
   * @param cacheTTL Optional cache TTL
   * @returns Promise with data and total items
   */
  public async fetchPaginatedData<T>(
    fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; totalItems: number }>,
    page: number,
    pageSize: number,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<{ data: T[]; totalItems: number }> {
    // Check cache first if cacheKey is provided
    if (cacheKey) {
      const cacheKeyWithParams = `${cacheKey}_page${page}_size${pageSize}`;
      const cachedData = cacheService.get<{ data: T[]; totalItems: number }>(cacheKeyWithParams);
      
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Fetch data
    const result = await fetchFn(page, pageSize);
    
    // Cache result if cacheKey is provided
    if (cacheKey) {
      const cacheKeyWithParams = `${cacheKey}_page${page}_size${pageSize}`;
      cacheService.set(cacheKeyWithParams, result, { ttl: cacheTTL });
    }
    
    return result;
  }
  
  /**
   * Fetch infinite scroll data with caching
   * 
   * @param fetchFn Function to fetch data for a specific page
   * @param page Current page
   * @param pageSize Items per page
   * @param cacheKey Optional cache key
   * @param cacheTTL Optional cache TTL
   * @returns Promise with data and hasMore flag
   */
  public async fetchInfiniteData<T>(
    fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
    page: number,
    pageSize: number,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<{ data: T[]; hasMore: boolean }> {
    // Check cache first if cacheKey is provided
    if (cacheKey) {
      const cacheKeyWithParams = `${cacheKey}_page${page}_size${pageSize}`;
      const cachedData = cacheService.get<{ data: T[]; hasMore: boolean }>(cacheKeyWithParams);
      
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Fetch data
    const result = await fetchFn(page, pageSize);
    
    // Cache result if cacheKey is provided
    if (cacheKey) {
      const cacheKeyWithParams = `${cacheKey}_page${page}_size${pageSize}`;
      cacheService.set(cacheKeyWithParams, result, { ttl: cacheTTL });
    }
    
    return result;
  }
  
  /**
   * Fetch lazy loaded data with caching
   * 
   * @param fetchFn Function to fetch data
   * @param cacheKey Optional cache key
   * @param cacheTTL Optional cache TTL
   * @returns Promise with data
   */
  public async fetchLazyData<T>(
    fetchFn: () => Promise<T>,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<T> {
    // Check cache first if cacheKey is provided
    if (cacheKey) {
      const cachedData = cacheService.get<T>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Fetch data
    const result = await fetchFn();
    
    // Cache result if cacheKey is provided
    if (cacheKey) {
      cacheService.set(cacheKey, result, { ttl: cacheTTL });
    }
    
    return result;
  }
}

// Create and export a singleton instance
const lazyLoadService = new LazyLoadService();
export default lazyLoadService;