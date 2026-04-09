// platform/frontend-mui/src/pages/maintenance/MaintenanceResourcesPage.tsx
import React, { useState } from 'react';
import { 
  Briefcase, 
  Wrench, 
  Package, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  Layout,
  MoreVertical,
  Flame,
  ShieldCheck,
  Eye,
  TrendingUp,
  Clock,
  Settings,
  AlertTriangle,
  History,
  FileText,
  BarChart3,
  RefreshCcw,
  CheckCircle2,
  Timer,
  Users,
  Box as BoxIcon,
  Warehouse,
  Star,
  Activity,
  ArrowRight,
  Truck
} from 'lucide-react';

const MaintenanceResourcesPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const resourceStats = [
    { label: 'Technical Ops', value: '14', color: 'blue', icon: Users },
    { label: 'Precision Kits', value: '28', color: 'emerald', icon: Wrench },
    { label: 'Stock Valuation', value: '$840k', color: 'rose', icon: Warehouse },
    { label: 'Supply Chain', value: 'Inbound', color: 'indigo', icon: Truck },
  ];

  const technicians = [
    { id: '1', name: 'John Smith', dept: 'Mechanical', status: 'Available', rating: 4.8, efficiency: 95 },
    { id: '2', name: 'Sarah Johnson', dept: 'Electrical', status: 'Busy', rating: 4.9, efficiency: 92 },
    { id: '3', name: 'Mike Wilson', dept: 'Process', status: 'Available', rating: 4.7, efficiency: 88 },
  ];

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Available': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Busy': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Low': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Inventory • Capital Utilization</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-300">Logistics</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Master the supply chain of industrial reliability. Calibrate your technical workforce, audit precision instrument reserves, and optimize the material lifecycle to ensure 100% mission readiness for every maintenance campaign.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-sans font-black">
                  <Plus size={16} strokeWidth={3} />
                  Provision Item
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 font-sans font-black">
                  <BoxIcon size={16} />
                   Stock Audit
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Utilization', value: '88%', color: 'text-indigo-400' },
                 { label: 'Tech Force', value: '14/14', color: 'text-emerald-400' },
                 { label: 'Out of Stock', value: '00', color: 'text-blue-400' },
                 { label: 'Latency', value: '4.2d', color: 'text-emerald-400' },
               ].map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 📊 KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {resourceStats.map((s, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] shadow-premium hover:shadow-2xl transition-all border border-white/40 group">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{s.value}</h3>
               </div>
               <div className={`p-3 rounded-2xl bg-${s.color}-50 text-${s.color}-600 border border-${s.color}-100 group-hover:scale-110 transition-transform`}>
                  <s.icon size={20} />
               </div>
             </div>
             <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">Asset Reserve Index</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
        <div className="px-8 pt-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-8">
              {['Technical Fleet', 'Precision Lab', 'Material Vault', 'Supply Flow'].map((tab, i) => (
                <button 
                  key={i}
                  onClick={() => setTabValue(i)}
                  className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === i ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                  {tabValue === i && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full"></div>}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pb-4">
               <button className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 border border-slate-100 rounded-xl"><RefreshCcw size={16} /></button>
            </div>
        </div>

        <div className="p-8">
           <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Node</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Division</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rating</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-8 py-5"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {technicians.map(t => (
                       <tr key={t.id} className="group hover:bg-slate-50 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all font-black text-xs">
                                   {t.name.charAt(0)}
                                </div>
                                <div className="max-w-[160px]">
                                   <p className="text-sm font-black text-slate-800 leading-none mb-1 truncate">{t.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">L{t.id} Certified Tech</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="px-2 py-1 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded-lg border border-slate-200">
                                {t.dept}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-black text-indigo-600">{t.efficiency}%</span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-indigo-500" style={{ width: `${t.efficiency}%` }}></div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex items-center justify-end gap-1">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-black text-slate-700">{t.rating}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusClasses(t.status)} shadow-sm`}>
                                {t.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2 text-slate-300 hover:text-indigo-600 bg-white border border-slate-100 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"><ArrowRight size={16}/></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceResourcesPage;