// platform/frontend-mui/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import logger from '../utils/logger';

// Client-global slice reducers
import authReducer from './slices/authSlice';
import categoryReducer from './slices/categorySlice';
import configurationReducer from './slices/configurationSlice';
import contentTypeReducer from './slices/contentTypeSlice';
import websocketReducer from './slices/websocketSlice';
import dashboardRealTimeReducer from './slices/dashboardRealTimeSlice';
import notificationReducer from './slices/notificationSlice';

// Middleware
import websocketMiddleware from './middleware/websocketMiddleware';
import dashboardUpdateMiddleware from './middleware/dashboardUpdateMiddleware';
import notificationMiddleware from './middleware/notificationMiddleware';

// Action logger middleware
const actionLogger = (store: any) => (next: any) => (action: any) => {
  logger.debug('Redux Action', {
    type: action.type,
    payload: action.payload,
    timestamp: new Date().toISOString(),
  });
  return next(action);
};

export const store = configureStore({
  reducer: {
    // Client-global reducers:
    auth: authReducer,
    categories: categoryReducer,
    configurations: configurationReducer,
    contentTypes: contentTypeReducer,
    websocket: websocketReducer,
    dashboardRealTime: dashboardRealTimeReducer,
    notifications: notificationReducer,
  },
  
  // Enhanced middleware configuration
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE'
        ],
        ignoredActionsPaths: [
          'meta.arg', 
          'payload.timestamp',
          'payload.file',
          'payload.formData'
        ],
        ignoredPaths: [
          'websocket.connection'
        ],
      },
      thunk: {
        extraArgument: {
          timeout: 30000,
        },
      },
    }).concat(
      actionLogger,  // Add action logging
      websocketMiddleware,
      dashboardUpdateMiddleware,
      notificationMiddleware
    ),
  
  // Enhanced devTools configuration
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'Reksolindo App Shell',
    trace: true,
    traceLimit: 25,
  },
});

// Export types and hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;

// Selectors
export const selectAllErrors = (state: RootState) => ({
  auth: state.auth?.error,
  notifications: (state.notifications as any)?.error,
});

export const selectGlobalLoading = (state: RootState) => ({
  auth: Boolean(state.auth?.loading || (state.auth as any)?.isLoading),
  configurations: Boolean((state.configurations as any)?.loading || (state.configurations as any)?.isLoading),
});