/**
 * Batch Service
 * 
 * This service provides request batching functionality for the application.
 * It allows batching multiple API requests into a single request to reduce
 * network overhead and improve performance.
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config';

// Batch request interface
export interface BatchRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
}

// Batch response interface
export interface BatchResponse<T = any> {
  id: string;
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

// Batch options interface
export interface BatchOptions {
  maxBatchSize?: number; // Maximum number of requests in a batch
  batchEndpoint?: string; // Endpoint for batch requests
  timeout?: number; // Timeout for batch requests in milliseconds
  headers?: Record<string, string>; // Additional headers for batch requests
}

/**
 * Batch Service
 */
class BatchService {
  private queue: BatchRequest[] = [];
  private batchPromise: Promise<any> | null = null;
  private batchTimeout: NodeJS.Timeout | null = null;
  private requestMap: Map<string, { resolve: Function; reject: Function }> = new Map();
  
  // Default options
  private defaultOptions: BatchOptions = {
    maxBatchSize: 10,
    batchEndpoint: '/batch',
    timeout: 50, // 50ms delay to batch requests
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  /**
   * Add a request to the batch queue
   * 
   * @param request Batch request
   * @param options Batch options
   * @returns Promise that resolves with the response
   */
  public add<T = any>(request: BatchRequest, options?: BatchOptions): Promise<BatchResponse<T>> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Add request to queue
    this.queue.push(request);
    
    // Create a promise that will be resolved when the batch is processed
    const promise = new Promise<BatchResponse<T>>((resolve, reject) => {
      this.requestMap.set(request.id, { resolve, reject });
    });
    
    // Schedule batch processing
    this.scheduleBatch(opts);
    
    return promise;
  }
  
  /**
   * Create a batched version of an API function
   * 
   * @param apiFn API function that returns a promise
   * @param options Batch options
   * @returns Batched version of the API function
   */
  public createBatchedApi<T extends (...args: any[]) => Promise<any>>(
    apiFn: T,
    options?: BatchOptions
  ): T {
    return ((...args: Parameters<T>) => {
      // Generate a unique ID for this request
      const id = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a promise that will extract the request details from the original function
      const requestPromise = apiFn(...args)
        .then(() => {
          // This should never be called because we're intercepting the request
          throw new Error('Batch interception failed');
        })
        .catch((error) => {
          // Check if this is an Axios error with a request
          if (error.config) {
            const config = error.config;
            
            // Create a batch request
            const batchRequest: BatchRequest = {
              id,
              method: config.method?.toUpperCase() || 'GET',
              url: config.url?.replace(API_BASE_URL, '') || '',
              data: config.data,
              headers: config.headers
            };
            
            // Add the request to the batch
            return this.add(batchRequest, options);
          }
          
          // If not an Axios error, re-throw
          throw error;
        });
      
      return requestPromise;
    }) as T;
  }
  
  /**
   * Schedule batch processing
   * 
   * @param options Batch options
   */
  private scheduleBatch(options: BatchOptions): void {
    // If a batch is already scheduled, do nothing
    if (this.batchTimeout !== null) {
      return;
    }
    
    // If the queue is full, process immediately
    if (this.queue.length >= (options.maxBatchSize || 10)) {
      this.processBatch(options);
      return;
    }
    
    // Schedule batch processing
    this.batchTimeout = setTimeout(() => {
      this.processBatch(options);
    }, options.timeout || 50);
  }
  
  /**
   * Process the batch queue
   * 
   * @param options Batch options
   */
  private processBatch(options: BatchOptions): void {
    // Clear the timeout
    if (this.batchTimeout !== null) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    // If the queue is empty, do nothing
    if (this.queue.length === 0) {
      return;
    }
    
    // Get the requests to process
    const requests = this.queue.splice(0, options.maxBatchSize || 10);
    
    // Process the batch
    this.batchPromise = this.sendBatchRequest(requests, options)
      .then((responses) => {
        // Process each response
        responses.forEach((response) => {
          const request = this.requestMap.get(response.id);
          if (request) {
            request.resolve(response);
            this.requestMap.delete(response.id);
          }
        });
      })
      .catch((error) => {
        // Reject all requests in the batch
        requests.forEach((request) => {
          const requestPromise = this.requestMap.get(request.id);
          if (requestPromise) {
            requestPromise.reject(error);
            this.requestMap.delete(request.id);
          }
        });
      })
      .finally(() => {
        this.batchPromise = null;
        
        // If there are more requests in the queue, process them
        if (this.queue.length > 0) {
          this.processBatch(options);
        }
      });
  }
  
  /**
   * Send a batch request to the server
   * 
   * @param requests Batch requests
   * @param options Batch options
   * @returns Promise that resolves with the batch responses
   */
  private async sendBatchRequest(
    requests: BatchRequest[],
    options: BatchOptions
  ): Promise<BatchResponse[]> {
    try {
      // Create the request config
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: `${API_BASE_URL}${options.batchEndpoint || '/batch'}`,
        data: { requests },
        headers: options.headers
      };
      
      // Send the request
      const response: AxiosResponse<{ responses: BatchResponse[] }> = await axios(config);
      
      return response.data.responses;
    } catch (error) {
      console.error('Batch request failed:', error);
      throw error;
    }
  }
  
  /**
   * Create an Axios interceptor to automatically batch requests
   * 
   * @param options Batch options
   */
  public setupInterceptor(options?: BatchOptions): void {
    const opts = { ...this.defaultOptions, ...options };
    
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        // Skip batch endpoint
        if (config.url?.includes(opts.batchEndpoint || '/batch')) {
          return config;
        }
        
        // Skip if explicitly disabled
        if (config.batchable === false) {
          return config;
        }
        
        // Generate a unique ID for this request
        const id = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create a batch request
        const batchRequest: BatchRequest = {
          id,
          method: config.method?.toUpperCase() || 'GET',
          url: config.url?.replace(API_BASE_URL, '') || '',
          data: config.data,
          headers: config.headers as Record<string, string>
        };
        
        // Add the request to the batch
        const batchPromise = this.add(batchRequest, opts);
        
        // Throw a special error to cancel the original request
        // This will be caught by the createBatchedApi function
        return Promise.reject({
          config,
          batchPromise,
          isBatchError: true
        });
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor to handle batch errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // If this is a batch error, return the batch promise
        if (error.isBatchError) {
          return error.batchPromise;
        }
        
        return Promise.reject(error);
      }
    );
  }
}

// Add batchable property to AxiosRequestConfig
declare module 'axios' {
  interface AxiosRequestConfig {
    batchable?: boolean;
  }
}

// Create and export a singleton instance
const batchService = new BatchService();
export default batchService;