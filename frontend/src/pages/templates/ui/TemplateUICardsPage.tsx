import React from 'react';
import { 
  Zap, 
  Shield, 
  Settings, 
  Activity, 
  ArrowUpRight, 
  MoreHorizontal, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Database
} from 'lucide-react';

const TemplateUICardsPage: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Library • Atomic Components</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-300">Containers</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              A collection of high-fidelity card patterns designed for data density and visual clarity. Every container is built with glassmorphism principles and deep shadows.
            </p>
          </div>
        </div>
      </section>

      {/* Grid Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 01. Glass Card - Simple */}
        <div className="space-y-4">
           <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">01. Standard Glass</p>
           <div className="glass-card p-8 rounded-[2.5rem] shadow-premium border border-white/40 bg-white/60 backdrop-blur-md hover:translate-y-[-4px] transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 color-indigo-600 flex items-center justify-center mb-6 text-indigo-600">
                 <Zap size={24} fill="currentColor" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Performance Mesh</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">High-frequency data streaming with sub-millisecond latency for real-time asset telemetry.</p>
           </div>
        </div>

        {/* 02. Dark Premium Card */}
        <div className="space-y-4">
           <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">02. Slate Onyx</p>
           <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                   <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                      <Shield size={20} />
                   </div>
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">Secured</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight mb-2 mt-auto">Quantum Vault</h3>
                <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6">Encrypted identity storage with rotatable keys and multi-sig authorization flow.</p>
                <button className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest group-hover:gap-4 transition-all">
                  Access Protocol <ChevronRight size={14} strokeWidth={3} />
                </button>
              </div>
           </div>
        </div>

        {/* 03. Stat Card - Trend */}
        <div className="space-y-4">
           <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">03. Numeric Insight</p>
           <div className="glass-card p-8 rounded-[2.5rem] shadow-premium border border-white/40 flex flex-col justify-between h-full bg-white">
              <div className="flex justify-between items-center mb-8">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Valuation</p>
                 <ArrowUpRight size={18} className="text-emerald-500" />
              </div>
              <div>
                 <p className="text-4xl font-black text-slate-900 tracking-tighter mb-2">$842.5M</p>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">+12.4%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Since last sync</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 04. Mini Action Card */}
        <div className="space-y-4">
           <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">04. Mini Utility</p>
           <div className="flex gap-4">
              <div className="flex-1 glass-card p-6 rounded-[2rem] shadow-premium border border-white/40 hover:bg-slate-900 hover:text-white transition-all group cursor-pointer">
                 <Cpu size={24} className="mb-4 text-primary-500 group-hover:text-primary-400" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Compute</p>
              </div>
              <div className="flex-1 glass-card p-6 rounded-[2rem] shadow-premium border border-white/40 hover:bg-slate-900 hover:text-white transition-all group cursor-pointer">
                 <Database size={24} className="mb-4 text-emerald-500 group-hover:text-emerald-400" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Registry</p>
              </div>
           </div>
        </div>

        {/* 05. Gradient Feature */}
        <div className="space-y-4 lg:col-span-2">
           <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">05. Hero Banner Card</p>
           <div className="relative rounded-[3rem] p-10 overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-700 shadow-2xl group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mt-20 -mr-20 group-hover:scale-125 transition-transform duration-1000"></div>
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                   <h3 className="text-3xl font-black text-white tracking-tighter mb-4 leading-none">Automated Risk Synthesis</h3>
                   <p className="text-white/70 text-sm font-medium leading-relaxed mb-8 max-w-md">Our neural engine analyzes cross-sector data points to identify potential failure vectors before they manifest in primary systems.</p>
                   <button className="px-8 py-3 bg-white text-indigo-700 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                     Initialize Analysis
                   </button>
                </div>
                <div className="w-full md:w-48 grid grid-cols-2 gap-3">
                   {[1,2,3,4].map(idx => (
                     <div key={idx} className="aspect-square bg-white/10 rounded-3xl border border-white/10 flex items-center justify-center">
                        <Activity size={24} className="text-white/40" />
                     </div>
                   ))}
                </div>
             </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default TemplateUICardsPage;
