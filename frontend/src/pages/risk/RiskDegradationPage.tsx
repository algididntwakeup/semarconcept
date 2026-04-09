// platform/frontend-mui/src/pages/risk/RiskDegradationPage.tsx
import React, { useState } from 'react';
import { 
  TrendingDown, 
  ShieldAlert, 
  AlertTriangle,
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
  TrendingUp,
  Clock,
  Droplets,
  Wrench,
  Thermometer,
  Zap as Electrical,
  Waves,
  FlaskConical,
  Microscope,
  Box as BoxIcon,
  Download,
  BarChart3,
  Edit,
  Trash2,
  FileText,
  RefreshCcw
} from 'lucide-react';

const RiskDegradationPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const keyStats = [
    { label: 'Total Modes', value: '24', color: 'blue', icon: Activity },
    { label: 'Critical Severity', value: '03', color: 'rose', icon: Flame },
    { label: 'High Risk Items', value: '08', color: 'orange', icon: AlertTriangle },
    { label: 'Active Monitored', value: '15', color: 'emerald', icon: ShieldCheck },
  ];

  const mechanisms = [
    { id: '1', name: 'Uniform Corrosion', category: 'Corrosion', severity: 'medium', riskScore: 6.8, likelihood: 75, status: 'active', affected: 45 },
    { id: '2', name: 'Fatigue Cracking', category: 'Mechanical', severity: 'high', riskScore: 7.5, likelihood: 60, status: 'monitored', affected: 23 },
    { id: '3', name: 'Thermal Cycling', category: 'Thermal', severity: 'medium', riskScore: 5.2, likelihood: 80, status: 'active', affected: 18 },
    { id: '4', name: 'Erosion-Corrosion', category: 'Flow', severity: 'high', riskScore: 7.8, likelihood: 65, status: 'active', affected: 31 },
    { id: '5', name: 'Stress Cracking', category: 'Environmental', severity: 'critical', riskScore: 8.9, likelihood: 40, status: 'monitored', affected: 12 },
  ];

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-rose-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Integrity • Material Decay Intelligence</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Degradation <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-300">Forensics</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Map and analyze insidious material degradation pathways. Utilize predictive kinetics and empirical failure models to anticipate structural aging before it reaches clinical criticality.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-sans font-black">
                  <Flame size={16} strokeWidth={3} />
                  Simulate Decay
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 font-sans font-black">
                  <Target size={16} />
                   Critical Map
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Integrity Index', value: 'High', color: 'text-emerald-400' },
                 { label: 'Active Decay', value: '12%', color: 'text-amber-400' },
                 { label: 'Risk Factor', value: 'Moderate', color: 'text-indigo-400' },
                 { label: 'Overdue', value: '00', color: 'text-rose-400' },
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

      {/* 📊 Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyStats.map((s, i) => (
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
             <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">Historical Context</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              {['All Mechanisms', 'Critical & High', 'Monitoring Plan', 'Kinetics Analytics'].map((tab, i) => (
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
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mechanism Flow</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vector</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Severity</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Decay Score</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Population</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {mechanisms.map(m => (
                       <tr key={m.id} className="group hover:bg-slate-50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getSeverityClasses(m.severity)}`}>
                                   <Zap size={18} />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-800 leading-none mb-1">{m.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{m.status}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="px-2 py-1 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded-lg border border-slate-200">
                                {m.category}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getSeverityClasses(m.severity)} shadow-sm`}>
                                {m.severity}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex flex-col items-end">
                                <span className={`text-sm font-black ${m.riskScore >= 7 ? 'text-rose-500' : 'text-indigo-500'}`}>{m.riskScore}</span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                   <div className={`h-full bg-rose-500`} style={{ width: `${(m.riskScore/10)*100}%` }}></div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-400 text-xs">
                             {m.affected} Units
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-slate-300 hover:text-indigo-600 bg-white border border-slate-100 rounded-lg shadow-sm"><Eye size={16}/></button>
                                <button className="p-2 text-slate-300 hover:text-rose-600 bg-white border border-slate-100 rounded-lg shadow-sm"><Trash2 size={16}/></button>
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
         <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-premium group">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
               <Activity size={16} className="text-indigo-500" />
               Kinetic Decay Model
            </h4>
            <div className="aspect-video bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent group-hover:scale-150 transition-transform duration-1000"></div>
               <Activity size={48} className="text-indigo-200 mb-4 animate-pulse" strokeWidth={1.5} />
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Real-time Kinematics Feed</p>
               <p className="text-[10px] text-slate-400 mt-1">Modeling degradation velocity across asset populations...</p>
            </div>
         </div>

         <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
               <ShieldCheck size={180} />
            </div>
            <h4 className="text-lg font-black mb-2 tracking-tight">Mitigation Node</h4>
            <div className="mb-8">
               <p className="text-indigo-100 text-xs opacity-70 mb-4 font-black uppercase tracking-widest">Structural Integrity Confidence</p>
               <div className="flex border-4 border-white/20 rounded-[2.5rem] p-4 bg-white/5 items-center justify-center">
                  <span className="text-5xl font-black">94.2%</span>
               </div>
            </div>
            <div className="space-y-4">
               {[
                 { label: 'Surface Stability', val: 98 },
                 { label: 'Fracture Toughness', val: 89 },
               ].map((b, i) => (
                  <div key={i}>
                     <div className="flex justify-between text-[10px] font-black uppercase mb-1 tracking-widest">
                        <span>{b.label}</span>
                        <span>{b.val}%</span>
                     </div>
                     <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-300" style={{ width: `${b.val}%` }}></div>
                     </div>
                  </div>
               ))}
               <button className="w-full py-4 mt-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Export Forensic Matrix</button>
            </div>
         </div>
      </div>
    </div>
  );
};


export default RiskDegradationPage;