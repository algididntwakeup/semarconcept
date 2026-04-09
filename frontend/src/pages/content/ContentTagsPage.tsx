// platform/frontend-mui/src/pages/content/ContentTagsPage.tsx
import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Tag as TagIcon, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  GitMerge, 
  Copy, 
  Eye, 
  Palette, 
  Hash, 
  Clipboard, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  History,
  Shield,
  Layers,
  Zap
} from 'lucide-react';

interface ContentTag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  category: 'system' | 'user' | 'auto' | 'custom';
  type: 'general' | 'asset' | 'location' | 'skill' | 'priority' | 'status';
  usage: {
    totalUsage: number;
    recentUsage: number;
    trending: 'up' | 'down' | 'stable';
    lastUsed: string;
  };
}

const ContentTagsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tags: ContentTag[] = [
    {
      id: '1',
      name: 'Maintenance',
      slug: 'maintenance',
      description: 'Content related to equipment maintenance and repair',
      color: '#FF9800',
      category: 'system',
      type: 'general',
      usage: {
        totalUsage: 347,
        recentUsage: 23,
        trending: 'up',
        lastUsed: '2025-06-11'
      }
    },
    {
      id: '2',
      name: 'Critical',
      slug: 'critical',
      description: 'High priority or critical importance content',
      color: '#F44336',
      category: 'system',
      type: 'priority',
      usage: {
        totalUsage: 189,
        recentUsage: 12,
        trending: 'stable',
        lastUsed: '2025-06-11'
      }
    },
    {
      id: '3',
      name: 'Pump',
      slug: 'pump',
      description: 'Content related to pump equipment',
      color: '#2196F3',
      category: 'user',
      type: 'asset',
      usage: {
        totalUsage: 276,
        recentUsage: 18,
        trending: 'up',
        lastUsed: '2025-06-11'
      }
    }
  ];

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTagSelection = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(tagId => tagId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Metadata • Collective Intelligence</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Semantic <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Signals</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Manage the metadata tissue that binds your operation together. Deploy smart tagging systems to enable rapid discovery, automated routing, and deep analytics across your entire content ecosystem.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  Register Signal
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <GitMerge size={16} />
                   Semantic Merge
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Unique Tags', value: '412', color: 'text-emerald-400' },
                 { label: 'Total Links', value: '18.4K', color: 'text-teal-400' },
                 { label: 'High Velocity', value: '24', color: 'text-amber-400' },
                 { label: 'Auto-Classified', value: '82%', color: 'text-purple-400' },
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
            placeholder="Search signals, aliases, or semantic clusters..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
             <button className="px-4 py-2 bg-white shadow-sm text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Global Cloud</button>
             <button className="px-4 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Audit List</button>
          </div>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Category: All
          </button>
        </div>
      </section>

      {/* 🏷️ Tag Grid */}
      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {filteredTags.map(tag => (
                 <div 
                  key={tag.id}
                  onClick={() => toggleTagSelection(tag.id)}
                  className={`relative p-6 rounded-[2rem] border transition-all cursor-pointer group ${selectedTags.includes(tag.id) ? 'bg-emerald-50/50 border-emerald-200 ring-2 ring-emerald-500/20' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-xl'}`}
                 >
                    <div className="flex justify-between items-start mb-6">
                       <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: tag.color }}
                       >
                          <Hash size={24} strokeWidth={3} />
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${tag.category === 'system' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {tag.category}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tag.type}</span>
                       </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">#{tag.name}</h3>
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-6 opacity-70 italic">"{tag.description}"</p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                       <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400"><Activity size={14} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Hits</p>
                            <p className="text-xs font-black text-slate-700">{tag.usage.totalUsage.toLocaleString()}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400"><TrendingUp size={14} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Velocity</p>
                            <p className={`text-xs font-black ${tag.usage.trending === 'up' ? 'text-emerald-500' : 'text-slate-500'}`}>{tag.usage.trending === 'up' ? '+' : ''}{tag.usage.recentUsage} / wk</p>
                          </div>
                       </div>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-emerald-600 border border-slate-100 transition-all">
                          <Edit2 size={14} />
                       </button>
                    </div>
                 </div>
               ))}

               {/* New Tag Action Card */}
               <button className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-emerald-600 group min-h-[240px]">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 group-hover:scale-110 transition-all">
                    <Plus size={32} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy New Signal</span>
               </button>
            </div>
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Semantic Index • Discovering {filteredTags.length} active signals
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-emerald-600">01</span>
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

export default ContentTagsPage;