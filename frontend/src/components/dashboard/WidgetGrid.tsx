import React, { useState, useEffect } from 'react';
import { 
  Box, 
  ClipboardCheck, 
  Wrench, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  BellRing,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

// --- DATA ---
const performanceData = [
  { name: 'Jan', value: 85 },
  { name: 'Feb', value: 88 },
  { name: 'Mar', value: 92 },
  { name: 'Apr', value: 89 },
  { name: 'May', value: 94 },
  { name: 'Jun', value: 96 },
];

const riskData = [
  { name: 'Critical', value: 5, color: '#f43f5e' },
  { name: 'High', value: 12, color: '#f59e0b' },
  { name: 'Medium', value: 25, color: '#3b82f6' },
  { name: 'Low', value: 58, color: '#10b981' },
];

const maintenanceData = [
  { name: 'Week 1', completed: 12, scheduled: 15 },
  { name: 'Week 2', completed: 18, scheduled: 20 },
  { name: 'Week 3', completed: 15, scheduled: 16 },
  { name: 'Week 4', completed: 22, scheduled: 22 },
];

const recentAlerts = [
  { id: 1, title: 'Critical Vibration Detected', target: 'Pump A-101', time: '2 mins ago', severity: 'critical' },
  { id: 2, title: 'Corrosion Threshold Breached', target: 'Tank B-205', time: '1 hour ago', severity: 'high' },
  { id: 3, title: 'Sensor Connection Lost', target: 'Node-44', time: '3 hours ago', severity: 'medium' },
];

const upcomingTasks = [
  { id: 1, task: 'Bi-Annual Overhaul', asset: 'Compressor C3', date: 'Tomorrow', type: 'Maintenance' },
  { id: 2, task: 'Pressure Test', asset: 'Main Pipeline', date: 'Jun 22', type: 'Inspection' },
];

// --- COMPONENTS ---

const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string; trend: number }> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="glass-card p-6 rounded-[2rem] shadow-premium hover:-translate-y-1 transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 ${color} opacity-5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-soft transition-all`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${trend > 0 ? 'text-emerald-500 bg-emerald-50 border border-emerald-100' : 'text-rose-500 bg-rose-50 border border-rose-100'}`}>
        {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(trend)}%
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h3>
  </div>
);

const ChartWidget: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="glass-card p-8 rounded-[2.5rem] shadow-premium flex flex-col h-[400px]">
    <div className="flex justify-between items-start mb-8">
      <div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">{title}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
      </div>
      <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><MoreVertical size={18} className="text-slate-400" /></button>
    </div>
    <div className="flex-1 w-full min-h-0">
      {children}
    </div>
  </div>
);

const WidgetGrid: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[2rem]"></div>)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 🚀 Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Assets" value="2,845" icon={Box} color="text-blue-500" trend={3.2} />
        <StatCard title="Active Inspec." value="142" icon={ClipboardCheck} color="text-indigo-500" trend={12.5} />
        <StatCard title="Open Work Orders" value="64" icon={Wrench} color="text-violet-500" trend={-4.1} />
        <StatCard title="Compliance Score" value="96.8" icon={ShieldCheck} color="text-emerald-500" trend={2.4} />
      </div>

      {/* 📊 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget title="Asset Performance Trends" subtitle="Global efficiency metrics (last 6 months)">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={performanceData}>
               <defs>
                 <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
               />
               <YAxis hide domain={[70, 100]} />
               <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
               />
               <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
               />
             </AreaChart>
           </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="Risk Distribution" subtitle="Active anomalies by severity class">
           <div className="flex flex-col md:flex-row h-full items-center">
             <div className="flex-1 w-full h-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex flex-col gap-3 pr-8">
                {riskData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">{d.name}</span>
                     <span className="text-xs font-black text-slate-800">{d.value}%</span>
                  </div>
                ))}
             </div>
           </div>
        </ChartWidget>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🔔 Recent Alerts */}
        <div className="glass-card p-8 rounded-[2.5rem] shadow-premium flex flex-col h-[400px]">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                 <BellRing size={16} className="text-rose-500" /> Recent Alerts
              </h3>
              <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-500 text-[8px] font-black uppercase">Live</span>
           </div>
           <div className="space-y-4 flex-1">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-soft transition-all group flex items-start gap-4 cursor-pointer">
                   <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-rose-500 shadow-glow-rose' : 'bg-amber-500 shadow-glow-amber'}`}></div>
                   <div className="flex-1">
                      <p className="text-xs font-black text-slate-800 mb-0.5">{alert.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alert.target}</p>
                   </div>
                   <span className="text-[9px] font-bold text-slate-300 uppercase">{alert.time}</span>
                </div>
              ))}
           </div>
           <button className="mt-6 w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors flex items-center justify-center gap-2">
              View All Signals <ArrowRight size={14} />
           </button>
        </div>

        {/* ⚙️ Maintenance Performance */}
        <div className="glass-card p-8 rounded-[2.5rem] shadow-premium flex flex-col h-[400px]">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2 leading-none">Maintenance Velocity</h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Service fulfillment (Weekly)</p>
           <div className="flex-1 -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                   <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
                   <Bar dataKey="scheduled" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={12} />
                   <Tooltip />
                </BarChart>
              </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scheduled</span></div>
           </div>
        </div>

        {/* 📅 Upcoming Tasks */}
        <div className="glass-card p-8 rounded-[2.5rem] shadow-premium flex flex-col h-[400px]">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                 <Calendar size={16} className="text-indigo-500" /> Upcoming Tasks
              </h3>
           </div>
           <div className="space-y-4 flex-1">
              {upcomingTasks.map(task => (
                <div key={task.id} className="p-5 rounded-[2rem] bg-indigo-50/30 border border-indigo-100 flex flex-col gap-3 group hover:bg-indigo-50 transition-colors">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{task.type}</p>
                         <h4 className="text-xs font-black text-slate-800">{task.task}</h4>
                      </div>
                      <div className="p-2 bg-white rounded-xl shadow-sm"><Clock size={12} className="text-indigo-400" /></div>
                   </div>
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{task.asset}</p>
                      <span className="text-[10px] font-black text-indigo-600 bg-white px-3 py-1 rounded-lg border border-indigo-100">{task.date}</span>
                   </div>
                </div>
              ))}
           </div>
           <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors self-end">Expand Schedule</button>
        </div>
      </div>
    </div>
  );
};

export default WidgetGrid;
