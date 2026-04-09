// platform/frontend-mui/src/pages/compliance/ComplianceStandardsPage.tsx
import React, { useState } from 'react';
import { 
  ShieldCheck, 
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
  CheckCircle2,
  AlertTriangle,
  Zap,
  MoreVertical,
  Scale,
  Globe,
  Activity,
  Award,
  BookOpen
} from 'lucide-react';

interface ComplianceStandard {
  id: string;
  name: string;
  code: string;
  organization: string;
  category: string;
  status: 'Active' | 'Pending' | 'Suspended' | 'Obsolete';
  complianceScore: number;
}

const ComplianceStandardsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const standards: ComplianceStandard[] = [
    {
      id: 'STD001',
      name: 'ISO 45001 - Occupational Health and Safety',
      code: 'ISO 45001:2018',
      organization: 'ISO',
      category: 'Safety',
      status: 'Active',
      complianceScore: 92,
    },
    {
      id: 'STD002',
      name: 'ISO 14001 - Environmental Management',
      code: 'ISO 14001:2015',
      organization: 'ISO',
      category: 'Environmental',
      status: 'Active',
      complianceScore: 88,
    }
  ];

  const filteredStandards = standards.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Regulatory • Global Frameworks</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Standard <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Authority</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Manage and monitor global regulatory frameworks and internal standards. Align operations with industry benchmarks to ensure continuous legal compliance.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  Record Standard
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Globe size={16} />
                   Frameworks
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Total Standards', value: '24', color: 'text-purple-400' },
                 { label: 'Compliance Level', value: '91%', color: 'text-emerald-400' },
                 { label: 'Active Audits', value: '08', color: 'text-indigo-400' },
                 { label: 'Risk Factor', value: 'Low', color: 'text-blue-400' },
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
            placeholder="Search standards, codes, or issuing bodies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Categories
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button className="p-3 text-slate-400 hover:text-purple-600 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* 📑 Premium Content with Navigation */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-8">
           <button 
             onClick={() => setTabValue(0)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 0 ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Framework
             {tabValue === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-full"></div>}
           </button>
           <button 
             onClick={() => setTabValue(1)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 1 ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Requirements
             {tabValue === 1 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-full"></div>}
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Name & Authority</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Compliance</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Reference Code</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStandards.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-purple-100">
                        <Scale size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{std.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{std.organization} • {std.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(std.status)}`}>
                      {std.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center">
                       <span className="text-sm font-black text-slate-600">{std.complianceScore}%</span>
                       <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${std.complianceScore}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <code className="text-[10px] px-2 py-1 bg-slate-100 rounded-lg text-slate-500 font-mono font-bold">
                       {std.code}
                    </code>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-300">
                       <button className="p-2 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                         <BookOpen size={18} />
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
             Legislative Governance • Monitoring {filteredStandards.length} regulatory frameworks
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-purple-600">01</span>
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

export default ComplianceStandardsPage;