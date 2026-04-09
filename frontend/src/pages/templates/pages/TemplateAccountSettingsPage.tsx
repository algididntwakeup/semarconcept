import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Smartphone, 
  MapPin, 
  Globe, 
  Upload, 
  Save, 
  Lock,
  ChevronRight,
  Monitor,
  Key
} from 'lucide-react';

const TemplateAccountSettingsPage: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-teal-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Self-Service • Identity Matrix</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-300">Workspace</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Fine-tune your personal interaction parameters. Manage cryptographic keys, biometric signatures, and notification dispatch protocols.
                </p>
             </div>
             
             <div className="hidden lg:block relative">
                <div className="w-48 h-48 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-md p-2 group/avatar">
                   <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 to-teal-500 flex items-center justify-center text-white text-5xl font-black shadow-inner overflow-hidden relative">
                      JD
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                         <Upload size={32} />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Settings Sidebar */}
        <div className="lg:col-span-3 space-y-4">
           <div className="glass-card p-4 rounded-[2.5rem] shadow-premium border border-white/40">
              <div className="space-y-1">
                 {[
                   { label: 'Core Profile', icon: User, active: true },
                   { label: 'Security & Keys', icon: Shield, active: false },
                   { label: 'Communications', icon: Bell, active: false },
                   { label: 'Connected Devices', icon: Monitor, active: false },
                   { label: 'Governance', icon: Lock, active: false }
                 ].map((item, i) => (
                   <button 
                     key={i} 
                     className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${item.active ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                   >
                      <div className="flex items-center gap-4">
                         <item.icon size={18} className={item.active ? 'text-indigo-400' : 'text-slate-400'} />
                         <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <ChevronRight size={14} className={item.active ? 'text-white' : 'text-slate-300'} />
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-9 space-y-10">
           
           <div className="glass-card p-10 sm:p-12 rounded-[3rem] shadow-premium border border-white/40 bg-white">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Core Profile</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">This data is visible to verified team members</p>
                 </div>
                 <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <Save size={16} /> Update Matrix
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Display Name</label>
                       <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" className="form-input pl-12" defaultValue="John Doe" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Sync Email</label>
                       <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="email" className="form-input pl-12" defaultValue="john.doe@reksolindo.com" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Temporal Zone</label>
                       <div className="relative">
                          <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <select className="form-input pl-12 appearance-none">
                             <option>UTC+07:00 Jakarta</option>
                             <option>UTC-05:00 Eastern Time</option>
                             <option>UTC+00:00 London</option>
                          </select>
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Operational Base</label>
                       <div className="relative">
                          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" className="form-input pl-12" defaultValue="Headquarters, Jakarta" />
                       </div>
                    </div>
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Professional Bio</label>
                    <textarea className="form-input min-h-[120px] resize-none" placeholder="Lead System Architect specialized in high-frequency data pipelines."></textarea>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 rounded-[2.5rem] shadow-premium border border-white/40 bg-slate-900 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                 <Key className="text-indigo-400 mb-6" size={32} />
                 <h3 className="text-sm font-black uppercase tracking-widest mb-2">Cryptographic Keys</h3>
                 <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-6 opacity-80">Last rotated: 14 days ago. You have 2 active SSH keys linked to this identity.</p>
                 <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Manage Keys</button>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] shadow-premium border border-white/40 bg-white">
                 <Smartphone className="text-teal-500 mb-6" size={32} />
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Mobile Verification</h3>
                 <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-6">Device: iPhone 15 Pro. Trusted status verified. 2FA is active.</p>
                 <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Pair Devices</button>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
};

export default TemplateAccountSettingsPage;
