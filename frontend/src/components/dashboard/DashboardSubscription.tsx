import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  subscribeToDashboard, 
  unsubscribeFromDashboard, 
  selectActiveSubscriptions 
} from '../../store/slices/dashboardRealTimeSlice';
import { 
  websocketSubscribe, 
  websocketUnsubscribe 
} from '../../store/middleware/websocketMiddleware';
import { selectWebSocketConnected } from '../../store/slices/websocketSlice';
import { RootState } from '../../store';

interface DashboardSubscriptionProps {
  dashboardId: number;
  children?: React.ReactNode;
}

/**
 * DashboardSubscription component
 * 
 * This component manages the subscription to real-time updates for a dashboard.
 * It automatically subscribes to updates when mounted and unsubscribes when unmounted.
 * 
 * It doesn't render anything itself, it's just a wrapper component.
 */
const DashboardSubscription: React.FC<DashboardSubscriptionProps> = ({ 
  dashboardId, 
  children 
}) => {
  const dispatch = useDispatch();
  const isConnected = useSelector(selectWebSocketConnected);
  const activeSubscriptions = useSelector((state: RootState) => 
    selectActiveSubscriptions(state)
  );
  const isSubscribed = activeSubscriptions.includes(dashboardId);

  // Subscribe to dashboard updates when the component mounts
  // or when the WebSocket connection is established
  useEffect(() => {
    if (isConnected && !isSubscribed) {
      // Update local state
      dispatch(subscribeToDashboard(dashboardId));
      
      // Send subscription request to server
      dispatch(websocketSubscribe('dashboard', String(dashboardId)));
    }
    
    // Unsubscribe when the component unmounts
    return () => {
      if (isSubscribed) {
        // Update local state
        dispatch(unsubscribeFromDashboard(dashboardId));
        
        // Send unsubscription request to server
        dispatch(websocketUnsubscribe('dashboard', String(dashboardId)));
      }
    };
  }, [dispatch, dashboardId, isConnected, isSubscribed]);

  // This component doesn't render anything itself
  return <>{children}</>;
};

export default DashboardSubscription;
