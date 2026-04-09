import React, { useState } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Layout, 
  User, 
  Settings, 
  Activity, 
  Shield, 
  Mail, 
  Bell, 
  Calendar, 
  FileText, 
  Clock, 
  Cloud, 
  Database, 
  Globe, 
  Smartphone, 
  Zap,
  MoreVertical,
  Plus,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

const TemplateUIIconsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const copyIconName = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const categories = [
    {
      name: 'System Framework',
      icons: [
        { n: 'Layout', i: Layout }, { n: 'Settings', i: Settings }, { n: 'Activity', i: Activity },
        { n: 'Shield', i: Shield }, { n: 'Zap', i: Zap }, { n: 'Database', i: Database }
      ]
    },
    {
      name: 'Communication',
      icons: [
        { n: 'Mail', i: Mail }, { n: 'Bell', i: Bell }, { n: 'Globe', i: Globe },
        { n: 'Smartphone', i: Smartphone }, { n: 'Message', i: Layout }, { n: 'Share', i: Plus }
      ]
    },
    {
      name: 'Data & Time',
      icons: [
        { n: 'Calendar', i: Calendar }, { n: 'Clock', i: Clock }, { n: 'FileText', i: FileText },
        { n: 'Cloud', i: Cloud }, { n: 'History', i: Clock }, { n: 'Archive', i: Database }
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-violet-600/30 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">System • Visual Language</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-6 tracking-tighter leading-tight">
              Icon <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">Lexicon</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              The SEMAR iconography system powered by Lucide. A precise, 24px grid-based symbol library designed for clarity and rapid semiotic recognition across enterprise clusters.
            </p>
          </div>
        </div>
      </section>

      {/* Control Bar */}
      <section className="glass-card p-6 rounded-[2.5rem] shadow-premium border border-white/40 bg-white sticky top-24 z-50">
         <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative flex-1">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input 
                 type="text" 
                 placeholder="Filter glyphs by metadata or semantic label..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-16 pr-6 py-4 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
               />
            </div>
            <div className="flex gap-4">
               <button className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <Plus size={16} /> Asset Library
               </button>
            </div>
         </div>
      </section>

      {/* Icon Categories */}
      <div className="space-y-16">
         {categories.map((cat, cIdx) => (
           <div key={cIdx} className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                 <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">{cat.name}</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                 {cat.icons.filter(icon => icon.n.toLowerCase().includes(searchTerm.toLowerCase())).map((icon, iIdx) => (
                   <div 
                     key={iIdx} 
                     onClick={() => copyIconName(icon.n)}
                     className="glass-card p-8 rounded-[2.5rem] shadow-premium border border-white/40 bg-white hover:bg-slate-900 hover:text-white transition-all duration-300 group cursor-pointer text-center"
                   >
                      <div className="flex items-center justify-center mb-6 relative">
                         <icon.i size={32} className="group-hover:scale-125 transition-transform duration-500" strokeWidth={1.5} />
                         {copied === icon.n && (
                           <div className="absolute -top-4 bg-emerald-500 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg animate-in fade-in slide-in-from-bottom-2">
                              Copied!
                           </div>
                         )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">{icon.n}</span>
                   </div>
                 ))}
              </div>
           </div>
         ))}
      </div>

    </div>
  );
};

export default TemplateUIIconsPage;