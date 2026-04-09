// platform/frontend-mui/src/components/debug/collectors/TimeDataCollector.tsx
import React from 'react';
import { Typography, List, ListItem, ListItemText, Box, LinearProgress, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface TimeDataCollectorProps {
  data: any;
}

const TimeDataCollector: React.FC<TimeDataCollectorProps> = ({ data }) => {
  const timeEntries = data ? Object.entries(data) : [];
  const hasSlowTiming = timeEntries.some(([, value]) => 
    typeof value === 'number' && value > 1000
  );

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Performance Timing
        </Typography>
        <Chip 
          label={hasSlowTiming ? 'Issues detected' : 'Good performance'} 
          size="small" 
          color={hasSlowTiming ? 'warning' : 'success'}
          sx={{ fontSize: '0.6rem', height: 18 }}
        />
      </Box>
      
      {timeEntries.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textAlign: 'center', mt: 2 }}>
          No timing data available yet.
        </Typography>
      ) : (
        <List dense sx={{ pt: 0 }}>
          {timeEntries.map(([key, value], index) => (
            <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '70px' }}>
                      <Typography sx={{ fontSize: '0.65rem' }}>
                        {typeof value === 'number' ? `${Math.round(value)}ms` : String(value)}
                      </Typography>
                      {typeof value === 'number' && value > 0 && (
                        <Box sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: value > 3000 ? 'error.main' : value > 1000 ? 'warning.main' : 'success.main'
                        }} />
                      )}
                    </Box>
                    {typeof value === 'number' && value > 0 && (
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((value / 5000) * 100, 100)} 
                        sx={{ 
                          flex: 1, 
                          height: 4, 
                          borderRadius: 1,
                          backgroundColor: (theme) => alpha(theme.palette.grey[300], 0.3)
                        }}
                        color={value > 3000 ? 'error' : value > 1000 ? 'warning' : 'success'}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default TimeDataCollector;