import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  RefreshCcw, 
  Download, 
  MoreVertical,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  ChevronRight,
  LayoutGrid,
  BarChart3,
  PieChart as PieChartIcon,
  CircleDot
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend
} from 'recharts';

// --- MOCK DATA ---
const assetMetrics = {
  totalAssets: { value: 1247, change: 3.2, trend: 'up' },
  operationalAssets: { value: 1089, percentage: 87.3 },
  maintenanceAssets: { value: 89, percentage: 7.1 },
  inactiveAssets: { value: 69, percentage: 5.5 },
  averageHealth: { value: 84.2, change: 2.1, trend: 'up' },
  criticalAssets: { value: 15, change: -2, trend: 'down' }
};

const assetHealthTrend = [
  { month: 'Jan', health: 82.1, availability: 94.2, performance: 87.5 },
  { month: 'Feb', health: 83.4, availability: 95.1, performance: 88.9 },
  { month: 'Mar', health: 82.8, availability: 93.8, performance: 86.2 },
  { month: 'Apr', health: 84.6, availability: 96.3, performance: 89.7 },
  { month: 'May', health: 85.2, availability: 94.9, performance: 90.1 },
  { month: 'Jun', health: 84.2, availability: 95.7, performance: 88.6 }
];

const assetByCategory = [
  { category: 'Pumps', count: 387, health: 85.2 },
  { category: 'Compressors', count: 156, health: 79.8 },
  { category: 'Heat Exchangers', count: 234, health: 88.1 },
  { category: 'Motors', count: 298, health: 86.7 },
  { category: 'Valves', count: 172, health: 82.4 }
];

const assetsByLocation = [
  { name: 'Building A', value: 423, color: '#3b82f6' },
  { name: 'Building B', value: 387, color: '#10b981' },
  { name: 'Building C', value: 245, color: '#f59e0b' },
  { name: 'Building D', value: 192, color: '#ef4444' }
];

const criticalAssets = [
  { id: 'AST001', name: 'Pump A-101', health: 23, status: 'Critical', lastMaintenance: '2024-01-10' },
  { id: 'AST045', name: 'Compressor C-205', health: 34, status: 'Critical', lastMaintenance: '2024-01-08' },
  { id: 'AST089', name: 'Motor M-154', health: 41, status: 'Warning', lastMaintenance: '2024-01-12' },
  { id: 'AST156', name: 'Valve V-089', health: 29, status: 'Critical', lastMaintenance: '2024-01-05' },
  { id: 'AST203', name: 'Heat Exchanger HX-301', health: 38, status: 'Warning', lastMaintenance: '2024-01-15' }
];

const upcomingMaintenance = [
  { id: 'AST023', name: 'Pump P-205', type: 'Preventive', due: 'Today', priority: 'High' },
  { id: 'AST067', name: 'Compressor C-301', type: 'Inspection', due: 'Tomorrow', priority: 'Medium' },
  { id: 'AST143', name: 'Motor M-089', type: 'Calibration', due: 'In 2 days', priority: 'Medium' },
  { id: 'AST189', name: 'Valve V-156', type: 'Repair', due: 'In 3 days', priority: 'High' },
  { id: 'AST234', name: 'Heat Exchanger HX-405', type: 'Preventive', due: 'In 5 days', priority: 'Low' }
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

const DashboardAssetPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('performance');
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 group-hover:translate-x-1 transition-transform">
                <Zap size={14} className="text-amber-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Enterprise Intelligence • Assets</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Intelligence</span> Dashboard
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-10 leading-relaxed opacity-80">
                Advanced structural health monitoring and predictive performance metrics. Operationalize your infrastructure data into strategic decisions.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  <Download size={18} strokeWidth={3} />
                  Export Full Report
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3">
                  <RefreshCcw size={18} />
                  Re-Sync Hub
                </button>
              </div>
            </div>

            {/* Micro Stats Overlay */}
            <div className="grid grid-cols-2 gap-4 lg:w-[400px]">
               <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 group-hover:-translate-y-1 transition-all duration-300">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Health Avg</p>
                  <p className="text-3xl font-black text-white">{assetMetrics.averageHealth.value}%</p>
                  <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${assetMetrics.averageHealth.value}%` }}></div>
                  </div>
               </div>
               <div className="p-6 rounded-3xl bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 group-hover:-translate-y-1 transition-all duration-300">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Critical Block</p>
                  <p className="text-3xl font-black text-rose-500">{assetMetrics.criticalAssets.value}</p>
                  <p className="mt-2 text-[9px] font-bold text-rose-300 uppercase tracking-widest">Action Required</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 High-Impact Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Inventory" value={assetMetrics.totalAssets.value} sub="Global registry entries" icon={HardHat} color="text-blue-500" trend={3.2} />
        <StatCard label="Operational Hub" value={assetMetrics.operationalAssets.value} sub={`${assetMetrics.operationalAssets.percentage}% of total fleet`} icon={CheckCircle2} color="text-emerald-500" />
        <StatCard label="In-Maintenance" value={assetMetrics.maintenanceAssets.value} sub={`${assetMetrics.maintenanceAssets.percentage}% undergoing service`} icon={Clock} color="text-indigo-500" />
        <StatCard label="Decommissioned" value={assetMetrics.inactiveAssets.value} sub={`${assetMetrics.inactiveAssets.percentage}% inactive/standby`} icon={AlertTriangle} color="text-slate-500" />
      </section>

      {/* 🛠️ Dynamic Analytics Hub */}
      <section className="glass-card p-4 rounded-[3rem] shadow-premium">
        <div className="flex flex-col md:flex-row gap-2">
          {[
            { id: 'performance', label: 'Performance Trends', icon: Activity },
            { id: 'categories', label: 'Asset Taxonomy', icon: LayoutGrid },
            { id: 'location', label: 'Geo Analysis', icon: MapPin },
            { id: 'critical', label: 'Risk Watchlist', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-transparent text-slate-400 hover:bg-slate-50'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-10 pt-14">
          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div className="lg:col-span-2">
                  <SectionHeader title="Health & Performance Index" subtitle="Overall fleet capability over 6 months" icon={BarChart3} iconColor="bg-blue-500" />
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={assetHealthTrend}>
                        <defs>
                          <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill:'#94a3b8'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill:'#94a3b8'}} />
                        <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="health" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorHealth)" />
                        <Area type="monotone" dataKey="availability" stroke="#10b981" strokeWidth={4} fill="transparent" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div>
                  <SectionHeader title="Maintenance Queue" subtitle="Priority items needing attention" icon={Clock} iconColor="bg-indigo-500" />
                  <div className="space-y-4">
                     {upcomingMaintenance.map(task => (
                        <div key={task.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-3 hover:bg-white hover:shadow-soft transition-all group cursor-pointer">
                           <div className="flex justify-between items-start">
                              <div>
                                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{task.type}</p>
                                 <h4 className="text-xs font-black text-slate-800">{task.name}</h4>
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${task.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>{task.priority}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span>Due {task.due}</span>
                              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div>
                  <SectionHeader title="Category Breakdown" subtitle="Distribution of assets by type" icon={LayoutGrid} iconColor="bg-violet-500" />
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assetByCategory} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="bg-slate-50/50 rounded-[2.5rem] p-10">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Category Health Health Index</h3>
                  <div className="space-y-8">
                     {assetByCategory.map(cat => (
                        <div key={cat.category}>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-black text-slate-700">{cat.category}</span>
                              <span className="text-xs font-black text-indigo-600">{cat.health}%</span>
                           </div>
                           <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${cat.health > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${cat.health}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'location' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="flex flex-col items-center">
                   <SectionHeader title="Spatial Distribution" subtitle="Assets mapped to operational zones" icon={MapPin} iconColor="bg-rose-500" />
                   <div className="h-[400px] w-full max-w-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={assetsByLocation} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none">
                              {assetsByLocation.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                           </Pie>
                           <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none'}} />
                           <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {assetsByLocation.map(loc => (
                      <div key={loc.name} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft flex items-center justify-between group hover:border-slate-200 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50" style={{ color: loc.color }}>
                               <CircleDot size={24} />
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-slate-800">{loc.name}</h4>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Site</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-2xl font-black text-slate-800">{loc.value}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Units</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'critical' && (
             <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                 <SectionHeader title="Structural Health Watchlist" subtitle="Anomalies detected in last 24 hours" icon={ShieldCheck} iconColor="bg-amber-500" />
                 <div className="overflow-x-auto -mx-4">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                       <thead>
                          <tr className="border-b border-slate-100">
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Detail</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Health</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Maint.</th>
                             <th className="px-6 py-4"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {criticalAssets.map(asset => (
                             <tr key={asset.id} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-6 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${asset.status === 'Critical' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                                         <AlertTriangle size={18} />
                                      </div>
                                      <div>
                                         <p className="text-xs font-black text-slate-800 leading-none mb-1">{asset.name}</p>
                                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{asset.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-6">
                                   <div className="flex items-center gap-3">
                                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                         <div className={`h-full rounded-full ${asset.health < 30 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${asset.health}%` }}></div>
                                      </div>
                                      <span className="text-[10px] font-black text-slate-600">{asset.health}%</span>
                                   </div>
                                </td>
                                <td className="px-6 py-6 text-center">
                                   <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${asset.status === 'Critical' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-amber-50 text-amber-500 border-amber-100'}`}>
                                      {asset.status}
                                   </span>
                                </td>
                                <td className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{asset.lastMaintenance}</td>
                                <td className="px-6 py-6 text-right">
                                   <button className="p-3 text-slate-300 hover:text-indigo-500 hover:bg-white rounded-2xl transition-all shadow-none hover:shadow-soft">
                                      <ArrowRight size={18} />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
             </div>
          )}
        </div>
      </section>

      {/* 🚀 Global Actions Footer */}
      <section className="flex flex-col md:flex-row gap-6">
         <div className="flex-1 glass-card p-10 rounded-[2.5rem] bg-indigo-600 shadow-2xl shadow-indigo-200 border-none relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-700 opacity-90"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
               <h3 className="text-xl font-black text-white mb-2 tracking-tight">Generate Operational Insight</h3>
               <p className="text-indigo-100 text-xs font-medium mb-6 opacity-80">Synthesize all asset health data into a strategic PDF briefing for stakeholders.</p>
               <button className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Compile Report</button>
            </div>
         </div>
         <div className="glass-card p-10 rounded-[2.5rem] border-slate-200 shadow-premium flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500 shadow-inner">
                  <Settings size={28} />
               </div>
               <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Alert Matrix</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adjust threshold triggers</p>
               </div>
            </div>
            <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:translate-x-1 transition-transform">
               <ArrowRight size={20} />
            </div>
         </div>
      </section>
    </div>
  );
};

export default DashboardAssetPage;