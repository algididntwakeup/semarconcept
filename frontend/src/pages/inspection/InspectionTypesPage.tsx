// platform/frontend-mui/src/pages/inspection/InspectionTypesPage.tsx
import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
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
  Activity,
  Layers,
  ShieldCheck,
  Wrench,
  Eye
} from 'lucide-react';

const InspectionTypesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const inspectionTypes = [
    {
      id: 'TYPE-001',
      name: 'Visual Inspection',
      description: 'External visual examination of equipment condition',
      category: 'Non-Destructive',
      frequency: 'Monthly',
      standardDuration: 2,
      requiredCertification: 'API 510',
      isActive: true,
      usageCount: 245,
    },
    {
      id: 'TYPE-002',
      name: 'NDT Inspection',
      description: 'Non-destructive testing including UT, RT, MT, PT',
      category: 'Non-Destructive',
      frequency: 'Annually',
      standardDuration: 8,
      requiredCertification: 'ASNT Level II',
      isActive: true,
      usageCount: 89,
    },
    {
      id: 'TYPE-003',
      name: 'Pressure Test',
      description: 'Hydrostatic or pneumatic pressure testing',
      category: 'Destructive',
      frequency: 'Every 5 years',
      standardDuration: 6,
      requiredCertification: 'API 570',
      isActive: true,
      usageCount: 34,
    }
  ];

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'Non-Destructive': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Destructive': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Operational': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol • Definition Library</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Inspection <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Taxonomy</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Define and standardize inspection methodologies. Organize and categorize structural, functional, and specialized validation protocols across the enterprise.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  New Methodology
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Wrench size={16} />
                   Tools & Gear
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Total Definitions', value: '18', color: 'text-cyan-400' },
                 { label: 'Standardized', value: '100%', color: 'text-emerald-400' },
                 { label: 'Certifications', value: '12', color: 'text-blue-400' },
                 { label: 'Usage Global', value: '4.2k', color: 'text-indigo-400' },
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

      {/* 📊 High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Types', value: '18', icon: Activity, color: 'text-cyan-600' },
          { label: 'Active Types', value: '15', icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Non-Destructive', value: '12', icon: Layers, color: 'text-blue-600' },
          { label: 'Avg Duration', value: '4.2h', icon: Clock, color: 'text-indigo-600' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] shadow-premium hover:shadow-2xl transition-all border border-white/40">
             <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
               </div>
               <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color}`}>
                  <stat.icon size={20} />
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* 🛠️ Modern Toolbar */}
      <section className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search methodologies, categories, or certifications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Taxonomy
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button className="p-3 text-slate-400 hover:text-cyan-600 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* 📑 Premium Content Table */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type Name & Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Frequency</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Standard Time</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inspectionTypes.map((type) => (
                <tr key={type.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-cyan-100">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{type.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate tracking-wider">{type.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getCategoryStyle(type.category)}`}>
                      {type.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{type.frequency}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col items-end">
                       <span className="text-sm font-black text-slate-700">{type.standardDuration} Hours</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Effort Estimate</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-300">
                       <button className="p-2 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all">
                         <Eye size={18} />
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
             Methodology Governance • Maintaining high-fidelity protocols
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-cyan-600">01</span>
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

export default InspectionTypesPage;