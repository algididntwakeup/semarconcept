// platform/frontend-mui/src/components/debug/collectors/FilesCollector.tsx
import React from 'react';
import { Typography, List, ListItem, ListItemText, Box, Chip } from '@mui/material';

interface FilesCollectorProps {
  data: any[];
}

const FilesCollector: React.FC<FilesCollectorProps> = ({ data }) => {
  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1 }}>
        Loaded Files & Modules ({data?.length || 0})
      </Typography>
      
      {(!data || data.length === 0) ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', textAlign: 'center', mt: 2 }}>
          No file data available yet.
        </Typography>
      ) : (
        <List dense sx={{ pt: 0 }}>
          {data.slice(-15).reverse().map((file, index) => (
            <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={file.type || 'JS'} 
                      size="small" 
                      color="info"
                      sx={{ fontSize: '0.6rem', height: 18 }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {file.name || file.path || file.filename || 'Unknown File'}
                    </Typography>
                  </Box>
                }
                secondary={`${file.size || 0}B • ${file.timestamp ? new Date(file.timestamp).toLocaleTimeString() : 'No timestamp'}`}
                secondaryTypographyProps={{ fontSize: '0.65rem' }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FilesCollector;