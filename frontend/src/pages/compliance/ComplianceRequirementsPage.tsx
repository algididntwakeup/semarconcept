// platform/frontend-mui/src/pages/compliance/ComplianceRequirementsPage.tsx
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Plus, 
  RefreshCcw,
  Eye,
  Clock,
  Timer,
  GanttChart
} from 'lucide-react';

const ComplianceRequirementsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const complianceStats = [
    { label: 'Total Mandates', value: '42', color: 'blue', icon: BookOpen },
    { label: 'Active Coverage', value: '100%', color: 'emerald', icon: ShieldCheck },
    { label: 'Pending Review', value: '03', color: 'rose', icon: Clock },
    { label: 'Next Deadline', value: '12d', color: 'indigo', icon: Timer },
  ];

  const requirements = [
    { id: '1', name: 'API 510 Pressure Vessel', agency: 'API', status: 'Compliant', criticality: 'High', date: '2025-06-15' },
    { id: '2', name: 'ASME Section VIII', agency: 'ASME', status: 'Warning', criticality: 'Critical', date: '2025-05-20' },
    { id: '3', name: 'ISO 9001:2015', agency: 'ISO', status: 'Compliant', criticality: 'Medium', date: '2025-09-10' },
  ];

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Compliant': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Warning': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Non-Compliant': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Regulatory • Governance Framework</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Compliance <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Mandates</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Navigate the global regulatory landscape with precision. Monitor statutory requirements, orchestrate adherence protocols, and maintain a bulletproof audit trail for all high-criticality industrial standards.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-sans font-black">
                  <Plus size={16} strokeWidth={3} />
                  New Requirement
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 font-sans font-black">
                  <GanttChart size={16} />
                   Audit Timeline
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Adherence', value: '100%', color: 'text-emerald-400' },
                 { label: 'Active Norms', value: '42', color: 'text-teal-400' },
                 { label: 'Risk Factor', value: 'Low', color: 'text-blue-400' },
                 { label: 'Drift Rate', value: '0.0%', color: 'text-emerald-400' },
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
        {complianceStats.map((s, i) => (
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
             <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">Compliance Pulse</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              {['Active Mandates', 'Upcoming Audits', 'Standard Library', 'Deviation Log'].map((tab, i) => (
                <button 
                  key={i}
                  onClick={() => setTabValue(i)}
                  className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === i ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                  {tabValue === i && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"></div>}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pb-4">
               <button className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 border border-slate-100 rounded-xl"><RefreshCcw size={16} /></button>
            </div>
        </div>

        <div className="p-8">
           <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mandate Context</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Criticality</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Target Date</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol Status</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {requirements.map(r => (
                       <tr key={r.id} className="group hover:bg-slate-50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getStatusClasses(r.status)}`}>
                                   <ShieldCheck size={18} />
                                </div>
                                <div className="max-w-[200px]">
                                   <p className="text-sm font-black text-slate-800 leading-none mb-1 truncate">{r.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reg #COMP-{r.id}00</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="px-2 py-1 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded-lg border border-slate-200">
                                {r.agency}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-center px-8 text-[10px] font-black text-slate-600 uppercase">
                             {r.criticality}
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-700 text-xs">
                             {r.date}
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusClasses(r.status)} shadow-sm`}>
                                {r.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2 text-slate-300 hover:text-emerald-600 bg-white border border-slate-100 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"><Eye size={16}/></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceRequirementsPage;
