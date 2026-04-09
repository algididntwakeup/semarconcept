// platform/frontend-mui/src/pages/maintenance/MaintenanceTasksPage.tsx
import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Clock,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MoreVertical,
  Activity,
  History,
  Layout
} from 'lucide-react';

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  type: 'Preventive' | 'Corrective' | 'Predictive' | 'Emergency' | 'Overhaul';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';
  assetName: string;
  assignedTo: string;
  scheduledDate: string;
  progress: number;
}

const MaintenanceTasksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const maintenanceTasks: MaintenanceTask[] = [
    {
      id: '1',
      title: 'Pump Bearing Replacement',
      description: 'Replace worn bearings in centrifugal pump CP-001',
      type: 'Preventive',
      priority: 'High',
      status: 'In Progress',
      assetName: 'Centrifugal Pump 001',
      assignedTo: 'John Smith',
      scheduledDate: '2025-06-15',
      progress: 65,
    },
    {
      id: '3',
      title: 'Heat Exchanger Tube Cleaning',
      description: 'Clean tubes in heat exchanger HX-012 due to fouling',
      type: 'Corrective',
      priority: 'Medium',
      status: 'Completed',
      assetName: 'Heat Exchanger 012',
      assignedTo: 'Mike Wilson',
      scheduledDate: '2025-06-10',
      progress: 100,
    }
  ];

  const filteredTasks = maintenanceTasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.assetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'High': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Reliability • Asset Engineering</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Maintenance <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">Terminal</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Coordinate and execute technical maintenance workflows. Leverage proactive engineering strategies to minimize downtime and maximize asset lifespan.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  Schedule WO
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <History size={16} />
                   Log History
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Active WO', value: '28', color: 'text-amber-400' },
                 { label: 'Technicians', value: '14', color: 'text-blue-400' },
                 { label: 'Mkt Time', value: '4.2h', color: 'text-emerald-400' },
                 { label: 'Backlog', value: '09', color: 'text-rose-400' },
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
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search work orders, assets, or technicians..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Work Order Types
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button className="p-3 text-slate-400 hover:text-amber-600 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* 📑 Premium Content with Navigation */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-8">
           <button 
             onClick={() => setTabValue(0)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 0 ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Assignments
             {tabValue === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-full"></div>}
           </button>
           <button 
             onClick={() => setTabValue(1)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 1 ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Scheduler
             {tabValue === 1 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-full"></div>}
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Maintenance Entity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Context</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee & Target</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-amber-100">
                        <Wrench size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{task.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          #{task.id} • {task.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <Wrench size={14} className="text-slate-300" />
                       <span className="text-xs font-bold text-slate-600">{task.assetName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(task.status)}`}>
                        {task.status}
                      </span>
                      <div className="w-16 h-1 mt-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${task.progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${getPriorityStyle(task.priority)}`}>
                          {task.priority} Priority
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Target {task.scheduledDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-300">
                       <button className="p-2 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                         <Activity size={18} />
                       </button>
                       <button className="p-2 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                         <MoreVertical size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Engineering Backlog • Monitoring {filteredTasks.length} technical assignments
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-amber-600">01</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">01</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronRight size={18} /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTasksPage;