// platform/frontend-mui/src/pages/analytics/AnalyticsDashboardPage.tsx
import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Download, 
  RefreshCcw, 
  Search, 
  Filter, 
  Calendar, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Zap,
  Layout,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Maximize2
} from 'lucide-react';

const AnalyticsDashboardPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const kpis = [
    { title: 'Asset Utilization', value: '87.5%', change: '+5.2%', trend: 'up', color: 'emerald' },
    { title: 'MTBF (Hours)', value: '1,240', change: '+2.8%', trend: 'up', color: 'blue' },
    { title: 'Compliance Score', value: '94.3%', change: '-1.2%', trend: 'down', color: 'amber' },
    { title: 'Risk Exposure', value: '23.7%', change: '-3.5%', trend: 'down', color: 'rose' },
  ];

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
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Analytics • Strategic Intelligence</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Operations</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Real-time visibility into your entire asset ecosystem. Harness predictive modeling and deterministic analytics to drive operational excellence.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Maximize2 size={16} strokeWidth={3} />
                  Full Report
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <RefreshCcw size={16} />
                   Live Sync
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'System Health', value: '98.2%', color: 'text-emerald-400' },
                 { label: 'Active nodes', value: '1.4k', color: 'text-blue-400' },
                 { label: 'Latency', value: '12ms', color: 'text-indigo-400' },
                 { label: 'Drift', value: '0.01%', color: 'text-amber-400' },
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

      {/* 📊 KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] shadow-premium hover:shadow-2xl transition-all border border-white/40">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</p>
               <div className={`p-1.5 rounded-lg ${kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {kpi.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
               </div>
            </div>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-black text-slate-800 tracking-tight">{kpi.value}</h3>
               <span className={`text-[10px] font-bold ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {kpi.change}
               </span>
            </div>
            <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
               <div className={`h-full bg-${kpi.color}-500/50`} style={{ width: '70%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* 🛠️ Modern Tabs & Content Container */}
      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              <button 
                onClick={() => setTabValue(0)}
                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 0 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Performance
                {tabValue === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full"></div>}
              </button>
              <button 
                onClick={() => setTabValue(1)}
                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 1 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Risk Matrix
                {tabValue === 1 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full"></div>}
              </button>
            </div>
            <div className="flex gap-2 pb-4">
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><RefreshCcw size={16} /></button>
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={16} /></button>
            </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 min-h-[400px] flex flex-col justify-center items-center text-center">
                  <Activity size={48} className="text-slate-200 mb-4" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Performance Rendering Engine</p>
                  <p className="text-slate-400 text-[10px] mt-1 max-w-xs">Connecting to telemetry streams and processing temporal data patterns...</p>
               </div>
            </div>
            <div className="space-y-6">
               <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
                    <Target size={120} />
                  </div>
                  <h4 className="text-lg font-black mb-2 relative z-10">Efficiency Target</h4>
                  <p className="text-indigo-100 text-sm mb-6 relative z-10">You are tracking 4.2% above the quarterly engineering baseline.</p>
                  <button className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 shadow-lg">View Audit</button>
               </div>
               <div className="glass-card p-6 rounded-[2rem] border border-slate-100">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Critical Alerts</h4>
                  <div className="space-y-4">
                    {[
                      { item: 'Compressor C-201', status: 'High Vibration', color: 'rose' },
                      { item: 'Pump A-101', status: 'Cavitation Risk', color: 'amber' },
                      { item: 'Sensor Node 12', status: 'Offline', color: 'slate' },
                    ].map((alert, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className={`w-2 h-2 rounded-full bg-${alert.color}-500 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-slate-700 leading-none">{alert.item}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{alert.status}</p>
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

export default AnalyticsDashboardPage;