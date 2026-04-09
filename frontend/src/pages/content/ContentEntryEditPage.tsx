// platform/frontend-mui/src/pages/content/ContentEntryEditPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Autocomplete,
  Paper,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import PreviewIcon from '@mui/icons-material/Preview';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CategoryIcon from '@mui/icons-material/Category';
import LabelIcon from '@mui/icons-material/Label';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import CommentIcon from '@mui/icons-material/Comment';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ContentItem {
  id?: number;
  title: string;
  slug: string;
  content_type_id: number;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  content: string;
  excerpt: string;
  featured_image?: string;
  scheduled_at?: string;
  published_at?: string;
  categories: number[];
  tags: string[];
  meta_data: Record<string, any>;
  workflow_step?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

interface ContentType {
  id: number;
  name: string;
  slug: string;
  description: string;
  fields: ContentTypeField[];
}

interface ContentTypeField {
  id: number;
  name: string;
  field_type: string;
  is_required: boolean;
  default_value?: string;
  validation_rules?: Record<string, any>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface WorkflowStep {
  step: string;
  next: string[];
  actions: string[];
}

interface WorkflowInstance {
  id: number;
  current_step: string;
  status: string;
  workflow_data: Record<string, any>;
  started_at: string;
  completed_at?: string;
}

interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  created_at: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ContentEntryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  // Form state
  const [contentItem, setContentItem] = useState<ContentItem>({
    title: '',
    slug: '',
    content_type_id: 1,
    status: 'draft',
    content: '',
    excerpt: '',
    categories: [],
    tags: [],
    meta_data: {},
  });
  
  // Data state
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [workflowInstance, setWorkflowInstance] = useState<WorkflowInstance | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [revisionHistory, setRevisionHistory] = useState<any[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  
  // Form state
  const [scheduledDate, setScheduledDate] = useState('');
  const [workflowComment, setWorkflowComment] = useState('');
  const [selectedWorkflowAction, setSelectedWorkflowAction] = useState('');

  const isEditing = Boolean(id);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load content types
      setContentTypes([
        { id: 1, name: 'Article', slug: 'article', description: 'Standard article content', fields: [] },
        { id: 2, name: 'News', slug: 'news', description: 'News content', fields: [] },
        { id: 3, name: 'Page', slug: 'page', description: 'Static page content', fields: [] },
        { id: 4, name: 'Documentation', slug: 'documentation', description: 'Technical documentation', fields: [] },
      ]);

      // Load categories
      setCategories([
        { id: 1, name: 'General', slug: 'general' },
        { id: 2, name: 'Technical', slug: 'technical' },
        { id: 3, name: 'Safety', slug: 'safety' },
        { id: 4, name: 'Compliance', slug: 'compliance' },
        { id: 5, name: 'Maintenance', slug: 'maintenance' },
      ]);

      // Load available tags
      setAvailableTags([
        'important', 'urgent', 'technical', 'safety', 'compliance', 
        'maintenance', 'inspection', 'documentation', 'training', 'update'
      ]);

      // Load workflow steps for content publishing
      setWorkflowSteps([
        { step: 'draft', next: ['review'], actions: ['submit_for_review'] },
        { step: 'review', next: ['approved', 'rejected'], actions: ['approve', 'reject', 'request_changes'] },
        { step: 'approved', next: ['published'], actions: ['publish', 'schedule'] },
        { step: 'rejected', next: ['draft'], actions: ['revise'] },
        { step: 'published', next: [], actions: ['unpublish', 'archive'] },
      ]);

      // Load content item if editing
      if (isEditing) {
        // Simulate loading existing content
        const existingContent: ContentItem = {
          id: parseInt(id!),
          title: 'Sample Content Item',
          slug: 'sample-content-item',
          content_type_id: 1,
          status: 'draft',
          content: '<h2>Introduction</h2><p>This is a sample content item with rich text content...</p>',
          excerpt: 'This is a sample content item for demonstration purposes.',
          categories: [1, 3],
          tags: ['important', 'technical'],
          meta_data: {
            seo_title: 'Sample Content - SEO Title',
            seo_description: 'Sample content SEO description',
            custom_field_1: 'Custom value 1'
          },
          workflow_step: 'draft',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T14:30:00Z',
        };
        setContentItem(existingContent);

        // Load workflow instance
        setWorkflowInstance({
          id: 1,
          current_step: 'draft',
          status: 'active',
          workflow_data: {},
          started_at: '2024-01-15T10:00:00Z',
        });

        // Load revision history
        setRevisionHistory([
          { id: 1, version: 'v1.2', created_at: '2024-01-15T14:30:00Z', created_by: 'John Doe', comment: 'Updated content and formatting' },
          { id: 2, version: 'v1.1', created_at: '2024-01-15T12:00:00Z', created_by: 'Jane Smith', comment: 'Added new sections' },
          { id: 3, version: 'v1.0', created_at: '2024-01-15T10:00:00Z', created_by: 'John Doe', comment: 'Initial creation' },
        ]);
      }

      // Load media files
      setMediaFiles([
        { id: 1, filename: 'sample-image.jpg', original_name: 'Sample Image.jpg', mime_type: 'image/jpeg', size: 2048576, url: '/media/sample-image.jpg', created_at: '2024-01-15T10:00:00Z' },
        { id: 2, filename: 'document.pdf', original_name: 'Technical Document.pdf', mime_type: 'application/pdf', size: 1024768, url: '/media/document.pdf', created_at: '2024-01-14T15:30:00Z' },
      ]);

    } catch (error) {
      setError('Failed to load content data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContentItem, value: any) => {
    setContentItem(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title' && value) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setContentItem(prev => ({
        ...prev,
        slug
      }));
    }

    // Clear success message when editing
    if (success) setSuccess(null);
  };

  const handleSave = async (action?: string) => {
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!contentItem.title.trim()) {
        throw new Error('Title is required');
      }
      if (!contentItem.content.trim()) {
        throw new Error('Content is required');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const actionText = action ? ` and ${action.replace('_', ' ')}` : '';
      setSuccess(`Content saved successfully${actionText}!`);

      // Update workflow status if action was taken
      if (action && workflowInstance) {
        const currentStep = workflowSteps.find(step => step.step === workflowInstance.current_step);
        if (currentStep?.actions.includes(action)) {
          // Update workflow step based on action
          let newStep = workflowInstance.current_step;
          if (action === 'submit_for_review') newStep = 'review';
          else if (action === 'approve') newStep = 'approved';
          else if (action === 'reject') newStep = 'rejected';
          else if (action === 'publish') newStep = 'published';

          setWorkflowInstance(prev => prev ? { ...prev, current_step: newStep } : null);
          setContentItem(prev => ({ ...prev, workflow_step: newStep }));
        }
      }

      // If new content, redirect to edit mode
      if (!isEditing) {
        navigate(`/content/entry/edit/1`);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleWorkflowAction = async () => {
    if (!selectedWorkflowAction) return;

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await handleSave(selectedWorkflowAction);
      setWorkflowDialogOpen(false);
      setSelectedWorkflowAction('');
      setWorkflowComment('');

    } catch (error) {
      setError('Failed to execute workflow action');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedulePublish = async () => {
    if (!scheduledDate) return;

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setContentItem(prev => ({ ...prev, scheduled_at: scheduledDate }));
      setSuccess('Content scheduled for publication!');
      setScheduleDialogOpen(false);
      setScheduledDate('');

    } catch (error) {
      setError('Failed to schedule content');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentWorkflowStep = () => {
    return workflowSteps.find(step => step.step === (workflowInstance?.current_step || 'draft'));
  };

  const getWorkflowStepIndex = (step: string) => {
    const stepOrder = ['draft', 'review', 'approved', 'published'];
    return stepOrder.indexOf(step);
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading content...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Edit Content' : 'Create Content'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setPreviewOpen(true)}
              disabled={!contentItem.content}
            >
              Preview
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={() => setScheduleDialogOpen(true)}
              disabled={saving}
            >
              Schedule
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => handleSave()}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            {workflowInstance && (
              <Button
                variant="contained"
                startIcon={<WorkflowIcon />}
                onClick={() => setWorkflowDialogOpen(true)}
                disabled={saving}
              >
                Workflow
              </Button>
            )}
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Workflow Status */}
        {workflowInstance && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Status
            </Typography>
            <Stepper activeStep={getWorkflowStepIndex(workflowInstance.current_step)} alternativeLabel>
              {['draft', 'review', 'approved', 'published'].map((step) => (
                <Step key={step}>
                  <StepLabel>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Content" />
                <Tab label="Media" />
                <Tab label="SEO & Meta" />
                <Tab label="History" />
              </Tabs>
            </Box>

            {/* Content Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ space: 'y-3' }}>
                {/* Title */}
                <TextField
                  fullWidth
                  label="Title"
                  value={contentItem.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  sx={{ mb: 3 }}
                />

                {/* Slug */}
                <TextField
                  fullWidth
                  label="Slug"
                  value={contentItem.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  helperText="URL-friendly version of the title"
                  sx={{ mb: 3 }}
                />

                {/* Content Type */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    value={contentItem.content_type_id}
                    onChange={(e) => handleInputChange('content_type_id', e.target.value)}
                    label="Content Type"
                  >
                    {contentTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Excerpt */}
                <TextField
                  fullWidth
                  label="Excerpt"
                  value={contentItem.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  multiline
                  rows={3}
                  helperText="Short description or summary"
                  sx={{ mb: 3 }}
                />

                {/* Rich Text Content */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Content
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={contentItem.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Enter your content here..."
                    helperText="Rich text editor placeholder - In production, this would be a WYSIWYG editor"
                  />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<ImageIcon />}
                      onClick={() => setMediaDialogOpen(true)}
                    >
                      Add Image
                    </Button>
                    <Button
                      size="small"
                      startIcon={<VideoLibraryIcon />}
                      onClick={() => setMediaDialogOpen(true)}
                    >
                      Add Video
                    </Button>
                    <Button
                      size="small"
                      startIcon={<AttachFileIcon />}
                      onClick={() => setMediaDialogOpen(true)}
                    >
                      Attach File
                    </Button>
                  </Box>
                </Box>
              </Box>
            </TabPanel>

            {/* Media Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Media Files
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AttachFileIcon />}
                    onClick={() => setMediaDialogOpen(true)}
                  >
                    Add Media
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {mediaFiles.map((file) => (
                    <Grid item xs={12} sm={6} md={4} key={file.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {file.mime_type.startsWith('image/') ? (
                              <ImageIcon color="primary" />
                            ) : file.mime_type === 'application/pdf' ? (
                              <AttachFileIcon color="secondary" />
                            ) : (
                              <AttachFileIcon />
                            )}
                            <Box sx={{ ml: 1, flexGrow: 1 }}>
                              <Typography variant="subtitle2" noWrap>
                                {file.original_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" title="Download">
                              <DownloadIcon />
                            </IconButton>
                            <IconButton size="small" title="Edit">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" title="Delete" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </TabPanel>

            {/* SEO & Meta Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ space: 'y-3' }}>
                <Typography variant="h6" gutterBottom>
                  SEO Settings
                </Typography>
                
                <TextField
                  fullWidth
                  label="SEO Title"
                  value={contentItem.meta_data.seo_title || ''}
                  onChange={(e) => handleInputChange('meta_data', { 
                    ...contentItem.meta_data, 
                    seo_title: e.target.value 
                  })}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="SEO Description"
                  value={contentItem.meta_data.seo_description || ''}
                  onChange={(e) => handleInputChange('meta_data', { 
                    ...contentItem.meta_data, 
                    seo_description: e.target.value 
                  })}
                  multiline
                  rows={3}
                  sx={{ mb: 3 }}
                />

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Custom Meta Fields
                </Typography>

                <TextField
                  fullWidth
                  label="Custom Field 1"
                  value={contentItem.meta_data.custom_field_1 || ''}
                  onChange={(e) => handleInputChange('meta_data', { 
                    ...contentItem.meta_data, 
                    custom_field_1: e.target.value 
                  })}
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Custom Field 2"
                  value={contentItem.meta_data.custom_field_2 || ''}
                  onChange={(e) => handleInputChange('meta_data', { 
                    ...contentItem.meta_data, 
                    custom_field_2: e.target.value 
                  })}
                  sx={{ mb: 3 }}
                />
              </Box>
            </TabPanel>

            {/* History Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Revision History
                </Typography>
                
                {revisionHistory.length > 0 ? (
                  <List>
                    {revisionHistory.map((revision) => (
                      <ListItem key={revision.id} divider>
                        <ListItemText
                          primary={`${revision.version} - ${revision.created_by}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {new Date(revision.created_at).toLocaleString()}
                              </Typography>
                              <Typography variant="body2">
                                {revision.comment}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="View this version">
                            <IconButton edge="end">
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary">
                    No revision history available.
                  </Typography>
                )}
              </Box>
            </TabPanel>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ space: 'y-3' }}>
            {/* Publishing */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PublishIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Publishing
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={contentItem.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="review">Under Review</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>

                {contentItem.scheduled_at && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Scheduled for: {new Date(contentItem.scheduled_at).toLocaleString()}
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PublishIcon />}
                  onClick={() => handleSave('publish')}
                  disabled={saving || contentItem.status === 'published'}
                  sx={{ mb: 1 }}
                >
                  {contentItem.status === 'published' ? 'Published' : 'Publish Now'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={() => setScheduleDialogOpen(true)}
                  disabled={saving}
                >
                  Schedule Publication
                </Button>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Categories
                </Typography>
                
                <Autocomplete
                  multiple
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  value={categories.filter(cat => contentItem.categories.includes(cat.id))}
                  onChange={(event, newValue) => {
                    handleInputChange('categories', newValue.map(cat => cat.id));
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option.name}
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select categories"
                    />
                  )}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LabelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Tags
                </Typography>
                
                <Autocomplete
                  multiple
                  freeSolo
                  options={availableTags}
                  value={contentItem.tags}
                  onChange={(event, newValue) => {
                    handleInputChange('tags', newValue);
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={index}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Add tags"
                    />
                  )}
                />
              </CardContent>
            </Card>

            {/* Workflow Actions */}
            {workflowInstance && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <WorkflowIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Workflow Actions
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Current Step: <strong>{workflowInstance.current_step}</strong>
                  </Typography>

                  {getCurrentWorkflowStep()?.actions.map((action) => (
                    <Button
                      key={action}
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setSelectedWorkflowAction(action);
                        setWorkflowDialogOpen(true);
                      }}
                      disabled={saving}
                      sx={{ mb: 1 }}
                    >
                      {action.replace('_', ' ').toUpperCase()}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Publication</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="datetime-local"
            label="Scheduled Date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSchedulePublish} variant="contained" disabled={!scheduledDate || saving}>
            {saving ? 'Scheduling...' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Workflow Dialog */}
      <Dialog open={workflowDialogOpen} onClose={() => setWorkflowDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Workflow Action: {selectedWorkflowAction.replace('_', ' ').toUpperCase()}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Current Step: <strong>{workflowInstance?.current_step}</strong>
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments"
            value={workflowComment}
            onChange={(e) => setWorkflowComment(e.target.value)}
            placeholder="Add comments for this workflow action..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleWorkflowAction} variant="contained" disabled={saving}>
            {saving ? 'Processing...' : 'Execute Action'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Dialog */}
      <Dialog open={mediaDialogOpen} onClose={() => setMediaDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Media</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select files to upload or choose from existing media.
          </Typography>
          
          <Box sx={{ border: '2px dashed', borderColor: 'grey.300', borderRadius: 1, p: 3, textAlign: 'center', mb: 3 }}>
            <AttachFileIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Drag & drop files here or click to browse
            </Typography>
            <Button variant="outlined">Choose Files</Button>
          </Box>

          <Typography variant="h6" gutterBottom>
            Recent Media
          </Typography>
          
          <Grid container spacing={2}>
            {mediaFiles.slice(0, 6).map((file) => (
              <Grid item xs={4} key={file.id}>
                <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ textAlign: 'center' }}>
                      {file.mime_type.startsWith('image/') ? (
                        <ImageIcon color="primary" sx={{ fontSize: 32 }} />
                      ) : (
                        <AttachFileIcon sx={{ fontSize: 32 }} />
                      )}
                      <Typography variant="caption" display="block" noWrap>
                        {file.original_name}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMediaDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Insert Selected</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Content Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
              {contentItem.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {contentItem.excerpt}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box dangerouslySetInnerHTML={{ __html: contentItem.content }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentEntryEditPage;