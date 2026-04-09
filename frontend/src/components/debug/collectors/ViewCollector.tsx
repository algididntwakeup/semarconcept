// platform/frontend-mui/src/components/debug/collectors/ViewCollector.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { getDebugManager } from '../../utils/debug-manager';

// Enhanced Types
interface DebugView {
  id: string;
  component: string;
  displayName: string;
  renderTime: number;
  timestamp: string;
  props?: any;
  phase: 'mount' | 'update' | 'unmount';
  renderCount: number;
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  componentStack?: string;
  errorBoundary?: boolean;
  suspenseStatus?: 'pending' | 'resolved' | 'error';
}

interface ViewCollectorProps {
  data: DebugView[];
}

interface ComponentStat {
  component: string;
  count: number;
  totalTime: number;
  averageTime: number;
  maxTime: number;
  minTime: number;
  slowRenders: number;
  lastRender: string;
  phases: {
    mount: number;
    update: number;
    unmount: number;
  };
}

const ViewCollector: React.FC<ViewCollectorProps> = ({ data }) => {
  const [showOnlySlowRenders, setShowOnlySlowRenders] = useState(false);
  const [expanded, setExpanded] = useState<string | false>('summary');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(2000);
  
const refreshIntervalRef = useRef<NodeJS.Timeout>();

  // Auto-refresh functionality
  useEffect(() => {
  if (autoRefresh) {
    refreshIntervalRef.current = setInterval(() => {
      // Force re-render to get fresh data
      setExpanded(prev => prev === 'summary' ? 'summary' : prev);
    }, refreshInterval);
  } else {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  }

  return () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  };
}, [autoRefresh, refreshInterval]);

  // Process and filter data
  const processedData = useMemo(() => {
    const slowRenderThreshold = 100;
    let filteredData = [...data];
    
    if (showOnlySlowRenders) {
      filteredData = filteredData.filter(view => view.renderTime > slowRenderThreshold);
    }
    
    return filteredData.slice(-50).reverse(); // Show last 50 renders
  }, [data, showOnlySlowRenders]);

  // Calculate comprehensive component statistics
  const componentStats = useMemo((): ComponentStat[] => {
    const statsMap = new Map<string, ComponentStat>();

    data.forEach(view => {
      const existing = statsMap.get(view.component) || {
        component: view.component,
        count: 0,
        totalTime: 0,
        averageTime: 0,
        maxTime: 0,
        minTime: Infinity,
        slowRenders: 0,
        lastRender: view.timestamp,
        phases: { mount: 0, update: 0, unmount: 0 }
      };

      existing.count++;
      existing.totalTime += view.renderTime;
      existing.maxTime = Math.max(existing.maxTime, view.renderTime);
      existing.minTime = Math.min(existing.minTime, view.renderTime);
      existing.phases[view.phase]++;
      
      if (view.renderTime > 100) existing.slowRenders++;
      if (new Date(view.timestamp) > new Date(existing.lastRender)) {
        existing.lastRender = view.timestamp;
      }

      statsMap.set(view.component, existing);
    });

    // Calculate averages and sort by performance impact
    return Array.from(statsMap.values())
      .map(stat => ({
        ...stat,
        averageTime: Math.round((stat.totalTime / stat.count) * 100) / 100,
        minTime: stat.minTime === Infinity ? 0 : stat.minTime
      }))
      .sort((a, b) => {
        // Sort by performance impact (slow renders count more)
        const impactA = a.averageTime * a.count + (a.slowRenders * 500);
        const impactB = b.averageTime * b.count + (b.slowRenders * 500);
        return impactB - impactA;
      })
      .slice(0, 15); // Top 15 components
  }, [data]);

  // Performance summary metrics
  const performanceSummary = useMemo(() => {
    const totalRenders = data.length;
    const slowRenders = data.filter(view => view.renderTime > 100).length;
    const criticalRenders = data.filter(view => view.renderTime > 300).length;
    const averageRenderTime = data.length > 0 
      ? Math.round((data.reduce((sum, view) => sum + view.renderTime, 0) / data.length) * 100) / 100 
      : 0;
    
    const uniqueComponents = new Set(data.map(view => view.component)).size;
    const recentRenders = data.filter(view => 
      Date.now() - new Date(view.timestamp).getTime() < 60000
    ).length; // Last minute

    return {
      totalRenders,
      slowRenders,
      criticalRenders,
      averageRenderTime,
      uniqueComponents,
      recentRenders,
      slowRenderPercentage: totalRenders > 0 ? Math.round((slowRenders / totalRenders) * 100) : 0
    };
  }, [data]);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getRenderTimeColor = (renderTime: number) => {
    if (renderTime > 300) return 'error';      // Critical
    if (renderTime > 100) return 'warning';    // Slow
    if (renderTime > 16) return 'info';        // Noticeable (60fps threshold)
    return 'success';                          // Good
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'mount': return '🚀';
      case 'update': return '🔄';
      case 'unmount': return '💀';
      default: return '❓';
    }
  };

  const getPerformanceGrade = (averageTime: number, slowRenders: number) => {
    if (slowRenders > 5 || averageTime > 100) return { grade: 'F', color: 'error' };
    if (slowRenders > 2 || averageTime > 50) return { grade: 'D', color: 'warning' };
    if (slowRenders > 0 || averageTime > 25) return { grade: 'C', color: 'info' };
    if (averageTime > 16) return { grade: 'B', color: 'primary' };
    return { grade: 'A', color: 'success' };
  };

const clearData = useCallback(() => {
  if (window.__DEBUG_VIEWS__) {
    window.__DEBUG_VIEWS__.length = 0;
  }
  // Clear debug data and force refresh
  setExpanded(prev => prev);
}, []);

  if (data.length === 0) {
    return (
      <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
        <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
          <Typography sx={{ fontSize: '0.75rem', mb: 1 }}>
            No component renders tracked yet.
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            To start tracking component renders:
            <br />• Use the <code>useComponentProfiler()</code> hook
            <br />• Wrap components with <code>withComponentProfiler()</code> HOC
            <br />• Initialize view tracking in your app with <code>getDebugManager().initializeDebugSystem()</code>
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header Controls */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 1,
        p: 0.5,
        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
        borderRadius: 1
      }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Component Performance ({data.length} renders)
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showOnlySlowRenders}
                onChange={(e) => setShowOnlySlowRenders(e.target.checked)}
              />
            }
            label={<Typography sx={{ fontSize: '0.7rem' }}>Slow only</Typography>}
          />
          
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label={<Typography sx={{ fontSize: '0.7rem' }}>Auto</Typography>}
          />

          <Tooltip title="Clear All Data">
            <IconButton size="small" onClick={clearData} sx={{ p: 0.5 }}>
              <ClearIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Performance Overview */}
      <Paper sx={{ p: 1, mb: 1, backgroundColor: (theme) => alpha(theme.palette.background.default, 0.02) }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Avg Render</Typography>
              <Typography sx={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                color: (theme) => theme.palette[getRenderTimeColor(performanceSummary.averageRenderTime)].main
              }}>
                {performanceSummary.averageRenderTime}ms
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Slow Renders</Typography>
              <Typography sx={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                color: performanceSummary.slowRenders > 0 ? 'error.main' : 'success.main'
              }}>
                {performanceSummary.slowRenders} ({performanceSummary.slowRenderPercentage}%)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Components</Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                {performanceSummary.uniqueComponents}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Recent (1m)</Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', color: 'primary.main' }}>
                {performanceSummary.recentRenders}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Component Performance Summary */}
      <Accordion 
        expanded={expanded === 'summary'} 
        onChange={handleAccordionChange('summary')}
        sx={{ mb: 1 }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
          sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpeedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              Component Performance Analysis
            </Typography>
            <Chip 
              label={`${componentStats.length} components analyzed`} 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.6rem', height: 18 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 1 }}>
          <List dense>
            {componentStats.map((stat, index) => {
              const grade = getPerformanceGrade(stat.averageTime, stat.slowRenders);
              return (
                <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 500, 
                          flex: 1,
                          fontFamily: 'monospace'
                        }}>
                          {stat.component}
                        </Typography>
                        
                        <Chip 
                          label={grade.grade} 
                          size="small" 
                          color={grade.color as any}
                          sx={{ fontSize: '0.6rem', height: 16, minWidth: 24, fontWeight: 'bold' }}
                        />
                        
                        <Chip 
                          label={`${stat.count}×`} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: 16 }}
                        />
                        
                        <Chip 
                          label={`~${stat.averageTime}ms`} 
                          size="small" 
                          color={getRenderTimeColor(stat.averageTime)}
                          sx={{ fontSize: '0.6rem', height: 16 }}
                        />
                        
                        {stat.slowRenders > 0 && (
                          <Chip 
                            label={`${stat.slowRenders} slow`} 
                            size="small" 
                            color="error"
                            variant="outlined"
                            icon={<WarningIcon sx={{ fontSize: 10 }} />}
                            sx={{ fontSize: '0.6rem', height: 16 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                            Range: {stat.minTime}ms - {stat.maxTime}ms
                          </Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                            Mount: {stat.phases.mount} • Update: {stat.phases.update} • Unmount: {stat.phases.unmount}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((stat.averageTime / 200) * 100, 100)} 
                          sx={{ height: 4, borderRadius: 1 }}
                          color={getRenderTimeColor(stat.averageTime)}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Recent Renders */}
      <Typography variant="caption" sx={{ 
        fontSize: '0.7rem', 
        fontWeight: 600, 
        mb: 0.5, 
        display: 'block',
        color: 'text.secondary'
      }}>
        Recent Renders ({processedData.length} shown)
        {showOnlySlowRenders && (
          <Chip 
            label="Slow only" 
            size="small" 
            color="warning" 
            sx={{ ml: 1, fontSize: '0.6rem', height: 16 }} 
          />
        )}
      </Typography>

      <List dense sx={{ pt: 0 }}>
        {processedData.map((view, index) => (
          <ListItem key={view.id || index} sx={{ py: 0.25, px: 0 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ fontSize: '0.7rem' }}>{getPhaseIcon(view.phase)}</span>
                  
                  <Typography sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 500, 
                    flex: 1,
                    fontFamily: 'monospace'
                  }}>
                    {view.displayName || view.component}
                  </Typography>
                  
                  <Chip 
                    label={view.phase} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.6rem', height: 18 }}
                  />
                  
                  <Chip 
                    label={`${view.renderTime}ms`} 
                    size="small" 
                    color={getRenderTimeColor(view.renderTime)}
                    sx={{ fontSize: '0.6rem', height: 18, minWidth: 48 }}
                  />
                  
                  {view.renderTime > 100 && (
                    <WarningIcon sx={{ fontSize: 14, color: 'error.main' }} />
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                  <Typography sx={{ fontSize: '0.65rem' }}>
                    {new Date(view.timestamp).toLocaleTimeString()}
                  </Typography>
                  
                  {view.renderCount > 1 && (
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                      • #{view.renderCount}
                    </Typography>
                  )}
                  
                  {view.actualDuration !== view.renderTime && view.actualDuration > 0 && (
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                      • Actual: {view.actualDuration}ms
                    </Typography>
                  )}
                  
                  {view.baseDuration > 0 && (
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                      • Base: {view.baseDuration}ms
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {processedData.length === 0 && showOnlySlowRenders && (
        <Alert severity="success" sx={{ mt: 1, fontSize: '0.75rem' }}>
          <Typography sx={{ fontSize: '0.75rem' }}>
            No slow renders detected! 🎉 All components are performing well.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ViewCollector;