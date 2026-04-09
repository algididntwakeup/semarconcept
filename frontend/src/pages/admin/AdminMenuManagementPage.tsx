import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Plus, 
  Save,
  Link,
  ChevronDown,
  LayoutGrid,
  Settings,
  Shield,
  Eye,
  Edit2,
  Trash2,
  Activity,
  Layers,
  X,
  CheckCircle2,
  Type,
  Globe,
  Lock,
  GripHorizontal
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MenusAPI, 
  handleAPIError, 
  type MenuItem 
} from '../../lib/api/endpoints';

const AdminMenuManagementPage: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('tree');
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Form state
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    title: '',
    route: '',
    icon: '',
    menu_type: 'standard',
    access_level: 'user',
    parent_id: null,
    order_index: 0,
    is_active: true,
    permissions: []
  });

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await MenusAPI.getMenuHierarchy({ admin: true });
      setMenus(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch menus:', handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedIds(newExpanded);
  };

  const handleOpenCreate = (parentId: number | null = null) => {
    setFormData({
      title: '',
      route: '',
      icon: '',
      menu_type: 'standard',
      access_level: 'user',
      parent_id: parentId,
      order_index: 0,
      is_active: true,
      permissions: []
    });
    setModalType('create');
    setModalOpen(true);
  };

  const handleOpenEdit = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setFormData({
      title: menu.title,
      route: menu.route,
      icon: menu.icon,
      menu_type: (menu as any).menu_type || 'standard',
      access_level: (menu as any).access_level || 'user',
      parent_id: menu.parent_id,
      order_index: menu.order_index,
      is_active: menu.is_active,
      permissions: menu.permissions || []
    });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalType === 'create') {
        await MenusAPI.createMenu(formData as any);
      } else if (modalType === 'edit' && selectedMenu) {
        await MenusAPI.updateMenu(selectedMenu.id, { 
          ...formData, 
          id: selectedMenu.id // Ensure ID is present for validation
        });
      }
      setModalOpen(false);
      fetchMenus();
      window.dispatchEvent(new CustomEvent('reksolindo:reload-menus'));
    } catch (error) {
      alert(handleAPIError(error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this menu item and all its children?')) return;
    try {
      await MenusAPI.deleteMenu(id);
      fetchMenus();
      window.dispatchEvent(new CustomEvent('reksolindo:reload-menus'));
    } catch (error) {
      alert(handleAPIError(error).message);
    }
  };

  const handleToggleStatus = async (menu: MenuItem) => {
    try {
      await MenusAPI.toggleMenuStatus(menu.id, !menu.is_active);
      fetchMenus();
      window.dispatchEvent(new CustomEvent('reksolindo:reload-menus'));
    } catch (error) {
      alert(handleAPIError(error).message);
    }
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Helper: Flatten tree to flat list with depth
  const flattenTree = (items: MenuItem[], depth = 0): (MenuItem & { depth: number })[] => {
    return items.reduce((acc, item) => {
      acc.push({ ...item, depth });
      if (item.children && item.children.length > 0 && expandedIds.has(item.id)) {
        acc.push(...flattenTree(item.children, depth + 1));
      }
      return acc;
    }, [] as (MenuItem & { depth: number })[]);
  };

  const findParentId = (flatList: (MenuItem & { depth: number })[], index: number): number | null => {
    const currentDepth = flatList[index].depth;
    if (currentDepth === 0) return null;
    for (let i = index - 1; i >= 0; i--) {
      if (flatList[i].depth === currentDepth - 1) {
        return flatList[i].id;
      }
    }
    return null;
  };

  const buildTreeAndFlatten = (
    flatVisible: (MenuItem & { depth: number, parent_id: number | null })[], 
    originalItems: MenuItem[]
  ) => {
    const allItemsMap = new Map<number, MenuItem>();
    
    // 1. Build a map of all items
    const addToMap = (items: MenuItem[]) => {
      items.forEach(item => {
        allItemsMap.set(item.id, { ...item, children: [] });
        if (item.children) addToMap(item.children);
      });
    };
    addToMap(originalItems);

    // 2. We will place visible items into their new parents according to flatVisible
    const rootItems: MenuItem[] = [];
    
    // Keep track of which items were visible so we know what's hidden
    const visibleIds = new Set(flatVisible.map(i => i.id));

    flatVisible.forEach((flatItem) => {
      const itemNode = allItemsMap.get(flatItem.id)!;
      const parentId = flatItem.parent_id;

      if (parentId === null) {
        rootItems.push(itemNode);
      } else {
        const parentNode = allItemsMap.get(parentId);
        if (parentNode) {
          parentNode.children!.push(itemNode);
        } else {
          // Fallback if parent missing
          rootItems.push(itemNode);
        }
      }
    });

    // 3. Any hidden items (that were collapsed) need to be appended to their original parents!
    const appendHiddenItems = (items: MenuItem[]) => {
      items.forEach(item => {
        if (!visibleIds.has(item.id)) {
           // It's hidden! Append it to its original parent
           const originalParentId = item.parent_id;
           if (originalParentId === null) {
             rootItems.push(allItemsMap.get(item.id)!);
           } else {
             const parentNode = allItemsMap.get(originalParentId);
             if (parentNode) {
               parentNode.children!.push(allItemsMap.get(item.id)!);
             } else {
               rootItems.push(allItemsMap.get(item.id)!);
             }
           }
        }
        if (item.children) {
          appendHiddenItems(item.children);
        }
      });
    };
    appendHiddenItems(originalItems);

    // 4. Finally, recursively assign absolute global order_index to ALL items
    const finalUpdateList: any[] = [];
    let globalIndex = 0;
    
    const generateUpdateList = (items: MenuItem[]) => {
      items.forEach(item => {
        finalUpdateList.push({
          id: item.id,
          order_index: globalIndex++,
          parent_id: flatVisible.find(f => f.id === item.id)?.parent_id ?? item.parent_id
        });
        if (item.children && item.children.length > 0) {
          generateUpdateList(item.children);
        }
      });
    };
    
    generateUpdateList(rootItems);
    return finalUpdateList;
  };

  const handleGlobalDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    // We need over to be valid, but we ALLOW active.id === over.id if there is horizontal movement!
    if (!over) return;
    
    const isSameVerticalPosition = active.id === over.id;

    // Calculate projected depth based on horizontal movement
    const indentSize = 16; 
    const horizontalOffset = delta.x;
    const depthChange = Math.round(horizontalOffset / indentSize);

    // If there is no vertical AND no horizontal indent change, then abort entirely.
    if (isSameVerticalPosition && depthChange === 0) return;

    // Get flat list of VISIBLE items
    const visibleFlatItems = flattenTree(menus);
    const oldIndex = visibleFlatItems.findIndex(i => i.id === active.id);
    const newIndex = visibleFlatItems.findIndex(i => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // ✨ Fix for nested nodes: Strip visible descendants of the dragged node. 
    // This allows them to behave as "hidden" items and securely tether to their parent.
    let descendantsCount = 0;
    const activeItem = visibleFlatItems[oldIndex];
    for (let i = oldIndex + 1; i < visibleFlatItems.length; i++) {
      if (visibleFlatItems[i].depth > activeItem.depth) descendantsCount++;
      else break;
    }

    let flatListForMove = [...visibleFlatItems];
    if (descendantsCount > 0) {
      flatListForMove.splice(oldIndex + 1, descendantsCount);
    }

    const dragIndex = flatListForMove.findIndex(i => i.id === active.id);
    const dropIndex = flatListForMove.findIndex(i => i.id === over.id);

    // Prevent dropping onto its own descendant
    if (dragIndex === -1 || dropIndex === -1) return;

    let newFlatVisible = [...flatListForMove];
    if (!isSameVerticalPosition) {
      newFlatVisible = arrayMove(flatListForMove, dragIndex, dropIndex);
    }
    
    // Update the depth of the moved item
    const finalMovedIndex = dropIndex;
    const movedItem = { ...newFlatVisible[finalMovedIndex] };
    const prevItem = finalMovedIndex > 0 ? newFlatVisible[finalMovedIndex - 1] : null;
    
    // Constraint: depth can be at most prevItem.depth + 1
    const maxDepth = prevItem ? prevItem.depth + 1 : 0;
    const minDepth = 0;
    
    const originalDepth = activeItem.depth;
    
    // ✨ FIXED: Proper step depth instead of jumping to maxDepth directly
    movedItem.depth = Math.max(minDepth, Math.min(maxDepth, originalDepth + depthChange));
    
    // If we didn't actually change depth or position after enforcing constraints, then abort!
    if (isSameVerticalPosition && movedItem.depth === originalDepth) return;
    
    newFlatVisible[finalMovedIndex] = movedItem;

    // Determine new parent_ids for visible nodes
    const updatedWithParents = newFlatVisible.map((item, idx) => ({
      ...item,
      parent_id: findParentId(newFlatVisible, idx)
    }));

    // Update ALL nodes properly to prevent alphabetical ordering collision with hidden nodes
    const itemsToUpdate = buildTreeAndFlatten(updatedWithParents, menus);

    const newParentId = movedItem.parent_id;

    try {
      await MenusAPI.reorderMenus(itemsToUpdate);
      
      // Auto-expand the parent if an item was moved into it
      if (newParentId) {
        setExpandedIds(prev => {
          const next = new Set(prev);
          next.add(newParentId as number);
          return next;
        });
      }

      fetchMenus(); // Re-fetch whole hierarchy to ensure consistency
      window.dispatchEvent(new CustomEvent('reksolindo:reload-menus'));
    } catch (error) {
      console.error('Failed to update menu order:', error);
      fetchMenus(); // Rollback
    }
  };

  const MenuNode: React.FC<{ node: MenuItem; depth: number }> = ({ node, depth }) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: node.id });

    // ✨ Compute projected depth for visual feedback during horizontal drag
    const indentSize = 16;
    const projectedDepthDelta = isDragging && transform ? Math.round(transform.x / indentSize) : 0;
    const visualDepth = Math.max(0, depth + projectedDepthDelta);

    const style = {
      // Zero out the x transform so it doesn't move smoothly and shift margin concurrently
      transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
      transition,
      marginLeft: `${visualDepth * 2}rem`,
      zIndex: isDragging ? 50 : 'auto',
      position: 'relative' as const,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} className="space-y-2">
        <div 
          className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
            depth === 0 ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
          } hover:border-violet-300 hover:shadow-md cursor-pointer`}
          onClick={() => hasChildren ? toggleExpand(node.id) : handleOpenEdit(node)}
        >
          <div className="flex items-center gap-4">
            <div 
              {...attributes} 
              {...listeners}
              className="p-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <GripHorizontal size={18} />
            </div>
            <div className="flex items-center justify-center w-6 h-6">
              {hasChildren ? (
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
              ) : (
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              )}
            </div>
            <div className={`p-2 rounded-lg ${node.is_active ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
              <FolderTree size={18} />
            </div>
            <div>
              <h4 className={`text-sm font-black tracking-tight ${node.is_active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                {node.title}
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <Link size={10} /> {node.route || 'No Link'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); handleOpenCreate(node.id); }}
              className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Add Child"
            >
              <Plus size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleOpenEdit(node); }}
              className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleToggleStatus(node); }}
              className={`p-1.5 rounded-lg transition-colors ${node.is_active ? 'text-emerald-400 hover:bg-emerald-50' : 'text-amber-400 hover:bg-amber-50'}`}
              title={node.is_active ? 'Deactivate' : 'Activate'}
            >
              {node.is_active ? <Eye size={16} /> : <Eye size={16} className="opacity-40" />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getFlatAll = (items: MenuItem[], depth = 0): (MenuItem & { depth: number })[] => {
    return items.reduce((acc, item) => {
      acc.push({ ...item, depth });
      if (item.children && item.children.length > 0) {
        acc.push(...getFlatAll(item.children, depth + 1));
      }
      return acc;
    }, [] as (MenuItem & { depth: number })[]);
  };

  const renderTree = (items: MenuItem[], depth = 0): React.ReactNode => {
    return items.map((item) => (
      <React.Fragment key={item.id}>
        <MenuNode node={item} depth={depth} />
        {item.children && expandedIds.has(item.id) && renderTree(item.children, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Platform Core • Routing</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Navigation <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">Architect</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Design, organize, and hierarchically structure the application frontend navigation rules globally. Manage multi-level menus with granular visibility.
                </p>
             </div>
             <div className="hidden lg:flex flex-col gap-4 bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-inner min-w-[280px]">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation Endpoints</span>
                   <span className="text-white font-black text-lg">{menus.length} Root</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Routines</span>
                   <div className="flex items-center gap-2 text-emerald-400">
                      <Activity size={14} /> <span className="font-black text-lg">98%</span>
                   </div>
                </div>
                <button onClick={fetchMenus} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all mt-2 uppercase">Refresh Hierarchy</button>
             </div>
          </div>
        </div>
      </section>

      {/* 🚀 Interactive Menu Builder */}
      <div className="glass-card max-w-6xl mx-auto rounded-[3rem] shadow-premium overflow-hidden border border-slate-100/50 flex flex-col md:flex-row">
         
         {/* Tree Canvas */}
         <div className="flex-1 bg-white p-10 relative">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
               <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Active Navigation Tree</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 w-max flex items-center gap-2"><Layers size={12} /> Click parent to expand • Use actions to modify</p>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenCreate(null)}
                    className="flex items-center gap-2 px-6 py-2 border-2 border-dashed border-slate-200 text-slate-500 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-all"
                  >
                     <Plus size={14} /> Add Root
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-violet-700 shadow-md shadow-violet-200 transition-all">
                     <Save size={14} /> Publish Menu
                  </button>
               </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reconstructing Hierarchy...</p>
                </div>
              ) : menus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300">
                    <FolderTree size={40} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">No Hierarchy Defined</h3>
                    <p className="text-sm text-slate-400">Initialize your first root menu to begin.</p>
                  </div>
                  <button 
                    onClick={() => handleOpenCreate(null)}
                    className="px-8 py-3 bg-violet-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"
                  >
                    Create First Menu
                  </button>
                </div>
              ) : (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleGlobalDragEnd}
                >
                  <SortableContext 
                    items={flattenTree(menus).map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {renderTree(menus)}
                  </SortableContext>
                </DndContext>
              )}
            </div>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-xl relative z-10 flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {modalType === 'create' ? 'Initalize Component' : 'Parameter Refinement'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {modalType === 'create' ? 'Define new navigation endpoint' : `Reference: ${selectedMenu?.id}`}
                  </p>
               </div>
               <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[70vh] space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Type size={12} /> Menu Title</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. Asset Registry"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Link size={12} /> Target URL</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      value={formData.route || ''}
                      onChange={(e) => setFormData({...formData, route: e.target.value})}
                      placeholder="e.g. /asset/registry"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2"><FolderTree size={12} /> Parent Menu</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      value={formData.parent_id || ''}
                      onChange={(e) => setFormData({...formData, parent_id: e.target.value ? parseInt(e.target.value) : null})}
                    >
                      <option value="">None (Root Menu)</option>
                      {getFlatAll(menus)
                        .filter(m => m.id !== selectedMenu?.id) // Prevent self-parenting
                        .map(m => (
                          <option key={m.id} value={m.id}>
                            {'\u00A0'.repeat(m.depth * 4)}{m.title}
                          </option>
                        ))}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Settings size={12} /> Icon Identifier</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      placeholder="e.g. DashboardIcon"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Layers size={12} /> Entry Type</label>
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      value={(formData as any).menu_type || 'standard'}
                      onChange={(e) => setFormData({...formData, menu_type: e.target.value as any} as any)}
                    >
                      <option value="standard">Standard Link</option>
                      <option value="collapse">Collapsible Group</option>
                      <option value="group">Visual Header</option>
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Globe size={12} /> Rendering Order</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                      value={formData.order_index}
                      onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2"><Lock size={12} /> Deployment Status</label>
                    <div 
                      onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border cursor-pointer transition-all ${
                        formData.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      {formData.is_active ? <CheckCircle2 size={16} /> : <X size={16} />}
                      <span className="text-xs font-black uppercase tracking-widest">{formData.is_active ? 'Production Ready' : 'In Sandbox'}</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setModalOpen(false)} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all">
                 Discard Definition
               </button>
               <button 
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-200 transition-all disabled:opacity-50"
               >
                 {saving ? 'Processing...' : modalType === 'create' ? 'Initalize Component' : 'Commit Changes'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuManagementPage;