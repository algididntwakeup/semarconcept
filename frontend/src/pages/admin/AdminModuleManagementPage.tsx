import React, { useState } from 'react';
import { 
  Puzzle, 
  CheckCircle2, 
  Settings, 
  DownloadCloud, 
  ShieldAlert, 
  HardDrive,
  Trash2,
  Power,
  RefreshCw,
  MoreVertical,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

const mockInstalledModules = [
  { id: 'MOD-01', name: 'Asset Intelligence Engine', version: '2.4.1', status: 'Active', size: '142 MB', author: 'Reksolindo Core', updated: '2 days ago' },
  { id: 'MOD-02', name: 'Predictive Maintenance Analytics', version: '1.2.0', status: 'Active', size: '350 MB', author: 'Reksolindo AI', updated: '1 week ago' },
  { id: 'MOD-03', name: 'Legacy Data Exporter', version: '0.9.5', status: 'Error', size: '12 MB', author: 'Community / Third-party', updated: '1 month ago' },
  { id: 'MOD-04', name: 'SAP Integration Layer', version: '3.0.0', status: 'Inactive', size: '89 MB', author: 'Enterprise Integrations', updated: '5 hours ago' }
];

const AdminModuleManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('installed');

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Platform Core • Modules</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Extension <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">Registry</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Manage internal subsystems and third-party integrations to enhance platform capabilities.
                </p>
             </div>
             
             <div className="hidden lg:grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Installed</p>
                   <p className="text-3xl font-black text-white">48</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Updates</p>
                   <p className="text-3xl font-black text-cyan-400">3</p>
                   <span className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full"></span>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner col-span-2">
                   <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-transparent">Storage</p>
                      <HardDrive className="text-white/20" size={16} />
                   </div>
                   <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-indigo-500 w-2/3"></div>
                   </div>
                   <p className="text-[10px] font-medium text-slate-300">12.4 GB / 50 GB Allocated</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 🚀 Main Interface */}
      <div className="glass-card max-w-7xl mx-auto rounded-[3rem] shadow-premium overflow-hidden border border-slate-100/50 flex flex-col md:flex-row">
         
         {/* Sidebar Navigation */}
         <div className="w-full md:w-80 bg-slate-50/80 border-r border-slate-100 p-8 flex flex-col min-h-[500px]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Registry Scopes</h3>
            <div className="space-y-2 flex-1">
               {[
                  { id: 'installed', label: 'Installed Modules', icon: Puzzle },
                  { id: 'available', label: 'Available Updates', icon: RefreshCw },
                  { id: 'store', label: 'Marketplace', icon: DownloadCloud },
                  { id: 'health', label: 'Dependency Graph', icon: Layers }
               ].map((tab) => (
                  <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all ${
                        activeTab === tab.id 
                           ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200' 
                           : 'bg-transparent text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm'
                     }`}
                  >
                     <div className="flex items-center gap-3"><tab.icon size={16} /> {tab.label}</div>
                     {tab.id === 'available' && <span className={`px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-rose-100 text-rose-600'}`}>3</span>}
                  </button>
               ))}
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 bg-white p-10">
            {activeTab === 'installed' && (
               <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                     <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Active Subsystems</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Modules currently installed to the platform</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {mockInstalledModules.map(module => (
                        <div key={module.id} className="p-6 rounded-3xl border border-slate-100 hover:border-cyan-200 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${module.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : module.status === 'Error' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                                 {module.status === 'Active' ? <CheckCircle2 size={24} /> : module.status === 'Error' ? <ShieldAlert size={24} /> : <Power size={24} />}
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1.5">{module.name}</h4>
                                 <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
                                    <span className="text-slate-500 shrink-0">v{module.version}</span> • {module.author}
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                              <div className="text-right hidden sm:block">
                                 <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{module.size}</p>
                                 <p className="text-[10px] font-bold text-slate-400">Upd. {module.updated}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Config</button>
                                 <button className="p-2.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {activeTab !== 'installed' && (
               <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500 opacity-60">
                  <Activity size={48} className="text-slate-300 mb-6" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Loading External Registry...</h3>
                  <p className="text-[10px] font-bold text-slate-400 max-w-xs leading-relaxed">Connecting to Reksolindo Cloud Services to fetch latest module metrics and dependencies.</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default AdminModuleManagementPage;