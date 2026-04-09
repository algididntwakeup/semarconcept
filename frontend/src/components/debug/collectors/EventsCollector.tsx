// platform/frontend-mui/src/components/debug/collectors/EventsCollector.tsx
import React from 'react';
import { Typography, List, ListItem, ListItemText, Box, Chip } from '@mui/material';

interface DebugEvent {
  type: string;
  target: string;
  timestamp: string;
  data?: any;
}

interface EventsCollectorProps {
  data: DebugEvent[];
}

const EventsCollector: React.FC<EventsCollectorProps> = ({ data }) => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1 }}>
        User Events & Interactions ({data.length})
      </Typography>
      <List dense sx={{ pt: 0 }}>
        {data.slice(-20).reverse().map((event, index) => (
          <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={event.type} 
                    size="small" 
                    color="primary"
                    sx={{ fontSize: '0.6rem', height: 18 }}
                  />
                  <Typography sx={{ fontSize: '0.75rem' }}>{event.target}</Typography>
                </Box>
              }
              secondary={new Date(event.timestamp).toLocaleTimeString()}
              secondaryTypographyProps={{ fontSize: '0.65rem' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default EventsCollector;

