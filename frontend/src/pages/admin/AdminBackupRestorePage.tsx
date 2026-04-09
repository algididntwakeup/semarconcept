import React, { useState } from 'react';
import { 
   CloudUpload, 
   HardDrive,
   History,
   DatabaseBackup,
   Calendar,
   Clock,
   CheckCircle2,
   AlertCircle,
   RefreshCcw,
   Download,
   Settings,
   Plus,
   Trash2,
   Save
} from 'lucide-react';

const mockBackups = [
  { id: 'BKP-001', name: 'backup_full_20250611_080000.sql', type: 'Full Archive', size: '500 MB', location: 'Local Network', status: 'Completed', date: '2 hours ago' },
  { id: 'BKP-002', name: 'backup_incremental_20250610.sql', type: 'Incremental', size: '50 MB', location: 'AWS S3 Cloud', status: 'Completed', date: '1 day ago' },
  { id: 'BKP-003', name: 'backup_full_20250609_080000.sql', type: 'Full Archive', size: '496 MB', location: 'Local Network', status: 'Failed', date: '3 days ago' },
];

const AdminBackupRestorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('backups');

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Platform Core • Persistence</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Disaster <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">Recovery</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Cryptographically secure database snapshots, incremental backups, and one-click cloud restoration pipelines.
                </p>
             </div>
             
             <div className="hidden lg:grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Payload</p>
                   <p className="text-3xl font-black text-white">4.2 GB</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Integrity</p>
                   <p className="text-3xl font-black text-emerald-400 border-b border-dashed border-emerald-400/50 pb-1">100%</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner col-span-2 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Snapshot</p>
                      <p className="text-lg font-black text-amber-400 flex items-center gap-2"><Clock size={16} /> 2h 14m ago</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 🚀 Main Interface */}
      <div className="glass-card max-w-7xl mx-auto rounded-[3rem] shadow-premium overflow-hidden border border-slate-100/50 flex flex-col md:flex-row">
         
         <div className="w-full md:w-80 bg-slate-50/80 border-r border-slate-100 p-8 flex flex-col min-h-[500px]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Data Operations</h3>
            <div className="space-y-2 flex-1">
               {[
                  { id: 'backups', label: 'Snapshot Vault', icon: DatabaseBackup },
                  { id: 'schedule', label: 'Automation rules', icon: Calendar },
                  { id: 'history', label: 'Restoration Logs', icon: History }
               ].map((tab) => (
                  <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all ${
                        activeTab === tab.id 
                           ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' 
                           : 'bg-transparent text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm'
                     }`}
                  >
                     <div className="flex items-center gap-3"><tab.icon size={16} /> {tab.label}</div>
                  </button>
               ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
               <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-xl transition-all mb-3">
                  <Save size={16} /> Force Backup Now
               </button>
               <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:border-amber-300 hover:text-amber-600 transition-all">
                  <DatabaseBackup size={16} /> Restore Database
               </button>
            </div>
         </div>

         <div className="flex-1 bg-white p-10">
            {activeTab === 'backups' && (
               <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                     <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Available Snapshots</h2>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {mockBackups.map(backup => (
                        <div key={backup.id} className="p-6 rounded-3xl border border-slate-100 hover:border-amber-200 hover:shadow-lg transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group bg-slate-50/50">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${backup.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {backup.status === 'Completed' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-2">{backup.name}</h4>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${backup.type === 'Full Archive' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                       {backup.type}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{backup.size}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 {backup.location === 'Local Network' ? <HardDrive size={12} /> : <CloudUpload size={12} />} {backup.location}
                              </div>
                              <div className="flex items-center gap-2">
                                 <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">Restore</button>
                                 <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"><Download size={16} /></button>
                                 <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 size={16} /></button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {activeTab !== 'backups' && (
               <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500 opacity-60 min-h-[300px]">
                  <Settings size={48} className="text-slate-300 mb-6 animate-spin-slow" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Automated Rules UI</h3>
                  <p className="text-[10px] font-bold text-slate-400 max-w-sm leading-relaxed">Configure scheduled CRON triggers for automated backup deployment to AWS S3 or Local Volumes.</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default AdminBackupRestorePage;