import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info,
  AlertTriangle,
  Mail,
  Lock,
  User,
  ShieldAlert,
  Save,
  RefreshCcw,
  BadgeCheck
} from 'lucide-react';

const TemplateFormValidationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: 'john_', // simulates invalid
    email: 'valid@reksolindo.com',
    password: '',
    confirmPassword: 'abc'
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight Section */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-amber-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Input States • Validation</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                Secure Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">Validation</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                Visual indicators and strict client-side validation states ensuring data integrity before server submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🛡️ Real-time Validation Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] shadow-premium">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Registration Integrity</h2>
            
            <form className="space-y-6">
               
               {/* Success State */}
               <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Corporate Email Address</label>
                  <div className="relative">
                     <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                       type="email" 
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       className="form-input pl-12 pr-12 !border-emerald-500 focus:!ring-emerald-500/20" 
                     />
                     <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                     <BadgeCheck size={12} /> Domain verified. Perfect!
                  </p>
               </div>

               {/* Error State */}
               <div>
                  <label className="block text-xs font-black text-rose-600 uppercase tracking-widest mb-2">Platform Username</label>
                  <div className="relative">
                     <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" />
                     <input 
                       type="text" 
                       value={formData.username}
                       onChange={(e) => setFormData({...formData, username: e.target.value})}
                       className="form-input pl-12 pr-12 !border-rose-500 focus:!ring-rose-500/20 text-rose-700" 
                     />
                     <AlertCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" />
                  </div>
                  <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-start gap-1.5 leading-relaxed">
                     <AlertCircle size={14} className="mt-0.5 shrink-0" />
                     Usernames cannot end with underscores and must be 5-20 characters long.
                  </p>
               </div>

               {/* Warning State */}
               <div>
                  <label className="block text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Complexity Setup (Password)</label>
                  <div className="relative">
                     <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                     <input 
                       type="password" 
                       placeholder="Enter password..."
                       value={formData.password}
                       onChange={(e) => setFormData({...formData, password: e.target.value})}
                       className="form-input pl-12 pr-12 !border-amber-400 focus:!ring-amber-500/20 text-amber-700" 
                     />
                     <AlertTriangle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500" />
                  </div>
                  <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                     <div className="h-full bg-amber-400 w-1/3 rounded-r-full"></div>
                  </div>
                  <p className="text-[10px] font-bold text-amber-600 mt-2 flex items-center gap-1.5">
                     <AlertTriangle size={12} /> Weak security. Add numbers & symbols.
                  </p>
               </div>

               {/* Default/Info State */}
               <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Password Confirmation</label>
                  <div className="relative">
                     <ShieldAlert size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                       type="password" 
                       placeholder="Re-type password..."
                       value={formData.confirmPassword}
                       onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                       className="form-input pl-12" 
                     />
                  </div>
                  <p className="text-[10px] font-bold text-indigo-500 mt-2 flex items-center gap-1.5">
                     <Info size={12} /> Required to prevent lockout.
                  </p>
               </div>

               <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button type="button" className="w-full py-4 text-xs font-black uppercase tracking-widest text-white bg-slate-800 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-lg active:scale-95 duration-200">
                     <Save size={16} /> Register Details
                  </button>
               </div>
            </form>
         </div>

         <div className="space-y-10">
            {/* Inline Alerts */}
            <div className="glass-card p-8 rounded-[2.5rem] shadow-premium">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Validation Feedback Components</h3>
               
               <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                        <AlertCircle size={16} />
                     </div>
                     <div>
                        <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest mb-1">Fatal Constraint Violation</h4>
                        <p className="text-[10px] font-bold text-rose-500 leading-relaxed">The submitted asset ID already exists in the registry. Duplication is strictly prohibited.</p>
                     </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <AlertTriangle size={16} />
                     </div>
                     <div>
                        <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Mandatory Field Omission</h4>
                        <p className="text-[10px] font-bold text-amber-600 leading-relaxed">Skipping technical specifications may downgrade asset compliance scores automatically.</p>
                     </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 size={16} />
                     </div>
                     <div>
                        <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1">Upload Validated</h4>
                        <p className="text-[10px] font-bold text-emerald-600 leading-relaxed">Checksum verified. Schematic blueprint successfully parsed and saved to cloud.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] shadow-premium bg-slate-900 border-none relative overflow-hidden group">
               <div className="absolute -inset-10 bg-gradient-to-tr from-rose-600/30 to-fuchsia-600/30 blur-2xl group-hover:scale-110 transition-transform duration-1000"></div>
               <div className="relative z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Error Boundary Testing</h3>
                  <p className="text-[10px] font-medium text-slate-300 mb-6 leading-relaxed opacity-80">Simulate backend validation failure delays or network interruptions to verify loading UX.</p>
                  
                  <button className="px-6 py-3 bg-white/10 text-white rounded-xl border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2">
                     <RefreshCcw size={14} /> Inject Latency
                  </button>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
};

export default TemplateFormValidationPage;