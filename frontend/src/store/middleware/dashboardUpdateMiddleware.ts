import { Middleware } from 'redux';
import { wsMessage } from '../slices/websocketSlice';
import { updateWidgetData } from '../slices/dashboardRealTimeSlice';

// Dashboard update middleware
// This middleware listens for WebSocket messages and updates the dashboard real-time state
const dashboardUpdateMiddleware: Middleware = store => next => action => {
  // Process WebSocket messages
  if (action.type === wsMessage.type) {
    const message = action.payload;
    
    // Check if this is a dashboard update message
    if (
      message.type === 'update' && 
      message.entity === 'dashboard' && 
      message.id && 
      message.data && 
      message.data.widget_id
    ) {
      // Extract data from the message
      const dashboardId = parseInt(message.id, 10);
      const widgetId = message.data.widget_id;
      const widgetData = message.data;
      
      // Check if we're subscribed to this dashboard
      const state = store.getState();
      const activeSubscriptions = state.dashboardRealTime.activeSubscriptions;
      
      if (activeSubscriptions.includes(dashboardId)) {
        // Dispatch action to update widget data
        store.dispatch(updateWidgetData({
          dashboardId,
          widgetId,
          data: widgetData
        }));
      }
    }
  }
  
  return next(action);
};

export default dashboardUpdateMiddleware;