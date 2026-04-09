// platform/frontend-mui/src/pages/analytics/AnalyticsCompliancePage.tsx
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Gavel, 
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
  FileCheck, 
  ShieldAlert, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Award,
  Clock
} from 'lucide-react';

const AnalyticsCompliancePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const complianceMetrics = [
    { label: 'Overall Index', value: '94.2%', color: 'emerald', icon: ShieldCheck, change: '+2.1%', trend: 'up' },
    { label: 'Req Count', value: '456', color: 'blue', icon: FileCheck, change: '100%', trend: 'up' },
    { label: 'Active Audits', value: '05', color: 'indigo', icon: Scale, change: 'Next: 12d', trend: 'up' },
    { label: 'Deficiencies', value: '09', color: 'rose', icon: ShieldAlert, change: '-4', trend: 'down' },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'rose': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Governance • Regulatory Intelligence</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Compliance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-300">Sanctuary</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Navigate the complex landscape of industrial regulations. Automate standard mappings, monitor real-time audit readiness, and maintain a bulletproof compliance posture across your global operations.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-sans">
                  <FileCheck size={16} strokeWidth={3} />
                  Initiate Audit
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 font-sans">
                  <Award size={16} />
                   Certifications
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Audit Grade', value: 'A+', color: 'text-emerald-400' },
                 { label: 'Pass Rate', value: '98%', color: 'text-blue-400' },
                 { label: 'Open Gaps', value: '02', color: 'text-rose-400' },
                 { label: 'Confidence', value: 'High', color: 'text-indigo-400' },
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
        {complianceMetrics.map((m, i) => (
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
             <div className="flex items-center gap-1">
                {m.trend === 'up' ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-rose-500" />}
                <span className={`text-[10px] font-bold ${m.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>{m.change} Index</span>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              {['Standards Tracker', 'Audit Lifecycle', 'Requirement Flow', 'Risk Gaps'].map((tab, i) => (
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
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                 <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 min-h-[400px] flex flex-col justify-center items-center text-center group relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent group-hover:scale-150 transition-transform duration-1000"></div>
                    <Scale size={48} className="text-indigo-200 mb-4 animate-in zoom-in duration-700" strokeWidth={1.5} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compliance Equilibrium Discovery</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed">Mapping cross-regulatory requirement threads and verifying audit integrity paths...</p>
                 </div>

                 <div className="glass-card p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Gavel size={16} className="text-indigo-500" />
                       Standard Proficiency
                    </h4>
                    <div className="space-y-6">
                       {[
                          { name: 'ISO 9001 Quality', rate: 96, status: 'Stable' },
                          { name: 'API Critical Integrity', rate: 89, status: 'Action' },
                          { name: 'Environmental 14001', rate: 94, status: 'Stable' },
                       ].map((s, i) => (
                          <div key={i} className="group">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{s.name}</span>
                                <div className="flex items-center gap-4">
                                   <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${s.status === 'Stable' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{s.status}</span>
                                   <span className="text-[10px] font-black text-indigo-600">{s.rate}%</span>
                                </div>
                             </div>
                             <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                <div className={`h-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors rounded-full`} style={{ width: `${s.rate}%` }}></div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                      <ShieldCheck size={180} />
                    </div>
                    <h4 className="text-lg font-black mb-2 tracking-tight leading-tight">Regulatory Shield</h4>
                    <p className="text-indigo-100 text-[10px] leading-relaxed mb-6 opacity-80 uppercase font-black tracking-widest">Global Integrity Status</p>
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/20 mb-6 font-sans">
                       <div className="text-3xl font-black">100%</div>
                       <div className="h-10 w-px bg-white/20"></div>
                       <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest text-left">Audit Readiness Baseline</div>
                    </div>
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">Download GRC Matrix</button>
                 </div>

                 <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Upcoming Milestones</h4>
                    <div className="space-y-5">
                       {[
                          { event: 'Safety Audit Flow', date: 'Feb 28', priority: 'High', color: 'rose' },
                          { event: 'ISO Surveillance', date: 'Mar 15', priority: 'Med', color: 'indigo' },
                       ].map((m, i) => (
                          <div key={i} className="flex gap-4 items-center">
                             <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border ${getColorClasses(m.color)}`}>
                                <span className="text-[10px] font-black">{m.date.split(' ')[1]}</span>
                                <span className="text-[8px] font-bold uppercase opacity-60 font-sans">{m.date.split(' ')[0]}</span>
                             </div>
                             <div className="flex-1">
                                <p className="text-xs font-black text-slate-800 leading-none mb-1">{m.event}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.priority} Relevance</p>
                             </div>
                             <button className="p-2 text-slate-200 hover:text-indigo-600"><Search size={16}/></button>
                          </div>
                       ))}
                       <button className="w-full mt-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">View Compliance Map</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCompliancePage;