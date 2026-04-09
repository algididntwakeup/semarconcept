// platform/frontend-mui/src/pages/compliance/ComplianceTasksPage.tsx
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Plus, 
  RefreshCcw,
  Timer,
  ClipboardCheck,
  ArrowRight,
  ListTodo
} from 'lucide-react';

const ComplianceTasksPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const taskStats = [
    { label: 'Active Tasks', value: '24', color: 'blue', icon: ListTodo },
    { label: 'Completion', value: '88%', color: 'emerald', icon: CheckCircle2 },
    { label: 'At Risk', value: '04', color: 'rose', icon: ClipboardCheck },
    { label: 'Drafted', value: '12', color: 'indigo', icon: ClipboardCheck },
  ];

  const tasks = [
    { id: '1', title: 'Vessel External Audit', type: 'Certification', priority: 'High', status: 'In Progress', progress: 65 },
    { id: '2', title: 'Valve Inspection Protocol', type: 'Mandatory', priority: 'Critical', status: 'Pending', progress: 0 },
    { id: '3', title: 'Q1 Compliance Report', type: 'Administrative', priority: 'Medium', status: 'Completed', progress: 100 },
  ];

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'In Progress': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Pending': return 'text-orange-600 bg-orange-50 border-orange-100';
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
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Execution • Compliance Lifecycle</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Compliance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Workstation</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Operationalize your regulatory strategy. Coordinate multi-stage compliance tasks, track adherence kinetics, and maintain a high-velocity flow of certification activities across the entire asset portfolio.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-sans font-black">
                  <Plus size={16} strokeWidth={3} />
                  Initiate Task
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 font-sans font-black">
                  <Timer size={16} />
                   Fleet Backlog
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Velocity', value: 'High', color: 'text-indigo-400' },
                 { label: 'Active Flow', value: '24', color: 'text-emerald-400' },
                 { label: 'Latency', value: 'Low', color: 'text-blue-400' },
                 { label: 'Capacity', value: '92%', color: 'text-emerald-400' },
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
        {taskStats.map((s, i) => (
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
             <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">Mission Momentum</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              {['Active Workflow', 'Certification Hub', 'Scheduled Flow', 'History'].map((tab, i) => (
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
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Assignment</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progress</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Priority</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Outcome Status</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {tasks.map(t => (
                       <tr key={t.id} className="group hover:bg-slate-50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getStatusClasses(t.status)}`}>
                                   <ClipboardCheck size={18} />
                                </div>
                                <div className="max-w-[200px]">
                                   <p className="text-sm font-black text-slate-800 leading-none mb-1 truncate">{t.title}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Node #{t.id}00</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="px-2 py-1 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded-lg border border-slate-200">
                                {t.type}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <div className="flex flex-col items-center gap-1">
                                <span className={`text-xs font-black ${t.progress === 100 ? 'text-emerald-500' : 'text-indigo-500'}`}>{t.progress}%</span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                   <div className={`h-full ${t.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${t.progress}%` }}></div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-700 text-[10px] uppercase">
                             {t.priority}
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusClasses(t.status)} shadow-sm`}>
                                {t.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2 text-slate-300 hover:text-indigo-600 bg-white border border-slate-100 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"><ArrowRight size={16}/></button>
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

export default ComplianceTasksPage;
