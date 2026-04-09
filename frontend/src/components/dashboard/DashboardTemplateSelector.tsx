import React, { useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

// Define dashboard template interface
interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  widgets: number;
  featured: boolean;
  popular: boolean;
}

interface DashboardTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string, dashboardName: string) => Promise<void>;
}

/**
 * DashboardTemplateSelector component
 * 
 * This component displays a dialog with a grid of dashboard templates
 * that users can select from when creating a new dashboard.
 */
const DashboardTemplateSelector: React.FC<DashboardTemplateSelectorProps> = ({
  open,
  onClose,
  onSelectTemplate
}) => {
  // Mock dashboard templates - in a real app, these would come from an API
  const [templates] = useState<DashboardTemplate[]>([
    {
      id: 'blank',
      name: 'Blank Dashboard',
      description: 'Start with a blank dashboard and add widgets as needed.',
      thumbnail: '/assets/images/dashboard-templates/blank.png',
      category: 'General',
      widgets: 0,
      featured: false,
      popular: true
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Pre-configured dashboard with analytics widgets for tracking key metrics.',
      thumbnail: '/assets/images/dashboard-templates/analytics.png',
      category: 'Analytics',
      widgets: 8,
      featured: true,
      popular: true
    },
    {
      id: 'sales',
      name: 'Sales Dashboard',
      description: 'Monitor sales performance with charts, KPIs, and tables.',
      thumbnail: '/assets/images/dashboard-templates/sales.png',
      category: 'Sales',
      widgets: 6,
      featured: true,
      popular: false
    },
    {
      id: 'marketing',
      name: 'Marketing Dashboard',
      description: 'Track marketing campaigns, leads, and conversions.',
      thumbnail: '/assets/images/dashboard-templates/marketing.png',
      category: 'Marketing',
      widgets: 7,
      featured: false,
      popular: true
    },
    {
      id: 'operations',
      name: 'Operations Dashboard',
      description: 'Monitor operational metrics and performance indicators.',
      thumbnail: '/assets/images/dashboard-templates/operations.png',
      category: 'Operations',
      widgets: 5,
      featured: false,
      popular: false
    },
    {
      id: 'executive',
      name: 'Executive Dashboard',
      description: 'High-level overview of key business metrics for executives.',
      thumbnail: '/assets/images/dashboard-templates/executive.png',
      category: 'Executive',
      widgets: 4,
      featured: true,
      popular: true
    }
  ]);
  
  // State for selected template
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null);
  const [dashboardName, setDashboardName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);
  
  // Get unique categories
  const categories = Array.from(new Set(templates.map(template => template.category)));
  
  // Filter templates
  const filteredTemplates = templates.filter(template => {
    if (selectedCategory && template.category !== selectedCategory) {
      return false;
    }
    if (showFeaturedOnly && !template.featured) {
      return false;
    }
    return true;
  });
  
  // Handle template selection
  const handleSelectTemplate = (template: DashboardTemplate) => {
    setSelectedTemplate(template);
    setDashboardName(template.name);
  };
  
  // Handle create dashboard
  const handleCreateDashboard = async () => {
    if (!selectedTemplate || !dashboardName.trim()) {
      setError('Please select a template and provide a dashboard name');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onSelectTemplate(selectedTemplate.id, dashboardName);
      onClose();
    } catch (err) {
      setError('Failed to create dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle category filter
  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
  };
  
  // Handle featured filter
  const handleFeaturedFilter = () => {
    setShowFeaturedOnly(!showFeaturedOnly);
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 1 }} />
            Select Dashboard Template
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Filters */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter Templates
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="All Categories"
              onClick={() => handleCategoryFilter(null)}
              color={selectedCategory === null ? 'primary' : 'default'}
              variant={selectedCategory === null ? 'filled' : 'outlined'}
            />
            
            {categories.map(category => (
              <Chip
                key={category}
                label={category}
                onClick={() => handleCategoryFilter(category)}
                color={selectedCategory === category ? 'primary' : 'default'}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
              />
            ))}
            
            <Chip
              icon={showFeaturedOnly ? <StarIcon /> : <StarBorderIcon />}
              label="Featured"
              onClick={handleFeaturedFilter}
              color={showFeaturedOnly ? 'primary' : 'default'}
              variant={showFeaturedOnly ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Templates Grid */}
        <Grid container spacing={3}>
          {filteredTemplates.map(template => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: selectedTemplate?.id === template.id ? 2 : 0,
                  borderColor: 'primary.main',
                  position: 'relative'
                }}
              >
                {template.featured && (
                  <Chip
                    icon={<StarIcon />}
                    label="Featured"
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1
                    }}
                  />
                )}
                
                {template.popular && (
                  <Chip
                    label="Popular"
                    size="small"
                    color="secondary"
                    sx={{
                      position: 'absolute',
                      top: template.featured ? 40 : 8,
                      right: 8,
                      zIndex: 1
                    }}
                  />
                )}
                
                <CardActionArea 
                  onClick={() => handleSelectTemplate(template)}
                  sx={{ height: '100%' }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={template.thumbnail}
                    alt={template.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Chip
                        label={template.category}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {template.widgets} widgets
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {filteredTemplates.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No templates match your filters
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedCategory(null);
                setShowFeaturedOnly(false);
              }}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
        
        {/* Template Details */}
        {selectedTemplate && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Dashboard Details
            </Typography>
            
            <TextField
              label="Dashboard Name"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              fullWidth
              required
              error={!dashboardName.trim()}
              helperText={!dashboardName.trim() ? 'Dashboard name is required' : ''}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="info" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                You are creating a new dashboard based on the "{selectedTemplate.name}" template.
                You can customize it after creation.
              </Typography>
            </Box>
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          endIcon={<CheckIcon />}
          disabled={!selectedTemplate || !dashboardName.trim() || loading}
          onClick={handleCreateDashboard}
        >
          Create Dashboard
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardTemplateSelector;