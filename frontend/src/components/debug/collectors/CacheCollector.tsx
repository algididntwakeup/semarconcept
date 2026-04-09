// platform/frontend-mui/src/components/debug/collectors/CacheCollector.tsx
import React from 'react';
import { Typography, List, ListItem, ListItemText, Box, Chip } from '@mui/material';

interface CacheCollectorProps {
  data: any[];
}

const CacheCollector: React.FC<CacheCollectorProps> = ({ data }) => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1 }}>
        Cache Operations ({data?.length || 0})
      </Typography>
      
      {(!data || data.length === 0) ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textAlign: 'center', mt: 2 }}>
          No cache operations yet.
        </Typography>
      ) : (
        <List dense sx={{ pt: 0 }}>
          {data.slice(-15).reverse().map((cache, index) => (
            <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={cache.operation || 'GET'} 
                      size="small" 
                      color="primary"
                      sx={{ fontSize: '0.6rem', height: 18 }}
                    />
                    <Typography sx={{ fontSize: '0.75rem' }}>{cache.key || cache.name || 'Cache Item'}</Typography>
                  </Box>
                }
                secondary={`${cache.size || 0}B • ${cache.timestamp ? new Date(cache.timestamp).toLocaleTimeString() : 'No timestamp'}`}
                secondaryTypographyProps={{ fontSize: '0.65rem' }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CacheCollector;