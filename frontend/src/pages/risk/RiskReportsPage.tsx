// platform/frontend-mui/src/pages/risk/RiskReportsPage.tsx
import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Activity, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  Layout,
  MoreVertical,
  Flame,
  ShieldCheck,
  Eye,
  TrendingDown,
  Clock,
  Download,
  Share2,
  Printer,
  FileSpreadsheet,
  FileJson,
  Calendar,
  AlertTriangle,
  RefreshCcw,
  Star
} from 'lucide-react';

const RiskReportsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const reportStats = [
    { label: 'Total Reports', value: '128', color: 'blue', icon: FileText },
    { label: 'Finalized', value: '42', color: 'emerald', icon: ShieldCheck },
    { label: 'Archived', value: '86', color: 'rose', icon: HistoryIcon },
    { label: 'This Month', value: '12', color: 'indigo', icon: Calendar },
  ];

  const reports = [
    { id: '1', title: 'Q1 2025 Risk Assessment', type: 'Risk Assessment', date: 'Apr 01', status: 'Final', priority: 'High', size: '2.4MB' },
    { id: '2', title: 'Pipeline Integrity Analysis', type: 'Integrity Analysis', date: 'Mar 28', status: 'Approved', priority: 'Critical', size: '5.7MB' },
    { id: '3', title: 'Risk Trend 2024-2025', type: 'Trend Analysis', date: 'Mar 15', status: 'Final', priority: 'Medium', size: '3.1MB' },
  ];

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Final': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Approved': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Draft': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Intelligence • Document Ecosystem</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Analytical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Vault</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Distill complex risk vectors into actionable intelligence. Archive, distribute, and orchestrate a global repository of forensic integrity reports to drive high-level executive decisioning and regulatory compliance.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-sans font-black">
                  <Plus size={16} strokeWidth={3} />
                  Compile Report
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 font-sans font-black">
                  <Calendar size={16} />
                   Schedule Sync
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Report Load', value: 'High', color: 'text-indigo-400' },
                 { label: 'Archival Rate', value: '98%', color: 'text-emerald-400' },
                 { label: 'Avg Size', value: '3.2MB', color: 'text-blue-400' },
                 { label: 'Latency', value: 'Sub-1s', color: 'text-emerald-400' },
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

      {/* 📊 KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((s, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] shadow-premium hover:shadow-2xl transition-all border border-white/40 group">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{s.value}</h3>
               </div>
               <div className={`p-3 rounded-2xl bg-${s.color}-50 text-${s.color}-600 border border-${s.color}-100 group-hover:scale-110 transition-transform`}>
                  <s.icon size={20} />
               </div>
             </div>
             <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">Historical Intelligence</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              {['Document Library', 'Forensic Sync', 'Automated Hub', 'Blueprints'].map((tab, i) => (
                <button 
                  key={i}
                  onClick={() => setTabValue(i)}
                  className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === i ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                  {tabValue === i && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full"></div>}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pb-4">
               <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 border border-slate-100 rounded-xl"><RefreshCcw size={16} /></button>
            </div>
        </div>

        <div className="p-8">
           <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Artifact</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Commit Date</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {reports.map(r => (
                       <tr key={r.id} className="group hover:bg-slate-50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all`}>
                                   <FileText size={18} />
                                </div>
                                <div className="max-w-[240px]">
                                   <p className="text-sm font-black text-slate-800 leading-none mb-1 truncate">{r.title}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{r.type}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="px-2 py-1 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded-lg border border-slate-200">
                                {r.type}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusClasses(r.status)} shadow-sm`}>
                                {r.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right text-xs font-black text-slate-700">
                             {r.date}, 2025
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-400 text-xs">
                             {r.size}
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-slate-300 hover:text-indigo-600 bg-white border border-slate-100 rounded-lg shadow-sm"><Download size={16}/></button>
                                <button className="p-2 text-slate-300 hover:text-blue-600 bg-white border border-slate-100 rounded-lg shadow-sm"><Share2 size={16}/></button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-premium">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
               <Star size={16} className="text-yellow-500 fill-yellow-500" />
               Pinned Intelligence
            </h4>
            <div className="space-y-4">
               {[
                 { label: '2024 Integrity Master', type: 'Annual Audit' },
                 { label: 'Structural Decay Matrix', type: 'Specialized' },
               ].map((p, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group cursor-pointer hover:bg-white hover:shadow-lg transition-all">
                     <div>
                        <p className="text-xs font-black text-slate-800 leading-none mb-1">{p.label}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.type}</p>
                     </div>
                     <button className="p-2 text-slate-200 hover:text-indigo-600"><Eye size={16}/></button>
                  </div>
               ))}
            </div>
         </div>

         <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Printer size={180} />
            </div>
            <h4 className="text-lg font-black mb-1 tracking-tight">Rapid Print Engine</h4>
            <p className="text-indigo-100 text-[10px] leading-relaxed mb-8 opacity-70 uppercase font-black tracking-widest">Zero-Latency Document Generation</p>
            <div className="grid grid-cols-2 gap-4 mb-8 font-sans">
               <button className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex flex-col items-center gap-2 transition-all group/btn">
                  <FileSpreadsheet className="group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Excel Matrix</span>
               </button>
               <button className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex flex-col items-center gap-2 transition-all group/btn">
                  <FileJson className="group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">JSON Pulse</span>
               </button>
            </div>
            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Trigger Global Sync</button>
         </div>
      </div>
    </div>
  );
};

const HistoryIcon = Clock;

export default RiskReportsPage;