// platform/frontend-mui/src/components/debug/collectors/LogsCollector.tsx
import React from 'react';
import { Typography, List, ListItem, ListItemText, Box, Chip } from '@mui/material';

interface LogsCollectorProps {
  data: any[];
}

const LogsCollector: React.FC<LogsCollectorProps> = ({ data }) => {
  const getLogColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'error';
      case 'warn': return 'warning'; 
      case 'info': return 'info';
      case 'debug': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1 }}>
        Application Logs ({data?.length || 0})
      </Typography>
      
      {(!data || data.length === 0) ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textAlign: 'center', mt: 2 }}>
          No logs yet.
        </Typography>
      ) : (
        <List dense sx={{ pt: 0 }}>
          {data.slice(-20).reverse().map((log, index) => (
            <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={log.level?.toUpperCase() || 'LOG'} 
                      size="small" 
                      color={getLogColor(log.level)}
                      sx={{ fontSize: '0.6rem', height: 18 }}
                    />
                    <Typography sx={{ fontSize: '0.75rem' }}>{log.message || log.text || 'Log entry'}</Typography>
                  </Box>
                }
                secondary={`${log.source || 'frontend'} • ${log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'No timestamp'}`}
                secondaryTypographyProps={{ fontSize: '0.65rem' }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default LogsCollector;