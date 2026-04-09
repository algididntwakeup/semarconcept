import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { diffChars, diffWordsWithSpace, Change } from 'diff'; // Using 'diff' library

interface VersionData {
  versionNumber: number;
  title: string;
  body: string;
  // Add other relevant fields like author, timestamp
}

interface VersionDiffViewerProps {
  versionA: VersionData;
  versionB: VersionData;
}

// Helper to render diff results with basic styling
const renderDiff = (diffResult: Change[]) => {
  // Add explicit type Change[]
  return diffResult.map((part: Change, index: number) => {
    // Add explicit types
    const style: React.CSSProperties = {
      backgroundColor: part.added
        ? 'rgba(0, 255, 0, 0.1)'
        : part.removed
          ? 'rgba(255, 0, 0, 0.1)'
          : 'transparent',
      textDecoration: part.removed ? 'line-through' : 'none',
      padding: '1px 2px',
      borderRadius: '2px',
      whiteSpace: 'pre-wrap', // Preserve whitespace
    };
    return (
      <span key={index} style={style}>
        {part.value}
      </span>
    );
  });
};
const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({ versionA, versionB }) => {
  // Calculate diffs (example using diffWordsWithSpace for body)
  const titleDiff = diffChars(versionA.title, versionB.title);
  const bodyDiff = diffWordsWithSpace(versionA.body, versionB.body); // Or diffLines

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Comparing Version {versionA.versionNumber} and Version {versionB.versionNumber}
      </Typography>

      <Grid container spacing={2}>
        {/* Side-by-side view (conceptual) - simple diff shown below */}
        {/*
        <Grid size={6}>
           <Typography variant="subtitle1">Version {versionA.versionNumber}</Typography>
           <Paper sx={{ p: 2, mt: 1, whiteSpace: 'pre-wrap' }}>{versionA.body}</Paper>
        </Grid>
        <Grid size={6}>
           <Typography variant="subtitle1">Version {versionB.versionNumber}</Typography>
            <Paper sx={{ p: 2, mt: 1, whiteSpace: 'pre-wrap' }}>{versionB.body}</Paper>
        </Grid>
        */}

        {/* Inline Diff View */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Title Changes:
            </Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem', mb: 2 }}>
              {renderDiff(titleDiff)}
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Body Changes:
            </Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {renderDiff(bodyDiff)}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VersionDiffViewer;
