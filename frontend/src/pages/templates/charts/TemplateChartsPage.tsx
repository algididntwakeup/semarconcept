import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  PieChart, 
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  PieChart as PieIcon, 
  BarChart3, 
  Download, 
  MoreHorizontal, 
  ChevronRight,
  Zap,
  Cpu
} from 'lucide-react';

const data = [
  { name: 'Mon', value: 4000, secondary: 2400 },
  { name: 'Tue', value: 3000, secondary: 1398 },
  { name: 'Wed', value: 2000, secondary: 9800 },
  { name: 'Thu', value: 2780, secondary: 3908 },
  { name: 'Fri', value: 1890, secondary: 4800 },
  { name: 'Sat', value: 2390, secondary: 3800 },
  { name: 'Sun', value: 3490, secondary: 4300 },
];

const pieData = [
  { name: 'On-spec', value: 400 },
  { name: 'Off-spec', value: 300 },
  { name: 'Unknown', value: 300 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const TemplateChartsPage: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Visualizations • Analytics Engine</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-300">Kinetic</span>
            </h1>
            <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
              Transform raw systemic parameters into actionable behavioral clusters. Our charting architecture uses neural-ready temporal mapping for deep visibility.
            </p>
          </div>
        </div>
      </section>

      {/* Grid Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 01. Area Chart - Full Width */}
        <div className="lg:col-span-12 space-y-4">
           <div className="flex items-center justify-between px-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Activity size={14} className="text-indigo-500" /> 01. Temporal Velocity
              </p>
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Download size={18} /></button>
           </div>
           
           <div className="glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 bg-white h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                    <defs>
                       <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                    <Tooltip 
                       contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '10px'}}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                    <Area type="monotone" dataKey="secondary" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSec)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* 02. Bar Chart */}
        <div className="lg:col-span-7 space-y-4">
           <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={14} className="text-emerald-500" /> 02. Distribution Logic
           </p>
           <div className="glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 bg-white h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                       {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#e2e8f0'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* 03. Pie Chart */}
        <div className="lg:col-span-5 space-y-4">
           <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <PieIcon size={14} className="text-amber-500" /> 03. Fractional Cohorts
           </p>
           <div className="glass-card p-10 rounded-[3rem] shadow-premium border border-white/40 bg-white h-[400px] flex flex-col items-center justify-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={10}
                        dataKey="value"
                      >
                         {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                        ))}
                      </Pie>
                      <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-6 mt-4">
                 {pieData.map((d, i) => (
                   <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{d.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default TemplateChartsPage;
