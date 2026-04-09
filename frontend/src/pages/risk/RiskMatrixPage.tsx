// platform/frontend-mui/src/pages/risk/RiskMatrixPage.tsx
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
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
  TrendingUp,
  User as UserIcon,
  Clock,
  Info,
  Maximize2
} from 'lucide-react';

const RiskMatrixPage: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<any>(null);

  const probabilityLevels = [
    { level: 5, label: 'Very High' },
    { level: 4, label: 'High' },
    { level: 3, label: 'Medium' },
    { level: 2, label: 'Low' },
    { level: 1, label: 'Very Low' }
  ];

  const consequenceLevels = [
    { level: 1, label: 'Negligible' },
    { level: 2, label: 'Minor' },
    { level: 3, label: 'Moderate' },
    { level: 4, label: 'Major' },
    { level: 5, label: 'Catastrophic' }
  ];

  const risks = [
    { id: 'RISK-001', title: 'Corrosion under insulation', asset: 'Pump A-101', probability: 4, consequence: 5, riskScore: 20, level: 'Critical', status: 'Open' },
    { id: 'RISK-002', title: 'Pressure relief valve failure', asset: 'Tank B-205', probability: 2, consequence: 5, riskScore: 10, level: 'High', status: 'Mitigating' },
    { id: 'RISK-003', title: 'Pump bearing wear', asset: 'Pump C-301', probability: 3, consequence: 2, riskScore: 6, level: 'Medium', status: 'Monitoring' },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 15) return 'bg-rose-500/10 text-rose-600 border-rose-200';
    if (score >= 10) return 'bg-orange-500/10 text-orange-600 border-orange-200';
    if (score >= 6) return 'bg-amber-500/10 text-amber-600 border-amber-200';
    if (score >= 3) return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    return 'bg-blue-500/10 text-blue-600 border-blue-200';
  };

  const matrixStats = [
    { label: 'Critical Risks', value: '03', color: 'rose', icon: Flame },
    { label: 'High Priority', value: '12', color: 'orange', icon: AlertTriangle },
    { label: 'Exposure Index', value: '92.4', color: 'indigo', icon: Target },
    { label: 'Mitigated', value: '88%', color: 'emerald', icon: ShieldCheck },
  ];

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
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Risk • 5x5 Matrix Analysis</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Integrity <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Determinants</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Map operational vulnerabilities with deterministic precision. Correlate probability vs. consequence vectors to architect a resilient, risk-neutral asset ecosystem.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-sans">
                  <Plus size={16} strokeWidth={3} />
                  Identify Risk
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 font-sans">
                  <Maximize2 size={16} />
                   Matrix View
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Stability Index', value: 'High', color: 'text-emerald-400' },
                 { label: 'Open Critical', value: '03', color: 'text-rose-400' },
                 { label: 'Forecast', value: 'Secure', color: 'text-blue-400' },
                 { label: 'Latency', value: 'Optimal', color: 'text-indigo-400' },
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

      {/* 📊 Matrix Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {matrixStats.map((s, i) => (
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
             <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">Operational Baseline</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
           <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-premium overflow-hidden font-sans">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   <Layout size={16} className="text-rose-500" />
                   Multi-Dimensional Matrix
                 </h3>
                 <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl border border-slate-100"><Filter size={16}/></button>
                 </div>
              </div>

              <div className="overflow-x-auto pb-4">
                 <table className="w-full border-separate border-spacing-2">
                    <thead>
                       <tr>
                          <th className="w-24 p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Prob \ Cons</th>
                          {consequenceLevels.map(c => (
                             <th key={c.level} className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center bg-slate-50/50 rounded-xl border border-slate-100">{c.label}</th>
                          ))}
                       </tr>
                    </thead>
                    <tbody className="font-sans">
                       {probabilityLevels.map(p => (
                          <tr key={p.level}>
                             <td className="p-4 text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-50/50 rounded-xl border border-slate-100">{p.label}</td>
                             {[1,2,3,4,5].map(c => {
                                const score = p.level * c;
                                const cellRisks = risks.filter(r => r.probability === p.level && r.consequence === c);
                                return (
                                   <td key={c} className={`p-4 h-24 min-w-[120px] rounded-[1.2rem] border relative group transition-all cursor-pointer hover:scale-[1.02] ${getRiskColor(score)}`}>
                                      <span className="absolute top-2 right-2 text-[8px] font-black opacity-40">{score}</span>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                         {cellRisks.map(r => (
                                            <div key={r.id} className="px-1.5 py-0.5 bg-white/50 backdrop-blur-sm rounded-md border border-white/50 text-[8px] font-black uppercase tracking-tighter">
                                               {r.id.split('-')[1]}
                                            </div>
                                         ))}
                                      </div>
                                   </td>
                                );
                             })}
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                 {[
                   { label: 'Critical', color: 'rose' },
                   { label: 'High', color: 'orange' },
                   { label: 'Medium', color: 'amber' },
                   { label: 'Low', color: 'emerald' },
                   { label: 'Very Low', color: 'blue' },
                 ].map(l => (
                    <div key={l.label} className="flex items-center gap-2">
                       <div className={`w-3 h-3 rounded-full bg-${l.color}-500`}></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l.label}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-premium">
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <ShieldAlert size={16} className="text-rose-500" />
                 Elevated Items
              </h4>
              <div className="space-y-4">
                 {risks.map((risk, i) => (
                    <div key={i} className="group p-4 bg-slate-50/50 rounded-[1.8rem] border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getRiskColor(risk.riskScore)}`}>
                             {risk.level}
                          </span>
                          <span className="text-[10px] font-black text-slate-400">{risk.id}</span>
                       </div>
                       <p className="text-xs font-black text-slate-800 leading-tight mb-2 group-hover:text-rose-600 transition-colors">{risk.title}</p>
                       <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{risk.asset}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {risk.status}</span>
                       </div>
                    </div>
                 ))}
                 <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">View Full Registry</button>
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <ShieldCheck size={140} />
              </div>
              <h4 className="text-lg font-black mb-2 tracking-tight">Strategy Node</h4>
              <p className="text-indigo-100 text-[10px] leading-relaxed mb-6 opacity-70 uppercase font-black tracking-widest">Global Risk Posture</p>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20 mb-6 flex flex-col items-center">
                 <span className="text-3xl font-black">Secure</span>
                 <span className="text-[9px] font-bold text-indigo-200 uppercase mt-1">Operational Confidence Index</span>
              </div>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all font-sans">Run Simulation</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrixPage;