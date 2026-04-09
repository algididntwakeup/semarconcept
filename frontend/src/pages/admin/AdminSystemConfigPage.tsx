import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  Database, 
  Globe, 
  Lock, 
  Bell, 
  ShieldAlert, 
  Save, 
  RefreshCcw,
  Activity,
  HardDrive
} from 'lucide-react';

const AdminSystemConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Platform Core • Admin</span>
             </div>
             <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Configuration</span>
             </h1>
             <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                Core parameters and environmental constraints dictating the operational boundaries of the enterprise asset management system.
             </p>
          </div>
        </div>
      </section>

      {/* 🛠️ Dynamic Navigation & Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         <div className="lg:col-span-3 space-y-2">
            {[
               { id: 'general', label: 'General Identity', icon: Globe },
               { id: 'db', label: 'Database Tuning', icon: Database },
               { id: 'security', label: 'Security & Auth', icon: Lock },
               { id: 'notifications', label: 'Event Triggers', icon: Bell },
               { id: 'maintenance', label: 'Cluster Health', icon: Activity },
            ].map(tab => (
               <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                     activeTab === tab.id 
                     ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                     : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-800 border border-slate-100'
                  }`}
               >
                  <tab.icon size={18} /> {tab.label}
               </button>
            ))}
         </div>

         <div className="lg:col-span-9">
            <div className="glass-card p-10 rounded-[2.5rem] shadow-premium">
               {activeTab === 'general' && (
                  <div className="animate-in fade-in duration-500 space-y-8 relative">
                     <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                           <Globe size={24} />
                        </div>
                        <div>
                           <h2 className="text-xl font-black text-slate-800 tracking-tight">Main Instance Identity</h2>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global variables affecting all tenants</p>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                        <div className="space-y-6">
                           <div>
                              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Platform Title</label>
                              <input type="text" defaultValue="SEMAR Asset Intelligence" className="form-input" />
                           </div>
                           <div>
                              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Support Email Address</label>
                              <input type="email" defaultValue="sysadmin@reksolindo.com" className="form-input" />
                           </div>
                           <div>
                              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Default Timezone</label>
                              <select className="form-input appearance-none">
                                 <option>Asia/Jakarta (UTC+7)</option>
                                 <option>UTC (Coordinated Universal Time)</option>
                                 <option>America/New_York (UTC-5)</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-6">
                           <div>
                              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Base Application URL</label>
                              <div className="flex items-center gap-2">
                                 <input type="text" defaultValue="https://app.semar.local" className="form-input bg-slate-50 border-slate-200 font-mono text-xs" />
                                 <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Server size={18} /></span>
                              </div>
                           </div>
                           <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2">Maintenance Mode</h3>
                              <p className="text-[10px] font-bold text-slate-400 mb-4 leading-relaxed">Toggle to restrict access to super-administrators only.</p>
                              <label className="flex items-center justify-start cursor-pointer group">
                                 <div className="relative">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none ring-4 ring-transparent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                 </div>
                              </label>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab !== 'general' && (
                  <div className="animate-in fade-in flex items-center justify-center min-h-[400px]">
                     <div className="text-center space-y-4 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                           <Settings size={32} className="animate-spin-slow" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Configuration module loading...</p>
                     </div>
                  </div>
               )}
               
               <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 items-center gap-2 text-slate-400">
                     <ShieldAlert size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Sysadmin rights verified</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <button className="px-6 py-3 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2">
                        <RefreshCcw size={14} /> Reset
                     </button>
                     <button className="px-8 py-3 bg-indigo-600 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:translate-y-0.5 transition-all flex items-center gap-2">
                        <Save size={14} /> Commit Changes
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminSystemConfigPage;