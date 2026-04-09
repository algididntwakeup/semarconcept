import { MenusAPI } from '../../lib/api/endpoints';
import { MenuItem } from '../../types/menu'; // Assuming this exists or using any

// Placeholder type - replace with actual type from slice/service
export interface MenuItemData {
  id: string;
  title: string;
  path: string;
  icon?: string;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  isVisible: boolean;
  type: string;
  slug: string;
  permissions?: string[]; // Optional: Permissions required to see this item
  children?: MenuItemData[]; // For tree structure
}

const MenuManagementPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  const mapBackendToFrontend = (item: any): MenuItemData => ({
    id: item.id.toString(),
    title: item.title,
    path: item.route || '',
    icon: item.icon,
    parentId: item.parent_id?.toString() || null,
    order: item.order_index,
    isActive: item.is_active,
    isVisible: item.is_visible,
    type: item.menu_type,
    slug: item.slug,
    permissions: item.permissions ? item.permissions.map((p: any) => p.code) : [],
    children: item.children ? item.children.map(mapBackendToFrontend) : [],
  });

  const fetchMenus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MenusAPI.getMenuHierarchy({ include_inactive: true });
      if (response.data?.data) {
        setMenuItems(response.data.data.map(mapBackendToFrontend));
      }
    } catch (err: any) {
      console.error('Failed to fetch menus:', err);
      setError('Failed to load menu structure. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleAddItem = (parentId: string | null = null) => {
    setEditingItem(null);
    setTargetParentId(parentId);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: MenuItemData) => {
    setEditingItem(item);
    setTargetParentId(item.parentId);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item and all its children?')) return;
    
    try {
      await MenusAPI.deleteMenu(itemId);
      fetchMenus(); // Refresh
      // Dispatch event to reload sidebar if needed
      window.dispatchEvent(new CustomEvent('reksolindo:reload-menus'));
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      setError('Failed to delete menu item.');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setTargetParentId(null);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const payload = {
        title: formData.title,
        route: formData.path,
        icon: formData.icon,
        parent_id: targetParentId ? parseInt(targetParentId) : null,
        menu_type: formData.type || 'item',
        is_active: formData.isActive ?? true,
        is_visible: formData.isVisible ?? true,
        order_index: formData.order || 0,
        slug: formData.slug || formData.title.toLowerCase().replace(/ /g, '-'),
      };

      if (editingItem) {
        await MenusAPI.updateMenu(editingItem.id, payload);
      } else {
        await MenusAPI.createMenu(payload);
      }
      
      handleFormClose();
      fetchMenus();
      window.dispatchEvent(new CustomEvent('reksolindo:reload-menus'));
    } catch (err: any) {
      console.error('Failed to save menu item:', err);
      setError(err.response?.data?.error || 'Failed to save menu item.');
    }
  };

  const handleReorder = async (newOrder: MenuItemData[]) => {
    // Collect flat list of orders
    const orders: any[] = [];
    const collectOrders = (items: MenuItemData[], parentId: number | null = null) => {
      items.forEach((item, index) => {
        orders.push({
          id: parseInt(item.id),
          order_index: index,
          parent_id: parentId
        });
        if (item.children) {
          collectOrders(item.children, parseInt(item.id));
        }
      });
    };
    
    collectOrders(newOrder);

    try {
      await MenusAPI.reorderMenus(orders);
      setMenuItems(newOrder);
      window.dispatchEvent(new CustomEvent('reksolindo:reload-menus'));
    } catch (err) {
      console.error('Failed to reorder menus:', err);
      setError('Failed to save menu order.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Menu Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAddItem()}
          disabled={isFormOpen}
        >
          Add Root Item
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isFormOpen && (
        <Paper sx={{ p: 2, mb: 3, border: '1px dashed grey' }}>
          <Typography variant="h6" gutterBottom>
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </Typography>
          <MenuItemForm
            initialData={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            // Pass isSubmitting and submitError if managing state here
          />
          {/* Removed placeholder Typography and Button */}
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Menu Structure
            </Typography>
            <MenuTreeEditor
              items={menuItems}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onAddChild={handleAddItem}
              onReorder={handleReorder}
            />
            {/* Removed placeholder Typography and pre */}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MenuManagementPage;
