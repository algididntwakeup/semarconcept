// platform/frontend-mui/src/utils/connectivity-test.ts
// 🔥 CONNECTIVITY TEST UTILITY - Run this in browser console to test API connectivity

export interface ConnectivityTestResult {
  api: {
    baseUrl: string;
    health: boolean;
    status?: number;
    responseTime?: number;
    error?: string;
  };
  websocket: {
    url: string;
    connected: boolean;
    error?: string;
  };
  auth: {
    hasToken: boolean;
    tokenValid: boolean;
    user: any;
  };
  config: {
    environment: string;
    tenant: string;
    debug: boolean;
  };
}

// Test API connectivity
export const testApiConnectivity = async (): Promise<ConnectivityTestResult['api']> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://breksolindo.opuschamber.com';
  const apiUrl = baseUrl.includes('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
  
  console.log('🧪 Testing API connectivity to:', apiUrl);
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      console.log('✅ API connectivity test passed:', response.status, `${responseTime}ms`);
      return {
        baseUrl: apiUrl,
        health: true,
        status: response.status,
        responseTime
      };
    } else {
      console.error('❌ API connectivity test failed:', response.status);
      return {
        baseUrl: apiUrl,
        health: false,
        status: response.status,
        responseTime,
        error: `HTTP ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('❌ API connectivity test error:', error.message);
    return {
      baseUrl: apiUrl,
      health: false,
      error: error.message
    };
  }
};

// Test WebSocket connectivity
export const testWebSocketConnectivity = async (): Promise<ConnectivityTestResult['websocket']> => {
  return new Promise((resolve) => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'wss://breksolindo.opuschamber.com/ws';
    
    console.log('🧪 Testing WebSocket connectivity to:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          url: wsUrl,
          connected: false,
          error: 'Connection timeout'
        });
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        console.log('✅ WebSocket connectivity test passed');
        ws.close();
        resolve({
          url: wsUrl,
          connected: true
        });
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ WebSocket connectivity test failed:', error);
        resolve({
          url: wsUrl,
          connected: false,
          error: 'Connection failed'
        });
      };
      
      ws.onclose = (event) => {
        if (event.code !== 1000) {
          clearTimeout(timeout);
          console.error('❌ WebSocket connectivity test closed unexpectedly:', event.code, event.reason);
          resolve({
            url: wsUrl,
            connected: false,
            error: `Closed: ${event.code} ${event.reason}`
          });
        }
      };
    } catch (error: any) {
      console.error('❌ WebSocket connectivity test error:', error.message);
      resolve({
        url: wsUrl,
        connected: false,
        error: error.message
      });
    }
  });
};

// Test authentication state
export const testAuthState = (): ConnectivityTestResult['auth'] => {
  // Try to get token from various storage locations
  const possibleKeys = [
    'reksolindo_auth_token',
    'auth_token',
    'authToken',
    'token',
    'access_token'
  ];
  
  let token: string | null = null;
  for (const key of possibleKeys) {
    token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) {
      console.log(`🔍 Found token in storage key: ${key}`);
      break;
    }
  }
  
  let tokenValid = false;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Date.now() / 1000;
        tokenValid = payload.exp > currentTime;
        console.log(`🔍 Token validity:`, tokenValid, `Expires:`, new Date(payload.exp * 1000));
      }
    } catch (error) {
      console.warn('⚠️ Unable to parse token:', error);
    }
  }
  
  // Try to get user data
  let user = null;
  const userKeys = ['user_data', 'user', 'current_user'];
  for (const key of userKeys) {
    const userData = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (userData) {
      try {
        user = JSON.parse(userData);
        console.log(`🔍 Found user data in storage key: ${key}`, user);
        break;
      } catch (error) {
        console.warn(`⚠️ Unable to parse user data from ${key}:`, error);
      }
    }
  }
  
  return {
    hasToken: !!token,
    tokenValid,
    user
  };
};

// Test configuration
export const testConfig = (): ConnectivityTestResult['config'] => {
  const tenant = localStorage.getItem('tenant_id') || 
                localStorage.getItem('tenantId') || 
                'reksolindo';
  
  return {
    environment: import.meta.env.MODE || 'unknown',
    tenant,
    debug: import.meta.env.VITE_DEBUG_MODE === 'true'
  };
};

// Run comprehensive connectivity test
export const runConnectivityTest = async (): Promise<ConnectivityTestResult> => {
  console.group('🧪 Running Comprehensive Connectivity Test');
  
  const api = await testApiConnectivity();
  const websocket = await testWebSocketConnectivity();
  const auth = testAuthState();
  const config = testConfig();
  
  const result: ConnectivityTestResult = {
    api,
    websocket,
    auth,
    config
  };
  
  console.log('📊 Connectivity Test Results:', result);
  
  // Summary
  console.group('📋 Test Summary');
  console.log(`API Health: ${api.health ? '✅ Healthy' : '❌ Failed'} (${api.baseUrl})`);
  console.log(`WebSocket: ${websocket.connected ? '✅ Connected' : '❌ Failed'} (${websocket.url})`);
  console.log(`Authentication: ${auth.hasToken && auth.tokenValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`Environment: ${config.environment} | Tenant: ${config.tenant} | Debug: ${config.debug}`);
  console.groupEnd();
  
  // Recommendations
  console.group('💡 Recommendations');
  if (!api.health) {
    console.log('🔧 API Issues detected:');
    console.log('   - Check if backend server is running');
    console.log('   - Verify VITE_API_BASE_URL in .env file');
    console.log('   - Check network connectivity');
  }
  if (!websocket.connected) {
    console.log('🔧 WebSocket Issues detected:');
    console.log('   - Check if WebSocket server is running');
    console.log('   - Verify VITE_WEBSOCKET_URL in .env file');
    console.log('   - Check firewall settings');
  }
  if (!auth.hasToken || !auth.tokenValid) {
    console.log('🔧 Authentication Issues detected:');
    console.log('   - User needs to login');
    console.log('   - Token may be expired');
    console.log('   - Check token storage keys');
  }
  console.groupEnd();
  
  console.groupEnd();
  
  return result;
};

// Quick test function for browser console
export const quickTest = async () => {
  console.log('🚀 Running quick connectivity test...');
  
  // Test API
  try {
    const response = await fetch('https://breksolindo.opuschamber.com/api/v1/health');
    console.log(`API Status: ${response.ok ? '✅' : '❌'} (${response.status})`);
  } catch (error) {
    console.log(`API Status: ❌ (${error.message})`);
  }
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log(`  VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL}`);
  console.log(`  VITE_WEBSOCKET_URL: ${import.meta.env.VITE_WEBSOCKET_URL}`);
  console.log(`  VITE_DEBUG_MODE: ${import.meta.env.VITE_DEBUG_MODE}`);
  
  // Check storage
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  const user = localStorage.getItem('user') || localStorage.getItem('user_data');
  console.log(`Storage: Token ${token ? '✅' : '❌'} | User ${user ? '✅' : '❌'}`);
};

// Make available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).connectivityTest = {
    runFull: runConnectivityTest,
    testAPI: testApiConnectivity,
    testWebSocket: testWebSocketConnectivity,
    testAuth: testAuthState,
    quickTest
  };
  
  console.log('🔧 Connectivity test utilities available:');
  console.log('   window.connectivityTest.runFull() - Full test');
  console.log('   window.connectivityTest.quickTest() - Quick test');
  console.log('   window.connectivityTest.testAPI() - API only');
  console.log('   window.connectivityTest.testWebSocket() - WebSocket only');
}