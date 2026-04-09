import React from 'react';
import { 
  AlertTriangle, 
  Construction, 
  WifiOff, 
  Clock, 
  ArrowRight, 
  RefreshCcw, 
  Home, 
  ShieldAlert, 
  Zap,
  Activity,
  Layers
} from 'lucide-react';

const TemplateMiscellaneousPage: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-amber-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Utilities • Edge Case Protocols</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">Outliers</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              Graceful resolution patterns for non-standard systemic states. From maintenance dormancy to unauthorized access interception, engineered for resilience.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 404 / Missing Node Card */}
        <div className="glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 flex flex-col items-center text-center">
           <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-8 relative">
              <div className="absolute inset-2 border-2 border-dashed border-slate-200 rounded-[2.2rem]"></div>
              <WifiOff size={32} />
           </div>
           <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Node Not Found</h3>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Error Code: 404</p>
           <p className="text-xs font-medium text-slate-500 leading-relaxed mb-10">The requested resource has been migrated or decomposed from the primary cluster.</p>
           <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
              <Home size={16} /> Central Hub
           </button>
        </div>

        {/* Maintenance Card */}
        <div className="glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 flex flex-col items-center text-center bg-gradient-to-b from-amber-50/50 to-white">
           <div className="w-20 h-20 rounded-[2.5rem] bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 mb-8">
              <Construction size={32} />
           </div>
           <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Protocol Upgrade</h3>
           <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-8">Scheduled Dormancy</p>
           <p className="text-xs font-medium text-slate-500 leading-relaxed mb-10">System is undergoing scheduled maintenance. Real-time telemetry will resume in:</p>
           
           <div className="flex gap-4 mb-4">
              <div className="flex flex-col">
                 <span className="text-2xl font-black text-slate-800 leading-none">02</span>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Hours</span>
              </div>
              <div className="text-2xl font-black text-slate-300">:</div>
              <div className="flex flex-col">
                 <span className="text-2xl font-black text-slate-800 leading-none">45</span>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Mins</span>
              </div>
           </div>
        </div>

        {/* Access Denied Card */}
        <div className="glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 flex flex-col items-center text-center bg-slate-900 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl"></div>
           <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-rose-500 mb-8">
              <ShieldAlert size={32} />
           </div>
           <h3 className="text-xl font-black text-white tracking-tight mb-2">Access Intercepted</h3>
           <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-8">Restriction Tier 5</p>
           <p className="text-xs font-medium text-slate-400 leading-relaxed mb-10 opacity-80">You do not possess the required cryptographic signatures to access this partition.</p>
           <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
              Request Auth
           </button>
        </div>

        {/* Success Feedback Card */}
        <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 flex md:flex-row flex-col items-center gap-10 bg-emerald-50/20 group">
           <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-200 shrink-0 group-hover:scale-110 transition-transform duration-500">
              <Zap size={48} />
           </div>
           <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-4 leading-none">Mission Calibrated</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 max-w-sm">All operational parameters have been successfully synchronized with the central node. System health is optimal.</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                 <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                    Next Task <ArrowRight size={16} />
                 </button>
                 <button className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all">
                    Review Log
                 </button>
              </div>
           </div>
        </div>

        {/* Loading / Processing Card */}
        <div className="glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 flex flex-col items-center justify-center text-center bg-white h-full overflow-hidden relative">
           <div className="absolute inset-0 bg-slate-50/50 -z-10"></div>
           <div className="relative mb-8">
              <RefreshCcw size={48} className="text-indigo-500 animate-spin transition-all" />
              <div className="absolute -inset-4 border-2 border-indigo-100 rounded-full animate-[ping_3s_infinite]"></div>
           </div>
           <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Syncing Matrix</h3>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">64% Completed</p>
           <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-indigo-500 rounded-full"></div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default TemplateMiscellaneousPage;
