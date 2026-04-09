// =============================================================================
// FIXED DebugConsole.tsx - Main Component with CSS Import Order Fix
// =============================================================================

// platform/frontend-mui/src/components/debug/DebugConsole.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Chip,
  Badge,
  useTheme,
  Tooltip,
  Grid,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  BugReport as BugReportIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Maximize as MaximizeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Api as ApiIcon,
  Route as RouteIcon,
  Visibility as VisibilityIcon,
  Event as EventIcon,
  Computer as ComputerIcon,
  Web as LanguageIcon,
  Storage as StorageIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Folder as CacheIcon,
  AccessTime as ScheduleIcon,
  Memory as MemoryIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// Import all collector components
import QueryCollector from './collectors/QueryCollector';
import RouteCollector from './collectors/RouteCollector';
import ViewCollector from './collectors/ViewCollector';
import EventsCollector from './collectors/EventsCollector';
import EnvironmentCollector from './collectors/EnvironmentCollector';
import RequestCollector from './collectors/RequestCollector';
import LogsCollector from './collectors/LogsCollector';
import FilesCollector from './collectors/FilesCollector';
import ConfigCollector from './collectors/ConfigCollector';
import CacheCollector from './collectors/CacheCollector';
import TimeDataCollector from './collectors/TimeDataCollector';
import MemoryCollector from './collectors/MemoryCollector';
import ExceptionsCollector from './collectors/ExceptionsCollector';
import StorageCollector from './collectors/StorageCollector';

// Enhanced Debug Manager - Import with error handling
let getDebugManager: () => any;
try {
  const debugManagerModule = require('../../utils/debug-manager');
  getDebugManager = debugManagerModule.getDebugManager;
} catch (error) {
  console.warn('Debug manager not available:', error);
  getDebugManager = () => ({
    initializeDebugSystem: () => {},
    logException: () => {},
    destroy: () => {}
  });
}

// Types
interface DebugData {
  queries: any[];
  routes: any[];
  views: any[];
  events: any[];
  requests: any[];
  logs: any[];
  files: any[];
  config: any;
  cache: any[];
  timing: any;
  memory: any;
  exceptions: any[];
  environment: any;
  storage: any;
}

// Error Boundary for Collectors
class CollectorErrorBoundary extends React.Component<
  { children: React.ReactNode; collectorName: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.collectorName}:`, error, errorInfo);
    
    // Log to debug manager with error handling
    try {
      const debugManager = getDebugManager();
      debugManager.logException({
        id: `${Date.now()}-${Math.random()}`,
        message: `Collector Error: ${error.message}`,
        component: this.props.collectorName,
        timestamp: new Date().toISOString(),
        type: 'react',
        severity: 'high',
        stack: error.stack || '',
        props: errorInfo
      });
    } catch (debugError) {
      console.warn('Could not log to debug manager:', debugError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error" sx={{ fontSize: '0.75rem' }}>
            Error loading {this.props.collectorName}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', mt: 1 }}>
            {this.state.error?.message}
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingCollector: React.FC<{ title: string }> = ({ title }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
    <CircularProgress size={20} />
    <Typography sx={{ ml: 1, fontSize: '0.75rem' }}>Loading {title}...</Typography>
  </Box>
);

const DebugConsole: React.FC = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Drag functionality state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragRef = useRef<HTMLDivElement>(null);

  // Debug data states with improved initialization
  const [debugData, setDebugData] = useState<DebugData>(() => ({
    queries: (window as any).__DEBUG_QUERIES__ || [],
    routes: (window as any).__DEBUG_ROUTES__ || [],
    views: (window as any).__DEBUG_VIEWS__ || [],
    events: (window as any).__DEBUG_EVENTS__ || [],
    requests: (window as any).__DEBUG_REQUESTS__ || [],
    logs: (window as any).__DEBUG_LOGS__ || [],
    files: (window as any).__DEBUG_FILES__ || [],
    config: {},
    cache: (window as any).__DEBUG_CACHE__ || [],
    timing: {},
    memory: {},
    exceptions: (window as any).__DEBUG_EXCEPTIONS__ || [],
    environment: null,
    storage: {},
  }));

  const [storageAccordionExpanded, setStorageAccordionExpanded] = useState<string | false>(false);

  // Initialize debug system with error handling
  useEffect(() => {
    try {
      const debugManager = getDebugManager();
      debugManager.initializeDebugSystem();
      startPerformanceMonitoring();
    } catch (error) {
      console.warn('Failed to initialize debug system:', error);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      try {
        const debugManager = getDebugManager();
        debugManager.destroy();
      } catch (error) {
        console.warn('Failed to destroy debug system:', error);
      }
    };
  }, []);

  // Enhanced environment data collection with error handling
  const collectEnvironmentData = useCallback(() => {
    try {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        online: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        screen: { 
          width: screen.width, 
          height: screen.height,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth
        },
        window: { 
          width: window.innerWidth, 
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio
        },
        memory: (performance as any)?.memory,
        connection: (navigator as any)?.connection,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Error collecting environment data:', error);
      return {
        userAgent: 'Unknown',
        platform: 'Unknown',
        language: 'Unknown',
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // Optimized performance monitoring with error handling
  const startPerformanceMonitoring = useCallback(() => {
    intervalRef.current = setInterval(() => {
      try {
        // Update memory usage
        if ((performance as any)?.memory) {
          const memory = {
            used: Math.round(((performance as any).memory.usedJSHeapSize / 1024 / 1024) * 100) / 100,
            total: Math.round(((performance as any).memory.totalJSHeapSize / 1024 / 1024) * 100) / 100,
            limit: Math.round(((performance as any).memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100,
            timestamp: new Date().toISOString(),
          };
          
          setDebugData(prev => ({ ...prev, memory }));
        }

        // Update timing data
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const timing = {
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
            loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
            timestamp: new Date().toISOString()
          };
          
          setDebugData(prev => ({ ...prev, timing }));
        }

        // Sync with global debug data
        syncDebugData();
      } catch (error) {
        console.warn('Error in performance monitoring:', error);
      }
    }, 3000);
  }, []);

  // Improved data synchronization with error handling
  const syncDebugData = useCallback(() => {
    try {
      // Collect storage data with error handling
      const storageData = {
        localStorage: {},
        sessionStorage: {},
        cookies: {},
        userAuth: {},
        tokens: {}
      };

      // Collect localStorage safely
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            try {
              const value = localStorage.getItem(key);
              (storageData.localStorage as any)[key] = value;
            } catch (e) {
              (storageData.localStorage as any)[key] = '[Error reading value]';
            }
          }
        }
      } catch (e) {
        console.warn('Cannot access localStorage:', e);
      }

      // Collect sessionStorage safely
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            try {
              const value = sessionStorage.getItem(key);
              (storageData.sessionStorage as any)[key] = value;
            } catch (e) {
              (storageData.sessionStorage as any)[key] = '[Error reading value]';
            }
          }
        }
      } catch (e) {
        console.warn('Cannot access sessionStorage:', e);
      }

      // Collect cookies safely
      try {
        document.cookie.split(';').forEach(cookie => {
          const [name, ...valueParts] = cookie.trim().split('=');
          if (name && valueParts.length > 0) {
            (storageData.cookies as any)[name] = { value: valueParts.join('=') };
          }
        });
      } catch (e) {
        console.warn('Cannot access cookies:', e);
      }

      // Enhanced user auth data collection
      try {
        const authKeys = ['auth_token', 'token', 'access_token', 'jwt_token'];
        const userKeys = ['user_data', 'user', 'currentUser', 'userData'];
        
        let authToken = null;
        let userData = null;

        // Find auth token
        for (const key of authKeys) {
          const value = localStorage.getItem(key) || sessionStorage.getItem(key);
          if (value) {
            authToken = value;
            break;
          }
        }

        // Find user data
        for (const key of userKeys) {
          const value = localStorage.getItem(key) || sessionStorage.getItem(key);
          if (value) {
            try {
              userData = JSON.parse(value);
              break;
            } catch (e) {
              userData = value;
            }
          }
        }
        
        storageData.userAuth = {
          isLoggedIn: !!authToken,
          username: userData?.username || userData?.name || null,
          email: userData?.email || null,
          userId: userData?.id || userData?.userId || null,
          roles: userData?.roles || userData?.permissions || [],
          loginTime: localStorage.getItem('login_time') || sessionStorage.getItem('login_time'),
          lastActivity: localStorage.getItem('last_activity') || sessionStorage.getItem('last_activity'),
          sessionExpiry: localStorage.getItem('session_expiry') || sessionStorage.getItem('session_expiry'),
        };

        storageData.tokens = {
          authToken: {
            value: authToken,
            length: authToken?.length || 0,
            type: authToken?.startsWith('eyJ') ? 'JWT' : 'Unknown',
            expiry: localStorage.getItem('token_expiry') || sessionStorage.getItem('token_expiry')
          }
        };
      } catch (e) {
        console.warn('Cannot parse auth data:', e);
        storageData.userAuth = { isLoggedIn: false };
        storageData.tokens = {};
      }

      // Enhanced config data
      const configData = {
        NODE_ENV: (import.meta.env as any)?.MODE || 'unknown',
        BASE_URL: (import.meta.env as any)?.BASE_URL || 'unknown',
        DEV: (import.meta.env as any)?.DEV || false,
        PROD: (import.meta.env as any)?.PROD || false,
        SSR: (import.meta.env as any)?.SSR || false,
        ...Object.keys((import.meta.env as any) || {})
          .filter(key => key.startsWith('VITE_'))
          .reduce((acc, key) => {
            acc[key] = (import.meta.env as any)[key];
            return acc;
          }, {} as Record<string, any>)
      };

      // Sync all data with size limits
      setDebugData(prev => ({
        ...prev,
        queries: [...((window as any).__DEBUG_QUERIES__ || [])].slice(-1000),
        routes: [...((window as any).__DEBUG_ROUTES__ || [])].slice(-1000),
        views: [...((window as any).__DEBUG_VIEWS__ || [])].slice(-1000),
        events: [...((window as any).__DEBUG_EVENTS__ || [])].slice(-1000),
        requests: [...((window as any).__DEBUG_REQUESTS__ || [])].slice(-1000),
        logs: [...((window as any).__DEBUG_LOGS__ || [])].slice(-1000),
        files: [...((window as any).__DEBUG_FILES__ || [])].slice(-1000),
        cache: [...((window as any).__DEBUG_CACHE__ || [])].slice(-1000),
        exceptions: [...((window as any).__DEBUG_EXCEPTIONS__ || [])].slice(-1000),
        environment: collectEnvironmentData(),
        storage: storageData,
        config: configData,
      }));
    } catch (error) {
      console.error('Error syncing debug data:', error);
    }
  }, [collectEnvironmentData]);

  // Enhanced cleanup with error handling
  const clearDebugData = useCallback(() => {
    try {
      // Clear global storage
      const globalArrays = [
        '__DEBUG_QUERIES__', '__DEBUG_ROUTES__', '__DEBUG_VIEWS__', '__DEBUG_EVENTS__',
        '__DEBUG_REQUESTS__', '__DEBUG_LOGS__', '__DEBUG_FILES__', '__DEBUG_CACHE__', '__DEBUG_EXCEPTIONS__'
      ];

      globalArrays.forEach(arrayName => {
        if ((window as any)[arrayName]) {
          ((window as any)[arrayName] as any[]).length = 0;
        }
      });
      
      // Clear local state
      setDebugData({
        queries: [], routes: [], views: [], events: [], requests: [],
        logs: [], files: [], config: {}, cache: [], timing: {},
        memory: {}, exceptions: [], environment: null, storage: {},
      });

      console.log('🧹 Debug data cleared');
    } catch (error) {
      console.error('Error clearing debug data:', error);
    }
  }, []);

  // Enhanced export functionality with error handling
  const exportDebugData = useCallback(() => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...debugData,
        summary: {
          totalQueries: debugData.queries.length,
          totalRoutes: debugData.routes.length,
          totalViews: debugData.views.length,
          totalEvents: debugData.events.length,
          totalExceptions: debugData.exceptions.length,
          memoryUsage: (debugData.memory as any)?.used || 0,
          isLoggedIn: (debugData.storage as any)?.userAuth?.isLoggedIn || false
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-data-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('📤 Debug data exported successfully');
    } catch (error) {
      console.error('Error exporting debug data:', error);
    }
  }, [debugData]);

  // Drag functionality (with error handling)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    try {
      if (!dragRef.current) return;
      
      const rect = dragRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    } catch (error) {
      console.warn('Error in drag start:', error);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    try {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      const maxX = window.innerWidth - (isMinimized ? 300 : 800);
      const maxY = window.innerHeight - (isMinimized ? 50 : 600);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    } catch (error) {
      console.warn('Error in drag move:', error);
    }
  }, [isDragging, dragOffset, isMinimized]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Memoized tabs with error boundaries and suspense
  const tabs = useMemo(() => [
    { 
      label: 'Storage', 
      icon: <StorageIcon />, 
      count: Object.keys((debugData.storage as any)?.localStorage || {}).length, 
      component: (
        <StorageCollector 
          data={debugData.storage as any} 
          expanded={storageAccordionExpanded}
          onExpandedChange={setStorageAccordionExpanded}
        />
      )
    },
    { 
      label: 'Views', 
      icon: <VisibilityIcon />, 
      count: debugData.views.length, 
      component: <ViewCollector data={debugData.views} />
    },
    { 
      label: 'Queries', 
      icon: <ApiIcon />, 
      count: debugData.queries.length, 
      component: <QueryCollector data={debugData.queries} />
    },
    { 
      label: 'Routes', 
      icon: <RouteIcon />, 
      count: debugData.routes.length, 
      component: <RouteCollector data={debugData.routes} />
    },
    { 
      label: 'Requests', 
      icon: <LanguageIcon />, 
      count: debugData.requests.length, 
      component: <RequestCollector data={debugData.requests} />
    },
    { 
      label: 'Events', 
      icon: <EventIcon />, 
      count: debugData.events.length, 
      component: <EventsCollector data={debugData.events} />
    },
    { 
      label: 'Exceptions', 
      icon: <ErrorIcon />, 
      count: debugData.exceptions.length, 
      component: <ExceptionsCollector data={debugData.exceptions} />
    },
    { 
      label: 'Environment', 
      icon: <ComputerIcon />, 
      count: 0, 
      component: <EnvironmentCollector data={debugData.environment} />
    },
    { 
      label: 'Memory', 
      icon: <MemoryIcon />, 
      count: 0, 
      component: <MemoryCollector data={debugData.memory} />
    },
    { 
      label: 'Timing', 
      icon: <ScheduleIcon />, 
      count: 0, 
      component: <TimeDataCollector data={debugData.timing} />
    },
    { 
      label: 'Logs', 
      icon: <DescriptionIcon />, 
      count: debugData.logs.length, 
      component: <LogsCollector data={debugData.logs} />
    },
    { 
      label: 'Files', 
      icon: <StorageIcon />, 
      count: debugData.files.length, 
      component: <FilesCollector data={debugData.files} />
    },
    { 
      label: 'Config', 
      icon: <SettingsIcon />, 
      count: Object.keys(debugData.config).length, 
      component: <ConfigCollector data={debugData.config} />
    },
    { 
      label: 'Cache', 
      icon: <CacheIcon />, 
      count: debugData.cache.length, 
      component: <CacheCollector data={debugData.cache} />
    },
  ], [debugData, storageAccordionExpanded]);

  const getTabLabel = (label: string, count: number) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{label}</Typography>
      {count > 0 && <Chip label={count} size="small" sx={{ fontSize: '0.6rem', height: 16 }} />}
    </Box>
  );

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ height: '100%', overflow: 'auto', padding: '4px', fontSize: '0.75rem' }}>
      {value === index && children}
    </div>
  );

  // Floating button when closed
  if (!isOpen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
        }}
      >
        <Tooltip title="Open Debug Console">
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              backgroundColor: theme.palette.error.main,
              color: 'white',
              width: 40,
              height: 40,
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
              },
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.7)}` },
                '70%': { boxShadow: `0 0 0 10px ${alpha(theme.palette.error.main, 0)}` },
                '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
              },
            }}
          >
            <Badge badgeContent={debugData.exceptions.length} color="warning">
              <BugReportIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  // Main debug console UI
  return (
    <Paper
      ref={dragRef}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: isMinimized ? 500 : 800,
        height: isMinimized ? 40 : 600,
        zIndex: 9998,
        backgroundColor: alpha(theme.palette.background.paper, isDragging ? 0.9 : 0.95),
        backdropFilter: 'blur(10px)',
        border: `2px solid ${theme.palette.error.main}`,
        borderRadius: 2,
        overflow: 'hidden',
        userSelect: 'none',
        fontSize: '0.75rem',
        opacity: isDragging ? 0.8 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s ease',
        boxShadow: isDragging ? theme.shadows[8] : theme.shadows[4],
      }}
    >
      {/* Header - Drag Handle */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          backgroundColor: theme.palette.error.main,
          color: 'white',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          fontSize: '0.75rem',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 0.25,
            opacity: 0.7,
            mr: 0.5
          }}>
            <Box sx={{ width: 4, height: 1, backgroundColor: 'white', borderRadius: 0.5 }} />
            <Box sx={{ width: 4, height: 1, backgroundColor: 'white', borderRadius: 0.5 }} />
            <Box sx={{ width: 4, height: 1, backgroundColor: 'white', borderRadius: 0.5 }} />
          </Box>
          <BugReportIcon sx={{ fontSize: 16 }} />
          <Typography variant="subtitle1" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
            🐛 Enhanced Debug Console
          </Typography>
          <Chip 
            label={`${debugData.queries.length + debugData.routes.length + debugData.exceptions.length} events`}
            size="small"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontSize: '0.7rem',
              height: 20,
            }}
          />
        </Box>
        
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={syncDebugData} size="small" sx={{ color: 'white', p: 0.5 }}>
              <RefreshIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear All Data">
            <IconButton onClick={clearDebugData} size="small" sx={{ color: 'white', p: 0.5 }}>
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Debug Data">
            <IconButton onClick={exportDebugData} size="small" sx={{ color: 'white', p: 0.5 }}>
              <DownloadIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={isMinimized ? "Maximize" : "Minimize"}>
            <IconButton onClick={() => setIsMinimized(!isMinimized)} size="small" sx={{ color: 'white', p: 0.5 }}>
              {isMinimized ? <MaximizeIcon sx={{ fontSize: 16 }} /> : <MinimizeIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ color: 'white', p: 0.5 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {!isMinimized && (
        <>
          {/* Enhanced Quick Stats */}
          <Box sx={{ p: 0.5, backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }}>
            <Grid container spacing={0.5}>
              <Grid item xs={2}>
                <Chip label={`Q: ${debugData.queries.length}`} size="small" color="primary" sx={{ fontSize: '0.6rem', height: 20 }} />
              </Grid>
              <Grid item xs={2}>
                <Chip label={`R: ${debugData.routes.length}`} size="small" color="secondary" sx={{ fontSize: '0.6rem', height: 20 }} />
              </Grid>
              <Grid item xs={2}>
                <Chip label={`V: ${debugData.views.length}`} size="small" color="info" sx={{ fontSize: '0.6rem', height: 20 }} />
              </Grid>
              <Grid item xs={2}>
                <Chip label={`E: ${debugData.events.length}`} size="small" color="success" sx={{ fontSize: '0.6rem', height: 20 }} />
              </Grid>
              <Grid item xs={2}>
                <Chip label={`Err: ${debugData.exceptions.length}`} size="small" color="error" sx={{ fontSize: '0.6rem', height: 20 }} />
              </Grid>
              <Grid item xs={2}>
                <Chip label={`${(debugData.memory as any)?.used || 0}MB`} size="small" color="warning" sx={{ fontSize: '0.6rem', height: 20 }} />
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                minHeight: 36,
                '& .MuiTab-root': {
                  minHeight: 36,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  py: 0.5,
                  px: 1,
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={getTabLabel(tab.label, tab.count)}
                  iconPosition="start"
                  sx={{ minWidth: 'auto' }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Panels with Error Boundaries */}
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={currentTab} index={index}>
              <CollectorErrorBoundary collectorName={tab.label}>
                <Suspense fallback={<LoadingCollector title={tab.label} />}>
                  {tab.component}
                </Suspense>
              </CollectorErrorBoundary>
            </TabPanel>
          ))}
        </>
      )}
    </Paper>
  );
};

// Enhanced Global type declarations
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
    axios?: any;
  }
}

export default DebugConsole;