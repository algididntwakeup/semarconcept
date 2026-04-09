// platform/frontend-mui/src/components/debug/collectors/RequestCollector.tsx
import React from 'react';
import { Typography, List, ListItem, ListItemText, Box, Chip } from '@mui/material';

interface RequestCollectorProps {
  data: any[];
}

const RequestCollector: React.FC<RequestCollectorProps> = ({ data }) => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1 }}>
        HTTP Requests ({data?.length || 0})
      </Typography>
      
      {(!data || data.length === 0) ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textAlign: 'center', mt: 2 }}>
          No HTTP requests yet.
        </Typography>
      ) : (
        <List dense sx={{ pt: 0 }}>
          {data.slice(-15).reverse().map((request, index) => (
            <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={request.method || 'GET'} 
                      size="small" 
                      color="primary"
                      sx={{ fontSize: '0.6rem', height: 18 }}
                    />
                    <Typography sx={{ fontSize: '0.75rem' }}>{request.url || request.endpoint}</Typography>
                  </Box>
                }
                secondary={`${request.duration || 0}ms • ${request.timestamp ? new Date(request.timestamp).toLocaleTimeString() : 'No timestamp'}`}
                secondaryTypographyProps={{ fontSize: '0.65rem' }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RequestCollector;