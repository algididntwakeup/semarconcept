import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

// Example data structure for time-series data
interface TimeSeriesDataPoint {
  timestamp: string; // Or Date object
  value: number;
  // Optional other series
  value2?: number;
}

interface TimeSeriesChartProps {
  title: string;
  data: TimeSeriesDataPoint[];
  dataKey: keyof TimeSeriesDataPoint; // The primary value key
  dataKey2?: keyof TimeSeriesDataPoint; // Optional second value key
  xAxisDataKey: keyof TimeSeriesDataPoint; // Key for the X axis (usually timestamp)
  isLoading?: boolean;
  error?: string | null;
  // Add customization options: colors, stroke width, etc.
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  title,
  data,
  dataKey,
  dataKey2,
  xAxisDataKey,
  isLoading = false,
  error = null,
}) => {
  // TODO: Add date formatting for XAxis tick labels

  return (
    <Paper sx={{ p: 2, height: 300 }}>
      {' '}
      {/* Adjust height as needed */}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 'calc(100% - 30px)' }}>
        {' '}
        {/* Adjust height based on title */}
        {isLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <Typography color="error">Error loading data: {error}</Typography>
          </Box>
        ) : data.length === 0 ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
          >
            <Typography color="textSecondary">No data available.</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 0, // Adjust left margin if YAxis labels are long
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisDataKey} fontSize={12} tick={{ fill: 'currentColor' }} />
              <YAxis fontSize={12} tick={{ fill: 'currentColor' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                }}
                labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                itemStyle={{ color: '#eee' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey as string} // Cast needed as dataKey is keyof
                stroke="#8884d8" // Example color
                activeDot={{ r: 8 }}
                dot={false}
                name={String(dataKey)} // Legend name
              />
              {dataKey2 && (
                <Line
                  type="monotone"
                  dataKey={dataKey2 as string}
                  stroke="#82ca9d" // Example color 2
                  dot={false}
                  name={String(dataKey2)}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
};

export default TimeSeriesChart;
