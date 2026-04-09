// platform/frontend-mui/src/pages/analytics/AnalyticsPerformancePage.tsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
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
  Maximize2,
  Gauge,
  Timer,
  ShieldCheck,
  Award
} from 'lucide-react';

const AnalyticsPerformancePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const keyMetrics = [
    { title: 'OEE Status', value: '87.2%', change: '+2.1%', trend: 'up', color: 'indigo' },
    { title: 'Availability', value: '94.8%', change: '-0.5%', trend: 'down', color: 'emerald' },
    { title: 'MTBF Rate', value: '720h', change: '+45h', trend: 'up', color: 'blue' },
    { title: 'Perf Score', value: '91.9', change: '+1.3', trend: 'up', color: 'purple' },
  ];

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'indigo': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Efficiency • Performance Benchmarking</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Intelligence</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Architect high-performance asset ecosystems. Analyze OEE, availability, and reliability using advanced deterministic models and comparative organizational benchmarks.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Maximize2 size={16} strokeWidth={3} />
                  Performance Audit
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Target size={16} />
                   Benchmarks
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'System OEE', value: '87.2%', color: 'text-blue-400' },
                 { label: 'Uptime', value: '99.9%', color: 'text-emerald-400' },
                 { label: 'Active Tasks', value: '24', color: 'text-indigo-400' },
                 { label: 'Variance', value: '-0.3%', color: 'text-amber-400' },
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
        {keyMetrics.map((kpi, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] shadow-premium hover:shadow-2xl transition-all border border-white/40">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</p>
               <div className={`p-1.5 rounded-lg ${getStatusColor(kpi.color)} shadow-sm`}>
                  {kpi.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
               </div>
            </div>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-slate-800 tracking-tight">{kpi.value}</h3>
               <span className={`text-[10px] font-bold ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {kpi.change}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* 🛠️ Modern Tabs & Analytics Container */}
      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              <button 
                onClick={() => setTabValue(0)}
                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 0 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Trend Analysis
                {tabValue === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>}
              </button>
              <button 
                onClick={() => setTabValue(1)}
                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 1 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Benchmarking
                {tabValue === 1 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>}
              </button>
            </div>
            <div className="flex gap-2 pb-4">
               <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><RefreshCcw size={16} /></button>
               <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Download size={16} /></button>
            </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 min-h-[400px] flex flex-col justify-center items-center text-center group">
                  <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Activity size={32} className="text-blue-500" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Real-time Performance Fabric</p>
                  <p className="text-slate-400 text-[10px] mt-1 max-w-xs">Initializing high-fidelity time-series visualization...</p>
               </div>
            </div>
            <div className="space-y-6">
               <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Award size={140} />
                  </div>
                  <h4 className="text-lg font-black mb-2 relative z-10">World-Class Rating</h4>
                  <p className="text-indigo-100 text-sm mb-6 relative z-10 opacity-80 leading-relaxed">Your organization is currently performing in the 92nd percentile of industry peers.</p>
                  <button className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 shadow-lg hover:bg-slate-50">Compare Data</button>
               </div>
               <div className="glass-card p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Critical Thresholds</h4>
                  <div className="space-y-4">
                    {[
                      { metric: 'Availability Delta', value: '-0.5%', status: 'Warning', color: 'amber' },
                      { metric: 'MTTR Efficiency', value: '+3.2%', status: 'Healthy', color: 'emerald' },
                      { metric: 'Quality Variance', value: '0.01%', status: 'Normal', color: 'blue' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className={`w-2 h-2 rounded-full bg-${m.color}-500 shadow-sm`}></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-700 leading-none">{m.metric}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{m.status} • {m.value}</p>
                        </div>
                        <button className="text-slate-300 hover:text-slate-600"><ChevronRight size={14} /></button>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPerformancePage;