import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Chip, 
  Tooltip, 
  CircularProgress, 
  SxProps, 
  Theme 
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  WifiOff as WifiOffIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { 
  selectWebSocketConnected, 
  selectWebSocketConnecting, 
  selectWebSocketError 
} from '../../store/slices/websocketSlice';

interface ConnectionStatusIndicatorProps {
  showLabel?: boolean;
  showTooltip?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

/**
 * ConnectionStatusIndicator component
 * 
 * This component displays the current WebSocket connection status.
 * It shows different icons and colors based on the connection state:
 * - Connected: Green check icon
 * - Connecting: Blue spinning icon
 * - Disconnected: Gray wifi-off icon
 * - Error: Red error icon with error message in tooltip
 */
const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  showLabel = true,
  showTooltip = true,
  size = 'medium',
  sx
}) => {
  const isConnected = useSelector(selectWebSocketConnected);
  const isConnecting = useSelector(selectWebSocketConnecting);
  const error = useSelector(selectWebSocketError);
  
  // Determine status
  let label = 'Disconnected';
  let color: 'success' | 'error' | 'default' | 'info' = 'default';
  let icon = <WifiOffIcon fontSize={size === 'small' ? 'small' : 'medium'} />;
  let tooltipText = 'Not connected to the server';
  
  if (isConnected) {
    label = 'Connected';
    color = 'success';
    icon = <CheckCircleIcon fontSize={size === 'small' ? 'small' : 'medium'} />;
    tooltipText = 'Connected to the server';
  } else if (isConnecting) {
    label = 'Connecting';
    color = 'info';
    icon = (
      <CircularProgress
        size={size === 'small' ? 16 : 20}
        thickness={5}
        sx={{ mr: 0.5 }}
      />
    );
    tooltipText = 'Connecting to the server...';
  } else if (error) {
    label = 'Error';
    color = 'error';
    icon = <ErrorIcon fontSize={size === 'small' ? 'small' : 'medium'} />;
    tooltipText = `Connection error: ${error}`;
  }
  
  const statusChip = (
    <Chip
      icon={icon}
      label={showLabel ? label : undefined}
      color={color}
      size={size}
      variant="outlined"
      sx={{ 
        borderRadius: showLabel ? undefined : '50%', 
        height: showLabel ? undefined : size === 'small' ? 24 : 32,
        width: showLabel ? undefined : size === 'small' ? 24 : 32,
        '& .MuiChip-icon': { 
          marginLeft: showLabel ? undefined : '0',
          marginRight: showLabel ? undefined : '0',
        },
        ...sx
      }}
    />
  );
  
  // Wrap in tooltip if showTooltip is true
  return showTooltip ? (
    <Tooltip title={tooltipText}>
      <Box component="span">{statusChip}</Box>
    </Tooltip>
  ) : (
    statusChip
  );
};

export default ConnectionStatusIndicator;