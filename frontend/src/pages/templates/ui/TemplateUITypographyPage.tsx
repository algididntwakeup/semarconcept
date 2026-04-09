import React from 'react';
import { 
  Type, 
  CaseUpper, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Plus, 
  ArrowRight,
  Monitor,
  Smartphone,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const TemplateUITypographyPage: React.FC = () => {
  const styles = [
    { label: 'Display Alpha', size: 'text-6xl sm:text-8xl', weight: 'font-black', tracking: 'tracking-tighter', leading: 'leading-none', usage: 'Hero Page Headlines' },
    { label: 'Heading Beta', size: 'text-4xl sm:text-6xl', weight: 'font-black', tracking: 'tracking-tight', leading: 'leading-tight', usage: 'Section Page Titles' },
    { label: 'Subhead Gamma', size: 'text-xl sm:text-2xl', weight: 'font-bold', tracking: 'tracking-tight', leading: 'leading-relaxed', usage: 'Card Headers, Subtitles' },
    { label: 'Body Delta', size: 'text-base', weight: 'font-medium', tracking: 'tracking-normal', leading: 'leading-relaxed', usage: 'Primary Content, Articles' },
    { label: 'Stat Epsilon', size: 'text-xs', weight: 'font-black', tracking: 'tracking-[0.2em]', leading: 'leading-none', usage: 'Labels, Micro-Copy, Badges' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">System • Semantic Scale</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-6 tracking-tighter leading-tight">
              Type <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Hierarchy</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              A meticulously calibrated typographic system designed for maximum structural clarity. Optimized for global legibility across high-density enterprise data clusters.
            </p>
          </div>
        </div>
      </section>

      {/* Font Family Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 space-y-10">
            <div className="glass-card p-10 sm:p-14 rounded-[3.5rem] shadow-premium border border-white/40 bg-white">
               <div className="flex items-center justify-between mb-12">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">The Type Scale</h3>
                  <div className="flex gap-2">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Monitor size={14} /></div>
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300"><Smartphone size={14} /></div>
                  </div>
               </div>
               
               <div className="space-y-16">
                  {styles.map((style, i) => (
                    <div key={i} className="group cursor-default">
                       <div className="flex items-end justify-between mb-4">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">{style.label}</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none group-hover:text-slate-400 transition-colors">{style.usage}</span>
                       </div>
                       <div className={`text-slate-900 ${style.size} ${style.weight} ${style.tracking} ${style.leading} group-hover:translate-x-2 transition-transform duration-500`}>
                          Semanycs Kinetic System
                       </div>
                       <div className="mt-4 flex gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{style.size.split(' ')[0]}</span>
                          <span className="text-slate-200">/</span>
                          <span>{style.weight}</span>
                          <span className="text-slate-200">/</span>
                          <span>{style.tracking}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-10">
            <div className="glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 bg-slate-900 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
               <Type className="text-blue-400 mb-8" size={32} />
               <h3 className="text-sm font-black uppercase tracking-widest mb-4">Primary Matrix</h3>
               <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-7xl font-black leading-none text-white">Aa</span>
                  <span className="text-xl font-bold text-slate-500">Inter UI</span>
               </div>
               <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-10 opacity-80">
                  A variable-weight geometric sans-serif optimized for screen legibility. Feature-rich OpenType support for tabular figures and contextual alternates.
               </p>
               <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Download Typeface</button>
            </div>

            <div className="glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 bg-white">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Structural Rules</h3>
               <div className="space-y-6">
                  {[
                    { label: 'Contrast Ratio', val: '4.5:1+', status: 'Pass' },
                    { label: 'Optimal Width', val: '65-75ch', status: 'Optimal' },
                    { label: 'Vertical Grid', val: '4px-Base', status: 'Locked' }
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rule.label}</span>
                       <div className="text-right">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{rule.val}</p>
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{rule.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-8 p-6 bg-slate-50 rounded-2xl flex items-center gap-4">
                  <Info size={20} className="text-blue-500 shrink-0" />
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed">System automatically scales font weights based on contrast detection algorithms.</p>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default TemplateUITypographyPage;