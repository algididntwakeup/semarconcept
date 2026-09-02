import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { SimpleTreeView as TreeView } from '@mui/x-tree-view';
import { TreeItem } from '@mui/x-tree-view';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { MenuItemData } from './MenuItemForm';

interface MenuTreeEditorProps {
  items: MenuItemData[];
  onEdit: (item: MenuItemData) => void;
  onDelete: (itemId: string) => void;
  onAddChild: (parentId: string | null) => void;
  onReorder: (newOrder: MenuItemData[]) => void;
}

// Helper to get all item IDs for SortableContext
const getAllItemIds = (items: MenuItemData[]): string[] => {
  const ids: string[] = [];
  const recurse = (currentItems: MenuItemData[]) => {
    currentItems.forEach((item) => {
      ids.push(String(item.id));
      if (item.children && item.children.length > 0) {
        recurse(item.children);
      }
    });
  };
  recurse(items);
  return ids;
};

// Helper to find an item and its parent, and its original index
interface FoundItemInfo {
  item: MenuItemData;
  parent: MenuItemData[] | null; // null if root
  index: number;
}

const findItemAndParent = (
  itemId: string,
  currentItems: MenuItemData[],
  currentParent: MenuItemData[] | null = null
): FoundItemInfo | null => {
  for (let i = 0; i < currentItems.length; i++) {
    const item = currentItems[i];
    if (item.id === itemId) {
      return { item, parent: currentParent, index: i };
    }
    if (item.children) {
      const foundInChildren = findItemAndParent(itemId, item.children, currentItems); // Pass currentItems as parent for children
      if (foundInChildren) return foundInChildren;
    }
  }
  return null;
};

interface SortableTreeItemProps {
  menuItemData: MenuItemData;
  onEdit: (item: MenuItemData) => void;
  onDelete: (itemId: string) => void;
  onAddChild: (parentId: string | null) => void;
  renderChildren: (nodes: MenuItemData) => React.ReactNode;
  nodeId: string;
  key: string;
}

const SortableTreeItem: React.FC<SortableTreeItemProps> = ({
  menuItemData,
  onEdit,
  onDelete,
  onAddChild,
  renderChildren,
  ...treeItemProps
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: menuItemData.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: isDragging ? '2px dashed #ccc' : 'none',
    // marginBottom: '4px', // Optional: for visual spacing when dragging
  };

  return (
    <TreeItem
      {...treeItemProps} // Pass down other TreeItem props like nodeId, key
      ref={setNodeRef}
      style={style}
      itemId={String(menuItemData.id)}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }} {...attributes}>
          <DragIndicatorIcon
            {...listeners}
            sx={{ mr: 1, cursor: 'grab', touchAction: 'none' }} // touchAction: 'none' is important for mobile
            fontSize="small"
          />
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {menuItemData.title} ({menuItemData.path})
          </Typography>
          <Tooltip title="Add Child Item">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(String(menuItemData.id));
              }}
              sx={{ mr: 0.5 }}
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Item">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(menuItemData);
              }}
              sx={{ mr: 0.5 }}
            >
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Item">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(String(menuItemData.id));
              }}
              color="error"
            >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      {Array.isArray(menuItemData.children)
        ? menuItemData.children.map((node) => renderChildren(node))
        : null}
    </TreeItem>
  );
};

const MenuTreeEditor: React.FC<MenuTreeEditorProps> = ({
  items,
  onEdit,
  onDelete,
  onAddChild,
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Drag only after 5px movement
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allItemIds = React.useMemo(() => getAllItemIds(items), [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Create a deep clone to modify
      const newItems = JSON.parse(JSON.stringify(items)) as MenuItemData[];

      const activeItemInfo = findItemAndParent(activeId, newItems);
      const overItemInfo = findItemAndParent(overId, newItems);

      if (activeItemInfo && overItemInfo) {
        const activeParentArray =
          activeItemInfo.parent === null
            ? newItems
            : activeItemInfo.parent.find((p) => p.id === activeItemInfo.item.parentId)?.children;
        const overParentArray =
          overItemInfo.parent === null
            ? newItems
            : overItemInfo.parent.find((p) => p.id === overItemInfo.item.parentId)?.children;

        // For now, only allow reordering if items are siblings (share the same direct parent array)
        // This simplifies the logic significantly. True nested DND is much more complex.
        if (activeParentArray && overParentArray && activeParentArray === overParentArray) {
          const oldIndex = activeParentArray.findIndex((item) => item.id === activeId);
          const newIndex = activeParentArray.findIndex((item) => item.id === overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedSiblings = arrayMove(activeParentArray, oldIndex, newIndex);

            // Update the children array of the parent
            if (activeItemInfo.parent === null) {
              // Root items
              // This case needs careful handling if newItems itself is the array
              // For now, assume activeParentArray is newItems if parent is null
              // This part of findItemAndParent needs to be robust for root items
              // Let's refine: if activeItemInfo.parent is null, activeParentArray is newItems
              const rootOldIndex = newItems.findIndex((item) => item.id === activeId);
              const rootNewIndex = newItems.findIndex((item) => item.id === overId);
              if (rootOldIndex !== -1 && rootNewIndex !== -1) {
                const finalReorderedItems = arrayMove(newItems, rootOldIndex, rootNewIndex);
                // Update order property
                finalReorderedItems.forEach((item, index) => {
                  item.order = index + 1;
                });
                onReorder(finalReorderedItems);
                return;
              }
            } else {
              const parentObject = activeItemInfo.parent.find(
                (p) => p.children === activeParentArray
              );
              if (parentObject) {
                parentObject.children = reorderedSiblings;
                // Update order property for the reordered siblings
                reorderedSiblings.forEach((item: any, index) => {
                  item.order = index + 1;
                });
              }
            }
            onReorder(newItems); // Pass the whole modified tree
          }
        } else {
          console.warn(
            'Drag-and-drop across different parents or levels is not yet supported for simplicity.'
          );
        }
      }
    }
  };

  // Recursive function to render tree items, now using SortableTreeItem
  const renderSortableTree = (nodes: MenuItemData): React.ReactNode => (
    <SortableTreeItem
      key={String(nodes.id)}
      nodeId={String(nodes.id)} // TreeItem needs nodeId
      menuItemData={nodes}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddChild={onAddChild}
      renderChildren={renderSortableTree} // Pass the render function for children
    />
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
        <Box sx={{ minHeight: 270, flexGrow: 1, width: '100%' }}>
          <TreeView
            aria-label="menu structure editor"
            sx={{ overflowY: 'auto' }}
            // multiSelect={false} // Optional: if you want to prevent multi-selection
            // defaultExpanded={allItemIds} // Optional: expand all by default
          >
            {items.map((item) => renderSortableTree(item))}
          </TreeView>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Note: Drag-and-drop reordering is enabled for sibling items.
          </Typography>
        </Box>
      </SortableContext>
    </DndContext>
  );
};

export default MenuTreeEditor;
