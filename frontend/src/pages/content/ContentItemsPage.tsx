// platform/frontend-mui/src/pages/content/ContentItemsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  Layers, 
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Clock,
  User as UserIcon,
  FileUp,
  FileDown
} from 'lucide-react';

interface ContentItem {
  id: number;
  title: string;
  slug: string;
  content_type_id: number;
  content_type_name: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived' | 'expired';
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  created_by_name: string;
  updated_by?: number;
  updated_by_name?: string;
  version: number;
  content_data: {
    excerpt?: string;
    featured_image?: string;
    categories?: string[];
    tags?: string[];
    seo_title?: string;
    word_count?: number;
  };
  workflow_status?: string;
  views_count?: number;
  comments_count?: number;
}

interface ContentType {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
}

const ContentItemsPage: React.FC = () => {
  const navigate = useNavigate();

  // Data state
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const sampleTypes: ContentType[] = [
        { id: 1, name: 'article', display_name: 'Article', description: 'General articles', is_active: true },
        { id: 2, name: 'manual', display_name: 'Manual', description: 'Equipment manuals', is_active: true },
        { id: 3, name: 'procedure', display_name: 'Procedure', description: 'Operating procedures', is_active: true },
      ];
      setContentTypes(sampleTypes);

      const sampleItems: ContentItem[] = [
        {
          id: 1,
          title: 'Safety Procedures Pump Ops',
          slug: 'safety-pump-ops',
          content_type_id: 3,
          content_type_name: 'Procedure',
          status: 'published',
          published_at: '2024-01-15T10:00:00Z',
          created_at: '2024-01-14T14:30:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          created_by: 1,
          created_by_name: 'Safety Manager',
          version: 2,
          content_data: { excerpt: 'Comprehensive safety procedures...' },
          views_count: 245,
        },
        {
          id: 2,
          title: 'Asset Management 2024',
          slug: 'asset-mgmt-2024',
          content_type_id: 1,
          content_type_name: 'Article',
          status: 'draft',
          created_at: '2024-01-16T09:15:00Z',
          updated_at: '2024-01-16T16:45:00Z',
          created_by: 2,
          created_by_name: 'John Smith',
          version: 1,
          content_data: { excerpt: 'Best practices for assets...' },
          views_count: 12,
        }
      ];
      setContentItems(sampleItems);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.content_type_id.toString() === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const paginatedItems = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'draft': return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'review': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'archived': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Platform • Knowledge Hub</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">Management</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Create, organize, and publish technical documentation, procedures, and manuals. Centralized repository for all operational knowledge.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/content/entry/edit')}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={16} strokeWidth={3} />
                  Compose Content
                </button>
                <div className="flex gap-2">
                  <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all">
                    <FileUp size={20} />
                  </button>
                  <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all">
                    <FileDown size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[300px]">
               {[
                 { label: 'Total Docs', value: contentItems.length, color: 'text-violet-400' },
                 { label: 'Published', value: contentItems.filter(i => i.status === 'published').length, color: 'text-emerald-400' },
                 { label: 'Technical Reads', value: '2.4k', color: 'text-blue-400' },
                 { label: 'Health Score', value: '94%', color: 'text-amber-400' },
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
            placeholder="Search documents, tags, or authors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-violet-600 text-white shadow-glow-violet' : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={14} />
            Filters
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button onClick={loadData} className="p-3 text-slate-400 hover:text-violet-600 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* 📂 Expanded Filters */}
      {showFilters && (
        <div className="glass-card p-6 rounded-[2rem] shadow-premium grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
            >
              <option value="all">All types</option>
              {contentTypes.map(t => <option key={t.id} value={t.id}>{t.display_name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {setSearchTerm(''); setStatusFilter('all'); setTypeFilter('all');}}
              className="w-full py-3.5 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-all"
            >
              Clear All Rules
            </button>
          </div>
        </div>
      )}

      {/* 📊 Premium Content Table */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Knowledge Entry</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-20 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching entries found</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-violet-100">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1">{item.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            v{item.version} • {item.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">{item.content_type_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <UserIcon size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{item.created_by_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(item.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-300">
                         <button className="p-2 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                           <Edit2 size={18} />
                         </button>
                         <button className="p-2 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 📑 Pagination */}
        <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Found {filteredItems.length} active entries
           </p>
           <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-violet-600">{page}</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">{totalPages || 1}</span>
              </div>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContentItemsPage;