import React from 'react';
import { 
  Map as MapIcon, 
  MapPin, 
  Navigation, 
  Layers, 
  Maximize, 
  Search, 
  Compass, 
  Globe, 
  Activity,
  ChevronRight,
  MoreVertical,
  Plus
} from 'lucide-react';

const TemplateMapsPage: React.FC = () => {
  const regions = [
    { name: 'ASEAN Cluster', nodes: 142, health: '98%', status: 'Active' },
    { name: 'EMEA Division', nodes: 85, health: '92%', status: 'Active' },
    { name: 'NA Registry', nodes: 210, health: '84%', status: 'Warning' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Geospatial • Asset Topology</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-300">Territories</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              Interactive mapping of distributed infrastructure. Real-time geospatial telemetry for high-value assets across diverse legislative environments.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Map Viewport (Mock) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card rounded-[3rem] shadow-premium border border-white/40 overflow-hidden relative h-[600px] bg-slate-100 group">
             {/* Abstract Grid Map Mock */}
             <div className="absolute inset-0 bg-[#0f172a] opacity-90">
                <div className="absolute inset-0 flex items-center justify-center">
                   {/* Abstract Map Graphic */}
                   <div className="relative w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] opacity-20">
                      <Globe size="100%" className="text-teal-500" />
                   </div>
                   
                   {/* Pings */}
                   <div className="absolute top-1/4 left-1/3 animate-ping w-4 h-4 bg-teal-500 rounded-full opacity-75"></div>
                   <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.8)]"></div>
                   
                   <div className="absolute bottom-1/3 right-1/4 animate-ping w-4 h-4 bg-orange-500 rounded-full opacity-75 animation-delay-500"></div>
                   <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]"></div>
                   
                   <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
             </div>

             {/* UI Overlays */}
             <div className="absolute top-8 left-8 space-y-3">
                <div className="p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col gap-2">
                   <button className="p-2 text-white hover:bg-white/10 rounded-xl transition-all"><Plus size={18} /></button>
                   <div className="h-[1px] bg-white/10"></div>
                   <button className="p-2 text-white hover:bg-white/10 rounded-xl transition-all"><Layers size={18} /></button>
                </div>
                <div className="p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10">
                   <button className="p-2 text-white hover:bg-white/10 rounded-xl transition-all"><Navigation size={18} /></button>
                </div>
             </div>

             <div className="absolute top-8 right-8 w-64">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="Locate Node ID..." className="w-full pl-11 pr-4 py-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none" />
                </div>
             </div>

             <div className="absolute bottom-8 left-8 right-8">
                <div className="glass-card p-6 rounded-[2rem] bg-slate-900/90 backdrop-blur-md border border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Active</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Warning</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Breach</span>
                      </div>
                   </div>
                   <button className="px-6 py-2 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all">Details View</button>
                </div>
             </div>
          </div>
        </div>

        {/* Region Monitor */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card p-8 rounded-[3rem] shadow-premium border border-white/40">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Spatial Metrics</h3>
              <div className="space-y-6">
                 {regions.map((reg, i) => (
                   <div key={i} className="p-5 rounded-[1.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                         <h4 className="text-sm font-black text-slate-800">{reg.name}</h4>
                         <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${reg.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{reg.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Nodes</p>
                            <p className="text-lg font-black text-slate-900">{reg.nodes}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Health Av.</p>
                            <p className="text-lg font-black text-emerald-600">{reg.health}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                 <Compass size={16} /> Global Report
              </button>
           </div>
           
           <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <Activity size={32} className="mb-6 opacity-60" />
              <h3 className="text-sm font-black uppercase tracking-widest mb-2">Live Topography</h3>
              <p className="text-[11px] font-medium text-indigo-100 leading-relaxed opacity-80 mb-6">Automated asset scanning is currently active across 14 zones. All geographic coordinates synchronized.</p>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                 <div className="w-[72%] h-full bg-white rounded-full"></div>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default TemplateMapsPage;
