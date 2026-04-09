import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { websocketConnect, websocketDisconnect } from '../../store/middleware/websocketMiddleware';
import { selectWebSocketConnected, selectWebSocketError } from '../../store/slices/websocketSlice';
import { RootState } from '../../store';

/**
 * WebSocketConnection component
 * 
 * This component manages the WebSocket connection lifecycle.
 * It connects to the WebSocket server when the user is authenticated
 * and disconnects when the user logs out.
 * 
 * This component doesn't render anything, it just manages the connection.
 */
const WebSocketConnection: React.FC = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isConnected = useSelector(selectWebSocketConnected);
  const error = useSelector(selectWebSocketError);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      dispatch(websocketConnect());
    } else if (!isAuthenticated && isConnected) {
      dispatch(websocketDisconnect());
    }
  }, [isAuthenticated, isConnected, dispatch]);

  // Log WebSocket errors
  useEffect(() => {
    if (error) {
      console.error('WebSocket error:', error);
    }
  }, [error]);

  // Disconnect when component unmounts
  useEffect(() => {
    return () => {
      if (isConnected) {
        dispatch(websocketDisconnect());
      }
    };
  }, [isConnected, dispatch]);

  // This component doesn't render anything
  return null;
};

export default WebSocketConnection;