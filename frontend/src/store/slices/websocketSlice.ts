// platform/frontend-mui/src/store/slices/websocketSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state interface
interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  messages: any[];
}

// Define the initial state
const initialState: WebSocketState = {
  connected: false,
  connecting: false,
  error: null,
  messages: [],
};

// Create the slice
const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    wsConnecting: (state) => {
      state.connecting = true;
      state.error = null;
    },
    wsConnected: (state) => {
      state.connected = true;
      state.connecting = false;
      state.error = null;
    },
    wsDisconnected: (state) => {
      state.connected = false;
      state.connecting = false;
    },
    wsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.connecting = false;
      state.connected = false;
    },
    wsMessage: (state, action: PayloadAction<any>) => {
      state.messages.push(action.payload);
      
      // Limit the number of stored messages to prevent memory issues
      if (state.messages.length > 100) {
        state.messages.shift(); // Remove the oldest message
      }
    },
    wsClearMessages: (state) => {
      state.messages = [];
    },
  },
});

// Export actions
export const {
  wsConnecting,
  wsConnected,
  wsDisconnected,
  wsError,
  wsMessage,
  wsClearMessages,
} = websocketSlice.actions;

// Export reducer
export default websocketSlice.reducer;

// Selectors
export const selectWebSocketConnected = (state: { websocket: WebSocketState }) => state.websocket.connected;
export const selectWebSocketConnecting = (state: { websocket: WebSocketState }) => state.websocket.connecting;
export const selectWebSocketError = (state: { websocket: WebSocketState }) => state.websocket.error;
export const selectWebSocketMessages = (state: { websocket: WebSocketState }) => state.websocket.messages;

// Select messages by type
export const selectMessagesByType = (state: { websocket: WebSocketState }, type: string) => 
  state.websocket.messages.filter(message => message.type === type);

// Select messages by entity
export const selectMessagesByEntity = (state: { websocket: WebSocketState }, entity: string) => 
  state.websocket.messages.filter(message => message.entity === entity);

// Select messages by entity and ID
export const selectMessagesByEntityAndId = (
  state: { websocket: WebSocketState }, 
  entity: string, 
  id: number | string
) => 
  state.websocket.messages.filter(
    message => message.entity === entity && message.id === id
  );