/**
 * Cache Service
 * 
 * This service provides client-side caching functionality for the application.
 * It supports in-memory and localStorage caching with configurable TTL (time-to-live).
 */

import { CACHE } from '../config';

// Cache entry interface
interface CacheEntry<T> {
  value: T;
  expiry: number | null; // Timestamp when the entry expires, null for no expiry
}

// Cache options interface
export interface CacheOptions {
  ttl?: number; // Time-to-live in milliseconds, default from config
  storage?: 'memory' | 'local'; // Storage type, default is memory
  namespace?: string; // Namespace for the cache key
}

/**
 * Cache Service
 */
class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  
  /**
   * Set a value in the cache
   * 
   * @param key Cache key
   * @param value Value to cache
   * @param options Cache options
   */
  public set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const {
      ttl = CACHE.DEFAULT_TTL,
      storage = 'memory',
      namespace = ''
    } = options;
    
    // Calculate expiry timestamp
    const expiry = ttl > 0 ? Date.now() + ttl : null;
    
    // Create cache entry
    const entry: CacheEntry<T> = {
      value,
      expiry
    };
    
    // Generate namespaced key
    const namespacedKey = this.getNamespacedKey(key, namespace);
    
    // Store in memory cache
    if (storage === 'memory') {
      this.memoryCache.set(namespacedKey, entry);
      return;
    }
    
    // Store in localStorage
    if (storage === 'local') {
      try {
        localStorage.setItem(
          namespacedKey,
          JSON.stringify(entry)
        );
      } catch (error) {
        console.error('Failed to store in localStorage:', error);
        // Fallback to memory cache
        this.memoryCache.set(namespacedKey, entry);
      }
    }
  }
  
  /**
   * Get a value from the cache
   * 
   * @param key Cache key
   * @param options Cache options
   * @returns Cached value or null if not found or expired
   */
  public get<T>(key: string, options: CacheOptions = {}): T | null {
    const {
      storage = 'memory',
      namespace = ''
    } = options;
    
    // Generate namespaced key
    const namespacedKey = this.getNamespacedKey(key, namespace);
    
    // Get from memory cache
    if (storage === 'memory') {
      return this.getFromMemory<T>(namespacedKey);
    }
    
    // Get from localStorage
    if (storage === 'local') {
      return this.getFromLocalStorage<T>(namespacedKey);
    }
    
    return null;
  }
  
  /**
   * Check if a key exists in the cache and is not expired
   * 
   * @param key Cache key
   * @param options Cache options
   * @returns True if the key exists and is not expired
   */
  public has(key: string, options: CacheOptions = {}): boolean {
    const {
      storage = 'memory',
      namespace = ''
    } = options;
    
    // Generate namespaced key
    const namespacedKey = this.getNamespacedKey(key, namespace);
    
    // Check memory cache
    if (storage === 'memory') {
      const entry = this.memoryCache.get(namespacedKey);
      if (!entry) {
        return false;
      }
      
      // Check if expired
      if (entry.expiry && entry.expiry < Date.now()) {
        this.memoryCache.delete(namespacedKey);
        return false;
      }
      
      return true;
    }
    
    // Check localStorage
    if (storage === 'local') {
      try {
        const item = localStorage.getItem(namespacedKey);
        if (!item) {
          return false;
        }
        
        const entry: CacheEntry<any> = JSON.parse(item);
        
        // Check if expired
        if (entry.expiry && entry.expiry < Date.now()) {
          localStorage.removeItem(namespacedKey);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Failed to check localStorage:', error);
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Remove a value from the cache
   * 
   * @param key Cache key
   * @param options Cache options
   */
  public remove(key: string, options: CacheOptions = {}): void {
    const {
      storage = 'memory',
      namespace = ''
    } = options;
    
    // Generate namespaced key
    const namespacedKey = this.getNamespacedKey(key, namespace);
    
    // Remove from memory cache
    if (storage === 'memory') {
      this.memoryCache.delete(namespacedKey);
    }
    
    // Remove from localStorage
    if (storage === 'local') {
      try {
        localStorage.removeItem(namespacedKey);
      } catch (error) {
        console.error('Failed to remove from localStorage:', error);
      }
    }
  }
  
  /**
   * Clear all values from the cache
   * 
   * @param options Cache options
   */
  public clear(options: CacheOptions = {}): void {
    const {
      storage = 'memory',
      namespace = ''
    } = options;
    
    // Clear memory cache
    if (storage === 'memory') {
      if (namespace) {
        // Clear only namespaced keys
        const prefix = this.getNamespacePrefix(namespace);
        [...this.memoryCache.keys()]
          .filter(key => key.startsWith(prefix))
          .forEach(key => this.memoryCache.delete(key));
      } else {
        // Clear all keys
        this.memoryCache.clear();
      }
    }
    
    // Clear localStorage
    if (storage === 'local') {
      try {
        if (namespace) {
          // Clear only namespaced keys
          const prefix = this.getNamespacePrefix(namespace);
          Object.keys(localStorage)
            .filter(key => key.startsWith(prefix))
            .forEach(key => localStorage.removeItem(key));
        } else {
          // Clear all keys with the cache prefix
          Object.keys(localStorage)
            .filter(key => key.startsWith(CACHE.STORAGE_PREFIX))
            .forEach(key => localStorage.removeItem(key));
        }
      } catch (error) {
        console.error('Failed to clear localStorage:', error);
      }
    }
  }
  
  /**
   * Get a value from memory cache
   * 
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (entry.expiry && entry.expiry < Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }
  
  /**
   * Get a value from localStorage
   * 
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }
      
      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check if expired
      if (entry.expiry && entry.expiry < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return entry.value;
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return null;
    }
  }
  
  /**
   * Generate a namespaced key
   * 
   * @param key Cache key
   * @param namespace Namespace
   * @returns Namespaced key
   */
  private getNamespacedKey(key: string, namespace: string): string {
    const prefix = this.getNamespacePrefix(namespace);
    return `${prefix}${key}`;
  }
  
  /**
   * Get namespace prefix
   * 
   * @param namespace Namespace
   * @returns Namespace prefix
   */
  private getNamespacePrefix(namespace: string): string {
    return namespace ? `${CACHE.STORAGE_PREFIX}${namespace}:` : CACHE.STORAGE_PREFIX;
  }
  
  /**
   * Create a cached function that will cache the result of the function
   * 
   * @param fn Function to cache
   * @param keyFn Function to generate cache key from arguments
   * @param options Cache options
   * @returns Cached function
   */
  public memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyFn: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args),
    options: CacheOptions = {}
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyFn(...args);
      
      // Check if result is cached
      const cachedResult = this.get<ReturnType<T>>(key, options);
      if (cachedResult !== null) {
        return cachedResult;
      }
      
      // Call the function and cache the result
      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.then(value => {
          this.set(key, value, options);
          return value;
        }) as ReturnType<T>;
      }
      
      // Cache the result
      this.set(key, result, options);
      return result;
    }) as T;
  }
}

// Create and export a singleton instance
const cacheService = new CacheService();
export default cacheService;