// platform/frontend-mui/src/components/debug/collectors/QueryCollector.tsx
import React, { useState, useMemo } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  FormControlLabel,
  Switch,
  Alert,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Api as ApiIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
interface DebugQuery {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  timestamp: string;
  requestData?: any;
  responseData?: any;
  binding?: string;
  headers?: Record<string, string>;
  error?: string;
}

interface QueryCollectorProps {
  data: DebugQuery[];
}

const QueryCollector: React.FC<QueryCollectorProps> = ({ data }) => {
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [showSlowOnly, setShowSlowOnly] = useState(false);
  const [expanded, setExpanded] = useState<string | false>('summary');

  // Process and filter data
  const processedData = useMemo(() => {
    let filteredData = [...data];
    
    if (showErrorsOnly) {
      filteredData = filteredData.filter(query => query.status >= 400);
    }
    
    if (showSlowOnly) {
      filteredData = filteredData.filter(query => query.duration > 1000);
    }
    
    return filteredData.slice(-30).reverse(); // Show last 30 queries
  }, [data, showErrorsOnly, showSlowOnly]);

  // API statistics
  const apiStats = useMemo(() => {
    if (data.length === 0) return null;

    const totalRequests = data.length;
    const successfulRequests = data.filter(q => q.status >= 200 && q.status < 400).length;
    const errorRequests = data.filter(q => q.status >= 400).length;
    const slowRequests = data.filter(q => q.duration > 1000).length;
    
    const averageDuration = Math.round(
      data.reduce((sum, q) => sum + q.duration, 0) / data.length
    );
    
    const endpointStats = data.reduce((acc, query) => {
      const endpoint = query.endpoint.replace(/\/\d+/g, '/:id'); // Normalize IDs
      if (!acc[endpoint]) {
        acc[endpoint] = { count: 0, totalDuration: 0, errors: 0 };
      }
      acc[endpoint].count++;
      acc[endpoint].totalDuration += query.duration;
      if (query.status >= 400) acc[endpoint].errors++;
      return acc;
    }, {} as Record<string, { count: number; totalDuration: number; errors: number }>);

    const topEndpoints = Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        averageDuration: Math.round(stats.totalDuration / stats.count),
        errorRate: Math.round((stats.errors / stats.count) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests,
      successfulRequests,
      errorRequests,
      slowRequests,
      averageDuration,
      successRate: Math.round((successfulRequests / totalRequests) * 100),
      topEndpoints
    };
  }, [data]);

  const getStatusColor = (status: number) => {
    if (status < 300) return 'success';
    if (status < 400) return 'warning';
    return 'error';
  };

  const getDurationColor = (duration: number) => {
    if (duration < 200) return 'success';
    if (duration < 1000) return 'warning';
    return 'error';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'primary';
      case 'POST': return 'secondary';
      case 'PUT': return 'info';
      case 'DELETE': return 'error';
      case 'PATCH': return 'warning';
      default: return 'default';
    }
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header Controls */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 1,
        p: 0.5,
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.02),
        borderRadius: 1
      }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          API Queries & Network Requests ({data.length})
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showErrorsOnly}
                onChange={(e) => setShowErrorsOnly(e.target.checked)}
              />
            }
            label={<Typography sx={{ fontSize: '0.7rem' }}>Errors</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showSlowOnly}
                onChange={(e) => setShowSlowOnly(e.target.checked)}
              />
            }
            label={<Typography sx={{ fontSize: '0.7rem' }}>Slow</Typography>}
          />
        </Box>
      </Box>

      {data.length === 0 ? (
        <Alert severity="info" sx={{ fontSize: '0.75rem', mt: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', mb: 1 }}>
            No API queries tracked yet.
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            The enhanced debug manager automatically intercepts:
            <br />• Axios requests and responses
            <br />• Fetch API calls
            <br />• Network errors and timeouts
          </Typography>
        </Alert>
      ) : (
        <>
          {/* API Statistics */}
          {apiStats && (
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
                    API Performance Summary
                  </Typography>
                  <Chip 
                    label={`${apiStats.successRate}% success`} 
                    size="small" 
                    color={apiStats.successRate > 95 ? 'success' : apiStats.successRate > 80 ? 'warning' : 'error'}
                    sx={{ fontSize: '0.6rem', height: 18 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Total</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                        {apiStats.totalRequests}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'success.main' }}>Success</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', color: 'success.main' }}>
                        {apiStats.successfulRequests}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'error.main' }}>Errors</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', color: 'error.main' }}>
                        {apiStats.errorRequests}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'warning.main' }}>Avg Time</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', color: 'warning.main' }}>
                        {apiStats.averageDuration}ms
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 1 }}>
                  Top Endpoints:
                </Typography>
                <List dense>
                  {apiStats.topEndpoints.map((endpoint, index) => (
                    <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ 
                              fontSize: '0.7rem', 
                              fontFamily: 'monospace',
                              flex: 1 
                            }}>
                              {endpoint.endpoint}
                            </Typography>
                            <Chip 
                              label={`${endpoint.count}×`} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 16 }}
                            />
                            <Chip 
                              label={`${endpoint.averageDuration}ms`} 
                              size="small" 
                              color={getDurationColor(endpoint.averageDuration)}
                              sx={{ fontSize: '0.6rem', height: 16 }}
                            />
                            {endpoint.errorRate > 0 && (
                              <Chip 
                                label={`${endpoint.errorRate}% err`} 
                                size="small" 
                                color="error"
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', height: 16 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Recent Requests Table */}
          <Typography variant="caption" sx={{ 
            fontSize: '0.7rem', 
            fontWeight: 600, 
            mb: 0.5, 
            display: 'block',
            color: 'text.secondary'
          }}>
            Recent Requests ({processedData.length} shown)
          </Typography>

          <TableContainer>
            <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5, fontSize: '0.7rem' } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, width: '60px' }}>Time</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, width: '60px' }}>Method</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Endpoint</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, width: '60px' }}>Status</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, width: '70px' }}>Duration</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, width: '60px' }}>Binding</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedData.map((query, index) => (
                  <TableRow 
                    key={query.id || index} 
                    hover 
                    sx={{ 
                      backgroundColor: query.error ? alpha => alpha('#f44336', 0.1) : 'inherit'
                    }}
                  >
                    <TableCell sx={{ fontSize: '0.65rem' }}>
                      {new Date(query.timestamp).toLocaleTimeString().substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={query.method} 
                        size="small" 
                        color={getMethodColor(query.method)}
                        sx={{ fontSize: '0.6rem', height: 18, minWidth: 45 }} 
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.65rem', 
                      maxWidth: '200px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontFamily: 'monospace'
                    }}>
                      <Tooltip title={query.endpoint}>
                        <span>{query.endpoint.replace(/^.*\/api/, '/api')}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip 
                          label={query.status || 'ERR'} 
                          size="small" 
                          color={getStatusColor(query.status)} 
                          sx={{ fontSize: '0.6rem', height: 18, minWidth: 40 }}
                        />
                        {query.error && (
                          <ErrorIcon sx={{ fontSize: 12, color: 'error.main' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.65rem',
                          color: `${getDurationColor(query.duration)}.main`,
                          fontWeight: query.duration > 1000 ? 'bold' : 'normal',
                          fontFamily: 'monospace'
                        }}
                      >
                        {query.duration}ms
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.65rem' }}>
                      <Chip 
                        label={query.binding || 'fetch'} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {processedData.length === 0 && (showErrorsOnly || showSlowOnly) && (
            <Alert severity="success" sx={{ mt: 1, fontSize: '0.75rem' }}>
              <Typography sx={{ fontSize: '0.75rem' }}>
                {showErrorsOnly && showSlowOnly 
                  ? 'No slow error requests found! 🎉' 
                  : showErrorsOnly 
                  ? 'No error requests found! 🎉'
                  : 'No slow requests found! 🎉'
                }
              </Typography>
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default QueryCollector;