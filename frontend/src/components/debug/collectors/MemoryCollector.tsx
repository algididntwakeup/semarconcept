// platform/frontend-mui/src/components/debug/collectors/MemoryCollector.tsx
import React from 'react';
import { Typography, List, ListItem, ListItemText, Box, LinearProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface MemoryCollectorProps {
  data: any;
}

const MemoryCollector: React.FC<MemoryCollectorProps> = ({ data }) => {
const usagePercent = data.used && data.limit ? Math.round((data.used / data.limit) * 100) : 0;
const isHighUsage = usagePercent > 80;
const isMediumUsage = usagePercent > 60;
  
return (
  <Box sx={{ height: '100%', overflow: 'auto' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
        Memory Usage
      </Typography>
      <Box sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: isHighUsage ? 'error.main' : isMediumUsage ? 'warning.main' : 'success.main'
      }} />
    </Box>
      <List dense sx={{ pt: 0 }}>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemText 
            primary="Used Heap Size" 
            secondary={`${data.used || 0} MB`} 
            primaryTypographyProps={{ fontSize: '0.75rem' }}
            secondaryTypographyProps={{ fontSize: '0.65rem' }}
          />
        </ListItem>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemText 
            primary="Total Heap Size" 
            secondary={`${data.total || 0} MB`} 
            primaryTypographyProps={{ fontSize: '0.75rem' }}
            secondaryTypographyProps={{ fontSize: '0.65rem' }}
          />
        </ListItem>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemText 
            primary="Heap Size Limit" 
            secondary={`${data.limit || 0} MB`} 
            primaryTypographyProps={{ fontSize: '0.75rem' }}
            secondaryTypographyProps={{ fontSize: '0.65rem' }}
          />
        </ListItem>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemText 
            primary="Usage Percentage" 
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
<LinearProgress 
  variant="determinate" 
  value={usagePercent} 
  sx={{ 
    flex: 1, 
    height: 6, 
    borderRadius: 1,
    backgroundColor: (theme) => alpha(theme.palette.grey[300], 0.3)
  }}
  color={isHighUsage ? 'error' : isMediumUsage ? 'warning' : 'success'}
/>
                <Typography sx={{ fontSize: '0.65rem' }}>{usagePercent}%</Typography>
              </Box>
            }
            primaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default MemoryCollector;

