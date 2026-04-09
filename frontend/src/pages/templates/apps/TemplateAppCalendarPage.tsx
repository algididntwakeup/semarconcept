import React, { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  MoreVertical, 
  Bell,
  Clock3,
  Filter,
  Activity,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const TemplateAppCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const events = [
    { id: '1', title: 'Asset Integrity Audit', type: 'audit', time: '09:00 AM', duration: '2h', location: 'Platform A-1', status: 'Upcoming' },
    { id: '2', title: 'Team Sync: Maintenance', type: 'meeting', time: '02:00 PM', duration: '1h', location: 'Virtual', status: 'Upcoming' },
    { id: '3', title: 'Pump Maintenance A-101', type: 'inspection', time: '08:00 AM', duration: '4h', location: 'Station B', status: 'Completed' },
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Simple calendar grid generation
  const generateDays = () => {
    const arr = [];
    for (let i = 1; i <= 31; i++) arr.push(i);
    return arr;
  };

  const getEventStyle = (type: string) => {
    switch(type) {
      case 'audit': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'inspection': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'meeting': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Operations • Temporal Mapping</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Schedule</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Synchronize critical maintenance windows and operational milestones. Advanced scheduling architecture for high-availability enterprise assets.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={18} strokeWidth={3} />
                    Schedule Event
                  </button>
                  <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all">
                    Sync Calendar
                  </button>
                </div>
             </div>
             
             <div className="hidden lg:grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Upcoming</p>
                   <p className="text-4xl font-black text-white">24</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 delay-75 text-emerald-400">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                   <p className="text-4xl font-black">98%</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Calendar View */}
        <div className="lg:col-span-9 space-y-6">
          <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden bg-white">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                  <button className="p-2 text-slate-400 hover:text-slate-900 transition-all"><ChevronLeft size={20} /></button>
                  <button className="p-2 text-slate-400 hover:text-slate-900 transition-all"><ChevronRight size={20} /></button>
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">June 2025</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                   {['Month', 'Week', 'Day'].map((v) => (
                     <button 
                       key={v}
                       onClick={() => setView(v.toLowerCase() as any)}
                       className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v.toLowerCase() ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       {v}
                     </button>
                   ))}
                </div>
                <button className="p-3 bg-white border border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                   <Search size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                  {days.map(day => (
                    <div key={day} className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 border-slate-100">
                  {generateDays().map(day => (
                    <div key={day} className={`min-h-[140px] p-4 border-r border-b border-slate-50 relative group hover:bg-slate-50/50 transition-all ${day === 15 ? 'bg-indigo-50/30' : ''}`}>
                       <span className={`text-[11px] font-black ${day === 15 ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                       
                       {day === 12 && (
                         <div className="mt-3 p-2 rounded-xl bg-rose-50 border border-rose-100 text-[9px] font-black text-rose-600 uppercase tracking-tighter leading-tight cursor-pointer hover:shadow-md transition-all">
                           Asset Audit • Platform A-1
                         </div>
                       )}
                       {day === 15 && (
                         <div className="mt-3 space-y-1">
                           <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-[9px] font-black text-indigo-600 uppercase tracking-tighter cursor-pointer hover:shadow-md transition-all">
                             Team Planning
                           </div>
                           <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-600 uppercase tracking-tighter cursor-pointer hover:shadow-md transition-all">
                             Pump Check
                           </div>
                         </div>
                       )}

                       <button className="absolute bottom-2 right-2 p-1.5 bg-white border border-slate-100 rounded-lg text-slate-300 opacity-0 group-hover:opacity-100 transition-all hover:text-primary-500 hover:border-primary-100">
                          <Plus size={12} strokeWidth={3} />
                       </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-6 rounded-[2.5rem] shadow-premium border border-white/40">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Upcoming Protocols</h3>
             <div className="space-y-4">
               {events.map(event => (
                 <div key={event.id} className="p-4 rounded-[1.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                       <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getEventStyle(event.type)}`}>
                          {event.type}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400">{event.time}</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-800 mb-3 group-hover:text-primary-600 transition-colors">{event.title}</h4>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                          <Clock size={10} /> {event.duration}
                       </div>
                       <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                          <MapPin size={10} /> {event.location}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
             <button className="w-full mt-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all border-t border-slate-100">
                View Full Agenda
             </button>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-900 text-white shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
             <div className="relative z-10">
               <Bell className="text-white/40 mb-4" size={24} />
               <h4 className="text-sm font-black mb-1">Operational Alerts</h4>
               <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-6">Real-time Triggers</p>
               
               <div className="space-y-4">
                 {[
                   { icon: Activity, label: 'Sensor Drift Delta', color: 'text-amber-400' },
                   { icon: ShieldCheck, label: 'Access Log Incon.', color: 'text-sky-400' },
                   { icon: AlertTriangle, label: 'Critical Asset Temp', color: 'text-rose-400' }
                 ].map((alert, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <alert.icon className={alert.color} size={14} />
                     <span className="text-[10px] font-bold text-white/80">{alert.label}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TemplateAppCalendarPage;