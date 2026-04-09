import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Grid,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Keyboard as KeyboardIcon,
  VolumeUp as AnnouncementIcon,
  Visibility as VisibilityIcon,
  TouchApp as FocusIcon,
  Code as CodeIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import AccessibleDialog from '../common/AccessibleDialog';
import AccessibleForm from '../common/AccessibleForm';
import { useAnnouncer, useKeyboardNavigation, useFocusTrap, useAria } from '../../hooks/useAccessibility';
import accessibilityService from '../../services/accessibility.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  id: string;
  tabId: string;
}

/**
 * TabPanel component
 */
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, id, tabId }) => {
  const { createTabPanelProps } = useAria();
  const tabPanelProps = createTabPanelProps(id, tabId);
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={id}
      aria-labelledby={tabId}
      {...tabPanelProps}
      style={{ padding: '16px 0' }}
    >
      {value === index && children}
    </div>
  );
};

/**
 * AccessibilityDemo component
 * 
 * This component demonstrates various accessibility features:
 * - Keyboard navigation
 * - Focus management
 * - Screen reader announcements
 * - ARIA attributes
 * - Accessible dialog
 * - Accessible form
 */
const AccessibilityDemo: React.FC = () => {
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // State for high contrast mode
  const [highContrast, setHighContrast] = useState(false);
  
  // Use announcer hook
  const { announce, announcePolite } = useAnnouncer();
  
  // Use keyboard navigation hook for the feature list
  const { containerRef: listRef } = useKeyboardNavigation('li[role="listitem"]', {
    orientation: 'vertical',
    loop: true,
    onSelect: (element) => {
      // Announce the selected item
      const text = element.textContent;
      if (text) {
        announcePolite(`Selected: ${text}`);
      }
    }
  });
  
  // Use aria hook
  const { createTabProps } = useAria();
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Announce tab change
    const tabLabel = document.getElementById(`accessibility-tab-${newValue}`)?.textContent;
    if (tabLabel) {
      announcePolite(`Switched to ${tabLabel} tab`);
    }
  };
  
  // Handle dialog open
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    announcePolite('Dialog closed');
  };
  
  // Handle announcement
  const handleAnnounce = (type: 'polite' | 'assertive') => {
    const message = `This is a ${type} announcement that screen readers will read aloud.`;
    
    if (type === 'polite') {
      announcePolite(message);
    } else {
      announce(message);
    }
  };
  
  // Handle high contrast toggle
  const handleHighContrastToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHighContrast(event.target.checked);
    
    // Apply high contrast styles
    if (event.target.checked) {
      document.body.classList.add('high-contrast');
      announcePolite('High contrast mode enabled');
    } else {
      document.body.classList.remove('high-contrast');
      announcePolite('High contrast mode disabled');
    }
  };
  
  // Sample form fields
  const formFields = [
    {
      id: 'name',
      label: 'Name',
      type: 'text' as const,
      required: true,
      autoComplete: 'name'
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true,
      autoComplete: 'email',
      helperText: 'We\'ll never share your email with anyone else.'
    },
    {
      id: 'message',
      label: 'Message',
      type: 'textarea' as const,
      required: true,
      multiline: true,
      rows: 4
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ]
    },
    {
      id: 'subscribe',
      label: 'Subscribe to newsletter',
      type: 'checkbox' as const,
      value: false
    }
  ];
  
  // Handle form submission
  const handleFormSubmit = (values: Record<string, string | boolean | string[]>) => {
    console.log('Form submitted:', values);
    announcePolite('Form submitted successfully');
    
    // Show an alert after a short delay
    setTimeout(() => {
      alert('Form submitted successfully!\n\n' + JSON.stringify(values, null, 2));
    }, 500);
  };
  
  return (
    <Box
      sx={{
        padding: 3,
        ...(highContrast && {
          backgroundColor: '#000',
          color: '#fff',
          '& .MuiPaper-root': {
            backgroundColor: '#222',
            color: '#fff',
            border: '1px solid #fff'
          },
          '& .MuiButton-contained': {
            backgroundColor: '#fff',
            color: '#000'
          },
          '& .MuiButton-outlined': {
            borderColor: '#fff',
            color: '#fff'
          },
          '& .MuiDivider-root': {
            backgroundColor: '#fff'
          }
        })
      }}
    >
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom id="accessibility-demo-title">
          <AccessibilityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Accessibility Features Demo
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={highContrast}
              onChange={handleHighContrastToggle}
              color="primary"
              inputProps={{ 'aria-label': 'Toggle high contrast mode' }}
            />
          }
          label="High Contrast Mode"
        />
      </Box>
      
      <Typography variant="body1" paragraph>
        This demo showcases various accessibility features implemented in the application.
        Navigate through the tabs to explore different accessibility enhancements.
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Accessibility features tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Keyboard Navigation"
            icon={<KeyboardIcon />}
            id="accessibility-tab-0"
            aria-controls="accessibility-tabpanel-0"
            {...createTabProps('accessibility-tab-0', 'accessibility-tabpanel-0', tabValue === 0)}
          />
          <Tab
            label="Screen Reader"
            icon={<AnnouncementIcon />}
            id="accessibility-tab-1"
            aria-controls="accessibility-tabpanel-1"
            {...createTabProps('accessibility-tab-1', 'accessibility-tabpanel-1', tabValue === 1)}
          />
          <Tab
            label="Focus Management"
            icon={<FocusIcon />}
            id="accessibility-tab-2"
            aria-controls="accessibility-tabpanel-2"
            {...createTabProps('accessibility-tab-2', 'accessibility-tabpanel-2', tabValue === 2)}
          />
          <Tab
            label="Visual Adjustments"
            icon={<VisibilityIcon />}
            id="accessibility-tab-3"
            aria-controls="accessibility-tabpanel-3"
            {...createTabProps('accessibility-tab-3', 'accessibility-tabpanel-3', tabValue === 3)}
          />
          <Tab
            label="Accessible Components"
            icon={<CodeIcon />}
            id="accessibility-tab-4"
            aria-controls="accessibility-tabpanel-4"
            {...createTabProps('accessibility-tab-4', 'accessibility-tabpanel-4', tabValue === 4)}
          />
        </Tabs>
        
        <TabPanel value={tabValue} index={0} id="accessibility-tabpanel-0" tabId="accessibility-tab-0">
          <Typography variant="h6" gutterBottom>
            Keyboard Navigation
          </Typography>
          
          <Typography variant="body1" paragraph>
            This list demonstrates keyboard navigation. Use arrow keys to navigate and Enter to select an item.
            The list is also accessible to screen readers.
          </Typography>
          
          <List ref={listRef as React.RefObject<HTMLUListElement>}>
            {[
              { icon: <KeyboardIcon />, primary: 'Arrow Key Navigation', secondary: 'Use arrow keys to move between items' },
              { icon: <AccessibilityIcon />, primary: 'Screen Reader Support', secondary: 'Each item is properly labeled for screen readers' },
              { icon: <FocusIcon />, primary: 'Focus Indicators', secondary: 'Visual indicators show which item has focus' },
              { icon: <InfoIcon />, primary: 'ARIA Attributes', secondary: 'Proper ARIA roles and attributes are used' }
            ].map((item, index) => (
              <ListItem
                key={index}
                role="listitem"
                button
                tabIndex={0}
                sx={{
                  '&:focus': {
                    outline: '2px solid #1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.primary} secondary={item.secondary} />
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1} id="accessibility-tabpanel-1" tabId="accessibility-tab-1">
          <Typography variant="h6" gutterBottom>
            Screen Reader Announcements
          </Typography>
          
          <Typography variant="body1" paragraph>
            These buttons demonstrate how to make announcements to screen readers.
            Polite announcements wait until the screen reader is idle, while assertive announcements interrupt.
          </Typography>
          
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              startIcon={<AnnouncementIcon />}
              onClick={() => handleAnnounce('polite')}
            >
              Polite Announcement
            </Button>
            
            <Button
              variant="contained"
              color="warning"
              startIcon={<AnnouncementIcon />}
              onClick={() => handleAnnounce('assertive')}
            >
              Assertive Announcement
            </Button>
          </Box>
          
          <Typography variant="body2" color="textSecondary">
            Note: You need a screen reader active to hear these announcements.
            Try using VoiceOver on macOS, NVDA or JAWS on Windows, or TalkBack on Android.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2} id="accessibility-tabpanel-2" tabId="accessibility-tab-2">
          <Typography variant="h6" gutterBottom>
            Focus Management
          </Typography>
          
          <Typography variant="body1" paragraph>
            This demo shows proper focus management. When you open the dialog,
            focus is trapped inside it until you close it, then focus returns to the button.
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleOpenDialog}
            aria-haspopup="dialog"
          >
            Open Accessible Dialog
          </Button>
          
          <AccessibleDialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            title="Accessible Dialog"
            showCloseButton
            announceOnOpen
          >
            <Typography paragraph>
              This dialog demonstrates proper focus management. Focus is trapped inside the dialog
              while it's open, and you can't tab out of it. When you close the dialog, focus returns
              to the button that opened it.
            </Typography>
            
            <Typography paragraph>
              The dialog is also properly labeled for screen readers with ARIA attributes.
              It announces itself when opened and can be closed with the Escape key.
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={2}>
              <Button variant="outlined">Tab to me</Button>
              <Button variant="outlined">And then to me</Button>
            </Box>
          </AccessibleDialog>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3} id="accessibility-tabpanel-3" tabId="accessibility-tab-3">
          <Typography variant="h6" gutterBottom>
            Visual Adjustments
          </Typography>
          
          <Typography variant="body1" paragraph>
            This demo shows visual adjustments for better accessibility, such as high contrast mode,
            which you can toggle in the top-right corner of this page.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Color Contrast
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    All text meets WCAG 2.1 AA standards for color contrast.
                    This ensures that text is readable for users with low vision.
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box bgcolor="#1976d2" color="#fff" p={1} borderRadius={1}>
                      Primary color with white text (Passes AA)
                    </Box>
                    <Box bgcolor="#f5f5f5" color="#212121" p={1} borderRadius={1}>
                      Light background with dark text (Passes AAA)
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Focus Indicators
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    All interactive elements have visible focus indicators.
                    This helps keyboard users know which element is currently focused.
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Button variant="contained">
                      Tab to me to see focus ring
                    </Button>
                    <Button variant="outlined">
                      And then to me
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={4} id="accessibility-tabpanel-4" tabId="accessibility-tab-4">
          <Typography variant="h6" gutterBottom>
            Accessible Components
          </Typography>
          
          <Typography variant="body1" paragraph>
            This demo shows accessible components that follow best practices for accessibility.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Accessible Form
          </Typography>
          
          <AccessibleForm
            title="Contact Form"
            description="This form demonstrates accessible form controls with proper labels, error messages, and keyboard navigation."
            fields={formFields}
            onSubmit={handleFormSubmit}
            submitText="Submit Form"
          />
        </TabPanel>
      </Paper>
      
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Accessibility Resources
        </Typography>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <KeyboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Keyboard Shortcuts
                </Typography>
                <Typography variant="body2">
                  Common keyboard shortcuts for accessibility:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Tab" secondary="Move to next focusable element" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Shift+Tab" secondary="Move to previous focusable element" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Enter/Space" secondary="Activate buttons and links" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Escape" secondary="Close dialogs and menus" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AnnouncementIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Screen Readers
                </Typography>
                <Typography variant="body2">
                  Popular screen readers:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="NVDA" secondary="Free screen reader for Windows" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="JAWS" secondary="Commercial screen reader for Windows" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="VoiceOver" secondary="Built-in screen reader for macOS and iOS" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="TalkBack" secondary="Built-in screen reader for Android" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  WCAG Guidelines
                </Typography>
                <Typography variant="body2">
                  Web Content Accessibility Guidelines:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Perceivable" secondary="Information must be presentable to users" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Operable" secondary="Interface must be navigable" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Understandable" secondary="Information must be understandable" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Robust" secondary="Content must be compatible with tools" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AccessibilityDemo;