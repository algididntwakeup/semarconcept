import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FieldForm from './FieldForm';
import { ContentTypeField, ContentTypeFieldFormData } from '../../../types/contentType'; // Import shared types

interface FieldManagerProps {
  contentTypeId: string; // Keep if needed for context, e.g., API calls
  fields: ContentTypeField[];
  setFields: React.Dispatch<React.SetStateAction<ContentTypeField[]>>;
  // Or:
  // onAddField: (fieldData: ContentTypeFieldFormData) => void;
  // onUpdateField: (fieldId: string, fieldData: ContentTypeFieldFormData) => void;
  // onDeleteField: (fieldId: string) => void;
}

const FieldManager: React.FC<FieldManagerProps> = ({ fields, setFields }) => {
  const [isFieldFormOpen, setIsFieldFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<ContentTypeField | null>(null);

  const handleAddFieldClick = () => {
    setEditingField(null);
    setIsFieldFormOpen(true);
  };

  const handleEditFieldClick = (field: ContentTypeField) => {
    setEditingField(field);
    setIsFieldFormOpen(true);
  };

  const handleDeleteField = (fieldId: string) => {
    // console.log(`Deleting field ${fieldId} for content type ${contentTypeId}`); // contentTypeId removed from props for now
    console.log(`Deleting field ${fieldId}`);
    // TODO: Add API call / Redux dispatch if managing fields server-side individually
    setFields((prevFields) => prevFields.filter((f) => f.id !== fieldId));
  };

  const handleFieldFormClose = () => {
    setIsFieldFormOpen(false);
    setEditingField(null);
  };

  // FieldForm will now submit ContentTypeFieldFormData
  const handleFieldFormSubmit = (fieldData: ContentTypeFieldFormData) => {
    console.log('Submitting field data:', fieldData);
    if (editingField) {
      // Update existing field
      setFields((prevFields) =>
        prevFields.map((f) => (f.id === editingField.id ? { ...editingField, ...fieldData } : f))
      );
    } else {
      // Add new field
      const newField: ContentTypeField = {
        ...fieldData,
        id: `temp-field-${Date.now()}`, // Temporary ID, backend should assign real one
      };
      setFields((prevFields) => [...prevFields, newField]);
    }
    handleFieldFormClose();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">Fields</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddFieldClick}
        >
          Add Field
        </Button>
      </Box>

      {/* Placeholder for FieldForm Modal/Dialog */}
      {isFieldFormOpen && (
        <Paper sx={{ p: 2, my: 2, border: '1px dashed grey' }}>
          <Typography variant="h6" gutterBottom>
            {editingField ? 'Edit Field' : 'Add New Field'}
          </Typography>
          <FieldForm
            initialData={editingField}
            onSubmit={handleFieldFormSubmit}
            onCancel={handleFieldFormClose}
          />
          {/* Removed placeholder text and button */}
        </Paper>
      )}

      <List component={Paper} variant="outlined" disablePadding>
        {fields.length === 0 ? (
          <ListItem>
            <ListItemText primary="No fields defined yet." />
          </ListItem>
        ) : (
          fields.map((field, index) => (
            <React.Fragment key={field.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEditFieldClick(field)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteField(field.id)}
                      size="small"
                      sx={{ ml: 1 }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={field.name}
                  secondary={`API Key: ${field.apiKey} | Type: ${field.type} ${field.isRequired ? '| Required' : ''} ${field.isList ? '| List' : ''}`}
                />
              </ListItem>
              {index < fields.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

export default FieldManager;
