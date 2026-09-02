import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, 
  Building2, 
  Layers, 
  Cpu, 
  Settings, 
  Search, 
  Plus, 
  ChevronRight, 
  Eye, 
  Edit2, 
  Trash2, 
  User, 
  MapPin, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { assetService } from '../../services/assetServices';
import { AssetHierarchyNode } from '../../types/asset';
import AssetFormModal, { ASSET_LEVELS } from '../../components/AssetFormModal';

// Flatten hierarchy to access easily by id
const flattenHierarchy = (nodes: AssetHierarchyNode[]): Record<string, AssetHierarchyNode> => {
  const map: Record<string, AssetHierarchyNode> = {};
  const traverse = (node: AssetHierarchyNode, parentId?: string) => {
    map[node.id] = { ...node, parentId };
    if (node.children) {
      node.children.forEach(child => traverse(child, node.id));
    }
  };
  nodes.forEach(node => traverse(node));
  return map;
};

const AssetHierarchyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Modal state
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingAsset, setEditingAsset] = useState<AssetHierarchyNode | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string>('');

  const [hierarchyTree, setHierarchyTree] = useState<AssetHierarchyNode[]>([]);
  const [hierarchyData, setHierarchyData] = useState<Record<string, AssetHierarchyNode>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchHierarchy = async () => {
    setIsLoading(true);
    try {
      const data = await assetService.getAssetHierarchy();
      setHierarchyTree(data || []);
      const flat = flattenHierarchy(data || []);
      setHierarchyData(flat);
      if (data && data.length > 0 && !selectedNode) {
        setSelectedNode(data[0].id);
        setExpandedItems([data[0].id]);
      }
    } catch (err) {
      console.error('Failed to load asset hierarchy', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHierarchy(); }, []);

  // Stat counts
  const hierarchyStats = useMemo(() => {
    const nodes = Object.values(hierarchyData);
    const t = (types: string[]) => nodes.filter(n => types.includes(n.type?.toLowerCase())).length;
    return [
      { label: 'Installations', value: t(['installation','location','site','facility']), icon: Building2, color: 'text-blue-500' },
      { label: 'Plants / Systems', value: t(['plant','section','area','system','unit']), icon: Network, color: 'text-emerald-500' },
      { label: 'Equipment', value: nodes.filter(n => !['installation','location','site','facility','plant','section','area','system','unit','subunit','component'].includes(n.type?.toLowerCase())).length, icon: Cpu, color: 'text-amber-500' },
      { label: 'Subunits / Parts', value: t(['subunit','component']), icon: Layers, color: 'text-rose-500' }
    ];
  }, [hierarchyData]);

  // Build a flat lookup for the form (id→name/type)
  const allAssetsMap = useMemo(() => {
    const m: Record<string, { id: string; name: string; type: string }> = {};
    for (const [id, n] of Object.entries(hierarchyData)) {
      m[id] = { id, name: n.name, type: n.type };
    }
    return m;
  }, [hierarchyData]);

  // ── Modal helpers ──
  const openCreateModal = (parentId?: string) => {
    setModalMode('create');
    setEditingAsset(null);
    setDefaultParentId(parentId || '');
    setModalOpen(true);
  };

  const openEditModal = (node: AssetHierarchyNode) => {
    setModalMode('edit');
    setEditingAsset(node);
    setDefaultParentId('');
    setModalOpen(true);
  };

  const handleDeleteAsset = async (nodeId: string) => {
    const node = hierarchyData[nodeId];
    const childCount = node?.children?.length || 0;
    const msg = childCount > 0
      ? `"${node.name}" has ${childCount} child asset(s). Deleting it will also affect its children. Continue?`
      : `Are you sure you want to delete "${node?.name}"?`;
    if (!window.confirm(msg)) return;
    try {
      await assetService.deleteAsset(nodeId);
      if (selectedNode === nodeId) setSelectedNode(null);
      await fetchHierarchy();
    } catch (err) {
      console.error('Failed to delete asset', err);
    }
  };

  // ── Node rendering helpers ──
  const getNodeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (['site','location','installation','facility'].includes(t)) return <Building2 size={18} />;
    if (['area','plant','section','system','unit'].includes(t)) return <Network size={18} />;
    if (['subunit'].includes(t)) return <Cpu size={18} />;
    if (['component'].includes(t)) return <Settings size={18} />;
    return <Layers size={18} />; // equipment
  };

  const getNodeColorClass = (type: string) => {
    const t = type.toLowerCase();
    if (['site','location','installation','facility'].includes(t)) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (['area','plant','section','system','unit'].includes(t)) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (['subunit'].includes(t)) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (['component'].includes(t)) return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-rose-50 text-rose-600 border-rose-100'; // equipment
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderTreeItem = (nodeId: string): React.ReactElement => {
    const node = hierarchyData[nodeId];
    if (!node) return <div key={nodeId}></div>;
    const isExpanded = expandedItems.includes(nodeId);
    const isSelected = selectedNode === nodeId;
    const hasChildren = node.children && node.children.length > 0;

    // Filter by search
    if (searchTerm) {
      const matchesSelf = node.name.toLowerCase().includes(searchTerm.toLowerCase());
      const hasMatchingChild = node.children?.some(c => {
        const cn = hierarchyData[c.id];
        return cn && cn.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!matchesSelf && !hasMatchingChild) return <React.Fragment key={nodeId} />;
    }

    return (
      <div key={nodeId} className="select-none">
        <div 
          onClick={() => setSelectedNode(nodeId)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer group ${isSelected ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-slate-50'}`}
        >
          {hasChildren ? (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleExpand(nodeId); }} 
              className={`p-1 rounded-md hover:bg-white transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            >
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          ) : (
            <div className="w-6"></div>
          )}
          
          <div className={`p-1.5 rounded-lg border ${getNodeColorClass(node.type)} group-hover:scale-110 transition-transform`}>
            {getNodeIcon(node.type)}
          </div>
          
          <span className={`text-sm font-bold flex-1 truncate ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>
            {node.name}
          </span>

          {/* Inline actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); openCreateModal(nodeId); }}
              className="p-1 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Add child asset">
              <Plus size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); openEditModal(node); }}
              className="p-1 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Edit">
              <Edit2 size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteAsset(nodeId); }}
              className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
          
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 group-hover:bg-white transition-colors">
            {node.children ? node.children.length : 0}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 pl-4 border-l border-slate-100 mt-1 space-y-1">
            {node.children!.map(child => renderTreeItem(child.id))}
          </div>
        )}
      </div>
    );
  };

  const generateBreadcrumbs = (nodeId: string | null) => {
    if (!nodeId) return [];
    const breadcrumbs: AssetHierarchyNode[] = [];
    let currentNode: AssetHierarchyNode | null | undefined = hierarchyData[nodeId];
    while (currentNode) {
      breadcrumbs.unshift(currentNode);
      currentNode = currentNode.parentId ? hierarchyData[currentNode.parentId] : null;
    }
    return breadcrumbs;
  };

  const selectedNodeData = selectedNode ? hierarchyData[selectedNode] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Asset Management • Installation Hierarchy</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-300">Hierarchy</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Navigate your asset structure from installations down to maintainable parts.
              </p>
              <button 
                onClick={() => openCreateModal()}
                className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={18} strokeWidth={3} />
                Add Asset
              </button>
            </div>
            
            <div className="hidden lg:grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
               {hierarchyStats.map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 min-w-[120px]">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🌲 Hierarchy Explorer & Detail Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Tree */}
        <div className="lg:col-span-4 glass-card p-6 flex flex-col h-[600px] shadow-premium rounded-[2.5rem]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Network size={16} className="text-indigo-500" />
                Asset Tree
              </h3>
              <div className="flex gap-1">
                 <button onClick={() => setExpandedItems(Object.keys(hierarchyData))} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors" title="Expand All"><Plus size={16} /></button>
                 <button onClick={() => setExpandedItems([])} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors" title="Collapse All"><Layers size={16} /></button>
              </div>
           </div>
           
           <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
           </div>

           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {isLoading ? (
                <div className="p-4 text-center text-slate-400 text-sm italic">Loading hierarchy...</div>
              ) : hierarchyTree.length === 0 ? (
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Network size={28} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-1">No assets yet</p>
                  <p className="text-xs text-slate-400 mb-4">Start by adding your first installation</p>
                  <button 
                    onClick={() => openCreateModal()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Asset
                  </button>
                </div>
              ) : (
                hierarchyTree.map(rootNode => renderTreeItem(rootNode.id))
              )}
           </div>
        </div>

        {/* Right: Detail */}
        <div className="lg:col-span-8 space-y-6">
          {selectedNodeData ? (
            <div className="glass-card p-8 shadow-premium rounded-[2.5rem] min-h-[600px] flex flex-col animate-in slide-in-from-right-4 duration-500">
              
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                 {generateBreadcrumbs(selectedNode).map((node, i, arr) => (
                   <React.Fragment key={node.id}>
                     <button 
                       onClick={() => setSelectedNode(node.id)}
                       className={`hover:text-indigo-500 transition-colors whitespace-nowrap ${i === arr.length - 1 ? 'text-indigo-600' : ''}`}
                     >
                       {node.name}
                     </button>
                     {i < arr.length - 1 && <ChevronRight size={10} className="flex-shrink-0" />}
                   </React.Fragment>
                 ))}
              </div>

              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                 <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner border group relative ${getNodeColorClass(selectedNodeData.type)}`}>
                        {React.cloneElement(getNodeIcon(selectedNodeData.type) as React.ReactElement<any>, { size: 40 })}
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{selectedNodeData.name}</h2>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${getNodeColorClass(selectedNodeData.type)}`}>
                            {ASSET_LEVELS[selectedNodeData.type?.toLowerCase()]?.label || selectedNodeData.type}
                          </span>
                       </div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                         ID: {selectedNodeData.id} {selectedNodeData.tagNumber && `• Tag: ${selectedNodeData.tagNumber}`}
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button onClick={() => openEditModal(selectedNodeData)}
                      className="p-3 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-2xl border border-transparent hover:border-amber-100 transition-all" title="Edit">
                       <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDeleteAsset(selectedNodeData.id)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl border border-transparent hover:border-rose-100 transition-all" title="Delete">
                       <Trash2 size={20} />
                    </button>
                    <div className="w-[1px] h-10 bg-slate-100 mx-1"></div>
                    <button onClick={() => openCreateModal(selectedNodeData.id)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                       <Plus size={16} strokeWidth={3} />
                       Add Child Asset
                    </button>
                 </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 <div className="space-y-6">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <Info size={12} className="text-indigo-400" />
                         Asset Information
                       </p>
                       <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                         "{selectedNodeData.name}" — {ASSET_LEVELS[selectedNodeData.type?.toLowerCase()]?.label || selectedNodeData.type}
                       </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex-1 min-w-[140px] shadow-inner">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Child Assets</p>
                           <p className="text-xl font-black text-slate-800">{selectedNodeData.children?.length || 0}</p>
                        </div>
                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex-1 min-w-[140px] shadow-inner">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asset Type</p>
                           <p className="text-lg font-black text-slate-800">{ASSET_LEVELS[selectedNodeData.type?.toLowerCase()]?.label || selectedNodeData.type}</p>
                        </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Properties</p>
                    {[
                      { label: 'Custodian', value: 'Unassigned', icon: User, color: 'text-blue-500' },
                      { label: 'Location', value: 'Not specified', icon: MapPin, color: 'text-indigo-500' },
                      { label: 'Status', value: selectedNodeData.status || 'Active', icon: CheckCircle2, color: 'text-emerald-500' },
                      { label: 'Criticality', value: selectedNodeData.criticality || 'Not set', icon: AlertCircle, color: 'text-amber-500' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all group">
                         <div className={`p-2 rounded-xl bg-white border border-slate-100 shadow-sm ${item.color} group-hover:scale-110 transition-transform`}>
                           <item.icon size={18} />
                         </div>
                         <div className="flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                            <p className="text-xs font-black text-slate-700 tracking-tight">{item.value}</p>
                         </div>
                         <ChevronRight size={14} className="text-slate-200 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                 </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100 flex flex-wrap gap-4">
                 <button className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group">
                    <Eye size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    View Full Details
                 </button>
                 <button onClick={() => openCreateModal(selectedNodeData.id)}
                   className="flex-1 px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 group border border-indigo-100/50">
                    <Plus size={16} strokeWidth={3} />
                    Add Child Asset
                 </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 shadow-premium rounded-[2.5rem] min-h-[600px] flex flex-col items-center justify-center opacity-40">
               <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <Network size={48} className="text-slate-400" />
               </div>
               <h3 className="text-xl font-black text-slate-800 tracking-tighter mb-2">Select an Asset</h3>
               <p className="text-sm font-medium text-slate-500">Pick an asset from the tree to view its details.</p>
            </div>
          )}
        </div>
      </section>

      {/* Shared Form Modal */}
      <AssetFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        editingAsset={editingAsset}
        defaultParentId={defaultParentId}
        allAssets={allAssetsMap}
        onClose={() => setModalOpen(false)}
        onSaved={() => fetchHierarchy()}
      />
    </div>
  );
};

export default AssetHierarchyPage;