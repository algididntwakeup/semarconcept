import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  LogIn, 
  Github, 
  Chrome,
  Key
} from 'lucide-react';

const TemplateAuthenticationPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Security • Entry Protocols</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">Architecture</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              State-of-the-art authentication interfaces. From multi-factor biometric syncing to single sign-on enterprise clusters, designed for zero-trust environments.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* 01. Login Portal - Premium */}
        <div className="space-y-6">
           <div className="flex items-center gap-4 px-4">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Login Protocol</h2>
           </div>
           
           <div className="glass-card p-10 sm:p-14 rounded-[3.5rem] shadow-premium border border-white/40 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
              
              <div className="text-center mb-10">
                 <div className="w-16 h-16 bg-indigo-600 rounded-3xl text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
                    <ShieldCheck size={32} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Secure Entry</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Initialize your authorized session</p>
              </div>

              <form className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Corporate ID</label>
                    <div className="relative">
                       <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input type="email" placeholder="name@company.com" className="form-input pl-12" />
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest">Access Key</label>
                       <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Revoke Access?</button>
                    </div>
                    <div className="relative">
                       <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="form-input pl-12 pr-12" />
                       <button 
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                       >
                         {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 pt-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Persist Session Data</span>
                 </div>

                 <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4">
                    Authenticate <LogIn size={18} />
                 </button>
              </form>

              <div className="mt-10 flex items-center gap-4">
                 <div className="h-[1px] flex-1 bg-slate-100"></div>
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Federated Auth</span>
                 <div className="h-[1px] flex-1 bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                 <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                    <Chrome size={16} className="text-rose-500" /> Google
                 </button>
                 <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                    <Github size={16} /> GitHub
                 </button>
              </div>
           </div>
        </div>

        {/* 02. Registration / Account Setup */}
        <div className="space-y-6">
           <div className="flex items-center gap-4 px-4">
              <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Onboarding Flow</h2>
           </div>

           <div className="glass-card p-10 sm:p-14 rounded-[3.5rem] shadow-premium border border-white/40 bg-gradient-to-br from-violet-600 to-indigo-700 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                    <Key size={48} className="mb-8 opacity-60" />
                    <h3 className="text-3xl font-black tracking-tighter mb-4 leading-none text-white">Initialize New Node Identity</h3>
                    <p className="text-violet-100 text-sm font-medium leading-relaxed opacity-80 mb-10 max-w-sm">
                       Join the SEMAR ecosystem. Create a singular identity that propagates across all operational clusters automatically.
                    </p>
                    
                    <div className="space-y-4">
                       {[
                         { icon: ShieldCheck, label: 'End-to-End Encryption Mapping' },
                         { icon: ArrowRight, label: 'Cross-Silo Permission Sync' },
                         { icon: ArrowRight, label: 'Legacy Data Porting' }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-violet-200">
                            <item.icon size={14} className="text-white" /> {item.label}
                         </div>
                       ))}
                    </div>
                 </div>

                 <button className="mt-16 w-full py-5 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-50 transition-all active:scale-95">
                    Start Onboarding
                 </button>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default TemplateAuthenticationPage;
