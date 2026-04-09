// platform/frontend-mui/src/components/debug/collectors/ConfigCollector.tsx
import React from 'react';
import { Typography, List, ListItem, ListItemText, Box, Chip } from '@mui/material';

interface ConfigCollectorProps {
  data: any;
}

const ConfigCollector: React.FC<ConfigCollectorProps> = ({ data }) => {
  const configEntries = data ? Object.entries(data) : [];

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1 }}>
        Configuration Variables ({configEntries.length})
      </Typography>
      
      {configEntries.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textAlign: 'center', mt: 2 }}>
          No configuration data available.
        </Typography>
      ) : (
        <List dense sx={{ pt: 0 }}>
          {configEntries.map(([key, value], index) => (
            <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, fontFamily: 'monospace' }}>
                      {key}
                    </Typography>
                    {key.startsWith('VITE_') && (
                      <Chip 
                        label="ENV" 
                        size="small" 
                        color="secondary"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                    )}
                  </Box>
                }
                secondary={String(value)}
                secondaryTypographyProps={{ 
                  fontSize: '0.65rem', 
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ConfigCollector;