import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  ClipboardCheck, 
  Settings as Tool, 
  ShieldCheck, 
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  PieChart,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { RootState } from '../../store';

const DashboardOverviewPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const firstName = user?.first_name || 'Admin';

  const performanceData = [
    { name: 'Jan', value: 85 },
    { name: 'Feb', value: 88 },
    { name: 'Mar', value: 84 },
    { name: 'Apr', value: 92 },
    { name: 'May', value: 90 },
    { name: 'Jun', value: 94 },
  ];

  const riskData = [
    { name: 'Low Risk', value: 65, color: '#10b981' },
    { name: 'Medium Risk', value: 25, color: '#f59e0b' },
    { name: 'High Risk', value: 10, color: '#ef4444' },
  ];

  const stats = [
    { label: 'Total Assets', value: '1,247', trend: '+12%', icon: Box, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Inspections', value: '89', trend: '15 overdue', icon: ClipboardCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', warning: true },
    { label: 'Open Work Orders', value: '156', trend: '23 critical', icon: Tool, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Compliance Score', value: '94.2%', trend: 'Stable', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Asset Intelligence • Real-time Monitoring</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{firstName}</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Your asset infrastructure is operating at peak efficiency. All critical metrics are within optimized parameters for the current cycle.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Generate Asset Report
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all">
                  Maintenance Logs
                </button>
              </div>
            </div>
            
            <div className="hidden lg:grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
               {stats.map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color.replace('text-', 'text-opacity-100 text-')}`}>{s.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Performance & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Asset Performance Trends */}
        <div className="lg:col-span-8">
          <div className="glass-card p-8 rounded-[2.5rem] shadow-premium h-full min-h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <TrendingUp className="text-primary-500 w-5 h-5" />
                  Asset Performance Trends
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Infrastructure Health Index</p>
              </div>
              <div className="flex bg-slate-100/50 p-1 rounded-xl">
                <button className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors">7D</button>
                <button className="px-3 py-1.5 text-[9px] font-bold bg-white text-primary-600 rounded-lg shadow-sm uppercase tracking-wider">30D</button>
              </div>
            </div>
            
            <div className="flex-1 w-full h-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorVal)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="lg:col-span-4">
          <div className="glass-card p-8 rounded-[2.5rem] shadow-premium h-full min-h-[450px] flex flex-col items-center justify-center text-center">
            <div className="mb-6 w-full text-left">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <PieChart className="text-rose-500 w-5 h-5" />
                Risk Distribution
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Criticality Analysis</p>
            </div>
            
            <div className="flex-1 w-full relative h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-3xl font-black text-slate-800">1,247</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Assets</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-full mt-4">
              {riskData.map((r, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: r.color }}></div>
                  <span className="text-[14px] font-black text-slate-800">{r.value}%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase leading-none mt-1">{r.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Alerts, Maintenance, Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Alerts */}
        <div className="glass-card p-6 rounded-[2.5rem] shadow-premium">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
              <AlertTriangle className="text-amber-500 w-4 h-4" />
              Recent Alerts
            </h3>
            <button className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Temperature Anomaly', asset: 'Pump P-101', time: '2m ago', severity: 'critical', icon: ArrowUpRight },
              { title: 'Voltage Flux', asset: 'Motor M-45', time: '14m ago', severity: 'warning', icon: Activity },
              { title: 'Offline Status', asset: 'Valve V-12', time: '1h ago', severity: 'info', icon: ArrowDownRight },
            ].map((alert, idx) => (
              <div key={idx} className="group p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-premium transition-all border border-transparent hover:border-slate-100 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                   <div className={`p-2 rounded-xl bg-white shadow-sm flex items-center justify-center ${alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                     <alert.icon size={16} />
                   </div>
                   <div>
                    <p className="text-xs font-bold text-slate-800 leading-none mb-1">{alert.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{alert.asset}</p>
                   </div>
                </div>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Performance */}
        <div className="glass-card p-6 rounded-[2.5rem] shadow-premium flex flex-col justify-between">
          <div className="px-2 mb-6">
            <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Activity className="text-emerald-500 w-4 h-4" />
              Maintenance Performance
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KPI Fulfillment Rate</p>
          </div>
          
          <div className="space-y-6 flex-1">
             {[
               { label: 'Preventive Maint.', value: 85, color: '#10b981' },
               { label: 'Corrective Maint.', value: 65, color: '#6366f1' },
               { label: 'Predictive Success', value: 92, color: '#f59e0b' },
             ].map((kpi, i) => (
               <div key={i} className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-bold">
                   <span className="text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                   <span className="text-slate-800">{kpi.value}%</span>
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full animate-in slide-in-from-left duration-1000" 
                      style={{ width: `${kpi.value}%`, backgroundColor: kpi.color }}
                    ></div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="glass-card p-6 rounded-[2.5rem] shadow-premium">
          <div className="flex items-center justify-between mb-8 px-2">
             <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
               <Calendar className="text-indigo-500 w-4 h-4" />
               Upcoming Tasks
             </h3>
             <Clock className="w-4 h-4 text-slate-300" />
          </div>
          <div className="space-y-3">
             {[
               { date: '04 Mar', task: 'Monthly Inspection', type: 'High', color: 'bg-rose-500' },
               { date: '07 Mar', task: 'Sensor Calibration', type: 'Medium', color: 'bg-amber-500' },
               { date: '12 Mar', task: 'Backup Verification', type: 'Low', color: 'bg-blue-500' },
               { date: '15 Mar', task: 'Safety Audit Phase 1', type: 'High', color: 'bg-rose-500' },
             ].map((task, idx) => (
               <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 border border-slate-100/50 hover:bg-slate-50 transition-colors">
                  <div className="bg-white px-2 py-1.5 rounded-xl shadow-sm border border-slate-100 text-center min-w-[50px]">
                    <span className="text-[10px] font-black text-slate-800 leading-none">{task.date.split(' ')[0]}</span>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{task.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800 mb-1">{task.task}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${task.color}`}></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{task.type} Priority</span>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverviewPage;
