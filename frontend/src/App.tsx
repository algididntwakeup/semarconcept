// platform/frontend-mui/src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { queryClient } from './shared/api';
import AppRouter from './router/index';
import { NotificationProvider } from './hooks/useNotification';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
              <AppRouter />
            </div>
          </BrowserRouter>
        </NotificationProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
