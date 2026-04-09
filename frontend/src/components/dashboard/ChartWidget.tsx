import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface ChartWidgetProps {
  title: string;
  // TODO: Add props for chart data, type (line, bar, pie), options, etc.
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ title }) => {
  // TODO: Implement actual chart rendering using a library like Chart.js, Recharts, etc.
  return (
    <Paper sx={{ p: 2, height: '300px' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          height: 'calc(100% - 40px)', // Adjust height based on title space
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed grey',
          borderRadius: 1,
          mt: 1,
        }}
      >
        <Typography color="text.secondary">[Chart Placeholder]</Typography>
      </Box>
    </Paper>
  );
};

export default ChartWidget;
