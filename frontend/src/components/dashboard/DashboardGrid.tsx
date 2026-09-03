import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import { Box, Button, Paper, Typography, IconButton, Tooltip, CircularProgress } from '@mui/material';
import {
  DragIndicator as DragHandleIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Create a responsive grid layout
const ResponsiveGridLayout = WidthProvider(Responsive);

// Define widget interface
export interface Widget {
  id: string;
  title: string;
  type: string;
  data?: any;
  settings?: any;
  layout?: Layout;
}

// Define dashboard grid props
interface DashboardGridProps {
  widgets: Widget[];
  layouts?: Layouts;
  onLayoutChange?: (layouts: Layouts) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetSettings?: (widgetId: string) => void;
  onWidgetFullscreen?: (widgetId: string) => void;
  onWidgetAdd?: () => void;
  onSave?: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  isEditable?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  isLoading?: boolean;
  renderWidgetContent: (widget: Widget) => React.ReactNode;
}

/**
 * DashboardGrid component
 * 
 * This component provides a responsive grid layout for dashboard widgets
 * with drag-and-drop, resize, and other interactive features.
 */
const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  layouts = {},
  onLayoutChange,
  onWidgetRemove,
  onWidgetSettings,
  onWidgetFullscreen,
  onWidgetAdd,
  onSave,
  onRefresh,
  isEditable = true,
  isDraggable = true,
  isResizable = true,
  isLoading = false,
  renderWidgetContent
}) => {
  // Default layouts for different breakpoints
  const defaultLayouts = {
    lg: widgets.map((widget, index) => ({
      i: widget.id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 4,
      w: 4,
      h: 4,
      minW: 2,
      minH: 2,
      ...widget.layout
    })),
    md: widgets.map((widget, index) => ({
      i: widget.id,
      x: (index % 2) * 6,
      y: Math.floor(index / 2) * 4,
      w: 6,
      h: 4,
      minW: 2,
      minH: 2,
      ...widget.layout
    })),
    sm: widgets.map((widget, index) => ({
      i: widget.id,
      x: 0,
      y: index * 4,
      w: 12,
      h: 4,
      minW: 2,
      minH: 2,
      ...widget.layout
    }))
  };
  
  // Merge provided layouts with default layouts
  const mergedLayouts = {
    lg: [...(layouts.lg || []), ...defaultLayouts.lg.filter(item => !(layouts.lg || []).some(l => l.i === item.i))],
    md: [...(layouts.md || []), ...defaultLayouts.md.filter(item => !(layouts.md || []).some(l => l.i === item.i))],
    sm: [...(layouts.sm || []), ...defaultLayouts.sm.filter(item => !(layouts.sm || []).some(l => l.i === item.i))]
  };
  
  // State for current layouts
  const [currentLayouts, setCurrentLayouts] = useState<Layouts>(mergedLayouts);
  const [saving, setSaving] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Update layouts when widgets or provided layouts change
  useEffect(() => {
    setCurrentLayouts(mergedLayouts);
  }, [widgets, layouts]);
  
  // Handle layout change
  const handleLayoutChange = useCallback((currentLayout: Layout[], allLayouts: Layouts) => {
    setCurrentLayouts(allLayouts);
    if (onLayoutChange) {
      onLayoutChange(allLayouts);
    }
  }, [onLayoutChange]);
  
  // Handle save
  const handleSave = async () => {
    if (!onSave) return;
    
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Toolbar */}
      {isEditable && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          mb: 2,
          gap: 1
        }}>
          {onWidgetAdd && (
            <Tooltip title="Add Widget">
              <IconButton onClick={onWidgetAdd} color="primary">
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onRefresh && (
            <Tooltip title="Refresh Dashboard">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                color="default"
              >
                {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          {onSave && (
            <Tooltip title="Save Layout">
              <IconButton 
                onClick={handleSave} 
                disabled={saving}
                color="primary"
              >
                {saving ? <CircularProgress size={24} /> : <SaveIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10
        }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Grid layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={currentLayouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        isDraggable={isDraggable}
        isResizable={isResizable}
        draggableHandle=".drag-handle"
      >
        {widgets.map(widget => (
          <Box key={widget.id} data-grid={widget.layout}>
            <Paper 
              elevation={2} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Widget header */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  overflow: 'hidden'
                }}>
                  {isDraggable && (
                    <Box 
                      className="drag-handle" 
                      sx={{ 
                        cursor: 'move',
                        display: 'flex',
                        mr: 1
                      }}
                    >
                      <DragHandleIcon fontSize="small" color="action" />
                    </Box>
                  )}
                  <Typography 
                    variant="subtitle2" 
                    noWrap 
                    title={widget.title}
                  >
                    {widget.title}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex' }}>
                  {onWidgetFullscreen && (
                    <Tooltip title="Fullscreen">
                      <IconButton 
                        size="small" 
                        onClick={() => onWidgetFullscreen(widget.id)}
                      >
                        <FullscreenIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {onWidgetSettings && (
                    <Tooltip title="Settings">
                      <IconButton 
                        size="small" 
                        onClick={() => onWidgetSettings(widget.id)}
                      >
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {onWidgetRemove && isEditable && (
                    <Tooltip title="Remove">
                      <IconButton 
                        size="small" 
                        onClick={() => onWidgetRemove(widget.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
              
              {/* Widget content */}
              <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                p: 1
              }}>
                {renderWidgetContent(widget)}
              </Box>
            </Paper>
          </Box>
        ))}
      </ResponsiveGridLayout>
      
      {/* Empty state */}
      {widgets.length === 0 && !isLoading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height: 300,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          p: 3
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No widgets added yet
          </Typography>
          
          {onWidgetAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onWidgetAdd}
              sx={{ mt: 2 }}
            >
              Add Widget
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DashboardGrid;
