// platform/frontend-mui/src/pages/auth/LoginPerformanceChart.tsx
// Extracted from LoginPage so recharts (a heavy charting library used here only
// for a decorative panel) loads in a separate chunk instead of blocking the
// login route bundle.
import React from 'react';
import { Box, Card, Chip, Typography } from '@mui/material';
import { XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Mock performance data for the decorative chart
const performanceData = [
  { month: 'Jan', efficiency: 387, reliability: 453 },
  { month: 'Feb', efficiency: 280, reliability: 140 },
  { month: 'Mar', efficiency: 129, reliability: 100 },
  { month: 'Apr', efficiency: 643, reliability: 405 },
  { month: 'May', efficiency: 540, reliability: 195 },
  { month: 'Jun', efficiency: 343, reliability: 135 },
];

const LoginPerformanceChart: React.FC = () => (
  <Card
    sx={{
      flex: '1.5',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
      p: 3,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'white' }}>
        System Performance
      </Typography>
      <Chip size="small" label="Live" sx={{ height: 20, backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 600, fontSize: '0.65rem' }} />
    </Box>
    <Box sx={{ height: 160, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={performanceData}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis hide />
          <Area
            type="monotone"
            dataKey="efficiency"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorEfficiency)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="reliability"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorReliability)"
            fillOpacity={1}
          />
          <defs>
            <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorReliability" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  </Card>
);

export default LoginPerformanceChart;
