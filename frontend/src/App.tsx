// platform/frontend-mui/src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { queryClient } from './shared/api';
import AppRouter from './router/index';
import { NotificationProvider } from './hooks/useNotification';
import { ThemeProvider } from './contexts/ThemeContext';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <ThemeProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased dark:bg-[#0b0f19] dark:text-slate-100 transition-colors duration-200">
                <AppRouter />
              </div>
            </BrowserRouter>
          </ThemeProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
