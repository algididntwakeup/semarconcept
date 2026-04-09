import React, { useState } from 'react';
import { 
  Zap, 
  Shield, 
  Settings, 
  Activity, 
  Plus, 
  Search, 
  MoreVertical, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  ChevronRight,
  ChevronDown,
  Mail,
  User,
  Star,
  Download,
  Share2,
  Trash2,
  Edit2
} from 'lucide-react';

const TemplateUIComponentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('buttons');

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design System • v4.0.0</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              Component <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-300">Architecture</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed opacity-80">
              The building blocks of the SEMAR ecosystem. Engineered for high-performance enterprise interfaces with a focus on accessibility, speed, and premium aesthetics.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Component Groups Nav */}
        <div className="lg:col-span-3 space-y-4 sticky top-8">
          <div className="glass-card p-4 rounded-[2.5rem] shadow-premium border border-white/40">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4 pt-2">Atomic Groups</h3>
            <div className="space-y-1">
              {[
                { id: 'buttons', label: 'Interaction Units', icon: Zap },
                { id: 'feedback', label: 'Signal Modals', icon: Bell },
                { id: 'data', label: 'Quantum Grids', icon: Activity },
                { id: 'forms', label: 'Input Channels', icon: Settings }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-primary-400' : 'text-slate-400'} />
                  <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Components Workspace */}
        <div className="lg:col-span-9 space-y-12">
          
          {/* Interaction Units (Buttons) */}
          <section id="buttons" className="space-y-6">
            <div className="flex items-center gap-4 px-4">
               <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Interaction Units</h2>
            </div>
            
            <div className="glass-card p-10 rounded-[2.5rem] shadow-premium border border-white/40 space-y-10">
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Actions</p>
                  <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 bg-primary-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary-200 hover:scale-105 active:scale-95 transition-all">Primary Action</button>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 transition-all">Slate Action</button>
                    <button className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">Ghost Entry</button>
                 </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Iconic Wrappers</p>
                  <div className="flex flex-wrap gap-4">
                     <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary-500 hover:border-primary-200 transition-all shadow-sm"><Share2 size={20} /></button>
                     <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-all shadow-sm"><Download size={20} /></button>
                     <button className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all shadow-sm"><Trash2 size={20} /></button>
                     <div className="h-10 w-[1px] bg-slate-100"></div>
                     <button className="px-8 py-4 bg-indigo-600/10 text-indigo-600 border border-indigo-200 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                        <Plus size={18} strokeWidth={3} /> Combined Node
                     </button>
                  </div>
               </div>
            </div>
          </section>

          {/* Signal Modals (Feedback) */}
          <section id="feedback" className="space-y-6">
            <div className="flex items-center gap-4 px-4">
               <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Signal Modals</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass-card p-6 rounded-[2rem] shadow-premium border-l-4 border-l-emerald-500 bg-emerald-50/30">
                  <div className="flex gap-4">
                     <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                     <div>
                        <h4 className="text-sm font-black text-emerald-900 mb-1">In Sync</h4>
                        <p className="text-xs font-medium text-emerald-700/80 leading-relaxed">Central node synchronization completed with zero delta detected.</p>
                     </div>
                  </div>
               </div>
               <div className="glass-card p-6 rounded-[2rem] shadow-premium border-l-4 border-l-rose-500 bg-rose-50/30">
                  <div className="flex gap-4">
                     <AlertTriangle className="text-rose-500 shrink-0" size={24} />
                     <div>
                        <h4 className="text-sm font-black text-rose-900 mb-1">Protocol Breach</h4>
                        <p className="text-xs font-medium text-rose-700/80 leading-relaxed">Unauthorized access attempt detected on secure partition B-12.</p>
                     </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Components (Chips / Badges) */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-4">
               <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Status Identifiers</h2>
            </div>
            
            <div className="glass-card p-10 rounded-[2.5rem] shadow-premium border border-white/40 space-y-10">
               <div className="flex flex-wrap gap-4">
                  {[
                    { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
                    { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
                    { label: 'Critical', bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
                    { label: 'Legacy', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
                    { label: 'Beta', bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
                  ].map((chip) => (
                    <span key={chip.label} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/50 ${chip.bg} ${chip.text}`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${chip.dot}`}></div>
                       {chip.label}
                    </span>
                  ))}
               </div>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
};

export default TemplateUIComponentsPage;