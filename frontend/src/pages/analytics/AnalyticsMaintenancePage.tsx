// platform/frontend-mui/src/pages/analytics/AnalyticsMaintenancePage.tsx
import React, { useState } from 'react';
import { 
  Wrench, 
  Settings, 
  Activity, 
  BarChart3, 
  PieChart, 
  RefreshCcw, 
  Download, 
  Search, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MoreVertical,
  Timer,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Gauge
} from 'lucide-react';

const AnalyticsMaintenancePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const maintenanceMetrics = [
    { label: 'Total Orders', value: '1,247', color: 'blue', icon: Wrench, change: '+8%', trend: 'up' },
    { label: 'On-Time rate', value: '72%', color: 'emerald', icon: CheckCircle2, change: '+5%', trend: 'up' },
    { label: 'Avg Completion', value: '4.2d', color: 'indigo', icon: Timer, change: '-0.5d', trend: 'down' },
    { label: 'MTBF Rate', value: '85d', color: 'purple', icon: Activity, change: '+12%', trend: 'up' },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
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
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Operation • Reliability Engineering</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Maintenance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Optimization</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Streamline corrective and preventive asset maintenance. Leverage data-driven insights to improve MTBF, reduce lifecycle costs, and ensure maximum operational availability.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Wrench size={16} strokeWidth={3} />
                  Reliability Feed
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Download size={16} />
                   Fleet Analytics
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'System Health', value: 'Optimal', color: 'text-emerald-400' },
                 { label: 'Uptime', value: '98.2%', color: 'text-blue-400' },
                 { label: 'Critical Tasks', value: '08', color: 'text-rose-400' },
                 { label: 'Cost Index', value: '-4.2%', color: 'text-indigo-400' },
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
        {maintenanceMetrics.map((m, i) => (
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
                {m.trend === 'up' ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-blue-500" />}
                <span className={`text-[10px] font-black ${m.trend === 'up' ? 'text-emerald-500' : 'text-blue-500'}`}>{m.change} vs Benchmark</span>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              {['Order Analysis', 'Asset Health', 'Cost Discovery', 'Efficiency'].map((tab, i) => (
                <button 
                  key={i}
                  onClick={() => setTabValue(i)}
                  className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === i ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                  {tabValue === i && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full"></div>}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pb-4">
               <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white border border-slate-100 rounded-xl shadow-sm"><RefreshCcw size={16} /></button>
            </div>
        </div>

        <div className="p-8">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                 <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 min-h-[400px] flex flex-col justify-center items-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent group-hover:scale-150 transition-transform duration-1000"></div>
                    <Gauge size={48} className="text-blue-200 mb-4 animate-in zoom-in duration-700" strokeWidth={1.5} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Reliability Stream Analysis</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-relaxed">Aggregating cross-functional maintenance data points for predictive modeling...</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Status Distribution</h4>
                       <div className="space-y-4">
                          {[
                            { label: 'Completed', value: 892, total: 1247, color: 'emerald' },
                            { label: 'In Progress', value: 156, total: 1247, color: 'blue' },
                            { label: 'Overdue', value: 45, total: 1247, color: 'rose' },
                          ].map((s, i) => (
                             <div key={i}>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-1 tracking-widest">
                                   <span className="text-slate-600">{s.label}</span>
                                   <span className={`text-${s.color}-600`}>{Math.round((s.value/s.total)*100)}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div className={`h-full bg-${s.color}-500`} style={{ width: `${(s.value/s.total)*100}%` }}></div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Maintenance Mix</h4>
                       <div className="space-y-4">
                          {[
                            { label: 'Preventive', value: 734, total: 1247, color: 'indigo' },
                            { label: 'Corrective', value: 513, total: 1247, color: 'amber' },
                          ].map((s, i) => (
                             <div key={i}>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-1 tracking-widest">
                                   <span className="text-slate-600">{s.label}</span>
                                   <span className={`text-${s.color}-600`}>{Math.round((s.value/s.total)*100)}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div className={`h-full bg-${s.color}-500`} style={{ width: `${(s.value/s.total)*100}%` }}></div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                      <ShieldCheck size={180} />
                    </div>
                    <h4 className="text-lg font-black mb-2 tracking-tight">OEE Mastery</h4>
                    <p className="text-indigo-100 text-sm mb-6 opacity-80 leading-relaxed uppercase font-black tracking-widest">Facility: Sector-4G Alpha</p>
                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/20 mb-6 font-sans">
                       <div className="text-3xl font-black">94.2%</div>
                       <div className="h-10 w-px bg-white/20"></div>
                       <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest text-left">Overall Equipment Resilience</div>
                    </div>
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all font-sans">Performance Feed</button>
                 </div>

                 <div className="glass-card p-8 rounded-[2.5rem] border border-white/40 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Repair Efficiency</h4>
                    <div className="space-y-6">
                       {[
                          { asset: 'Pump A-101', efficiency: 94, color: 'emerald' },
                          { asset: 'Compressor B-205', efficiency: 89, color: 'blue' },
                          { asset: 'Motor C-301', efficiency: 91, color: 'indigo' },
                       ].map((a, i) => (
                          <div key={i} className="flex gap-4 items-center">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getColorClasses(a.color)}`}>
                                <Settings size={18} />
                             </div>
                             <div className="flex-1">
                                <p className="text-xs font-black text-slate-800 leading-none mb-1">{a.asset}</p>
                                <div className="flex items-center gap-2">
                                   <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                      <div className={`h-full bg-${a.color}-500`} style={{ width: `${a.efficiency}%` }}></div>
                                   </div>
                                   <span className="text-[10px] font-black text-slate-500">{a.efficiency}%</span>
                                </div>
                             </div>
                          </div>
                       ))}
                       <button className="w-full mt-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">View Asset Health</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMaintenancePage;