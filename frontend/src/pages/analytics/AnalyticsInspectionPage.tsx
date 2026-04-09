// platform/frontend-mui/src/pages/analytics/AnalyticsInspectionPage.tsx
import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  RefreshCcw, 
  Download, 
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MoreVertical,
  Activity,
  Award,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Eye,
  PieChart as PieChartIcon
} from 'lucide-react';

const AnalyticsInspectionPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const inspectionMetrics = [
    { label: 'Total Volume', value: '1,247', color: 'blue', icon: Activity, change: '+12%', trend: 'up' },
    { label: 'Completion', value: '89', color: 'emerald', icon: CheckCircle2, change: '+4.2%', trend: 'up' },
    { label: 'Avg Lead Time', value: '4.2d', color: 'indigo', icon: Clock, change: '-0.5d', trend: 'down' },
    { label: 'Overdue', value: '23', color: 'rose', icon: AlertTriangle, change: '-5', trend: 'down' },
    { label: 'Compliance', value: '94.5%', color: 'purple', icon: ShieldCheck, change: '+2.1%', trend: 'up' },
    { label: 'Unit Cost', value: '$1.2k', color: 'amber', icon: Zap, change: '-8.0%', trend: 'down' },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'rose': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'amber': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol • Execution Analytics</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Inspection <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Resilience</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Monitor and optimize inspection lifecycle performance. Correlate field execution data with regulatory requirements to drive structural integrity and operational uptime.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <BarChart3 size={16} strokeWidth={3} />
                  Performance Feed
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Download size={16} />
                   Audit Export
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Resilience Index', value: 'High', color: 'text-indigo-400' },
                 { label: 'Completion', value: '94%', color: 'text-emerald-400' },
                 { label: 'Deviation', value: '-2%', color: 'text-amber-400' },
                 { label: 'Velocity', value: 'Optimal', color: 'text-blue-400' },
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

      {/* 📊 Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {inspectionMetrics.map((m, i) => (
          <div key={i} className="glass-card p-4 rounded-[1.8rem] shadow-premium hover:shadow-2xl transition-all border border-white/40 group">
             <div className="flex justify-between items-start mb-2">
               <div className={`p-2 rounded-xl ${getColorClasses(m.color)} group-hover:scale-110 transition-transform`}>
                  <m.icon size={16} />
               </div>
               <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${m.trend === 'up' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-blue-600 border-blue-100 bg-blue-50'}`}>
                 {m.change}
               </span>
             </div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
             <h3 className="text-xl font-black text-slate-800 tracking-tight">{m.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-premium">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   <Activity size={16} className="text-indigo-500" />
                   Temporal Flux Analysis
                 </h3>
                 <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button className="px-3 py-1.5 bg-white text-[9px] font-black uppercase text-indigo-600 rounded-lg shadow-sm">Volume</button>
                    <button className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 rounded-lg transition-all">Latency</button>
                 </div>
              </div>
              <div className="aspect-video bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent"></div>
                 <Activity size={48} className="text-indigo-200 mb-4 animate-in zoom-in duration-1000" strokeWidth={1.5} />
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Protocol Dynamics Visualization</p>
                 <p className="text-[10px] text-slate-400 mt-1">Simulating high-fidelity inspection flow...</p>
              </div>
           </div>

           {/* Completion Rate Table */}
           <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-premium uppercase tracking-widest font-sans">
              <h3 className="text-[10px] font-black text-slate-800 mb-6 flex items-center gap-2">
                 <ShieldCheck size={16} className="text-emerald-500" />
                 Category Proficiency
              </h3>
              <div className="space-y-6">
                 {[
                    { type: 'Visual Inspection', rate: 90.6, count: '145/160' },
                    { type: 'NDT Structural', rate: 91.8, count: '78/85' },
                    { type: 'Functional Test', rate: 92.0, count: '92/100' },
                 ].map((row, i) => (
                    <div key={i} className="group">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-slate-600">{row.type}</span>
                          <span className="text-[10px] font-black text-indigo-600">{row.rate}%</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                          <div className={`h-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors rounded-full`} style={{ width: `${row.rate}%` }}></div>
                       </div>
                       <div className="flex justify-between mt-1 text-[8px] font-bold text-slate-400">
                          <span>Throughput Rate</span>
                          <span>{row.count} Units</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8 text-center sm:text-left">
           <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Award size={160} />
              </div>
              <h4 className="text-lg font-black mb-2 tracking-tight">Compliance Elite</h4>
              <p className="text-indigo-100 text-[10px] leading-relaxed mb-6 opacity-80 uppercase font-black tracking-widest">Facility: Sector-4G Alpha</p>
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/20 mb-6">
                 <div className="text-2xl font-black">94.5%</div>
                 <div className="h-8 w-px bg-white/20"></div>
                 <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest text-left">Regulatory Alignment Index</div>
              </div>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">Verify Credentials</button>
           </div>

           <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-premium">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Execution Anomalies</h4>
              <div className="space-y-4">
                 {[
                    { label: 'Latency Spike', value: '+1.2d', color: 'rose' },
                    { label: 'Accuracy Variance', value: '-0.3%', color: 'amber' },
                 ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 bg-slate-50/20 hover:bg-slate-100/50 transition-colors">
                       <div className={`w-2 h-2 rounded-full bg-${a.color}-500 shadow-sm animate-pulse`}></div>
                       <div className="flex-1 text-left">
                          <p className="text-[10px] font-black text-slate-800 leading-none">{a.label}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Deviation: {a.value}</p>
                       </div>
                       <button className="text-slate-300 hover:text-indigo-600"><ChevronRight size={14} /></button>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Run Diagnostics</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInspectionPage;