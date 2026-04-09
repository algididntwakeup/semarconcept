// platform/frontend-mui/src/components/test/TestLogin.tsx

import React from 'react';

/**
 * 🔥 PRODUCTION SAFETY: TestLogin Component Disabled
 * 
 * This test component has been disabled for production safety.
 * It previously contained mock authentication functionality that
 * could bypass real authentication in production environments.
 * 
 * For production deployments, this component returns null.
 * For development, it shows a warning message.
 */

interface TestLoginProps {
  onMockLogin?: () => void;
  onTestComplete?: () => void;
}

const TestLogin: React.FC<TestLoginProps> = (props) => {
  // 🔥 CRITICAL: Never render in production
  if (import.meta.env.PROD || import.meta.env.NODE_ENV === 'production') {
    return null;
  }

  // Additional safety check
  if (!import.meta.env.DEV && !import.meta.env.VITE_DEBUG_MODE) {
    return null;
  }

  // Even in development, show warning instead of mock functionality
  return (
    <div style={{
      padding: '20px',
      border: '2px solid #ff9800',
      borderRadius: '8px',
      backgroundColor: '#fff3e0',
      color: '#e65100',
      textAlign: 'center',
      margin: '20px',
      fontFamily: 'monospace'
    }}>
      <h3>⚠️ TestLogin Component Disabled</h3>
      <p>
        <strong>This component has been disabled for production safety.</strong>
      </p>
      <p>
        Mock authentication features have been removed to prevent<br/>
        security bypasses in production environments.
      </p>
      <p>
        Use the real login page at <code>/login</code> with actual credentials.
      </p>
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#ffecb3',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>For Testing:</strong><br/>
        • Use the DevAuthPanel in development mode<br/>
        • Use real user accounts from the database<br/>
        • Test with actual backend API endpoints
      </div>
    </div>
  );
};

export default TestLogin;

/**
 * 🔥 ALTERNATIVE APPROACH - Complete File Removal
 * 
 * If you prefer to completely remove this file instead of disabling it:
 * 
 * 1. Delete this file: src/components/test/TestLogin.tsx
 * 2. Remove any imports of TestLogin from other files
 * 3. Remove the test directory if it becomes empty
 * 4. Update any routes that reference this component
 * 
 * Files to check for TestLogin imports:
 * - src/router/index.tsx
 * - Any page components that import TestLogin
 * - Any test files that reference TestLogin
 * 
 * Search command to find references:
 * grep -r "TestLogin" src/
 */