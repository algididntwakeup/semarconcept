import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  X,
  MapPin,
  Settings,
  HardHat,
  Timer,
  ArrowRight,
  TrendingUp,
  Box as BoxIcon
} from 'lucide-react';

interface MaintenanceEvent {
  id: string;
  title: string;
  workOrderNumber: string;
  assetName: string;
  assetId: string;
  maintenanceType: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  date: Date;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  description?: string;
  requiredParts?: string[];
  requiredTools?: string[];
}

const MaintenanceCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceEvent | null>(null);

  // Sample events
  const [events] = useState<MaintenanceEvent[]>([
    {
      id: '1',
      title: 'Pump Bearing Replacement',
      workOrderNumber: 'WO-2025-001',
      assetName: 'Pump A-101',
      assetId: 'AST-001',
      maintenanceType: 'preventive',
      status: 'scheduled',
      date: new Date(2025, 5, 15, 8, 0),
      assignedTo: 'John Smith',
      priority: 'high',
      estimatedDuration: 6,
      description: 'Replace worn bearings and seals',
      requiredParts: ['Bearing 6308', 'Shaft Seal'],
      requiredTools: ['Bearing Puller', 'Torque Wrench']
    },
    {
      id: '2',
      title: 'Emergency Valve Repair',
      workOrderNumber: 'WO-2025-002',
      assetName: 'Safety Valve SV-120',
      assetId: 'AST-002',
      maintenanceType: 'emergency',
      status: 'in_progress',
      date: new Date(2025, 5, 12, 10, 0),
      assignedTo: 'Sarah Johnson',
      priority: 'critical',
      estimatedDuration: 4
    }
  ]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'in_progress': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'scheduled': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'emergency': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-rose-600';
      case 'high': return 'text-amber-600';
      case 'medium': return 'text-blue-600';
      default: return 'text-emerald-600';
    }
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (dir === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-violet-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Temporal Intelligence • Resource Planning</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Maintenance <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Timeline</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Master the cadence of your critical assets. A multi-dimensional scheduling environment designed for elite operational oversight and resource optimization.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={18} strokeWidth={3} />
                  Schedule Deployment
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                   <TrendingUp size={18} /> Schedule Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🗓️ Core Calendar Grid */}
      <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden">
         {/* Calendar Navigation */}
         <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex items-center gap-6">
               <div className="flex bg-white shadow-soft rounded-2xl border border-slate-100 p-1">
                  <button onClick={() => navigateMonth('prev')} className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><ChevronLeft size={20} /></button>
                  <button onClick={() => navigateMonth('next')} className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><ChevronRight size={20} /></button>
               </div>
               <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                    {monthNames[currentDate.getMonth()]} <span className="text-indigo-600">{currentDate.getFullYear()}</span>
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active operational window</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="hidden lg:flex gap-4 mr-6 pr-6 border-r border-slate-200">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emergency</span>
                  </div>
               </div>
               <button className="px-6 py-2.5 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-2xl hover:border-indigo-500 transition-all shadow-sm">View Month</button>
               <button className="px-6 py-2.5 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-300 rounded-2xl cursor-not-allowed">Gantt Flow</button>
            </div>
         </div>

         {/* Calendar Visualization */}
         <div className="grid grid-cols-7 border-collapse">
            {dayNames.map(d => (
              <div key={d} className="px-4 py-5 bg-slate-50 text-center border-b border-r border-slate-100">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</span>
              </div>
            ))}
            
            {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-40 bg-slate-50/30 border-b border-r border-slate-100"></div>
            ))}
            
            {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
              const day = i + 1;
              const hasEvents = day === 12 || day === 15; // Just for demo
              return (
                <div key={day} className={`h-40 p-4 border-b border-r border-slate-100 hover:bg-slate-50/50 transition-colors group relative cursor-pointer ${day === new Date().getDate() ? 'bg-indigo-50/30' : 'bg-white'}`}>
                   <span className={`text-xs font-black transition-colors ${day === new Date().getDate() ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-800'}`}>{day}</span>
                   
                   <div className="mt-3 space-y-1.5">
                      {day === 15 && (
                        <div onClick={() => setSelectedEvent(events[0])} className="px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[9px] font-black text-blue-600 leading-tight truncate shadow-sm hover:scale-105 transition-transform z-10">
                           {events[0].title}
                        </div>
                      )}
                      {day === 12 && (
                        <div onClick={() => setSelectedEvent(events[1])} className="px-2 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-[9px] font-black text-rose-600 leading-tight truncate shadow-sm hover:scale-105 transition-transform z-10">
                           {events[1].title}
                        </div>
                      )}
                   </div>
                   
                   {day === new Date().getDate() && (
                      <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-glow-blue animate-pulse"></div>
                   )}
                </div>
              );
            })}
         </div>
      </div>

      {/* 📦 Event Orchestration Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEvent(null)}></div>
          <div className="modal-glass w-full max-w-3xl relative z-10 flex flex-col scale-in overflow-hidden">
            
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-[500px]">
               {/* Left Sidebar Info */}
               <div className="md:col-span-2 bg-slate-900 p-10 text-white flex flex-col">
                  <div className="flex items-center gap-3 mb-10">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                         <Wrench size={20} className="text-violet-400" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-violet-300 uppercase tracking-widest leading-none mb-1">Asset ID</p>
                         <p className="text-xs font-black text-white/50">{selectedEvent.assetId}</p>
                      </div>
                  </div>
                  
                  <div className="mt-auto space-y-8">
                     <div>
                        <h3 className="text-3xl font-black tracking-tighter leading-tight mb-2">{selectedEvent.title}</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{selectedEvent.description || 'No detailed brief provided for this deployment cycle.'}</p>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <User className="text-violet-400" size={16} />
                           <div>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lead Strategist</p>
                              <p className="text-xs font-bold">{selectedEvent.assignedTo}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Clock className="text-violet-400" size={16} />
                           <div>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Temporal Window</p>
                              <p className="text-xs font-bold">{selectedEvent.estimatedDuration} Hours (Verified)</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Main Content */}
               <div className="md:col-span-3 bg-white p-10 flex flex-col relative">
                  <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors">
                     <X size={20} className="text-slate-400" />
                  </button>

                  <div className="mb-10 flex gap-3">
                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(selectedEvent.status)}`}>
                        {selectedEvent.status.replace('_', ' ')}
                     </span>
                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-slate-900 text-white`}>
                        {selectedEvent.maintenanceType}
                     </span>
                  </div>

                  <div className="space-y-8 flex-1">
                     <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Settings size={14} /> Critical Resources
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                           {selectedEvent.requiredParts?.map((part, i) => (
                             <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                <BoxIcon className="text-indigo-400" size={14} />
                                <span className="text-[11px] font-black text-slate-700">{part}</span>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <HardHat size={14} /> Strategic Tools
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                           {selectedEvent.requiredTools?.map((tool, i) => (
                             <div key={i} className="flex items-center gap-3 text-slate-600">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-[11px] font-bold">{tool}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex justify-end gap-3">
                     <button className="btn-secondary-premium px-6">Modify Brief</button>
                     <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        Commence Work <ArrowRight size={14} />
                     </button>
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MaintenanceCalendarPage;