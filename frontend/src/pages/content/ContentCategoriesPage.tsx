// platform/frontend-mui/src/pages/content/ContentCategoriesPage.tsx
import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  Eye, 
  Palette, 
  Tag, 
  GitMerge, 
  List,
  Search,
  Filter,
  Activity,
  ChevronLeft,
  Settings,
  History,
  Shield,
  Layers
} from 'lucide-react';

interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
  level: number;
  path: string;
  status: 'active' | 'inactive' | 'archived';
  contentCount: number;
  children: ContentCategory[];
}

const ContentCategoriesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['1', '2']);

  const categories: ContentCategory[] = [
    {
      id: '1',
      name: 'Asset Documentation',
      slug: 'asset-documentation',
      description: 'Documentation related to physical assets and equipment',
      color: '#2196F3',
      icon: 'description',
      level: 0,
      path: '/asset-documentation',
      status: 'active',
      contentCount: 247,
      children: [
        {
          id: '1-1',
          name: 'Manuals',
          slug: 'manuals',
          description: 'Operating and maintenance manuals',
          color: '#1976D2',
          icon: 'menu_book',
          parentId: '1',
          level: 1,
          path: '/asset-documentation/manuals',
          status: 'active',
          contentCount: 89,
          children: []
        },
        {
          id: '1-2',
          name: 'Specifications',
          slug: 'specifications',
          description: 'Technical specifications and drawings',
          color: '#1976D2',
          icon: 'engineering',
          parentId: '1',
          level: 1,
          path: '/asset-documentation/specifications',
          status: 'active',
          contentCount: 158,
          children: []
        }
      ]
    },
    {
      id: '2',
      name: 'Safety & Compliance',
      slug: 'safety-compliance',
      description: 'Safety procedures and compliance documentation',
      color: '#FF9800',
      icon: 'security',
      level: 0,
      path: '/safety-compliance',
      status: 'active',
      contentCount: 156,
      children: []
    }
  ];

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => 
      prev.includes(id) ? prev.filter(nodeId => nodeId !== id) : [...prev, id]
    );
  };

  const renderTreeItem = (category: ContentCategory) => {
    const isExpanded = expandedNodes.includes(category.id);
    const hasChildren = category.children.length > 0;

    return (
      <div key={category.id} className="space-y-1">
        <div className="flex items-center group py-2 px-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
          <div className="flex items-center gap-3 flex-1">
            {hasChildren ? (
              <button 
                onClick={() => toggleNode(category.id)}
                className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/10"
              style={{ backgroundColor: category.color }}
            >
              <Folder size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-none mb-1">{category.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight max-w-md truncate">{category.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Context</p>
              <p className="text-sm font-black text-slate-600">{category.contentCount} Assets</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${category.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
              {category.status}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                <Edit2 size={16} />
              </button>
              <button className="p-2 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-10 pl-6 border-l-2 border-slate-100 space-y-1 py-1">
            {category.children.map(child => renderTreeItem(child))}
          </div>
        )}
      </div>
    );
  };

  const flattenCategories = (cats: ContentCategory[]): ContentCategory[] => {
    const result: ContentCategory[] = [];
    const flatten = (items: ContentCategory[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.children.length > 0) flatten(item.children);
      });
    };
    flatten(cats);
    return result;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">IA • Knowledge Architecture</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Taxonomy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Blueprints</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Architect the semantic hierarchy of your enterprise content. Create complex, nested category systems to organize diverse asset classes and mission-critical documentation.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  New Blueprint
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <GitMerge size={16} />
                   Merge Nodes
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Total Nodes', value: '42', color: 'text-blue-400' },
                 { label: 'Linked Assets', value: '4,829', color: 'text-indigo-400' },
                 { label: 'Depth Level', value: '05', color: 'text-emerald-400' },
                 { label: 'System Nodes', value: '12', color: 'text-amber-400' },
               ].map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ Modern Toolbar */}
      <section className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search taxonomy IDs, slugs, or attributes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            <button 
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'tree' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <GitMerge size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Status: All
          </button>
        </div>
      </section>

      {/* 🌲 Taxonomy Structure */}
      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden min-h-[500px]">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              {['Active Hierarchy', 'Structural Audit', 'Usage Analytics'].map((tab, i) => (
                <button 
                  key={i}
                  className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${i === 0 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                  {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>}
                </button>
              ))}
            </div>
        </div>

        <div className="p-8">
          {viewMode === 'tree' ? (
            <div className="space-y-4">
              {categories.map(cat => renderTreeItem(cat))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Identifier</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logical Path</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Density</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {flattenCategories(categories).map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner"
                            style={{ backgroundColor: cat.color }}
                          >
                            <Folder size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-none mb-1">{cat.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level {cat.level} Cluster</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <code className="text-[10px] px-2 py-1 bg-slate-100 rounded-lg text-slate-500 font-mono font-bold">
                          {cat.path}
                        </code>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-sm font-black text-slate-600">{cat.contentCount}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${cat.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          {cat.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-300">
                           <button className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                             <Edit2 size={18} />
                           </button>
                           <button className="p-2 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                             <MoreVertical size={18} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             IA Governance • Mapping {flattenCategories(categories).length} architectural nodes
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-blue-600">01</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">01</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronRight size={18} /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCategoriesPage;