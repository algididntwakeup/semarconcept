// platform/frontend-mui/src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRouter from './router/index';
import { NotificationProvider } from './hooks/useNotification';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
            <AppRouter />
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;
