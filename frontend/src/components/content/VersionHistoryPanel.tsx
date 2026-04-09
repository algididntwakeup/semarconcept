import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RestoreIcon from '@mui/icons-material/Restore';
import VersionDiffViewer from './VersionDiffViewer'; // Import the diff viewer
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../store';
// import { fetchVersionHistory, rollbackToVersion } from '../../store/slices/contentSlice'; // Assuming actions exist

// Placeholder type matching backend model
interface ContentVersionInfo {
  id: number;
  versionNumber: number;
  createdAt: string; // Or Date object
  userId?: number; // ID of user who created version
  // Add author name if fetched/joined
}

// Placeholder type for full version data needed by diff viewer
interface FullVersionData {
  id: number;
  versionNumber: number;
  title: string;
  body: string;
  createdAt: string;
  userId?: number;
}


interface VersionHistoryPanelProps {
  contentEntryId: number;
  currentVersionNumber?: number; // Optional: Highlight current version
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ contentEntryId, currentVersionNumber }) => {
  // const dispatch = useDispatch<AppDispatch>();
  // const { history, loadingHistory, errorHistory, rollingBack } = useSelector((state: RootState) => state.content);

  // Placeholder state
  const [history, setHistory] = useState<ContentVersionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDiffVisible, setIsDiffVisible] = useState(false);
  const [versionToViewA, setVersionToViewA] = useState<FullVersionData | null>(null);
  const [versionToViewB, setVersionToViewB] = useState<FullVersionData | null>(null);
  const [isRollingBack, setIsRollingBack] = useState<number | null>(null); // Store ID of version being rolled back to

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // dispatch(fetchVersionHistory(contentEntryId));
    // Mock fetch
    setTimeout(() => {
      setHistory([
        { id: 101, versionNumber: 1, createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), userId: 1 },
        { id: 102, versionNumber: 2, createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), userId: 2 },
        { id: 103, versionNumber: 3, createdAt: new Date().toISOString(), userId: 1 },
      ]);
      setIsLoading(false);
    }, 500);
  }, [contentEntryId]); // dispatch

  const handleViewVersion = async (versionId: number) => {
    console.log('View version:', versionId);
    // TODO: Fetch full version content via API/dispatch
    // Mock fetch/data
    const mockVersion: FullVersionData = {
        id: versionId,
        versionNumber: history.find(v => v.id === versionId)?.versionNumber || 0,
        title: `Version ${versionId} Title`,
        body: `Content of version ${versionId}.\nWith some changes perhaps.`,
        createdAt: history.find(v => v.id === versionId)?.createdAt || '',
        userId: history.find(v => v.id === versionId)?.userId,
    };
    setVersionToViewA(mockVersion);
    setVersionToViewB(null); // Clear second version for single view
    setIsDiffVisible(true);
  };

  const handleCompareVersions = async (versionIdA: number, versionIdB: number) => {
     console.log('Compare versions:', versionIdA, versionIdB);
     // TODO: Fetch full content for both versions
     // Mock fetch/data
     const mockVersionA: FullVersionData = { id: versionIdA, versionNumber: 1, title: "Version 1 Title", body: "Original content.", createdAt: '', userId: 1 };
     const mockVersionB: FullVersionData = { id: versionIdB, versionNumber: 2, title: "Version 2 Title Changed", body: "Original content with additions.", createdAt: '', userId: 2 };
     setVersionToViewA(mockVersionA);
     setVersionToViewB(mockVersionB);
     setIsDiffVisible(true);
  };

  const handleRollback = (versionId: number, versionNumber: number) => {
    if (window.confirm(`Are you sure you want to roll back to version ${versionNumber}? This will create a new version based on version ${versionNumber}.`)) {
      console.log('Rolling back to version:', versionId);
      setError(null);
      setIsRollingBack(versionId);
      // TODO: dispatch(rollbackToVersion({ entryId: contentEntryId, versionId }));
      // Mock rollback
      setTimeout(() => {
          console.log('Rollback complete (mock)');
          setIsRollingBack(null);
          // Optionally refresh history or main content form
      }, 1500);
    }
  };

  const handleCloseDiff = () => {
    setIsDiffVisible(false);
    setVersionToViewA(null);
    setVersionToViewB(null);
  };

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Version History
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
      ) : history.length === 0 ? (
        <Typography variant="body2" color="textSecondary">No version history available.</Typography>
      ) : (
        <List dense disablePadding>
          {history.slice().reverse().map((version, index) => ( // Show newest first
            <ListItem
              key={version.id}
              divider={index < history.length - 1}
              sx={version.versionNumber === currentVersionNumber ? { bgcolor: 'action.hover' } : {}}
            >
              <ListItemText
                primary={`Version ${version.versionNumber}${version.versionNumber === currentVersionNumber ? ' (Current)' : ''}`}
                secondary={`Saved on ${new Date(version.createdAt).toLocaleString()} by User ${version.userId || '?'}`}
              />
              <ListItemSecondaryAction>
                <Tooltip title="View This Version">
                  <IconButton edge="end" size="small" onClick={() => handleViewVersion(version.id)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {/* TODO: Add Compare button logic - needs selection mechanism */}
                {/* <Tooltip title="Compare With Previous">
                  <IconButton edge="end" size="small" disabled={index === history.length - 1} onClick={() => handleCompareVersions(version.id, history[index + 1]?.id)}>
                    <CompareArrowsIcon fontSize="small" />
                  </IconButton>
                </Tooltip> */}
                <Tooltip title="Rollback to This Version">
                  <span> {/* Span needed for tooltip on disabled button */}
                    <IconButton
                      edge="end"
                      size="small"
                      color="warning"
                      onClick={() => handleRollback(version.id, version.versionNumber)}
                      disabled={isRollingBack === version.id || version.versionNumber === currentVersionNumber}
                      sx={{ ml: 1 }}
                    >
                      {isRollingBack === version.id ? <CircularProgress size={16} color="inherit" /> : <RestoreIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

       {/* Diff Viewer Dialog */}
       <Dialog open={isDiffVisible} onClose={handleCloseDiff} maxWidth="lg" fullWidth scroll="paper">
         <DialogTitle>
           {versionToViewB
             ? `Comparing Version ${versionToViewA?.versionNumber} and ${versionToViewB?.versionNumber}`
             : `Viewing Version ${versionToViewA?.versionNumber}`
           }
         </DialogTitle>
         <DialogContent dividers>
           {versionToViewA && versionToViewB ? (
             <VersionDiffViewer versionA={versionToViewA} versionB={versionToViewB} />
           ) : versionToViewA ? (
             // Simple view for single version
             <Box>
                <Typography variant="h6" gutterBottom>{versionToViewA.title}</Typography>
                <Paper variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto' }}>
                    {versionToViewA.body}
                </Paper>
             </Box>
           ) : null}
         </DialogContent>
         <DialogActions>
           <Button onClick={handleCloseDiff}>Close</Button>
         </DialogActions>
       </Dialog>

    </Paper>
  );
};

export default VersionHistoryPanel;