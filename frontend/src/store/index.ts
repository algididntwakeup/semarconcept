// platform/frontend-mui/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import logger from '../utils/logger';

// Existing slice reducers
import authReducer from './slices/authSlice';
import categoryReducer from './slices/categorySlice';
import configurationReducer from './slices/configurationSlice';
import contentTypeReducer from './slices/contentTypeSlice';
import websocketReducer from './slices/websocketSlice';
import dashboardRealTimeReducer from './slices/dashboardRealTimeSlice';
import notificationReducer from './slices/notificationSlice';
import assetReducer from './slices/assetSlice';

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
    // Existing reducers:
    auth: authReducer,
    categories: categoryReducer,
    configurations: configurationReducer,
    contentTypes: contentTypeReducer,
    websocket: websocketReducer,
    dashboardRealTime: dashboardRealTimeReducer,
    notifications: notificationReducer,
    
    // Asset Management reducers
    assets: assetReducer,
  },
  
  // Enhanced middleware configuration
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'assets/importAssets/pending',
          'assets/importAssets/fulfilled',
          'assets/uploadAssetDocument/pending',
          'assets/uploadAssetDocument/fulfilled',
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
          'assets.pendingUpdates',
          'assets.fileUploads',
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
    name: 'Reksolindo Asset Management',
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action: any) => {
      if (action.type?.includes('upload') || action.type?.includes('import')) {
        return {
          ...action,
          payload: action.payload?.file ? 
            { ...action.payload, file: '[File Object]' } : 
            action.payload
        };
      }
      return action;
    },
    stateSanitizer: (state: any) => {
      return {
        ...state,
        assets: state.assets ? {
          ...state.assets,
          assets: Object.keys(state.assets.assets || {}).length > 50 ? 
            '[Large Asset Collection]' : 
            state.assets.assets
        } : state.assets
      };
    }
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
export const selectAssetManagementState = (state: RootState) => ({
  assets: state.assets,
});

export const selectStorePerformance = (state: RootState) => ({
  assetCount: Object.keys(state.assets?.assets || {}).length,
  selectedAssets: state.assets?.selectedAssets?.length || 0,
  isLoading: state.assets?.isLoading || false,
  lastFetchTime: state.assets?.lastFetchTime || 0,
});

export const selectAllErrors = (state: RootState) => ({
  auth: state.auth?.error,
  assets: state.assets?.error,
  notifications: state.notifications?.error,
});

export const selectGlobalLoading = (state: RootState) => ({
  auth: state.auth?.isLoading || false,
  assets: state.assets?.isLoading || false,
  configurations: state.configurations?.isLoading || false,
});