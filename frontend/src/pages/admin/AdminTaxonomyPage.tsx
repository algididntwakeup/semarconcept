import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { taxonomyService, TaxonomyCategory, TaxonomyAttribute } from '../../services/taxonomy.service';

const AdminTaxonomyPage: React.FC = () => {
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TaxonomyCategory | null>(null);
  const [attributes, setAttributes] = useState<TaxonomyAttribute[]>([]);
  
  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [attributeModalOpen, setAttributeModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<TaxonomyCategory> | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<Partial<TaxonomyAttribute> | null>(null);

  useEffect(() => {
    fetchCategoryTree();
  }, []);

  const fetchCategoryTree = async () => {
    try {
      const res = await taxonomyService.getCategoriesTree();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch taxonomy tree', error);
    }
  };

  const fetchAttributes = async (categoryId: number) => {
    try {
      const res = await taxonomyService.getInheritedAttributes(categoryId);
      setAttributes(res.data || []);
    } catch (error) {
      console.error('Failed to fetch attributes', error);
    }
  };

  const handleSelectCategory = (event: React.SyntheticEvent, nodeId: string) => {
    const findCategory = (nodes: TaxonomyCategory[], id: number): TaxonomyCategory | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findCategory(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const cat = findCategory(categories, parseInt(nodeId));
    if (cat) {
      setSelectedCategory(cat);
      fetchAttributes(cat.id);
    } else {
      setSelectedCategory(null);
      setAttributes([]);
    }
  };

  // Convert categories to TreeView format
  const getTreeItems = (nodes: TaxonomyCategory[]): any[] => {
    return nodes.map((node) => ({
      id: node.id.toString(),
      label: node.name,
      children: node.children ? getTreeItems(node.children) : undefined,
    }));
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory?.id) {
        await taxonomyService.updateCategory(editingCategory.id, editingCategory);
      } else {
        await taxonomyService.createCategory(editingCategory as any);
      }
      setCategoryModalOpen(false);
      fetchCategoryTree();
    } catch (error) {
      console.error('Failed to save category', error);
    }
  };

  const handleSaveAttribute = async () => {
    try {
      const payload = { ...editingAttribute, category_id: selectedCategory?.id };
      if (editingAttribute?.id) {
        await taxonomyService.updateAttribute(editingAttribute.id, payload);
      } else {
        await taxonomyService.createAttribute(payload);
      }
      setAttributeModalOpen(false);
      if (selectedCategory) fetchAttributes(selectedCategory.id);
    } catch (error) {
      console.error('Failed to save attribute', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await taxonomyService.deleteCategory(id);
        if (selectedCategory?.id === id) {
          setSelectedCategory(null);
          setAttributes([]);
        }
        fetchCategoryTree();
      } catch (error) {
        console.error('Failed to delete category', error);
      }
    }
  };

  const handleDeleteAttribute = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this attribute?")) {
      try {
        await taxonomyService.deleteAttribute(id);
        if (selectedCategory) fetchAttributes(selectedCategory.id);
      } catch (error) {
        console.error('Failed to delete attribute', error);
      }
    }
  };

  return (
    <Container maxWidth="xl" className="py-6">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" className="font-bold text-slate-800">
          Taxonomy Configuration (ISO 14224)
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => {
            setEditingCategory({ level: 1, is_active: true });
            setCategoryModalOpen(true);
          }}
        >
          Add Root Category
        </Button>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Panel: Taxonomy Tree */}
        <div className="md:col-span-4">
          <Paper sx={{ p: 2, height: '100%', minHeight: 500 }} className="rounded-2xl shadow-sm border border-slate-100">
            <Typography variant="h6" gutterBottom className="font-bold">Category Tree</Typography>
            <Divider sx={{ mb: 2 }} />
            {categories.length > 0 ? (
              <RichTreeView 
                items={getTreeItems(categories)} 
                onItemSelectionToggle={handleSelectCategory}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">No categories found.</Typography>
            )}
          </Paper>
        </div>

        {/* Right Panel: Category Details & Attributes */}
        <div className="md:col-span-8">
          <Paper sx={{ p: 2, minHeight: 500 }} className="rounded-2xl shadow-sm border border-slate-100">
            {!selectedCategory ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="textSecondary">Select a category from the tree to view details</Typography>
              </Box>
            ) : (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" className="font-bold text-slate-800">{selectedCategory.name}</Typography>
                  <Box>
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />} 
                      onClick={() => {
                        setEditingCategory({ parent_id: selectedCategory.id, level: selectedCategory.level + 1, is_active: true });
                        setCategoryModalOpen(true);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Add Sub-category
                    </Button>
                    <Button 
                      size="small" 
                      color="secondary"
                      startIcon={<EditIcon />} 
                      onClick={() => {
                        setEditingCategory(selectedCategory);
                        setCategoryModalOpen(true);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      startIcon={<DeleteIcon />} 
                      onClick={() => handleDeleteCategory(selectedCategory.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Typography variant="body2" color="textSecondary">Code</Typography>
                    <Typography variant="body1">{selectedCategory.code || '-'}</Typography>
                  </div>
                  <div>
                    <Typography variant="body2" color="textSecondary">Level</Typography>
                    <Typography variant="body1">{selectedCategory.level}</Typography>
                  </div>
                  <div className="col-span-2">
                    <Typography variant="body2" color="textSecondary">Description</Typography>
                    <Typography variant="body1">{selectedCategory.description || '-'}</Typography>
                  </div>
                </div>

                <Divider sx={{ my: 3 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" className="font-bold text-slate-800">Minimum Equipment Data (Attributes)</Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingAttribute({ category_id: selectedCategory.id, data_type: 'string', is_required: false, is_active: true, display_order: 0 });
                      setAttributeModalOpen(true);
                    }}
                  >
                    Add Attribute
                  </Button>
                </Box>

                {attributes.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No attributes defined for this category.</Typography>
                ) : (
                  <List>
                    {attributes.map((attr) => (
                      <Paper variant="outlined" sx={{ mb: 1 }} key={attr.id} className="rounded-xl">
                        <ListItem
                          secondaryAction={
                            attr.category_id === selectedCategory.id ? (
                              <Box>
                                <IconButton edge="end" aria-label="edit" onClick={() => {
                                  setEditingAttribute(attr);
                                  setAttributeModalOpen(true);
                                }}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDeleteAttribute(attr.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="textSecondary">Inherited</Typography>
                            )
                          }
                        >
                          <ListItemText
                            primary={`${attr.attribute_name} (${attr.attribute_key})`}
                            secondary={`Type: ${attr.data_type} | Required: ${attr.is_required ? 'Yes' : 'No'} | Unit: ${attr.unit_of_measure || '-'}`}
                          />
                        </ListItem>
                      </Paper>
                    ))}
                  </List>
                )}
              </>
            )}
          </Paper>
        </div>
      </div>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory?.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={editingCategory?.name || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              required
            />
            <TextField
              label="Code"
              fullWidth
              value={editingCategory?.code || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, code: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={editingCategory?.description || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editingCategory?.is_active ?? true}
                  onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained" disabled={!editingCategory?.name}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Attribute Modal */}
      <Dialog open={attributeModalOpen} onClose={() => setAttributeModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAttribute?.id ? 'Edit Attribute' : 'Add Attribute'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Attribute Name (Display)"
              fullWidth
              value={editingAttribute?.attribute_name || ''}
              onChange={(e) => setEditingAttribute({ ...editingAttribute, attribute_name: e.target.value, attribute_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              required
            />
            <TextField
              label="Attribute Key (JSON Key)"
              fullWidth
              value={editingAttribute?.attribute_key || ''}
              onChange={(e) => setEditingAttribute({ ...editingAttribute, attribute_key: e.target.value })}
              required
            />
            <TextField
              select
              label="Data Type"
              fullWidth
              value={editingAttribute?.data_type || 'string'}
              onChange={(e) => setEditingAttribute({ ...editingAttribute, data_type: e.target.value })}
            >
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="select">Select</MenuItem>
            </TextField>
            <TextField
              label="Unit of Measure"
              fullWidth
              value={editingAttribute?.unit_of_measure || ''}
              onChange={(e) => setEditingAttribute({ ...editingAttribute, unit_of_measure: e.target.value })}
              placeholder="e.g. kW, m3/h, Bar"
            />
            <TextField
              label="Default Value"
              fullWidth
              value={editingAttribute?.default_value || ''}
              onChange={(e) => setEditingAttribute({ ...editingAttribute, default_value: e.target.value })}
            />
            <TextField
              label="Display Order"
              type="number"
              fullWidth
              value={editingAttribute?.display_order || 0}
              onChange={(e) => setEditingAttribute({ ...editingAttribute, display_order: parseInt(e.target.value) })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editingAttribute?.is_required || false}
                  onChange={(e) => setEditingAttribute({ ...editingAttribute, is_required: e.target.checked })}
                />
              }
              label="Required Field"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttributeModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveAttribute} variant="contained" disabled={!editingAttribute?.attribute_name || !editingAttribute?.attribute_key}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminTaxonomyPage;
