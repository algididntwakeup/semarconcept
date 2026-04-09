import React, { useState } from 'react';
import { 
  Palette, 
  Copy, 
  Check, 
  Droplets, 
  Sun, 
  Moon, 
  Zap, 
  Shield, 
  Activity, 
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const TemplateUIColorsPage: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  const palettes = [
    {
      name: 'Primary Brand',
      desc: 'The core identity representing innovation and reliability.',
      colors: [
        { label: 'Indigo 950', hex: '#1e1b4b' },
        { label: 'Indigo 900', hex: '#312e81' },
        { label: 'Indigo 600', hex: '#4f46e5' },
        { label: 'Indigo 400', hex: '#818cf8' },
        { label: 'Indigo 100', hex: '#e0e7ff' }
      ]
    },
    {
      name: 'Accent Emerald',
      desc: 'Environmental safety and system health status.',
      colors: [
        { label: 'Emerald 950', hex: '#022c22' },
        { label: 'Emerald 900', hex: '#064e3b' },
        { label: 'Emerald 600', hex: '#059669' },
        { label: 'Emerald 400', hex: '#34d399' },
        { label: 'Emerald 100', hex: '#d1fae5' }
      ]
    },
    {
      name: 'Slate Onyx',
      desc: 'Deep structural tones for high-density interfaces.',
      colors: [
        { label: 'Slate 950', hex: '#020617' },
        { label: 'Slate 900', hex: '#0f172a' },
        { label: 'Slate 600', hex: '#475569' },
        { label: 'Slate 400', hex: '#94a3b8' },
        { label: 'Slate 100', hex: '#f1f5f9' }
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-emerald-600/30 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">System • Chromatic Tokens</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-6 tracking-tighter leading-tight">
              Color <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-300">Spectrum</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              The chromatic foundation of the SEMAR design system. A calibrated set of HSL-derived tokens optimized for dark and light modes across high-fidelity dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* Semantic Status Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Operational', color: 'bg-emerald-500', icon: CheckCircle2, text: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Dormant', color: 'bg-slate-400', icon: Moon, text: 'text-slate-400', bg: 'bg-slate-50' },
          { label: 'Warning', color: 'bg-amber-500', icon: AlertTriangle, text: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Critical', color: 'bg-rose-500', icon: Shield, text: 'text-rose-500', bg: 'bg-rose-50' }
        ].map((s, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border border-white/40 shadow-premium flex items-center gap-4 ${s.bg}`}>
             <div className={`w-12 h-12 rounded-2xl ${s.color} text-white flex items-center justify-center shadow-lg`}>
                <s.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                <h4 className={`text-sm font-black ${s.text}`}>{s.label}</h4>
             </div>
          </div>
        ))}
      </section>

      {/* Main Palettes */}
      <div className="space-y-12">
         {palettes.map((palette, pIdx) => (
           <div key={pIdx} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{palette.name}</h3>
                    <p className="text-xs font-medium text-slate-500">{palette.desc}</p>
                 </div>
                 <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button className="px-4 py-1.5 rounded-lg bg-white shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-800">HEX</button>
                    <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400">HSL</button>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                 {palette.colors.map((color, cIdx) => (
                   <div 
                     key={cIdx} 
                     onClick={() => copyToClipboard(color.hex)}
                     className="glass-card p-6 rounded-[2.5rem] shadow-premium border border-white/40 group cursor-pointer hover:bg-slate-50 transition-all"
                   >
                      <div 
                        className="aspect-square rounded-[2rem] shadow-inner mb-6 relative overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: color.hex }}
                      >
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                         <div className="opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all text-white flex flex-col items-center gap-2">
                            {copied === color.hex ? <Check size={24} /> : <Copy size={24} />}
                            <span className="text-[9px] font-black uppercase tracking-widest">Copy Code</span>
                         </div>
                      </div>
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none mb-2">{color.label}</h5>
                      <code className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{color.hex}</code>
                   </div>
                 ))}
              </div>
           </div>
         ))}
      </div>

    </div>
  );
};

export default TemplateUIColorsPage;