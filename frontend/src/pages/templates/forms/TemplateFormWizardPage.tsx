import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Server,
  Database,
  ShieldAlert,
  Save,
  Rocket
} from 'lucide-react';

const TemplateFormWizardPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">UX Patterns • Wizard</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              Sequential <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-300">Data Engine</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              A high-conversion multi-step form architecture designed for complex onboarding, infrastructure scaling, or systemic configurations.
            </p>
          </div>
        </div>
      </section>

      {/* 🚀 Wizard Container */}
      <div className="glass-card max-w-4xl mx-auto rounded-[3rem] shadow-premium overflow-hidden border border-slate-100/50">
         
         {/* Step Progress Tracker */}
         <div className="bg-slate-50/80 px-10 py-8 border-b border-slate-100 flex items-center justify-between relative">
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-500 shadow-glow-primary" style={{ width: `${(activeStep / totalSteps) * 100}%` }}></div>
            
            {[
               { id: 1, label: 'Environment', icon: Server },
               { id: 2, label: 'Database', icon: Database },
               { id: 3, label: 'Security', icon: ShieldAlert },
               { id: 4, label: 'Deploy', icon: Rocket }
            ].map((step) => (
               <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                  <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all duration-500 font-black text-sm ${activeStep > step.id ? 'bg-indigo-600 text-white shadow-lg' : activeStep === step.id ? 'bg-white border-2 border-indigo-500 text-indigo-600' : 'bg-white border border-slate-200 text-slate-300'}`}>
                     {activeStep > step.id ? <Check size={20} /> : <step.icon size={18} />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${activeStep >= step.id ? 'text-indigo-900' : 'text-slate-400'}`}>
                     {step.label}
                  </span>
               </div>
            ))}
         </div>

         {/* Wizard Content Area */}
         <div className="p-10 sm:p-14 bg-white min-h-[400px]">
            {activeStep === 1 && (
               <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                  <div>
                     <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Configure Base Environment</h2>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Select the primary computational frame for your cluster.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <label className="p-6 rounded-3xl border-2 border-indigo-500 bg-indigo-50/30 cursor-pointer shadow-soft">
                        <input type="radio" name="env" defaultChecked className="sr-only" />
                        <Server size={32} className="text-indigo-600 mb-4" />
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Production Node</h3>
                        <p className="text-[10px] font-medium text-slate-500 mt-2 leading-relaxed">High availability, load balanced, auto-scaling enabled multi-zone deployment.</p>
                     </label>
                     <label className="p-6 rounded-3xl border border-slate-200 hover:border-slate-300 bg-white cursor-pointer hover:bg-slate-50 transition-all">
                        <input type="radio" name="env" className="sr-only" />
                        <Database size={32} className="text-slate-400 mb-4" />
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Staging / Development</h3>
                        <p className="text-[10px] font-medium text-slate-500 mt-2 leading-relaxed">Cost-optimized single zone instance for testing and pre-release.</p>
                     </label>
                  </div>
               </div>
            )}

            {activeStep === 2 && (
               <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                  <div>
                     <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Relational Storage</h2>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Allocate database engine specifications.</p>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Engine Engine</label>
                        <select className="form-input">
                           <option>PostgreSQL 15 (Recommended)</option>
                           <option>MySQL 8.0 Engine</option>
                           <option>MariaDB Latest</option>
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Storage Allocation</label>
                           <input type="text" className="form-input" placeholder="250 GB" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Compute Instance</label>
                           <input type="text" className="form-input" placeholder="db-memory-8x" />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeStep > 2 && (
               <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col items-center justify-center py-10 text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center border-4 border-slate-100">
                     <ShieldAlert size={48} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Security Placeholder</h2>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">This UI element demonstrates wizard state progression. Advance to finalize initialization.</p>
                  </div>
               </div>
            )}
         </div>

         {/* Navigation Actions */}
         <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center relative overflow-hidden">
            <button 
               onClick={prevStep}
               disabled={activeStep === 1}
               className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
               <ArrowLeft size={16} /> Retreat
            </button>

            {activeStep < totalSteps ? (
               <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
               >
                  Progress <ArrowRight size={16} />
               </button>
            ) : (
               <button 
                  className="flex items-center gap-2 px-10 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-teal-200"
               >
                  <Save size={16} /> Finalize Configuration
               </button>
            )}
         </div>
      </div>

    </div>
  );
};

export default TemplateFormWizardPage;
