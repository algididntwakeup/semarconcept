import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { selectWidgetData } from '../../store/slices/dashboardRealTimeSlice';
import { RootState } from '../../store';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Define chart types
type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';

interface RealTimeChartProps {
  dashboardId: number;
  widgetId: string;
  title?: string;
  type?: ChartType;
  height?: number;
  width?: number;
  options?: ChartOptions<any>;
}

/**
 * RealTimeChart component
 * 
 * This component displays a chart that updates in real-time when new data
 * is received via WebSocket. It supports line, bar, pie, and doughnut charts.
 */
const RealTimeChart: React.FC<RealTimeChartProps> = ({
  dashboardId,
  widgetId,
  title,
  type = 'line',
  height = 300,
  width = '100%',
  options
}) => {
  // Get widget data from Redux store
  const widgetData = useSelector((state: RootState) => 
    selectWidgetData(state, dashboardId, widgetId)
  );
  
  // Local state for chart data
  const [chartData, setChartData] = useState<ChartData<any> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update chart data when widget data changes
  useEffect(() => {
    if (widgetData) {
      try {
        // Process widget data into chart data
        const processedData = processWidgetData(widgetData.data, type);
        setChartData(processedData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error processing chart data:', err);
        setError('Failed to process chart data');
        setLoading(false);
      }
    }
  }, [widgetData, type]);
  
  // Process widget data into chart data
  const processWidgetData = (data: any, chartType: ChartType): ChartData<any> => {
    // Default empty chart data
    const defaultData: ChartData<any> = {
      labels: [],
      datasets: []
    };
    
    // If no data, return default
    if (!data) return defaultData;
    
    // If data already in ChartData format, use it directly
    if (data.labels && data.datasets) {
      return data as ChartData<any>;
    }
    
    // Otherwise, try to extract from widget data structure
    // This depends on the structure of your widget data
    if (data.chartData) {
      return data.chartData as ChartData<any>;
    }
    
    // For demo purposes, return some sample data if nothing else works
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Sample Data',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };
  
  // Default chart options
  const defaultOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title || '',
      },
    },
  };
  
  // Merge default options with provided options
  const chartOptions = { ...defaultOptions, ...options };
  
  // Render loading state
  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 2, height, width, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 2, height, width, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }
  
  // Render chart based on type
  const renderChart = () => {
    if (!chartData) return null;
    
    switch (type) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 2, height, width }}>
      {title && !chartOptions.plugins?.title?.display && (
        <Typography variant="h6" gutterBottom>{title}</Typography>
      )}
      <Box sx={{ height: title ? 'calc(100% - 40px)' : '100%', width: '100%' }}>
        {renderChart()}
      </Box>
    </Paper>
  );
};

export default RealTimeChart;