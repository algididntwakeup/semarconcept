// platform/frontend-mui/src/pages/analytics/AnalyticsRiskPage.tsx
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  BarChart3, 
  PieChart, 
  RefreshCcw, 
  Download, 
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
  TrendingUp,
  User as UserIcon,
  Clock
} from 'lucide-react';

const AnalyticsRiskPage: React.FC = () => {
  const [riskFilter, setRiskFilter] = useState('all');

  const riskSummary = [
    { label: 'Critical Risks', value: '12', color: 'rose', icon: Flame, description: 'Requires immediate mitigation' },
    { label: 'High Priority', value: '45', color: 'orange', icon: AlertTriangle, description: 'Mitigation within 7 days' },
    { label: 'Medium Level', value: '89', color: 'amber', icon: ShieldAlert, description: 'Continuous monitoring' },
    { label: 'Safety Index', value: '94.2', color: 'emerald', icon: ShieldCheck, description: 'Overall security posture' },
  ];

  const topRisks = [
    {
      id: 'RISK-001',
      asset: 'Pump A-101',
      description: 'Corrosion under insulation',
      level: 'Critical',
      riskScore: 7.2,
      owner: 'John Doe',
      dueDate: '2025-06-15'
    },
    {
      id: 'RISK-002',
      asset: 'Tank B-205',
      description: 'Stress corrosion cracking',
      level: 'High',
      riskScore: 4.8,
      owner: 'Jane Smith',
      dueDate: '2025-06-20'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'rose': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'amber': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-orange-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Risk • Predictive Exposure Model</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Anticipation</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Quantify and mitigate systemic vulnerabilities. Utilize high-fidelity risk matrices and degradation modeling to maintain operational integrity across complex asset networks.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <ShieldAlert size={16} strokeWidth={3} />
                  Run Risk Engine
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Download size={16} />
                   Risk Registry
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Exposure Index', value: 'Low', color: 'text-emerald-400' },
                 { label: 'Mitigated', value: '88%', color: 'text-blue-400' },
                 { label: 'Open Critical', value: '12', color: 'text-rose-400' },
                 { label: 'Forecast', value: 'Stable', color: 'text-indigo-400' },
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

      {/* 📊 Risk Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {riskSummary.map((m, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] shadow-premium hover:shadow-2xl transition-all border border-white/40 group">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{m.value}</h3>
               </div>
               <div className={`p-3 rounded-2xl ${getColorClasses(m.color)} group-hover:scale-110 transition-transform`}>
                  <m.icon size={20} />
               </div>
             </div>
             <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">{m.description}</p>
          </div>
        ))}
      </div>

      {/* 🧩 Matrix & Trends Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-premium">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   <Layout size={16} className="text-rose-500" />
                   Exposure Heat Discovery
                 </h3>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200">Probability</button>
                    <button className="px-4 py-2 bg-rose-600 rounded-xl text-[10px] font-black uppercase text-white shadow-md">Impact</button>
                 </div>
              </div>
              <div className="relative aspect-video bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center p-8 group overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/5 via-transparent to-transparent group-hover:scale-150 transition-transform duration-1000"></div>
                 <ShieldAlert size={48} className="text-rose-200 mb-4 animate-pulse" strokeWidth={1.5} />
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Risk Matrix Simulator</p>
                 <p className="text-[10px] text-slate-400 mt-1">Generating multi-dimensional risk distribution...</p>
              </div>
           </div>

           {/* Top Risk Items Table */}
           <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
              <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Elevated Risk Registry</h3>
                 <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical size={16}/></button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/20 border-b border-slate-50">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset & Context</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Exposure</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Maturity</th>
                          <th className="px-8 py-4"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {topRisks.map(risk => (
                          <tr key={risk.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border ${risk.level === 'Critical' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-orange-50 border-orange-100 text-orange-500'}`}>
                                      <Zap size={18} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-800 leading-none mb-1">{risk.asset}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[180px] tracking-wider">{risk.description}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${risk.level === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                   {risk.level}
                                </span>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <div className="flex flex-col items-center">
                                   <span className="text-sm font-black text-slate-700">{risk.riskScore}</span>
                                   <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                      <div className={`h-full bg-rose-500`} style={{ width: `${(risk.riskScore/10)*100}%` }}></div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <div className="flex flex-col items-end">
                                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{risk.dueDate}</span>
                                   <span className="text-[9px] font-bold text-slate-400 uppercase">Deadline Tracking</span>
                                </div>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><Eye size={18} /></button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-xl relative overflow-hidden group border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"></div>
              <h4 className="text-lg font-black mb-2 relative z-10 tracking-tight">Mitigation Health</h4>
              <p className="text-slate-300 text-xs mb-6 relative z-10 opacity-70 leading-relaxed">System-wide critical risk mitigation velocity is up 14.2% since the previous audit cycle.</p>
              <div className="space-y-4 relative z-10">
                 {[
                   { label: 'Asset Hardening', value: 88, color: 'text-cyan-400' },
                   { label: 'Process Compliance', value: 92, color: 'text-indigo-400' },
                 ].map((bar, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-[10px] font-black uppercase mb-1 tracking-widest">
                          <span className="text-slate-400">{bar.label}</span>
                          <span className={bar.color}>{bar.value}%</span>
                       </div>
                       <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full bg-indigo-500`} style={{ width: `${bar.value}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-premium">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Mitigation Owners</h4>
              <div className="space-y-6">
                 {topRisks.map((risk, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 font-black text-xs">
                          {risk.owner.split(' ').map(n => n[0]).join('')}
                       </div>
                       <div className="flex-1">
                          <p className="text-xs font-black text-slate-800 leading-none mb-1">{risk.owner}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Responsible for {risk.id}</p>
                       </div>
                       <button className="p-2 text-slate-300 hover:text-indigo-600"><Clock size={16} /></button>
                    </div>
                 ))}
                 <button className="w-full py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">Assign Protocol</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsRiskPage;
