// platform/frontend-mui/src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRouter from './router/index';
import { NotificationProvider } from './hooks/useNotification';

// ✅ ADD: Debug Console imports
import DebugConsole from './components/debug/DebugConsole';
import { getDebugManager } from './utils/debug-manager';

import './App.css';

function App() {
  const [authKey] = useState(0);

  // ✅ ADD: Initialize debug console data sync
  useEffect(() => {
    if (import.meta.env.DEV) {
      const debugManager = getDebugManager();
      debugManager.log('info', 'App component mounted', {
        timestamp: new Date().toISOString(),
        authKey
      });
    }
  }, [authKey]);

  return (
    <Provider store={store}>
      <NotificationProvider>
        <BrowserRouter>
          <div key={authKey} className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
            <AppRouter />
          </div>
          
          {/* ✅ ADD: Debug Console - only in development */}
          {import.meta.env.DEV && <DebugConsole />}
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;