// platform/frontend-mui/src/components/debug/collectors/EnvironmentCollector.tsx
import React from 'react';
import { Typography, List, ListItem, ListItemText, Box } from '@mui/material';

interface EnvironmentCollectorProps {
  data: any;
}

const EnvironmentCollector: React.FC<EnvironmentCollectorProps> = ({ data }) => {
  if (!data) return <Typography sx={{ fontSize: '0.75rem', p: 1 }}>Loading environment data...</Typography>;

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1 }}>
        System Environment
      </Typography>
      <List dense sx={{ pt: 0 }}>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemText 
            primary="Platform" 
            secondary={data.platform} 
            primaryTypographyProps={{ fontSize: '0.75rem' }}
            secondaryTypographyProps={{ fontSize: '0.65rem' }}
          />
        </ListItem>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemText 
            primary="Language" 
            secondary={data.language} 
            primaryTypographyProps={{ fontSize: '0.75rem' }}
            secondaryTypographyProps={{ fontSize: '0.65rem' }}
          />
        </ListItem>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemText 
            primary="Online" 
            secondary={data.online ? 'Yes' : 'No'} 
            primaryTypographyProps={{ fontSize: '0.75rem' }}
            secondaryTypographyProps={{ fontSize: '0.65rem' }}
          />
        </ListItem>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemText 
            primary="Screen" 
            secondary={`${data.screen?.width} x ${data.screen?.height}`} 
            primaryTypographyProps={{ fontSize: '0.75rem' }}
            secondaryTypographyProps={{ fontSize: '0.65rem' }}
          />
        </ListItem>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemText 
            primary="Window" 
            secondary={`${data.window?.width} x ${data.window?.height}`} 
            primaryTypographyProps={{ fontSize: '0.75rem' }}
            secondaryTypographyProps={{ fontSize: '0.65rem' }}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default EnvironmentCollector;

