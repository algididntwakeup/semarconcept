// platform/frontend-mui/src/pages/content/ContentTypesPage.tsx
import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Clock,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MoreVertical,
  Activity,
  Box,
  Layout,
  Code,
  Layers
} from 'lucide-react';

interface ContentType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  category: 'asset' | 'documentation' | 'media' | 'system' | 'custom';
  totalEntries: number;
}

const ContentTypesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const contentTypes: ContentType[] = [
    {
      id: '1',
      name: 'asset_document',
      displayName: 'Asset Document',
      description: 'Documentation related to physical assets',
      status: 'active',
      category: 'asset',
      totalEntries: 247,
    },
    {
      id: '2',
      name: 'inspection_report',
      displayName: 'Inspection Report',
      description: 'Reports from asset inspections and assessments',
      status: 'active',
      category: 'asset',
      totalEntries: 89,
    }
  ];

  const filteredTypes = contentTypes.filter(t => 
    t.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'draft': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
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
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Architecture • Meta Data</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Schema</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Define the structural blueprints for your enterprise content. Architect flexible data models and content types to support complex asset life cycles.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  Define Type
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Layers size={16} />
                   Library
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Total Types', value: '42', color: 'text-blue-400' },
                 { label: 'Active', value: '38', color: 'text-emerald-400' },
                 { label: 'Fields', value: '412', color: 'text-indigo-400' },
                 { label: 'Templates', value: '14', color: 'text-amber-400' },
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
            placeholder="Search schemas, display names, or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Categories
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button className="p-3 text-slate-400 hover:text-blue-600 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* 📊 Premium Content with Navigation */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-8">
           <button 
             onClick={() => setTabValue(0)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 0 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Definition
             {tabValue === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>}
           </button>
           <button 
             onClick={() => setTabValue(1)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 1 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Usage Stats
             {tabValue === 1 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>}
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Content Schema</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Entries</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Identifier</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTypes.map((type) => (
                <tr key={type.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-blue-100">
                         <Database size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{type.displayName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{type.category} Structure</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(type.status)}`}>
                      {type.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-sm font-black text-slate-600">{type.totalEntries.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <code className="text-[10px] px-2 py-1 bg-slate-100 rounded-lg text-slate-500 font-mono font-bold">
                       {type.name}
                    </code>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-300">
                       <button className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                         <Code size={18} />
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

        {/* 📑 Premium Pagination */}
        <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Schema Governance • Monitoring {filteredTypes.length} structural definitions
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

export default ContentTypesPage;