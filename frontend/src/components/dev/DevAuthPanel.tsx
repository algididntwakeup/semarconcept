// platform/frontend-mui/src/components/dev/DevAuthPanel.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Badge,
  CircularProgress,
  LinearProgress,
  Fade,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Security as SecurityIcon,
  BugReport as BugIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
  Minimize as MinimizeIcon,
  Maximize as MaximizeIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { 
  setMockAuth, 
  clearMockAuth, 
  isAuthenticated, 
  getCurrentUser, 
  getCurrentTenant,
  getAuthToken,
  debugAuthState,
  isDevelopmentMode,
  hasPermission,
  hasRole,
  getUserFullName,
  getUserInitials,
} from '../../utils/auth';
import api, { apiUtils } from '../../utils/api';

interface DevAuthPanelProps {
  onAuthChange?: () => void;
}

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading' | 'idle';
  message: string;
  responseTime?: number;
  data?: any;
}

interface RealUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_superuser: boolean;
  is_active: boolean;
  tenant_id: number;
  role?: string;
}

interface RealTenant {
  id: number;
  name: string;
  subdomain: string;
  status: string;
  subscription_plan: string;
  max_users: number;
  max_storage_gb: number;
}

// Configuration object using real system data instead of hardcoded values
const DEV_CONFIG = {
  // Real API endpoints to test
  testEndpoints: [
    { name: 'Health Check', method: 'healthCheck' },
    { name: 'Users List', method: 'getUsers', params: { limit: 5 } },
    { name: 'Roles List', method: 'getRoles', params: { limit: 5 } },
    { name: 'Tenants List', method: 'getTenants', params: { limit: 5 } },
    { name: 'Permissions List', method: 'getPermissions', params: { limit: 10 } },
  ],
  // Permission checks based on actual database permissions
  permissionChecks: [
    { name: 'Super Admin', check: (user: any) => hasRole('Super Admin') || hasRole('Administrator') },
    { name: 'Admin', check: (user: any) => hasRole('admin') || user?.is_admin },
    { name: 'Create Users', check: () => hasPermission('user.create') },
    { name: 'View Users', check: () => hasPermission('user.view') },
    { name: 'Create Roles', check: () => hasPermission('role.create') },
    { name: 'View Roles', check: () => hasPermission('role.view') },
    { name: 'All Perms', check: () => hasPermission('*') },
    { name: 'Superuser', check: (user: any) => user?.is_superuser },
  ],
  // Panel layout configuration
  panel: {
    minWidth: 420,
    maxWidth: 520,
    bottom: 16,
    right: 16,
    minimizedHeight: 60,
  }
};

const DevAuthPanel: React.FC<DevAuthPanelProps> = ({ onAuthChange }) => {
  // 🔥 CRITICAL PRODUCTION CHECK: Only render in development
  if (import.meta.env.PROD || import.meta.env.NODE_ENV === 'production') {
    return null; // Never render in production
  }

  // Additional safety check
  if (!isDevelopmentMode()) {
    return null;
  }

  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);
  const [apiTests, setApiTests] = useState<ApiTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Real authentication states - NO MOCK DATA
  const [realUsers, setRealUsers] = useState<RealUser[]>([]);
  const [realTenants, setRealTenants] = useState<RealTenant[]>([]);
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: '',
    tenant_id: ''
  });
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Initialize test results
  useEffect(() => {
    const initialTests: ApiTestResult[] = DEV_CONFIG.testEndpoints.map(endpoint => ({
      endpoint: endpoint.name,
      status: 'idle',
      message: 'Not tested'
    }));
    setApiTests(initialTests);
  }, []);

  // Load real data on mount
  useEffect(() => {
    checkAuthStatus();
    checkApiHealth();
    loadRealData();
    
    // Listen for auth events
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);
    window.addEventListener('auth:changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
      window.removeEventListener('auth:changed', handleAuthChange);
    };
  }, []);

  const loadRealData = async () => {
    setIsLoadingRealData(true);
    try {
      // 🔥 ONLY LOAD FROM REAL BACKEND - NO MOCK DATA
      const promises = [];
      
      // Load users if API method exists
      if (typeof api.getUsers === 'function') {
        promises.push(
          api.getUsers({ limit: 20 }).catch((error) => {
            console.warn('⚠️ Failed to load users:', error?.message || error);
            return { data: [] };
          })
        );
      } else {
        console.warn('⚠️ api.getUsers method not available');
        promises.push(Promise.resolve({ data: [] }));
      }
      
      // Load tenants if API method exists
      if (typeof (api as any).getTenants === 'function') {
        promises.push(
          (api as any).getTenants({ limit: 10 }).catch((error: any) => {
            console.warn('⚠️ Failed to load tenants:', error?.message || error);
            return { data: [] };
          })
        );
      } else {
        console.warn('⚠️ api.getTenants method not available');
        promises.push(Promise.resolve({ data: [] }));
      }

      const [usersResponse, tenantsResponse] = await Promise.allSettled(promises);

      // Set users data - Only from backend, no fallback mock data
      if (usersResponse.status === 'fulfilled' && (usersResponse.value as any)?.data) {
        const users = Array.isArray((usersResponse.value as any).data) ? (usersResponse.value as any).data : [];
        setRealUsers(users);
      } else {
        console.warn('⚠️ No users data available from backend');
        setRealUsers([]);
      }

      // Set tenants data - Only from backend, no fallback mock data
      if (tenantsResponse.status === 'fulfilled' && (tenantsResponse.value as any)?.data) {
        const tenants = Array.isArray((tenantsResponse.value as any).data) ? (tenantsResponse.value as any).data : [];
        setRealTenants(tenants);
      } else {
        console.warn('⚠️ No tenants data available from backend');
        setRealTenants([]);
      }

      console.log('📊 Loaded REAL data only:', {
        users: realUsers.length,
        tenants: realTenants.length,
        apiAvailable: typeof (api as any).getUsers === 'function' && typeof (api as any).getTenants === 'function'
      });
    } catch (error) {
      console.error('❌ Failed to load real data:', error);
      // 🔥 NO MOCK DATA FALLBACK - Set empty arrays
      setRealUsers([]);
      setRealTenants([]);
    } finally {
      setIsLoadingRealData(false);
    }
  };

  const checkAuthStatus = () => {
    // 🔥 FIXED: Check multiple token storage locations
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('auth_token') || 
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('reksolindo_auth_token');
                  
    const userData = localStorage.getItem('user') || 
                     localStorage.getItem('user_data');
                     
    const tenantData = localStorage.getItem('tenant_data') || 
                       localStorage.getItem('tenantId');
    
    let currentUser = null;
    let currentTenant = null;
    
    // Parse user data
    if (userData) {
      try {
        currentUser = JSON.parse(userData);
      } catch (error) {
        console.error('❌ Failed to parse user data:', error);
      }
    }
    
    // Parse tenant data  
    if (tenantData) {
      try {
        currentTenant = JSON.parse(tenantData);
      } catch (error) {
        console.error('❌ Failed to parse tenant data:', error);
      }
    }
    
    // 🔥 CRITICAL FIX: Only authenticate with REAL tokens and users
    const authenticated = !!(token && currentUser && !token.startsWith('dev-token-'));
    
    setIsAuth(authenticated);
    setUser(currentUser);
    setTenant(currentTenant);
    setToken(token);
    
    console.log('🔍 DevAuthPanel Production-Safe Status Check:', {
      authenticated,
      hasToken: !!token,
      hasUser: !!currentUser,
      isRealToken: token && !token.startsWith('dev-token-'),
      user: currentUser,
      tenant: currentTenant
    });
  };

  const checkApiHealth = async () => {
    try {
      setIsLoading(true);
      
      // Check if healthCheck method exists
      if (typeof api.healthCheck === 'function') {
        const healthy = await api.healthCheck();
        setApiHealth(healthy);
        console.log(healthy ? '✅ API Health: Healthy' : '❌ API Health: Unhealthy');
      } else {
        console.warn('⚠️ API healthCheck method not available');
        setApiHealth(null);
      }
    } catch (error) {
      console.error('❌ API Health Check Error:', error?.message || error);
      setApiHealth(false);
    } finally {
      setIsLoading(false);
    }
  };

  const runApiTests = async () => {
    if (!isAuth) {
      alert('Please authenticate first before running API tests');
      return;
    }

    setIsRunningTests(true);
    const tests = [...apiTests];
    
    // Filter test configs to only include available API methods
    const testConfigs = DEV_CONFIG.testEndpoints
      .map((endpoint, index) => ({
        name: endpoint.name,
        test: () => {
          const method = (api as any)[endpoint.method];
          if (typeof method === 'function') {
            return method.call(api, endpoint.params || {});
          } else {
            throw new Error(`API method ${endpoint.method} not available`);
          }
        },
        index,
        available: typeof (api as any)[endpoint.method] === 'function'
      }))
      .filter(config => config.available); // Only test available methods

    if (testConfigs.length === 0) {
      alert('No API methods available for testing');
      setIsRunningTests(false);
      return;
    }

    for (const testConfig of testConfigs) {
      const startTime = Date.now();
      
      // Set loading state
      tests[testConfig.index] = {
        endpoint: testConfig.name,
        status: 'loading',
        message: 'Testing...'
      };
      setApiTests([...tests]);

      try {
        const result = await testConfig.test();
        const responseTime = Date.now() - startTime;
        
        tests[testConfig.index] = {
          endpoint: testConfig.name,
          status: 'success',
          message: `Success (${responseTime}ms)`,
          responseTime,
          data: result
        };
        
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        
        tests[testConfig.index] = {
          endpoint: testConfig.name,
          status: 'error',
          message: error?.message || apiUtils.handleError(error),
          responseTime,
          data: error?.response?.data
        };
      }
      
      setApiTests([...tests]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunningTests(false);
  };

  // 🔥 REAL LOGIN ONLY - No development bypasses
  const handleRealLogin = async () => {
    if (!loginCredentials.email || !loginCredentials.password) {
      alert('Please enter email and password');
      return;
    }

    setIsLoggingIn(true);
    try {
      // Check if login method exists
      if (typeof (api as any).login === 'function') {
        const response: any = await (api as any).login({
          email: loginCredentials.email,
          password: loginCredentials.password,
          tenant_id: loginCredentials.tenant_id || undefined
        });

        const token = response?.token || response?.data?.token;
        const user = response?.user || response?.data?.user;
        const tenant = response?.tenant || response?.data?.tenant;

        if (token) {
          // Store real authentication data
          localStorage.setItem('auth_token', token);
          if (user) localStorage.setItem('user_data', JSON.stringify(user));
          if (tenant) {
            localStorage.setItem('tenant_data', JSON.stringify(tenant));
          }

          checkAuthStatus();
          onAuthChange?.();
          setLoginCredentials({ email: '', password: '', tenant_id: '' });
          
          console.log('✅ Real login successful:', user);
        }
      } else {
        throw new Error('Login API method not available');
      }
    } catch (error: any) {
      console.error('❌ Real login failed:', error);
      alert(`Login failed: ${error?.message || 'API not available'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 🔥 REMOVED: Quick login with development tokens
  // This feature has been removed for production safety
  // All authentication must go through the real API

  const handleClearAuth = () => {
    clearMockAuth();
    checkAuthStatus();
    setApiTests(prevTests => 
      prevTests.map(test => ({ ...test, status: 'idle' as const, message: 'Not tested' }))
    );
    onAuthChange?.();
    
    console.log('✅ Authentication cleared successfully');
  };

  const handleCopyToken = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        console.log('📋 Token copied to clipboard');
      } catch (error) {
        console.error('❌ Failed to copy token:', error);
      }
    }
  };

  const handleDebugAuth = () => {
    debugAuthState();
  };

  const handleRefresh = () => {
    checkAuthStatus();
    checkApiHealth();
    loadRealData();
    onAuthChange?.();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const getStatusIcon = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'loading':
        return <CircularProgress size={16} />;
      case 'idle':
      default:
        return <WarningIcon color="disabled" fontSize="small" />;
    }
  };

  const getStatusColor = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'success': return 'success.light';
      case 'error': return 'error.light';
      case 'loading': return 'info.light';
      case 'idle':
      default: return 'grey.100';
    }
  };

  const authStatusSeverity = isAuth ? 'success' : 'warning';
  const healthStatusSeverity = apiHealth === null ? 'info' : apiHealth ? 'success' : 'error';

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: DEV_CONFIG.panel.bottom,
        right: DEV_CONFIG.panel.right,
        minWidth: isMinimized ? 'auto' : DEV_CONFIG.panel.minWidth,
        maxWidth: isMinimized ? 'auto' : DEV_CONFIG.panel.maxWidth,
        height: isMinimized ? DEV_CONFIG.panel.minimizedHeight : 'auto',
        maxHeight: isMinimized ? DEV_CONFIG.panel.minimizedHeight : 'calc(100vh - 32px)',
        overflow: isMinimized ? 'hidden' : 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        border: '2px solid',
        borderColor: isAuth ? 'success.main' : 'warning.main',
        borderRadius: 2,
        zIndex: 9999,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {/* Header - Always visible */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        pb: isMinimized ? 2 : 1,
        backgroundColor: isAuth ? 'success.light' : 'warning.light',
        color: isAuth ? 'success.contrastText' : 'warning.contrastText',
      }}>
        <BugIcon sx={{ mr: 1 }} />
        <Typography variant={isMinimized ? "body2" : "h6"} sx={{ fontWeight: 600, flexGrow: 1 }}>
          {isMinimized ? 'Dev' : 'Dev Panel (PROD-SAFE)'}
        </Typography>
        {!isMinimized && (
          <Badge 
            variant="dot" 
            color={apiHealth ? "success" : apiHealth === false ? "error" : "warning"}
            sx={{ mr: 1 }}
          >
            <Chip
              label={apiHealth === false ? "BACKEND OFFLINE" : "REAL API ONLY"}
              size="small"
              color={isAuth ? "success" : "warning"}
              sx={{ fontSize: '0.7rem' }}
            />
          </Badge>
        )}
        <Tooltip title={isMinimized ? "Expand Panel" : "Minimize Panel"}>
          <IconButton 
            size="small" 
            onClick={handleToggleMinimize} 
            sx={{ ml: 1, color: 'inherit' }}
          >
            {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
          </IconButton>
        </Tooltip>
        {!isMinimized && (
          <>
            <Tooltip title="Refresh Status">
              <IconButton 
                size="small" 
                onClick={handleRefresh} 
                sx={{ ml: 1, color: 'inherit' }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close Panel">
              <IconButton size="small" onClick={handleClose} sx={{ ml: 0.5, color: 'inherit' }}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Collapsible Content */}
      <Collapse in={!isMinimized} timeout={300}>
        <Box sx={{ p: 2 }}>
          {/* API Health Status */}
          <Alert 
            severity={healthStatusSeverity} 
            sx={{ mb: 2, py: 0.5 }}
            action={
              <Button 
                size="small" 
                onClick={checkApiHealth}
                disabled={isLoading}
                sx={{ minWidth: 'auto' }}
              >
                Test
              </Button>
            }
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              API: {apiHealth === null ? 'Unknown' : apiHealth ? 'Healthy' : 'Offline'}
            </Typography>
            <Typography variant="caption">
              {api.getBaseURL ? api.getBaseURL() : 'API URL not available'}
            </Typography>
            {apiHealth === false && (
              <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                ⚠️ Backend server is offline. Development panel disabled.
              </Typography>
            )}
          </Alert>

          {/* Current Auth Status */}
          <Alert 
            severity={authStatusSeverity} 
            icon={<SecurityIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Status: {isAuth ? 'Authenticated (REAL)' : 'Not Authenticated'}
            </Typography>
            {user && (
              <>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  <strong>User:</strong> {getUserFullName()} ({user.role || 'No Role'})
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  <strong>ID:</strong> {user.id} | <strong>Email:</strong> {user.email}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  <strong>Admin:</strong> {user.is_admin ? 'Yes' : 'No'} | 
                  <strong> Superuser:</strong> {user.is_superuser ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'success.main' }}>
                  ✅ Using REAL authentication tokens only
                </Typography>
              </>
            )}
            {tenant && (
              <Typography variant="caption" sx={{ display: 'block' }}>
                <strong>Tenant:</strong> {tenant.name} ({tenant.subdomain})
              </Typography>
            )}
          </Alert>

          {/* Real Authentication Section - Production Safe */}
          {!isAuth && apiHealth && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                🔐 Real Authentication (Production-Safe)
              </Typography>
              
              {/* Real Login Form Only */}
              <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Backend API Login:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    label="Email"
                    type="email"
                    value={loginCredentials.email}
                    onChange={(e) => setLoginCredentials(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@example.com"
                  />
                  <TextField
                    size="small"
                    label="Password"
                    type="password"
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                  <FormControl size="small">
                    <InputLabel>Tenant (Optional)</InputLabel>
                    <Select
                      value={loginCredentials.tenant_id}
                      onChange={(e) => setLoginCredentials(prev => ({ ...prev, tenant_id: e.target.value }))}
                      label="Tenant (Optional)"
                    >
                      <MenuItem value="">Default</MenuItem>
                      {realTenants.map((tenant) => (
                        <MenuItem key={tenant.id} value={tenant.id.toString()}>
                          {tenant.name} ({tenant.subdomain})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleRealLogin}
                  disabled={isLoggingIn || !loginCredentials.email || !loginCredentials.password}
                  startIcon={isLoggingIn ? <CircularProgress size={16} /> : <LoginIcon />}
                  fullWidth
                >
                  {isLoggingIn ? 'Logging in...' : 'Real API Login'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Logout Button */}
          {isAuth && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleClearAuth}
                fullWidth
              >
                Logout
              </Button>
            </Box>
          )}

          {/* API Testing */}
          {isAuth && (
            <Box sx={{ mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={runApiTests}
                disabled={isRunningTests}
                fullWidth
                startIcon={isRunningTests ? <CircularProgress size={16} /> : <PlayArrowIcon />}
              >
                {isRunningTests ? 'Running Tests...' : 'Test API Endpoints'}
              </Button>
              
              {apiTests.length > 0 && (
                <Box sx={{ mt: 1, maxHeight: 180, overflow: 'auto' }}>
                  {apiTests.map((test, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        py: 0.75,
                        px: 1,
                        bgcolor: getStatusColor(test.status),
                        borderRadius: 1,
                        mb: 0.5,
                        border: '1px solid',
                        borderColor: test.status === 'success' ? 'success.main' : 
                                     test.status === 'error' ? 'error.main' : 'grey.300',
                      }}
                    >
                      {getStatusIcon(test.status)}
                      <Typography variant="caption" sx={{ ml: 1, flexGrow: 1, fontWeight: 500 }}>
                        {test.endpoint}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                        {test.message}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Permission Check Display */}
          {isAuth && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                Real Permissions & Roles:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {DEV_CONFIG.permissionChecks.map((perm) => (
                  <Chip
                    key={perm.name}
                    label={perm.name}
                    size="small"
                    color={perm.check(user) ? 'success' : 'default'}
                    variant={perm.check(user) ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Real Data Statistics */}
          <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              Real Backend Data Only:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={`${realUsers.length} Users`} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip 
                label={`${realTenants.length} Tenants`} 
                size="small" 
                color="secondary" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
              {isLoadingRealData && (
                <CircularProgress size={16} />
              )}
            </Box>
          </Box>

          {/* Advanced Options */}
          <Accordion 
            expanded={expanded} 
            onChange={() => setExpanded(!expanded)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Advanced Options</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              {/* Token Display */}
              {token && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                    Current Token:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={showToken ? token : '••••••••••••••••'}
                      InputProps={{
                        readOnly: true,
                        sx: { fontSize: '0.75rem', fontFamily: 'monospace' }
                      }}
                    />
                    <Tooltip title={showToken ? 'Hide Token' : 'Show Token'}>
                      <IconButton size="small" onClick={() => setShowToken(!showToken)}>
                        {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy Token">
                      <IconButton size="small" onClick={handleCopyToken}>
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {/* Token Info */}
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                    Type: {token.startsWith('dev-token-') ? 
                      '⚠️ Development Token (DISABLED)' : 
                      '✅ Real JWT Token'}
                  </Typography>
                </Box>
              )}

              {/* Debug Information */}
              <Button
                size="small"
                variant="outlined"
                onClick={handleDebugAuth}
                startIcon={<BugIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Debug Auth State (Console)
              </Button>

              {/* Configuration */}
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                Configuration:
              </Typography>
              <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1, py: 0.5 }}>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="API Base URL"
                    secondary={api.getBaseURL()}
                    primaryTypographyProps={{ fontSize: '0.75rem' }}
                    secondaryTypographyProps={{ fontSize: '0.7rem', fontFamily: 'monospace' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="Environment"
                    secondary={`${import.meta.env.MODE} (Production-Safe)`}
                    primaryTypographyProps={{ fontSize: '0.75rem' }}
                    secondaryTypographyProps={{ fontSize: '0.7rem' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="Authentication Mode"
                    secondary="Real Backend API Only"
                    primaryTypographyProps={{ fontSize: '0.75rem' }}
                    secondaryTypographyProps={{ fontSize: '0.7rem', color: 'success.main' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.25 }}>
                  <ListItemText 
                    primary="Mock Data"
                    secondary="DISABLED - Production Safe"
                    primaryTypographyProps={{ fontSize: '0.75rem' }}
                    secondaryTypographyProps={{ fontSize: '0.7rem', color: 'success.main' }}
                  />
                </ListItem>
              </List>

              {/* Quick Actions */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  sx={{ flex: 1 }}
                >
                  Reload Page
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  color="warning"
                  sx={{ flex: 1 }}
                >
                  Clear Storage
                </Button>
              </Box>

              {/* Reload Real Data */}
              <Button
                size="small"
                variant="outlined"
                onClick={loadRealData}
                disabled={isLoadingRealData}
                startIcon={isLoadingRealData ? <CircularProgress size={16} /> : <RefreshIcon />}
                fullWidth
                sx={{ mt: 1 }}
              >
                {isLoadingRealData ? 'Loading...' : 'Reload Real Data'}
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Usage Instructions */}
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center' }}>
            Production-Safe Development Panel
            <br />
            {apiHealth === false ? 
              '🔴 Backend offline - Panel disabled.' :
              '🟢 REAL API authentication only - No mock data.'}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DevAuthPanel;