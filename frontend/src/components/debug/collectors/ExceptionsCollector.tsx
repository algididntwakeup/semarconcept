// platform/frontend-mui/src/components/debug/collectors/ExceptionsCollector.tsx
import React, { useState } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

interface DebugException {
  message: string;
  stack: string;
  timestamp: string;
  component?: string;
  props?: any;
}

interface ExceptionsCollectorProps {
  data: DebugException[];
}

const ExceptionsCollector: React.FC<ExceptionsCollectorProps> = ({ data }) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
  <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
    Exception Tracking
  </Typography>
  <Chip 
    label={`${data.length} errors`} 
    size="small" 
    color={data.length > 0 ? 'error' : 'success'}
    sx={{ fontSize: '0.6rem', height: 18 }}
  />
</Box>
      
      {data.length === 0 ? (
        <Alert severity="success" sx={{ fontSize: '0.75rem', mt: 1 }}>
          <Typography sx={{ fontSize: '0.75rem' }}>No exceptions caught! 🎉</Typography>
        </Alert>
      ) : (
        <Box>
          {data.slice(-10).reverse().map((exception, index) => (
            <Accordion 
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{ 
                mb: 0.5,
                '&:before': { display: 'none' },
                boxShadow: 1
              }}
            >
<AccordionSummary
  expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
  sx={{ 
    minHeight: 40,
    '& .MuiAccordionSummary-content': { my: 0.5 },
    backgroundColor: (theme) => alpha(theme.palette.error.main, 0.05),
    '&:hover': {
      backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
    }
  }}
>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <ErrorIcon color="error" sx={{ fontSize: 16 }} />
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography 
                      sx={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {exception.message}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                        {new Date(exception.timestamp).toLocaleTimeString()}
                      </Typography>
                      {exception.component && (
                        <Chip 
                          label={exception.component} 
                          size="small" 
                          color="error"
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: 16 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.5, display: 'block' }}>
                    Stack Trace:
                  </Typography>
<Box
  component="pre"
  sx={{
    fontSize: '0.65rem',
    backgroundColor: (theme) => alpha(theme.palette.grey[100], 0.8),
    border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
    p: 1,
    borderRadius: 1,
    overflow: 'auto',
    maxHeight: 150,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }}
>
                    {exception.stack}
                  </Box>
                  {exception.props && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, mb: 0.5, display: 'block' }}>
                        Component Props:
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          fontSize: '0.65rem',
                          backgroundColor: 'grey.50',
                          p: 1,
                          borderRadius: 1,
                          overflow: 'auto',
                          maxHeight: 100,
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {JSON.stringify(exception.props, null, 2)}
                      </Box>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ExceptionsCollector;