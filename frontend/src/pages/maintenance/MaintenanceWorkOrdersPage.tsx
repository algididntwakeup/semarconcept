import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Play, 
  Pause, 
  CheckCircle2, 
  Wrench, 
  Calendar, 
  User, 
  TrendingUp,
  AlertCircle,
  X,
  ArrowRight,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Box
} from 'lucide-react';

const MaintenanceWorkOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setModalOpen] = useState(false);

  // Sample work orders data
  const workOrders = [
    {
      id: 'WO-001',
      title: 'Pump A-101 Routine Maintenance',
      asset: 'Pump A-101',
      type: 'Preventive',
      status: 'In Progress',
      priority: 'Medium',
      assignee: 'John Doe',
      team: 'Mechanical Team',
      createdDate: '2025-06-01',
      scheduledDate: '2025-06-10',
      dueDate: '2025-06-15',
      estimatedHours: 8,
      actualHours: 4.5,
      progress: 60,
      description: 'Routine maintenance including bearing lubrication and alignment check',
      cost: 1250,
      materials: ['Bearing grease', 'Gaskets', 'Bolts']
    },
    {
      id: 'WO-002',
      title: 'Tank B-205 Emergency Repair',
      asset: 'Tank B-205',
      type: 'Corrective',
      status: 'Open',
      priority: 'Critical',
      assignee: 'Jane Smith',
      team: 'Welding Team',
      createdDate: '2025-06-09',
      scheduledDate: '2025-06-11',
      dueDate: '2025-06-12',
      estimatedHours: 16,
      actualHours: 0,
      progress: 0,
      description: 'Emergency repair of tank bottom plate corrosion',
      cost: 3500,
      materials: ['Steel plate', 'Welding electrodes', 'Grinding discs']
    },
    {
      id: 'WO-003',
      title: 'Valve C-301 Overhaul',
      asset: 'Valve C-301',
      type: 'Predictive',
      status: 'Completed',
      priority: 'High',
      assignee: 'Bob Wilson',
      team: 'Instrumentation Team',
      createdDate: '2025-05-20',
      scheduledDate: '2025-06-05',
      dueDate: '2025-06-08',
      estimatedHours: 12,
      actualHours: 10,
      progress: 100,
      description: 'Complete valve overhaul based on condition monitoring data',
      cost: 2100,
      materials: ['Valve internals', 'Actuator parts', 'Seals']
    }
  ];

  const stats = [
    { label: 'Total Orders', value: 42, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Cycle', value: 12, icon: Play, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Finalized', value: 28, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Risk/Overdue', value: 2, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Budget Util.', value: '$45K', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-50' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Open': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Scheduled': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'On Hold': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'High': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  const filteredOrders = workOrders.filter(wo => 
     wo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     wo.asset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Maintenance Operations • Task Execution</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Maintenance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Hub</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Streamline your infrastructure lifecycle. Manage work orders, track team performance, and optimize asset reliability across the entire enterprise.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setModalOpen(true)}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={18} strokeWidth={3} />
                  Initiate Work Order
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                  <TrendingUp size={18} />
                  Efficiency Metrics
                </button>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
               {stats.slice(0, 4).map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 min-w-[120px]">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Wide Stats Banner */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
         {stats.map((s, i) => (
           <div key={i} className="glass-card p-6 flex flex-col items-center text-center shadow-premium rounded-[2rem] hover:-translate-y-1 transition-transform border border-white/50 group">
              <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner`}>
                 <s.icon size={22} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
              <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{s.value}</p>
           </div>
         ))}
      </section>

      {/* 🛠️ Work Orders Registry */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        
        {/* Dynamic Toolbar */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search order ID, title or asset..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-indigo-500/50 transition-all font-bold"
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-2xl hover:bg-slate-50 transition-all">
                 <Filter size={16} /> Extended Filter
              </button>
              <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
              <button className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:scale-110 active:scale-95 transition-all">
                 <Plus size={20} />
              </button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Specification</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inflow Domain</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / priority</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workforce</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Completion</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl border shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform ${getStatusColor(wo.status)}`}>
                        <Wrench size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1.5">{wo.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <Box size={10} className="text-indigo-400" /> {wo.id} • {wo.asset}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                       {wo.type}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex flex-col gap-2">
                        <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-sm w-fit ${getStatusColor(wo.status)}`}>
                           {wo.status}
                        </div>
                        <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border w-fit ${getPriorityStyle(wo.priority)}`}>
                           {wo.priority}
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 border border-white shadow-premium flex items-center justify-center text-[10px] font-black text-slate-500 overflow-hidden">
                          {wo.assignee.split(' ').map(n => n[0]).join('')}
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-800 leading-none">{wo.assignee}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{wo.team}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-black text-slate-800">{wo.progress}%</span>
                           <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${wo.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: `${wo.progress}%` }}
                              ></div>
                           </div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                           <Clock size={10} /> {wo.dueDate}
                        </p>
                     </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all shadow-sm"><Eye size={18} /></button>
                       <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><MoreVertical size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Infrastructure maintenance lifecycle monitoring active 24/7
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                 <span className="text-xs font-black text-indigo-600">1</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">12</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* 📦 Maintenance Initialization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-2xl relative z-10 flex flex-col scale-in overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Initialize Work Order</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maintenance requisition workflow</p>
               </div>
               <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="form-label uppercase text-[9px] font-black tracking-widest">Operation Designation</label>
                     <input type="text" className="form-input transition-all focus:ring-4 focus:ring-indigo-500/10" placeholder="e.g. Pump A-101 Critical Refurbishment" />
                  </div>
                  <div className="space-y-2">
                     <label className="form-label uppercase text-[9px] font-black tracking-widest">Mission Description</label>
                     <textarea className="form-input min-h-[100px]" placeholder="Outline exact operational goals and safety protocols..."></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="form-label uppercase text-[9px] font-black tracking-widest">Infrastructure Link</label>
                        <select className="form-input">
                           <option>Select Asset...</option>
                           <option>Pump A-101</option>
                           <option>Tank B-205</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="form-label uppercase text-[9px] font-black tracking-widest">Operation Domain</label>
                        <select className="form-input">
                           <option>Preventive Task</option>
                           <option>Emergency Corrective</option>
                           <option>Predictive Analysis</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="form-label uppercase text-[9px] font-black tracking-widest">Strategic Priority</label>
                        <select className="form-input">
                           <option>Standard (Normal)</option>
                           <option>High Priority</option>
                           <option>Critical Mission</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="form-label uppercase text-[9px] font-black tracking-widest">Workforce Assignment</label>
                        <select className="form-input">
                           <option>Unassigned (Pool)</option>
                           <option>Mechanical Team A</option>
                           <option>Reliability Experts</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="form-label uppercase text-[9px] font-black tracking-widest">Scheduled Inception</label>
                        <div className="relative">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input type="date" className="form-input pl-12" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="form-label uppercase text-[9px] font-black tracking-widest">Completion Deadline</label>
                        <div className="relative">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input type="date" className="form-input pl-12" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setModalOpen(false)} className="btn-secondary-premium">Discard Request</button>
               <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  Launch Work Order <ArrowRight size={14} />
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaintenanceWorkOrdersPage;