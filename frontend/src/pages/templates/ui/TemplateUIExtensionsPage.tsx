import React from 'react';
import { 
  Puzzle, 
  Terminal, 
  Settings, 
  Activity, 
  Share2, 
  Cpu, 
  Layers, 
  Workflow, 
  Box, 
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Plus
} from 'lucide-react';

const TemplateUIExtensionsPage: React.FC = () => {
  const extensions = [
    { name: 'Neural Fabric', type: 'System Core', status: 'Operational', version: '4.2.0', icon: Cpu, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'Asset Telemetry', type: 'Data Stream', status: 'Active', version: '1.8.5', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Identity Matrix', type: 'Security', status: 'Operational', version: '2.0.1', icon: Layers, color: 'text-violet-500', bg: 'bg-violet-50' },
    { name: 'Legacy Bridge', type: 'Adapter', status: 'Dormant', version: '0.9.2', icon: Workflow, color: 'text-slate-400', bg: 'bg-slate-50' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Architectural • Modular Extensions</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              Plugin <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Registry</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              Extend the core SEMAR capabilities with enterprise-grade modules. Our micro-kernel architecture allows for hot-reloading components and recursive sub-system integration.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
               <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={18} strokeWidth={3} /> Register Extension
               </button>
               <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Terminal size={18} /> Console Access
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {extensions.map((ext, i) => (
           <div key={i} className="glass-card p-8 rounded-[3rem] shadow-premium border border-white/40 bg-white hover:translate-y-[-4px] transition-all duration-300 group">
              <div className="flex justify-between items-start mb-8">
                 <div className={`w-14 h-14 rounded-2xl ${ext.bg} ${ext.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                    <ext.icon size={28} />
                 </div>
                 <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical size={18} /></button>
              </div>
              <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest mb-1">{ext.type}</p>
              <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-4">{ext.name}</h3>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Version</span>
                    <span className="text-xs font-black text-slate-700">v{ext.version}</span>
                 </div>
                 <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${ext.status === 'Operational' || ext.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{ext.status}</span>
              </div>
           </div>
         ))}
      </div>

      {/* Advanced Capabilities Showcase */}
      <section className="glass-card p-10 sm:p-14 rounded-[3.5rem] shadow-premium border border-white/40 bg-slate-900 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
               <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl">
                  <Puzzle size={32} />
               </div>
               <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none">Infinite Sub-module <br/><span className="text-indigo-400">Nesting Capabilities</span></h2>
               <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xl">
                  Our extension protocols support recursive containerization. Build once, deploy across multiple instances, and manage all child-nodes from a single dashboard interface.
               </p>
               <div className="flex flex-wrap gap-4 pt-4">
                  <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                     <Share2 size={16} /> Deploy Distributed
                  </button>
                  <button className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
                     View Schema
                  </button>
               </div>
            </div>
            
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
               {[
                 { label: 'Latency Map', icon: Activity },
                 { label: 'Security Log', icon: ShieldCheck },
                 { label: 'Auto Scale', icon: ArrowUpRight },
                 { label: 'Direct Port', icon: ExternalLink }
               ].map((item, i) => (
                 <div key={i} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-all cursor-pointer">
                    <item.icon size={24} className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</span>
                 </div>
               ))}
            </div>
         </div>
      </section>

    </div>
  );
};

// Internal icon proxy
const ShieldCheck = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

const ArrowUpRight = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 7h10v10"></path>
    <path d="M7 17 17 7"></path>
  </svg>
);

export default TemplateUIExtensionsPage;
