import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define types for dashboard widget data
interface WidgetData {
  id: string;
  type: string;
  data: any;
  lastUpdated: string;
}

// Define the state interface
interface DashboardRealTimeState {
  activeSubscriptions: number[];
  widgetData: Record<string, Record<string, WidgetData>>;
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: DashboardRealTimeState = {
  activeSubscriptions: [],
  widgetData: {},
  loading: false,
  error: null,
};

// Create the slice
const dashboardRealTimeSlice = createSlice({
  name: 'dashboardRealTime',
  initialState,
  reducers: {
    // Subscribe to a dashboard
    subscribeToDashboard: (state, action: PayloadAction<number>) => {
      const dashboardId = action.payload;
      if (!state.activeSubscriptions.includes(dashboardId)) {
        state.activeSubscriptions.push(dashboardId);
        
        // Initialize widget data for this dashboard if it doesn't exist
        if (!state.widgetData[dashboardId.toString()]) {
          state.widgetData[dashboardId.toString()] = {};
        }
      }
    },
    
    // Unsubscribe from a dashboard
    unsubscribeFromDashboard: (state, action: PayloadAction<number>) => {
      const dashboardId = action.payload;
      state.activeSubscriptions = state.activeSubscriptions.filter(id => id !== dashboardId);
    },
    
    // Update widget data
    updateWidgetData: (
      state, 
      action: PayloadAction<{
        dashboardId: number;
        widgetId: string;
        data: any;
      }>
    ) => {
      const { dashboardId, widgetId, data } = action.payload;
      const dashboardIdStr = dashboardId.toString();
      
      // Ensure dashboard entry exists
      if (!state.widgetData[dashboardIdStr]) {
        state.widgetData[dashboardIdStr] = {};
      }
      
      // Update widget data
      state.widgetData[dashboardIdStr][widgetId] = {
        id: widgetId,
        type: data.type || 'unknown',
        data: data,
        lastUpdated: new Date().toISOString(),
      };
    },
    
    // Clear widget data for a dashboard
    clearDashboardData: (state, action: PayloadAction<number>) => {
      const dashboardId = action.payload.toString();
      if (state.widgetData[dashboardId]) {
        delete state.widgetData[dashboardId];
      }
    },
    
    // Clear all widget data
    clearAllData: (state) => {
      state.widgetData = {};
      state.activeSubscriptions = [];
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions
export const {
  subscribeToDashboard,
  unsubscribeFromDashboard,
  updateWidgetData,
  clearDashboardData,
  clearAllData,
  setLoading,
  setError,
} = dashboardRealTimeSlice.actions;

// Export reducer
export default dashboardRealTimeSlice.reducer;

// Selectors
export const selectActiveSubscriptions = (state: RootState) => 
  state.dashboardRealTime.activeSubscriptions;

export const selectWidgetData = (state: RootState, dashboardId: number, widgetId: string) => {
  const dashboardData = state.dashboardRealTime.widgetData[dashboardId.toString()];
  return dashboardData ? dashboardData[widgetId] : undefined;
};

export const selectAllWidgetDataForDashboard = (state: RootState, dashboardId: number) => 
  state.dashboardRealTime.widgetData[dashboardId.toString()] || {};

export const selectDashboardRealTimeLoading = (state: RootState) => 
  state.dashboardRealTime.loading;

export const selectDashboardRealTimeError = (state: RootState) => 
  state.dashboardRealTime.error;