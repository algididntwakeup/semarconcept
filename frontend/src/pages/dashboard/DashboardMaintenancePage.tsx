import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCcw, 
  Download, 
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Plus,
  Settings
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

// --- MOCK DATA ---
const maintenanceStats = {
  totalWorkOrders: { value: 234, change: 5.4, trend: 'up' },
  completed: { value: 156, percentage: 67 },
  inProgress: { value: 45, percentage: 19 },
  overdue: { value: 18, percentage: 8 },
  scheduled: { value: 15, percentage: 6 }
};

const maintenanceTrend = [
  { month: 'Jan', completed: 110, scheduled: 130 },
  { month: 'Feb', completed: 145, scheduled: 150 },
  { month: 'Mar', completed: 130, scheduled: 160 },
  { month: 'Apr', completed: 175, scheduled: 180 },
  { month: 'May', completed: 190, scheduled: 210 },
  { month: 'Jun', completed: 156, scheduled: 220 }
];

const recentWorkOrders = [
  { id: 'WO-001', asset: 'Pump A-101', type: 'Preventive', status: 'In Progress', assignee: 'John Doe', priority: 'High', dueDate: '2025-06-11' },
  { id: 'WO-002', asset: 'Tank B-205', type: 'Corrective', status: 'Completed', assignee: 'Jane Smith', priority: 'Medium', dueDate: '2025-06-09' },
  { id: 'WO-003', asset: 'Valve C-301', type: 'Emergency', status: 'Overdue', assignee: 'Bob Wilson', priority: 'Critical', dueDate: '2025-06-08' },
  { id: 'WO-004', asset: 'Motor E-511', type: 'Predictive', status: 'Scheduled', assignee: 'Alice Brown', priority: 'Low', dueDate: '2025-06-13' }
];

// --- COMPONENTS ---
const StatCard: React.FC<{ label: string; value: string | number; sub: string; icon: any; color: string; trend?: number }> = ({ label, value, sub, icon: Icon, color, trend }) => (
  <div className="glass-card p-6 rounded-[2rem] shadow-premium hover:-translate-y-1 transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 ${color.replace('text-', 'bg-')} opacity-5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-white border border-slate-100 shadow-soft group-hover:shadow-md transition-all`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${trend > 0 ? 'text-emerald-500 bg-emerald-50 border border-emerald-100' : 'text-rose-500 bg-rose-50 border border-rose-100'}`}>
          {trend > 0 ? <TrendingUp size={12} /> : <Activity size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-1">{value}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">{sub}</p>
  </div>
);

const SectionHeader: React.FC<{ title: string; subtitle: string; icon: any; iconColor: string }> = ({ title, subtitle, icon: Icon, iconColor }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className={`w-12 h-12 rounded-2xl ${iconColor} flex items-center justify-center shadow-soft`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{title}</h2>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
    </div>
  </div>
);

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const DashboardMaintenancePage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><RefreshCcw className="animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight Section */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 group-hover:translate-x-1 transition-transform">
                <Settings size={14} className="text-amber-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Operations • Maintenance</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                Maintenance <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">Operations</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-10 leading-relaxed opacity-80">
                Track maintenance work orders, monitor completion rates, and manage schedules for optimal asset performance and reliability.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  <Plus size={18} strokeWidth={3} />
                  Create Work Order
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3">
                  <Download size={18} />
                  Export Log
                </button>
              </div>
            </div>

            {/* Micro Stats Overlay */}
            <div className="grid grid-cols-2 gap-4 lg:w-[400px]">
               <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 group-hover:-translate-y-1 transition-all duration-300">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Completion Rate</p>
                  <p className="text-3xl font-black text-white">{maintenanceStats.completed.percentage}%</p>
                  <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${maintenanceStats.completed.percentage}%` }}></div>
                  </div>
               </div>
               <div className="p-6 rounded-3xl bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 group-hover:-translate-y-1 transition-all duration-300">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Critical Tasks</p>
                  <p className="text-3xl font-black text-rose-500">{maintenanceStats.overdue.value}</p>
                  <p className="mt-2 text-[9px] font-bold text-rose-300 uppercase tracking-widest">Require Attention</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 High-Impact Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Work Orders" value={maintenanceStats.totalWorkOrders.value} sub="Active & Scheduled" icon={Wrench} color="text-amber-500" trend={maintenanceStats.totalWorkOrders.change} />
        <StatCard label="In Progress" value={maintenanceStats.inProgress.value} sub={`${maintenanceStats.inProgress.percentage}% of total queue`} icon={PlayCircle} color="text-indigo-500" />
        <StatCard label="Completed" value={maintenanceStats.completed.value} sub={`${maintenanceStats.completed.percentage}% success rate`} icon={CheckCircle2} color="text-emerald-500" />
        <StatCard label="Overdue" value={maintenanceStats.overdue.value} sub={`${maintenanceStats.overdue.percentage}% backlog`} icon={AlertTriangle} color="text-rose-500" />
      </section>

      {/* 🛠️ Main Analytics */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 glass-card p-10 rounded-[3rem] shadow-premium">
          <SectionHeader title="Maintenance Velocity" subtitle="Completed vs Scheduled over 6 months" icon={Activity} iconColor="bg-amber-500" />
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={maintenanceTrend}>
                <defs>
                  <linearGradient id="colorCompletedMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill:'#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill:'#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="completed" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorCompletedMain)" />
                <Area type="monotone" dataKey="scheduled" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Work Orders Sidebar */}
        <div className="glass-card p-8 rounded-[3rem] shadow-premium bg-slate-50/50">
          <SectionHeader title="Active Work Orders" subtitle="Latest tasks and assignments" icon={Clock} iconColor="bg-indigo-500" />
          <div className="space-y-4">
            {recentWorkOrders.map(wo => (
              <div key={wo.id} className="p-5 rounded-3xl bg-white border border-slate-100 flex flex-col gap-3 hover:border-amber-200 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{wo.asset}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{wo.type} | {wo.id}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${
                    wo.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    wo.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    wo.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {wo.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600">
                      {getInitials(wo.assignee)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{wo.assignee}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${wo.priority === 'Critical' ? 'text-rose-500 bg-rose-50' : wo.priority === 'High' ? 'text-orange-500 bg-orange-50' : 'text-blue-500 bg-blue-50'}`}>
                       {wo.priority}
                     </span>
                     <ArrowRight size={14} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-800 transition-all">
            View All Work Orders
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardMaintenancePage;
