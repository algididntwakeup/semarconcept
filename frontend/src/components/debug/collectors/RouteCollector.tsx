// platform/frontend-mui/src/components/debug/collectors/RouteCollector.tsx
import React, { useState, useMemo } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  Paper,
  Grid,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ExpandMore as ExpandMoreIcon,
  Route as RouteIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface DebugRoute {
  id: string;
  path: string;
  component: string;
  timestamp: string;
  params?: any;
  query?: any;
  navigationType: 'push' | 'replace' | 'pop';
  hash?: string;
  search?: string;
}

interface RouteCollectorProps {
  data: DebugRoute[];
}

const RouteCollector: React.FC<RouteCollectorProps> = ({ data }) => {
  const [expanded, setExpanded] = useState<string | false>('summary');

  // Navigation statistics
  const navigationStats = useMemo(() => {
    if (data.length === 0) return null;

    const pathCounts = data.reduce((acc, route) => {
      acc[route.path] = (acc[route.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const navigationTypes = data.reduce((acc, route) => {
      acc[route.navigationType] = (acc[route.navigationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniquePaths = Object.keys(pathCounts).length;
    const mostVisitedPaths = Object.entries(pathCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    const recentNavigations = data.slice(-10);

    return {
      totalNavigations: data.length,
      uniquePaths,
      mostVisitedPaths,
      navigationTypes,
      recentNavigations
    };
  }, [data]);

  const getNavigationTypeColor = (type: string) => {
    switch (type) {
      case 'push': return 'primary';
      case 'replace': return 'secondary';
      case 'pop': return 'info';
      default: return 'default';
    }
  };

  const getNavigationTypeIcon = (type: string) => {
    switch (type) {
      case 'push': return '➡️';
      case 'replace': return '🔄';
      case 'pop': return '⬅️';
      default: return '❓';
    }
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 1 
      }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Route Navigation History ({data.length})
        </Typography>
      </Box>

      {data.length === 0 ? (
        <Alert severity="info" sx={{ fontSize: '0.75rem', mt: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', mb: 1 }}>
            No route changes tracked yet.
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            The enhanced debug manager automatically tracks:
            <br />• Browser navigation (back/forward)
            <br />• Programmatic navigation (history.pushState/replaceState)
            <br />• URL hash and query parameter changes
          </Typography>
        </Alert>
      ) : (
        <>
          {/* Navigation Statistics */}
          {navigationStats && (
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
                  <TrendingUpIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    Navigation Analytics
                  </Typography>
                  <Chip 
                    label={`${navigationStats.uniquePaths} unique paths`} 
                    size="small" 
                    color="primary"
                    sx={{ fontSize: '0.6rem', height: 18 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Total</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                        {navigationStats.totalNavigations}
                      </Typography>
                    </Paper>
                  </div>
                  <div>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Push</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', color: 'primary.main' }}>
                        {navigationStats.navigationTypes.push || 0}
                      </Typography>
                    </Paper>
                  </div>
                  <div>
                    <Paper sx={{ p: 1, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Back/Forward</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', color: 'info.main' }}>
                        {navigationStats.navigationTypes.pop || 0}
                      </Typography>
                    </Paper>
                  </div>
                </div>

                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 1 }}>
                  Most Visited Paths:
                </Typography>
                <List dense>
                  {navigationStats.mostVisitedPaths.map((pathData, index) => (
                    <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ 
                              fontSize: '0.7rem', 
                              fontFamily: 'monospace',
                              flex: 1,
                              color: 'primary.main'
                            }}>
                              {pathData.path}
                            </Typography>
                            <Chip 
                              label={`${pathData.count} visits`} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 16 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Recent Navigation History */}
          <Typography variant="caption" sx={{ 
            fontSize: '0.7rem', 
            fontWeight: 600, 
            mb: 0.5, 
            display: 'block',
            color: 'text.secondary'
          }}>
            Recent Navigation History ({Math.min(data.length, 20)} shown)
          </Typography>

          <List dense sx={{ pt: 0 }}>
            {data.slice(-20).reverse().map((route, index) => (
              <ListItem key={route.id || index} sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem' }}>
                        {getNavigationTypeIcon(route.navigationType)}
                      </span>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 500,
                          fontFamily: 'monospace',
                          color: 'primary.main',
                          flex: 1,
                          minWidth: 0
                        }}
                      >
                        {route.path}
                      </Typography>
                      
                      <Chip 
                        label={route.navigationType} 
                        size="small" 
                        color={getNavigationTypeColor(route.navigationType)}
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                      
                      <Chip 
                        label={route.component} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                        {new Date(route.timestamp).toLocaleTimeString()}
                      </Typography>
                      
                      {route.search && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.6rem', 
                            fontFamily: 'monospace',
                            color: 'text.secondary',
                            backgroundColor: 'grey.100',
                            px: 0.5,
                            borderRadius: 0.5,
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {route.search}
                        </Typography>
                      )}
                      
                      {route.hash && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.6rem', 
                            fontFamily: 'monospace',
                            color: 'secondary.main',
                            backgroundColor: 'grey.100',
                            px: 0.5,
                            borderRadius: 0.5
                          }}
                        >
                          {route.hash}
                        </Typography>
                      )}
                      
                      {route.params && Object.keys(route.params).length > 0 && (
                        <Chip 
                          label={`${Object.keys(route.params).length} params`} 
                          size="small" 
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
        </>
      )}
    </Box>
  );
};

export default RouteCollector;