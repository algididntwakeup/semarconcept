import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  MessageSquare, 
  LifeBuoy, 
  BookOpen, 
  Settings, 
  Lock,
  Cpu,
  ArrowRight
} from 'lucide-react';

const TemplateFAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { 
      q: "How do I synchronize my legacy data silos?", 
      a: "Our neural bridge adapter allows for real-time extraction from SQL, NoSQL and even flat file architectures. Simply initialize the mapping engine in the Settings > Integration panel.",
      category: "Integration"
    },
    { 
      q: "Is multi-factor authentication mandatory?", 
      a: "Yes, in accordance with Zero-Trust Protocol 4.2, all enterprise nodes must verify identity via biometric or hardware-token challenges at every session initialization.",
      category: "Security"
    },
    { 
      q: "What is the maximum data frequency supported?", 
      a: "Currently, our streaming clusters support up to 50,000 events per second with sub-5ms latency across verified backbone regions.",
      category: "Performance"
    },
    { 
      q: "Can I self-host the SEMAR analytics engine?", 
      a: "Standard accounts use our shared cloud fabric. Enterprise Tier accounts may request isolated VPC deployments or on-premise container orchestration.",
      category: "Hosting"
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-indigo-950 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14 text-center">
          <div className="max-w-2xl mx-auto">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                <span className="text-[10px] font-black text-white uppercase tracking-widest text-indigo-200">Knowledge Base • Help Center</span>
             </div>
             <h1 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">assist you?</span>
             </h1>
             
             <div className="relative max-w-xl mx-auto group/search">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-400 transition-colors" size={20} />
                <input 
                   type="text" 
                   placeholder="Search documentation, API refs, troubleshooting..." 
                   className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-3xl text-sm text-slate-900 shadow-2xl focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium" 
                />
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* Categories */}
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-4 rounded-[2.5rem] shadow-premium border border-white/40">
               <div className="space-y-1">
                  {[
                    { label: 'Technical Guide', icon: Cpu, active: true },
                    { label: 'Security Policy', icon: Lock, active: false },
                    { label: 'Account Matrix', icon: Settings, active: false },
                    { label: 'Global Network', icon: LifeBuoy, active: false }
                  ].map((cat, i) => (
                    <button 
                      key={i} 
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${cat.active ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                       <div className="flex items-center gap-4">
                          <cat.icon size={18} className={cat.active ? 'text-indigo-400' : 'text-slate-400'} />
                          <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                       </div>
                    </button>
                  ))}
               </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
               <MessageSquare className="mb-6 opacity-60" size={32} />
               <h3 className="text-sm font-black uppercase tracking-widest mb-2">Can't find it?</h3>
               <p className="text-[11px] font-medium text-indigo-100 leading-relaxed opacity-80 mb-6">Our system architects are available 24/7 for technical clarification.</p>
               <button className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Submit Ticket</button>
            </div>
         </div>

         {/* FAQ Accordion */}
         <div className="lg:col-span-8 space-y-4">
            {faqs.map((faq, idx) => (
               <div 
                 key={idx} 
                 className={`glass-card rounded-[2.5rem] shadow-premium border border-white/40 transition-all duration-500 overflow-hidden ${openIndex === idx ? 'bg-white ring-2 ring-indigo-500/10' : 'bg-white/50'}`}
               >
                  <button 
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    className="w-full px-8 py-7 flex items-center justify-between gap-6 group text-left"
                  >
                     <div className="flex items-center gap-6">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${openIndex === idx ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                           <HelpCircle size={20} />
                        </div>
                        <div>
                           <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 block">{faq.category}</span>
                           <h4 className={`text-sm font-black tracking-tight transition-colors ${openIndex === idx ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{faq.q}</h4>
                        </div>
                     </div>
                     <div className={`transition-transform duration-500 ${openIndex === idx ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`}>
                        <ChevronDown size={20} />
                     </div>
                  </button>
                  
                  {openIndex === idx && (
                     <div className="px-8 pb-8 pt-0 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="pl-16">
                           <p className="text-xs font-medium text-slate-500 leading-relaxed border-l-2 border-indigo-100 pl-6 py-2">
                             {faq.a}
                           </p>
                           <div className="mt-6 flex items-center gap-4">
                              <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                 Read Full Doc <ArrowRight size={14} />
                              </button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            ))}
         </div>

      </div>

    </div>
  );
};

export default TemplateFAQPage;
