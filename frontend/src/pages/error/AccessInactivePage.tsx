// platform/frontend-mui/src/pages/error/AccessInactivePage.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ShieldAlert, Home, LifeBuoy, Ghost } from 'lucide-react';

const AccessInactivePage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-items-center justify-center p-8 animate-in fade-in duration-700">
      <div className="max-w-xl w-full text-center space-y-12">
        
        {/* 🛡️ Visual Spotlight */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative glass-card w-40 h-40 rounded-[2.5rem] flex items-center justify-center shadow-2xl border-rose-100/50 scale-110">
            <ShieldAlert size={80} className="text-rose-500" strokeWidth={1} />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg border border-white/20">
               <Ghost size={24} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* 📝 Narrative */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
            <span className="text-[10px] font-black uppercase tracking-widest">Structural Blockade • 403.Inactive</span>
          </div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter leading-tight font-sans">
            Feature Currently <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600">Deactivated</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-lg mx-auto">
            This module has been structurally disabled or hidden from your workspace configuration. You do not have permission to view this specific content at this time.
          </p>
        </div>

        {/* 🛠️ Tactical Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
           <RouterLink 
            to="/dashboard" 
            className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
           >
             <Home size={16} />
             Safe Harbor
           </RouterLink>
           <button 
            className="px-8 py-4 glass-card border-slate-200 text-slate-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            onClick={() => window.open('https://help.semsar.io', '_blank')}
           >
             <LifeBuoy size={16} />
             Contact Support
           </button>
        </div>

        {/* 📑 Governance Metadata */}
        <div className="pt-12">
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
             SEMAR Security Layer • Policy v2.4.1
           </p>
        </div>
      </div>
    </div>
  );
};

export default AccessInactivePage;
