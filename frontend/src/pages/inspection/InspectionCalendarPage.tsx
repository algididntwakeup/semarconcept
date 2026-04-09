// platform/frontend-mui/src/pages/inspection/InspectionCalendarPage.tsx
import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  ChevronLeft,
  ChevronRight,
  Clock,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MoreVertical,
  Activity,
  MapPin,
  CalendarDays,
  List,
  LayoutGrid
} from 'lucide-react';

const InspectionCalendarPage: React.FC = () => {
  const [view, setView] = useState<'month' | 'list'>('month');
  const [selectedDate] = useState(new Date());

  const inspectionEvents = [
    {
      id: '1',
      title: 'Pressure Vessel Inspection',
      date: '2025-06-15',
      time: '09:00',
      type: 'Pressure',
      priority: 'High',
      status: 'Scheduled',
      asset: 'PV-001',
      inspector: 'John Smith',
    },
    {
      id: '2',
      title: 'Pipeline Visual Check',
      date: '2025-06-15',
      time: '14:00',
      type: 'Visual',
      priority: 'Medium',
      status: 'Scheduled',
      asset: 'PL-205',
      inspector: 'Sarah Johnson',
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Scheduled': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Temporal • Master Schedule</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Inspection <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">Horizon</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Visualize and orchestrate temporal inspection workflows. Synchronize field activities, expert review sessions, and mandatory regulatory audits.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  Schedule Event
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <MapPin size={16} />
                   Site View
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'This Month', value: '42', color: 'text-indigo-400' },
                 { label: 'Completed', value: '28', color: 'text-emerald-400' },
                 { label: 'Overdue', value: '02', color: 'text-rose-400' },
                 { label: 'Man-Hours', value: '1.2k', color: 'text-purple-400' },
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

      {/* 🛠️ Modern Toolbar */}
      <section className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
               onClick={() => setView('month')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Month
             </button>
             <button 
               onClick={() => setView('list')}
               className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               List
             </button>
           </div>
           <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
           <div className="flex items-center gap-2">
             <button className="p-2 text-slate-400 hover:text-indigo-600"><ChevronLeft size={18}/></button>
             <span className="text-xs font-black uppercase tracking-widest text-slate-800">
               {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
             </span>
             <button className="p-2 text-slate-400 hover:text-indigo-600"><ChevronRight size={18}/></button>
           </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Filter schedule..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 border border-slate-100 rounded-xl">
            <Filter size={16} />
          </button>
        </div>
      </section>

      {/* 🗓️ Calendar Table/Grid view */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40 mb-8 p-1">
         <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-[2.3rem] overflow-hidden">
           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
             <div key={day} className="bg-white py-4 text-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</span>
             </div>
           ))}
           {/* Simple placeholder for calendar grid */}
           {Array.from({ length: 35 }).map((_, i) => (
             <div key={i} className={`bg-white min-h-[140px] p-4 group hover:bg-slate-50/50 transition-colors ${i < 5 || i > 30 ? 'opacity-30' : ''}`}>
               <span className="text-xs font-black text-slate-300 group-hover:text-indigo-400 transition-colors">{(i % 31) + 1}</span>
               {i === 15 && (
                 <div className="mt-2 space-y-1">
                   {inspectionEvents.map(e => (
                     <div key={e.id} className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 cursor-pointer hover:scale-105 transition-transform">
                       <p className="text-[9px] font-black text-indigo-600 leading-none truncate">{e.title}</p>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           ))}
         </div>
      </div>

      {/* 📊 Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="glass-card p-8 rounded-[2.5rem] border border-white/40">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <CalendarDays size={16} className="text-indigo-500" />
                  Upcoming Agenda
                </h3>
                <button className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {inspectionEvents.map(e => (
                   <div key={e.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                     <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:border-indigo-200">
                        <span className="text-[9px] font-black text-slate-400 uppercase leading-none">JUN</span>
                        <span className="text-xl font-black text-slate-800 leading-none">15</span>
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{e.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{e.asset} • {e.inspector}</p>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(e.status)}`}>
                          {e.status}
                        </span>
                        <div className="flex items-center gap-1 text-slate-300">
                           <Clock size={12} />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{e.time}</span>
                        </div>
                     </div>
                   </div>
                ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <Activity size={180} />
              </div>
              <h4 className="text-lg font-black mb-2 relative z-10 tracking-tight">System Compliance</h4>
              <p className="text-indigo-100 text-xs mb-6 relative z-10 leading-relaxed opacity-80">Your facility's structural inspection velocity is tracking 12% above the safety baseline for Q2.</p>
              <button className="px-5 py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 shadow-lg hover:scale-105 active:scale-95 transition-all">Download Audit</button>
           </div>
           <div className="glass-card p-6 rounded-[2.5rem] border border-slate-100 shadow-premium">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Critical Alerts</h4>
              <div className="space-y-3">
                 <div className="flex gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-100">
                    <AlertTriangle className="text-rose-500 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-[10px] font-black text-rose-800 leading-none mb-1 uppercase tracking-wider">Overdue Inspection</p>
                      <p className="text-[9px] font-bold text-rose-600 leading-tight">Compressor CP-008 is 2 days past scheduled deadline.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionCalendarPage;