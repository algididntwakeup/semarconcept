// platform/frontend-mui/src/components/debug/collectors/StorageCollector.tsx
import React, { useMemo } from 'react';
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip,
  Paper,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Storage as StorageIcon,
  Cookie as CookieIcon,
  VpnKey as TokenIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface StorageData {
  localStorage: Record<string, any>;
  sessionStorage: Record<string, any>;
  cookies: Record<string, any>;
  userAuth: {
    isLoggedIn: boolean;
    username?: string;
    email?: string;
    userId?: string;
    roles?: string[];
    loginTime?: string;
    lastActivity?: string;
    sessionExpiry?: string;
  };
  tokens: Record<string, any>;
}

interface StorageCollectorProps {
  data: StorageData;
  expanded?: string | false;
  onExpandedChange?: (expanded: string | false) => void;
}

const StorageCollector: React.FC<StorageCollectorProps> = ({ 
  data, 
  expanded = false, 
  onExpandedChange 
}) => {
  // Use external state if provided, otherwise use internal state
  const [internalExpanded, setInternalExpanded] = React.useState<string | false>('userAuth');
  
  const currentExpanded = onExpandedChange ? expanded : internalExpanded;
  const setCurrentExpanded = onExpandedChange || setInternalExpanded;

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    event.stopPropagation();
    event.preventDefault();
    
    const newExpanded = isExpanded ? panel : false;
    setCurrentExpanded(newExpanded);
  };

  // Enhanced data processing
  const processedData = useMemo(() => {
    if (!data) {
      return {
        localStorage: {},
        sessionStorage: {},
        cookies: {},
        userAuth: { isLoggedIn: false },
        tokens: {}
      };
    }

    return {
      localStorage: data.localStorage || {},
      sessionStorage: data.sessionStorage || {},
      cookies: data.cookies || {},
      userAuth: data.userAuth || { isLoggedIn: false },
      tokens: data.tokens || {}
    };
  }, [data]);

  // Storage health check
  const storageHealth = useMemo(() => {
    const localStorageSize = JSON.stringify(processedData.localStorage).length;
    const sessionStorageSize = JSON.stringify(processedData.sessionStorage).length;
    const cookieCount = Object.keys(processedData.cookies).length;
    
    return {
      localStorageSize: Math.round(localStorageSize / 1024 * 100) / 100, // KB
      sessionStorageSize: Math.round(sessionStorageSize / 1024 * 100) / 100, // KB
      cookieCount,
      authStatus: processedData.userAuth.isLoggedIn ? 'authenticated' : 'anonymous',
      tokenStatus: Object.keys(processedData.tokens).length > 0 ? 'present' : 'missing'
    };
  }, [processedData]);

  const formatStorageValue = (value: any): string => {
    if (typeof value === 'string') {
      if (value.length > 100) {
        return `${value.substring(0, 100)}... (${value.length} chars)`;
      }
      return value;
    }
    try {
      const str = JSON.stringify(value);
      if (str.length > 100) {
        return `${str.substring(0, 100)}... (${str.length} chars)`;
      }
      return str;
    } catch {
      return '[Complex Object]';
    }
  };

  const getStorageItemIcon = (key: string, value: any) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('token') || lowerKey.includes('auth')) return '🔑';
    if (lowerKey.includes('user') || lowerKey.includes('profile')) return '👤';
    if (lowerKey.includes('setting') || lowerKey.includes('config')) return '⚙️';
    if (lowerKey.includes('theme') || lowerKey.includes('ui')) return '🎨';
    if (lowerKey.includes('lang') || lowerKey.includes('locale')) return '🌍';
    return '📄';
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Storage & Authentication Data
        </Typography>
        <Tooltip title="Storage health indicators">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip 
              label={`${storageHealth.localStorageSize}KB`} 
              size="small" 
              color={storageHealth.localStorageSize > 1000 ? 'warning' : 'default'}
              sx={{ fontSize: '0.6rem', height: 16 }}
            />
            <Chip 
              label={storageHealth.authStatus} 
              size="small" 
              color={storageHealth.authStatus === 'authenticated' ? 'success' : 'default'}
              sx={{ fontSize: '0.6rem', height: 16 }}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Storage Overview */}
      <Paper sx={{ p: 1, mb: 1, backgroundColor: (theme) => alpha(theme.palette.background.default, 0.02) }}>
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Local</Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                {Object.keys(processedData.localStorage).length}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Session</Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                {Object.keys(processedData.sessionStorage).length}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Cookies</Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                {Object.keys(processedData.cookies).length}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Auth</Typography>
              <Typography sx={{ 
                fontSize: '0.8rem', 
                fontWeight: 'bold',
                color: processedData.userAuth.isLoggedIn ? 'success.main' : 'text.secondary'
              }}>
                {processedData.userAuth.isLoggedIn ? '✓' : '✗'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* User Authentication Status */}
      <Accordion 
        expanded={currentExpanded === 'userAuth'} 
        onChange={handleChange('userAuth')}
        sx={{ mb: 0.5 }}
        disableGutters
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
          sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            {processedData.userAuth.isLoggedIn ? (
              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            )}
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, flex: 1 }}>
              User Authentication
            </Typography>
            <Chip 
              label={processedData.userAuth.isLoggedIn ? 'Authenticated' : 'Anonymous'} 
              size="small" 
              color={processedData.userAuth.isLoggedIn ? 'success' : 'warning'}
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1 }}>
          <List dense>
            <ListItem sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary="Status"
                secondary={processedData.userAuth.isLoggedIn ? 'Logged in' : 'Not authenticated'}
                primaryTypographyProps={{ fontSize: '0.7rem', fontWeight: 500 }}
                secondaryTypographyProps={{ 
                  fontSize: '0.65rem',
                  color: processedData.userAuth.isLoggedIn ? 'success.main' : 'warning.main'
                }}
              />
            </ListItem>
            {processedData.userAuth.username && (
              <ListItem sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary="Username"
                  secondary={processedData.userAuth.username}
                  primaryTypographyProps={{ fontSize: '0.7rem', fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: '0.65rem' }}
                />
              </ListItem>
            )}
            {processedData.userAuth.email && (
              <ListItem sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary="Email"
                  secondary={processedData.userAuth.email}
                  primaryTypographyProps={{ fontSize: '0.7rem', fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: '0.65rem' }}
                />
              </ListItem>
            )}
            {processedData.userAuth.roles && processedData.userAuth.roles.length > 0 && (
              <ListItem sx={{ py: 0.25, px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, mb: 0.5 }}>
                  Roles
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {processedData.userAuth.roles.map((role, index) => (
                    <Chip 
                      key={index}
                      label={role} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.6rem', height: 16 }}
                    />
                  ))}
                </Box>
              </ListItem>
            )}
            {processedData.userAuth.loginTime && (
              <ListItem sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary="Login Time"
                  secondary={new Date(processedData.userAuth.loginTime).toLocaleString()}
                  primaryTypographyProps={{ fontSize: '0.7rem', fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: '0.65rem' }}
                />
              </ListItem>
            )}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Token Information */}
      <Accordion 
        expanded={currentExpanded === 'tokens'} 
        onChange={handleChange('tokens')}
        sx={{ mb: 0.5 }}
        disableGutters
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
          sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TokenIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              Authentication Tokens
            </Typography>
            <Chip 
              label={`${Object.keys(processedData.tokens).length} tokens`} 
              size="small" 
              color={Object.keys(processedData.tokens).length > 0 ? 'info' : 'default'}
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1 }}>
          {Object.keys(processedData.tokens).length === 0 ? (
            <Alert severity="info" sx={{ fontSize: '0.7rem' }}>
              No authentication tokens found
            </Alert>
          ) : (
            <List dense>
              {Object.entries(processedData.tokens).map(([key, token]: [string, any], index) => (
                <ListItem key={index} sx={{ py: 0.25, px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                      {key}
                    </Typography>
                    {token?.type && (
                      <Chip 
                        label={token.type} 
                        size="small" 
                        color="secondary"
                        sx={{ fontSize: '0.6rem', height: 16 }}
                      />
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{ 
                      fontSize: '0.65rem', 
                      fontFamily: 'monospace',
                      sx: { wordBreak: 'break-all' }
                    }}>
                      {token?.value ? `${token.value.substring(0, 40)}...` : 'No token'}
                    </Typography>
                    {token?.expiry && (
                      <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', mt: 0.25 }}>
                        Expires: {new Date(token.expiry).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      {/* localStorage */}
      <Accordion 
        expanded={currentExpanded === 'localStorage'} 
        onChange={handleChange('localStorage')}
        sx={{ mb: 0.5 }}
        disableGutters
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
          sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              localStorage
            </Typography>
            <Chip 
              label={`${Object.keys(processedData.localStorage).length} items`} 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
            <Chip 
              label={`${storageHealth.localStorageSize}KB`} 
              size="small" 
              color={storageHealth.localStorageSize > 1000 ? 'warning' : 'default'}
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1 }}>
          {Object.keys(processedData.localStorage).length === 0 ? (
            <Alert severity="info" sx={{ fontSize: '0.7rem' }}>
              localStorage is empty
            </Alert>
          ) : (
            <List dense>
              {Object.entries(processedData.localStorage).map(([key, value], index) => (
                <ListItem key={index} sx={{ py: 0.25, px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, width: '100%' }}>
                    <span style={{ fontSize: '0.7rem' }}>{getStorageItemIcon(key, value)}</span>
                    <Typography sx={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 500, 
                      fontFamily: 'monospace',
                      flex: 1
                    }}>
                      {key}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                      {typeof value === 'string' ? value.length : JSON.stringify(value).length} chars
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '0.65rem', 
                    fontFamily: 'monospace',
                    sx: { wordBreak: 'break-all' },
                    pl: 2
                  }}>
                    {formatStorageValue(value)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      {/* sessionStorage */}
      <Accordion 
        expanded={currentExpanded === 'sessionStorage'} 
        onChange={handleChange('sessionStorage')}
        sx={{ mb: 0.5 }}
        disableGutters
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
          sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              sessionStorage
            </Typography>
            <Chip 
              label={`${Object.keys(processedData.sessionStorage).length} items`} 
              size="small" 
              color="info"
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1 }}>
          {Object.keys(processedData.sessionStorage).length === 0 ? (
            <Alert severity="info" sx={{ fontSize: '0.7rem' }}>
              sessionStorage is empty
            </Alert>
          ) : (
            <List dense>
              {Object.entries(processedData.sessionStorage).map(([key, value], index) => (
                <ListItem key={index} sx={{ py: 0.25, px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <span style={{ fontSize: '0.7rem' }}>{getStorageItemIcon(key, value)}</span>
                    <Typography sx={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 500, 
                      fontFamily: 'monospace',
                      flex: 1
                    }}>
                      {key}
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    fontSize: '0.65rem', 
                    fontFamily: 'monospace',
                    sx: { wordBreak: 'break-all' },
                    pl: 2
                  }}>
                    {formatStorageValue(value)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Cookies */}
      <Accordion 
        expanded={currentExpanded === 'cookies'} 
        onChange={handleChange('cookies')}
        sx={{ mb: 0.5 }}
        disableGutters
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
          sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CookieIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              Cookies
            </Typography>
            <Chip 
              label={`${Object.keys(processedData.cookies).length} cookies`} 
              size="small" 
              color="warning"
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1 }}>
          {Object.keys(processedData.cookies).length === 0 ? (
            <Alert severity="info" sx={{ fontSize: '0.7rem' }}>
              No cookies found
            </Alert>
          ) : (
            <List dense>
              {Object.entries(processedData.cookies).map(([key, cookie]: [string, any], index) => (
                <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        {key}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ 
                        fontSize: '0.65rem', 
                        fontFamily: 'monospace',
                        sx: { wordBreak: 'break-all' }
                      }}>
                        {cookie?.value ? `${cookie.value.substring(0, 50)}...` : 'No value'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default StorageCollector;