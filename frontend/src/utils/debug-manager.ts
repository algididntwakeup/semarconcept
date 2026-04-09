// platform/frontend-mui/src/utils/debug-manager.ts
// Types
export interface DebugQuery {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: number;
  duration: number;
  timestamp: string;
  requestData?: any;
  responseData?: any;
  binding?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  error?: string;
}

export interface DebugRoute {
  id: string;
  path: string;
  component: string;
  timestamp: string;
  params?: Record<string, any>;
  query?: Record<string, any>;
  previousPath?: string;
  navigationType: 'push' | 'replace' | 'pop';
  hash?: string;
  search?: string;
}

export interface DebugView {
  id: string;
  component: string;
  displayName: string;
  renderTime: number;
  timestamp: string;
  props?: any;
  phase: 'mount' | 'update' | 'unmount';
  renderCount: number;
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  componentStack?: string;
  errorBoundary?: boolean;
  suspenseStatus?: 'pending' | 'resolved' | 'error';
}

export interface DebugEvent {
  id: string;
  type: string;
  target: string;
  timestamp: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  coordinates?: { x: number; y: number };
  viewport?: { width: number; height: number };
}

export interface DebugException {
  id: string;
  message: string;
  stack: string;
  timestamp: string;
  component?: string;
  props?: any;
  type: 'javascript' | 'promise' | 'react' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  lineno?: number;
  colno?: number;
  userAgent?: string;
  url?: string;
}

export interface DebugRequest {
  id: string;
  url: string;
  method: string;
  status?: number;
  duration?: number;
  timestamp: string;
  headers?: Record<string, string>;
  body?: any;
  response?: any;
  error?: string;
  size?: number;
}

// Component Performance Monitor
interface ComponentStats {
  name: string;
  averageRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  totalRenders: number;
  lastRender: number;
  slowRenders: number;
}

export class ComponentPerformanceMonitor {
  private static instance: ComponentPerformanceMonitor;
  private stats: Map<string, ComponentStats> = new Map();
  private slowRenderThreshold = 100; // ms

  static getInstance(): ComponentPerformanceMonitor {
    if (!ComponentPerformanceMonitor.instance) {
      ComponentPerformanceMonitor.instance = new ComponentPerformanceMonitor();
    }
    return ComponentPerformanceMonitor.instance;
  }

  recordRender(componentName: string, renderTime: number) {
    const existingStats = this.stats.get(componentName);
    
    if (existingStats) {
      const totalTime = existingStats.averageRenderTime * existingStats.totalRenders + renderTime;
      const newTotalRenders = existingStats.totalRenders + 1;
      
      existingStats.averageRenderTime = totalTime / newTotalRenders;
      existingStats.maxRenderTime = Math.max(existingStats.maxRenderTime, renderTime);
      existingStats.minRenderTime = Math.min(existingStats.minRenderTime, renderTime);
      existingStats.totalRenders = newTotalRenders;
      existingStats.lastRender = Date.now();
      
      if (renderTime > this.slowRenderThreshold) {
        existingStats.slowRenders++;
      }
    } else {
      this.stats.set(componentName, {
        name: componentName,
        averageRenderTime: renderTime,
        maxRenderTime: renderTime,
        minRenderTime: renderTime,
        totalRenders: 1,
        lastRender: Date.now(),
        slowRenders: renderTime > this.slowRenderThreshold ? 1 : 0
      });
    }

    // if (renderTime > this.slowRenderThreshold) {
    //   console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime}ms`);
    // }
  }

  getStats(): ComponentStats[] {
    return Array.from(this.stats.values()).sort((a, b) => b.averageRenderTime - a.averageRenderTime);
  }

  getSlowComponents(): ComponentStats[] {
    return this.getStats().filter(stat => stat.slowRenders > 0);
  }

  clearStats() {
    this.stats.clear();
  }
}

// React DevTools Integration
export class ReactDevToolsIntegration {
  private static instance: ReactDevToolsIntegration;
  private isConnected = false;

  static getInstance(): ReactDevToolsIntegration {
    if (!ReactDevToolsIntegration.instance) {
      ReactDevToolsIntegration.instance = new ReactDevToolsIntegration();
    }
    return ReactDevToolsIntegration.instance;
  }

  connect() {
    if (this.isConnected || typeof window === 'undefined') return;

    try {
      if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
        
        if (hook.onCommitFiberRoot) {
          const originalOnCommitFiberRoot = hook.onCommitFiberRoot;
          hook.onCommitFiberRoot = (rendererID: number, root: any, priorityLevel: any) => {
            this.handleFiberCommit(root);
            if (originalOnCommitFiberRoot) {
              originalOnCommitFiberRoot(rendererID, root, priorityLevel);
            }
          };
        }

        this.isConnected = true;
        console.log('🐛 React DevTools integration connected');
      }
    } catch (error) {
      console.warn('Failed to connect React DevTools integration:', error);
    }
  }

  private handleFiberCommit(root: any) {
    try {
      this.traverseFiber(root.current);
    } catch (error) {
      console.warn('Error traversing fiber tree:', error);
    }
  }

  private traverseFiber(fiber: any) {
    if (!fiber) return;

    try {
      if (fiber.type && typeof fiber.type === 'function') {
        const componentName = fiber.type.displayName || fiber.type.name || 'Anonymous';
        const renderTime = fiber.actualDuration || 0;
        
        if (renderTime > 0) {
          const debugManager = getDebugManager();
          debugManager.trackView({
            id: `${Date.now()}-${Math.random()}`,
            component: componentName,
            displayName: componentName,
            renderTime,
            timestamp: new Date().toISOString(),
            phase: fiber.alternate ? 'update' : 'mount',
            renderCount: 1,
            actualDuration: fiber.actualDuration || 0,
            baseDuration: fiber.treeBaseDuration || 0,
            startTime: fiber.actualStartTime || 0,
            commitTime: Date.now()
          });
        }
      }

      let child = fiber.child;
      while (child) {
        this.traverseFiber(child);
        child = child.sibling;
      }
    } catch (error) {
      // Silently handle fiber traversal errors
    }
  }

  disconnect() {
    this.isConnected = false;
  }
}

// Enhanced Debug Manager
export class DebugManager {
  private isInitialized = false;
  private logs: any[] = [];
  private maxEntries = 1000;
  private intervalId?: NodeJS.Timeout;
  private performanceMonitor: ComponentPerformanceMonitor;
  private devToolsIntegration: ReactDevToolsIntegration;

  constructor() {
    this.performanceMonitor = ComponentPerformanceMonitor.getInstance();
    this.devToolsIntegration = ReactDevToolsIntegration.getInstance();
  }

  initializeDebugSystem() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      console.log('🐛 Initializing Enhanced Debug System...');
      
      // Initialize global storage
      this.initializeGlobalStorage();
      
      // Setup all integrations
      this.setupEnhancedErrorHandling();
      this.setupEnhancedEventTracking();
      this.setupApiInterceptors();
      this.setupRouterIntegration();
      this.setupPerformanceMonitoring();
      this.setupViewTracking();
      this.setupDataRotation();

      this.isInitialized = true;
      console.log('✅ Enhanced Debug System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize debug system:', error);
    }
  }

  private initializeGlobalStorage() {
    const globalArrays = [
      '__DEBUG_QUERIES__', '__DEBUG_ROUTES__', '__DEBUG_VIEWS__', '__DEBUG_EVENTS__',
      '__DEBUG_REQUESTS__', '__DEBUG_LOGS__', '__DEBUG_FILES__', '__DEBUG_CACHE__', '__DEBUG_EXCEPTIONS__'
    ];

    globalArrays.forEach(arrayName => {
      if (!(window as any)[arrayName]) {
        (window as any)[arrayName] = [];
      }
    });
  }

  private setupDataRotation() {
    this.intervalId = setInterval(() => {
      this.rotateData();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private rotateData() {
    try {
      const globalArrays = [
        '__DEBUG_QUERIES__', '__DEBUG_ROUTES__', '__DEBUG_VIEWS__', '__DEBUG_EVENTS__',
        '__DEBUG_REQUESTS__', '__DEBUG_LOGS__', '__DEBUG_FILES__', '__DEBUG_CACHE__', '__DEBUG_EXCEPTIONS__'
      ];

      globalArrays.forEach(arrayName => {
        const array = (window as any)[arrayName];
        if (array && array.length > this.maxEntries) {
          array.splice(0, array.length - this.maxEntries);
        }
      });
    } catch (error) {
      console.warn('Error rotating debug data:', error);
    }
  }

  // ✅ API INTERCEPTORS
  private setupApiInterceptors() {
    this.setupAxiosInterceptor();
    this.setupFetchInterceptor();
  }

  private setupAxiosInterceptor() {
    if (typeof window === 'undefined') return;

    try {
      // Try to get axios from window or import
      const axios = (window as any).axios;
      if (!axios) return;

      // Request interceptor
      axios.interceptors.request.use((config: any) => {
        config.metadata = { startTime: Date.now() };
        return config;
      }, (error: any) => {
        return Promise.reject(error);
      });

      // Response interceptor
      axios.interceptors.response.use(
        (response: any) => {
          const endTime = Date.now();
          const duration = endTime - (response.config.metadata?.startTime || endTime);
          
          this.trackQuery({
            id: `axios-${Date.now()}-${Math.random()}`,
            endpoint: response.config.url || 'unknown',
            method: (response.config.method || 'GET').toUpperCase(),
            status: response.status,
            duration,
            timestamp: new Date().toISOString(),
            requestData: response.config.data,
            responseData: this.sanitizeData(response.data),
            headers: response.config.headers,
            binding: 'axios'
          });
          
          return response;
        },
        (error: any) => {
          const endTime = Date.now();
          const duration = error.config?.metadata ? 
            endTime - error.config.metadata.startTime : 0;
          
          this.trackQuery({
            id: `axios-error-${Date.now()}-${Math.random()}`,
            endpoint: error.config?.url || 'unknown',
            method: (error.config?.method || 'GET').toUpperCase(),
            status: error.response?.status || 0,
            duration,
            timestamp: new Date().toISOString(),
            requestData: error.config?.data,
            responseData: this.sanitizeData(error.response?.data),
            headers: error.config?.headers,
            binding: 'axios',
            error: error.message
          });
          
          return Promise.reject(error);
        }
      );

      console.log('📡 Axios interceptor setup complete');
    } catch (error) {
      console.warn('Failed to setup Axios interceptor:', error);
    }
  }

  private setupFetchInterceptor() {
    if (typeof window === 'undefined' || !window.fetch) return;

    try {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args: any[]) => {
        const startTime = Date.now();
        const url = args[0];
        const options = args[1] || {};
        
        try {
          const response = await originalFetch(...args);
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Clone response to read body without consuming it
          const responseClone = response.clone();
          let responseData: any;
          
          try {
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              responseData = await responseClone.json();
            } else {
              responseData = await responseClone.text();
            }
          } catch (e) {
            responseData = '[Unable to parse response]';
          }
          
          this.trackQuery({
            id: `fetch-${Date.now()}-${Math.random()}`,
            endpoint: url.toString(),
            method: (options.method || 'GET').toUpperCase(),
            status: response.status,
            duration,
            timestamp: new Date().toISOString(),
            requestData: options.body,
            responseData: this.sanitizeData(responseData),
            headers: options.headers,
            binding: 'fetch'
          });
          
          return response;
        } catch (error: any) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          this.trackQuery({
            id: `fetch-error-${Date.now()}-${Math.random()}`,
            endpoint: url.toString(),
            method: (options.method || 'GET').toUpperCase(),
            status: 0,
            duration,
            timestamp: new Date().toISOString(),
            requestData: options.body,
            headers: options.headers,
            binding: 'fetch',
            error: error.message
          });
          
          throw error;
        }
      };

      console.log('🌐 Fetch interceptor setup complete');
    } catch (error) {
      console.warn('Failed to setup Fetch interceptor:', error);
    }
  }

  // ✅ ROUTER INTEGRATION
  private setupRouterIntegration() {
    if (typeof window === 'undefined') return;

    try {
      // Listen for popstate events (browser navigation)
      window.addEventListener('popstate', (event) => {
        this.trackRoute({
          id: `route-pop-${Date.now()}`,
          path: window.location.pathname,
          component: this.getComponentFromPath(window.location.pathname),
          timestamp: new Date().toISOString(),
          params: event.state || {},
          query: Object.fromEntries(new URLSearchParams(window.location.search)),
          navigationType: 'pop',
          hash: window.location.hash,
          search: window.location.search
        });
      });

      // Override pushState and replaceState
      const originalPushState = history.pushState.bind(history);
      const originalReplaceState = history.replaceState.bind(history);

      history.pushState = (state, title, url) => {
        originalPushState(state, title, url);
        
        this.trackRoute({
          id: `route-push-${Date.now()}`,
          path: url?.toString() || window.location.pathname,
          component: this.getComponentFromPath(url?.toString() || window.location.pathname),
          timestamp: new Date().toISOString(),
          params: state || {},
          query: Object.fromEntries(new URLSearchParams(window.location.search)),
          navigationType: 'push',
          hash: window.location.hash,
          search: window.location.search
        });
      };

      history.replaceState = (state, title, url) => {
        originalReplaceState(state, title, url);
        
        this.trackRoute({
          id: `route-replace-${Date.now()}`,
          path: url?.toString() || window.location.pathname,
          component: this.getComponentFromPath(url?.toString() || window.location.pathname),
          timestamp: new Date().toISOString(),
          params: state || {},
          query: Object.fromEntries(new URLSearchParams(window.location.search)),
          navigationType: 'replace',
          hash: window.location.hash,
          search: window.location.search
        });
      };

      // Track initial page load
      this.trackRoute({
        id: `route-initial-${Date.now()}`,
        path: window.location.pathname,
        component: this.getComponentFromPath(window.location.pathname),
        timestamp: new Date().toISOString(),
        params: {},
        query: Object.fromEntries(new URLSearchParams(window.location.search)),
        navigationType: 'push',
        hash: window.location.hash,
        search: window.location.search
      });

      console.log('🗺️ Router integration setup complete');
    } catch (error) {
      console.warn('Failed to setup router integration:', error);
    }
  }

  private getComponentFromPath(path: string): string {
    // Simple component name inference from path
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'HomePage';
    
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) + 'Page';
  }

  // ✅ ENHANCED EVENT TRACKING
  private setupEnhancedEventTracking() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    try {
      // Track clicks
      document.addEventListener('click', (event) => {
        this.trackEvent({
          id: `click-${Date.now()}-${Math.random()}`,
          type: 'click',
          target: this.getElementSelector(event.target as HTMLElement),
          timestamp: new Date().toISOString(),
          data: {
            x: event.clientX,
            y: event.clientY,
            button: event.button,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
          },
          coordinates: { x: event.clientX, y: event.clientY },
          viewport: { width: window.innerWidth, height: window.innerHeight }
        });
      }, true);

      // Track keyboard events
      document.addEventListener('keydown', (event) => {
        // Only track special keys to avoid overwhelming data
        if (event.key === 'Enter' || event.key === 'Escape' || event.key === 'Tab' || 
            event.ctrlKey || event.altKey || event.metaKey) {
          this.trackEvent({
            id: `keydown-${Date.now()}-${Math.random()}`,
            type: 'keydown',
            target: this.getElementSelector(event.target as HTMLElement),
            timestamp: new Date().toISOString(),
            data: {
              key: event.key,
              code: event.code,
              ctrlKey: event.ctrlKey,
              shiftKey: event.shiftKey,
              altKey: event.altKey,
              metaKey: event.metaKey
            }
          });
        }
      }, true);

      // Track form submissions
      document.addEventListener('submit', (event) => {
        this.trackEvent({
          id: `submit-${Date.now()}-${Math.random()}`,
          type: 'submit',
          target: this.getElementSelector(event.target as HTMLElement),
          timestamp: new Date().toISOString(),
          data: {
            formData: this.getFormData(event.target as HTMLFormElement)
          }
        });
      }, true);

      // Track window resize
      let resizeTimeout: NodeJS.Timeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.trackEvent({
            id: `resize-${Date.now()}`,
            type: 'resize',
            target: 'window',
            timestamp: new Date().toISOString(),
            data: {
              width: window.innerWidth,
              height: window.innerHeight,
              devicePixelRatio: window.devicePixelRatio
            },
            viewport: { width: window.innerWidth, height: window.innerHeight }
          });
        }, 250);
      });

      // Track visibility changes
      document.addEventListener('visibilitychange', () => {
        this.trackEvent({
          id: `visibility-${Date.now()}`,
          type: 'visibilitychange',
          target: 'document',
          timestamp: new Date().toISOString(),
          data: {
            hidden: document.hidden,
            visibilityState: document.visibilityState
          }
        });
      });

      console.log('📊 Enhanced event tracking setup complete');
    } catch (error) {
      console.warn('Failed to setup event tracking:', error);
    }
  }

  private getElementSelector(element: HTMLElement): string {
    if (!element) return 'unknown';

    try {
      // Get ID
      if (element.id) {
        return `#${element.id}`;
      }

      // Get data-testid
      const testId = element.getAttribute('data-testid');
      if (testId) {
        return `[data-testid="${testId}"]`;
      }

      // Get class names
      if (element.className && typeof element.className === 'string') {
        const classes = element.className.split(' ')
          .filter(cls => cls.trim().length > 0)
          .slice(0, 2)
          .join('.');
        
        if (classes) {
          return `.${classes}`;
        }
      }

      // Get tag name with role
      const tagName = element.tagName ? element.tagName.toLowerCase() : 'unknown';
      const role = element.getAttribute('role');
      if (role) {
        return `${tagName}[role="${role}"]`;
      }

      // Get tag name with type (for inputs)
      const type = element.getAttribute('type');
      if (type && tagName === 'input') {
        return `${tagName}[type="${type}"]`;
      }

      return tagName;
    } catch (error) {
      return 'unknown';
    }
  }

  private getFormData(form: HTMLFormElement): Record<string, any> {
    try {
      const formData = new FormData(form);
      const data: Record<string, any> = {};
      
      formData.forEach((value, key) => {
        // Don't capture sensitive data
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          data[key] = '[REDACTED]';
        } else {
          data[key] = value;
        }
      });
      
      return data;
    } catch (error) {
      return { error: 'Unable to capture form data' };
    }
  }

  // ✅ ENHANCED ERROR HANDLING
  private setupEnhancedErrorHandling() {
    if (typeof window === 'undefined') return;

    try {
      // Global error handler
      window.addEventListener('error', (event) => {
        this.logException({
          id: `js-error-${Date.now()}-${Math.random()}`,
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
          timestamp: new Date().toISOString(),
          type: 'javascript',
          severity: this.categorizeSeverity(event.message),
          stack: event.error?.stack || 'No stack trace available',
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      });

      // Promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.logException({
          id: `promise-error-${Date.now()}-${Math.random()}`,
          message: `Unhandled Promise Rejection: ${event.reason}`,
          timestamp: new Date().toISOString(),
          type: 'promise',
          severity: 'high',
          error: event.reason,
          stack: event.reason?.stack || 'No stack trace available',
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      });

      console.log('🚨 Enhanced error handling setup complete');
    } catch (error) {
      console.warn('Failed to setup error handling:', error);
    }
  }

  private categorizeSeverity(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('script error')) return 'low';
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) return 'medium';
    if (lowerMessage.includes('cannot read property') || 
        lowerMessage.includes('undefined') || 
        lowerMessage.includes('null')) return 'high';
    if (lowerMessage.includes('out of memory') || 
        lowerMessage.includes('maximum call stack')) return 'critical';
    
    return 'medium';
  }

  // ✅ PERFORMANCE MONITORING
  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // Monitor navigation timing
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackTiming({
              type: 'navigation',
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              timestamp: new Date().toISOString()
            });
          }
        });
      });
      
      navObserver.observe({ entryTypes: ['navigation'] });

      // Monitor paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.trackTiming({
            type: entry.name,
            value: entry.startTime,
            timestamp: new Date().toISOString()
          });
        });
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });

      // Monitor largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.trackTiming({
            type: 'largest-contentful-paint',
            value: entry.startTime,
            timestamp: new Date().toISOString()
          });
        });
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      console.log('⚡ Performance monitoring setup complete');
    } catch (error) {
      console.warn('Failed to setup performance monitoring:', error);
    }
  }

  // ✅ VIEW TRACKING
  private setupViewTracking() {
    try {
      this.devToolsIntegration.connect();
      console.log('👁️ View tracking setup complete');
    } catch (error) {
      console.warn('Failed to setup view tracking:', error);
    }
  }

  // Helper methods
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    try {
      const str = JSON.stringify(data);
      if (str.length > 10000) {
        return '[Data too large to display]';
      }
      
      // Remove potential sensitive data
      const sanitized = str.replace(
        /"(password|token|secret|key|auth|credential)[^"]*":\s*"[^"]*"/gi,
        '"$1": "[REDACTED]"'
      );
      
      return JSON.parse(sanitized);
    } catch (error) {
      return '[Unable to sanitize data]';
    }
  }

  private trackTiming(timing: any) {
    if ((window as any).__DEBUG_TIMING__) {
      (window as any).__DEBUG_TIMING__.push({
        ...timing,
        id: `timing-${Date.now()}-${Math.random()}`
      });
    }
  }

  // Public tracking methods
  public trackQuery(query: DebugQuery) {
    if ((window as any).__DEBUG_QUERIES__) {
      (window as any).__DEBUG_QUERIES__.push({
        ...query,
        timestamp: query.timestamp || new Date().toISOString()
      });
    }
  }

  public trackRoute(route: DebugRoute) {
    if ((window as any).__DEBUG_ROUTES__) {
      (window as any).__DEBUG_ROUTES__.push({
        ...route,
        timestamp: route.timestamp || new Date().toISOString()
      });
    }
  }

  public trackView(view: DebugView) {
    if ((window as any).__DEBUG_VIEWS__) {
      (window as any).__DEBUG_VIEWS__.push({
        ...view,
        timestamp: view.timestamp || new Date().toISOString()
      });

      this.performanceMonitor.recordRender(view.component, view.renderTime);
    }
  }

  public trackEvent(event: DebugEvent) {
    if ((window as any).__DEBUG_EVENTS__) {
      (window as any).__DEBUG_EVENTS__.push({
        ...event,
        timestamp: event.timestamp || new Date().toISOString()
      });
    }
  }

  public trackRequest(request: DebugRequest) {
    if ((window as any).__DEBUG_REQUESTS__) {
      (window as any).__DEBUG_REQUESTS__.push({
        ...request,
        timestamp: request.timestamp || new Date().toISOString()
      });
    }
  }

  public logException(exception: DebugException) {
    if ((window as any).__DEBUG_EXCEPTIONS__) {
      (window as any).__DEBUG_EXCEPTIONS__.push({
        ...exception,
        timestamp: exception.timestamp || new Date().toISOString()
      });
    }

    this.log('error', `Exception caught: ${exception.message}`, exception);
  }

  public log(level: string, message: string, data?: any) {
    const logEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
      source: 'debug-manager'
    };

    this.logs.push(logEntry);
    
    if ((window as any).__DEBUG_LOGS__) {
      (window as any).__DEBUG_LOGS__.push(logEntry);
    }

    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[DEBUG] ${message}`, data || '');
  }

  // Utility methods
  public isDevelopmentMode(): boolean {
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
  }

  public getDebugData() {
    return {
      queries: (window as any).__DEBUG_QUERIES__ || [],
      routes: (window as any).__DEBUG_ROUTES__ || [],
      views: (window as any).__DEBUG_VIEWS__ || [],
      events: (window as any).__DEBUG_EVENTS__ || [],
      requests: (window as any).__DEBUG_REQUESTS__ || [],
      logs: (window as any).__DEBUG_LOGS__ || [],
      files: (window as any).__DEBUG_FILES__ || [],
      cache: (window as any).__DEBUG_CACHE__ || [],
      exceptions: (window as any).__DEBUG_EXCEPTIONS__ || []
    };
  }

  public clearData() {
    try {
      this.logs = [];
      const globalArrays = [
        '__DEBUG_QUERIES__', '__DEBUG_ROUTES__', '__DEBUG_VIEWS__', '__DEBUG_EVENTS__',
        '__DEBUG_REQUESTS__', '__DEBUG_LOGS__', '__DEBUG_FILES__', '__DEBUG_CACHE__', '__DEBUG_EXCEPTIONS__'
      ];

      globalArrays.forEach(arrayName => {
        const array = (window as any)[arrayName];
        if (array) array.length = 0;
      });

      this.performanceMonitor.clearStats();
    } catch (error) {
      console.error('Error clearing debug data:', error);
    }
  }

  public exportData() {
    return {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.logs,
      performanceStats: this.performanceMonitor.getStats(),
      ...this.getDebugData()
    };
  }

  public getViewStats() {
    return {
      stats: this.performanceMonitor.getStats(),
      slowComponents: this.performanceMonitor.getSlowComponents()
    };
  }

  public destroy() {
    try {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.devToolsIntegration.disconnect();
      this.isInitialized = false;
    } catch (error) {
      console.error('Error destroying debug manager:', error);
    }
  }
}

// Global instance
let DebugManagerInstance: DebugManager;

export const getDebugManager = (): DebugManager => {
  if (!DebugManagerInstance) {
    DebugManagerInstance = new DebugManager();
  }
  return DebugManagerInstance;
};

export const initializeEnhancedDebugSystem = () => {
  const manager = getDebugManager();
  manager.initializeDebugSystem();
  console.log('✅ Enhanced Debug system ready - look for the red bug icon!');
};

// Enhanced global type declarations
declare global {
  interface Window {
    __DEBUG_QUERIES__?: any[];
    __DEBUG_ROUTES__?: any[];
    __DEBUG_VIEWS__?: any[];
    __DEBUG_EVENTS__?: any[];
    __DEBUG_REQUESTS__?: any[];
    __DEBUG_LOGS__?: any[];
    __DEBUG_FILES__?: any[];
    __DEBUG_CACHE__?: any[];
    __DEBUG_EXCEPTIONS__?: any[];
    __DEBUG_TIMING__?: any[];
    axios?: any;
  }
}

export default DebugManager;
export const initializeDebugSystem = initializeEnhancedDebugSystem;
export const getEnhancedDebugManager = getDebugManager;
