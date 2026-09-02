import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCcw, 
  Download, 
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  FileCheck,
  Scale
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
const complianceStats = {
  totalRequirements: { value: 178, change: 2.1, trend: 'up' },
  compliant: { value: 142, percentage: 80 },
  nonCompliant: { value: 23, percentage: 13 },
  pending: { value: 13, percentage: 7 },
  overallScore: { value: 80, change: 1.5, trend: 'up' }
};

const complianceTrend = [
  { month: 'Jan', score: 72, requirements: 150 },
  { month: 'Feb', score: 75, requirements: 155 },
  { month: 'Mar', score: 74, requirements: 160 },
  { month: 'Apr', score: 78, requirements: 165 },
  { month: 'May', score: 79, requirements: 172 },
  { month: 'Jun', score: 80, requirements: 178 }
];

const recentActivities = [
  { id: 'COMP-001', title: 'API 570 Inspection Review', type: 'Standard', status: 'Compliant', dueDate: '2025-06-15', priority: 'High' },
  { id: 'COMP-002', title: 'Environmental Audit', type: 'Audit', status: 'In Progress', dueDate: '2025-06-20', priority: 'Medium' },
  { id: 'COMP-003', title: 'Safety Certification Renewal', type: 'Certification', status: 'Overdue', dueDate: '2025-06-05', priority: 'Critical' },
  { id: 'COMP-004', title: 'Quality Management Review', type: 'Standard', status: 'Pending', dueDate: '2025-06-25', priority: 'Low' }
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

const DashboardCompliancePage: React.FC = () => {
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/40 to-violet-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 group-hover:translate-x-1 transition-transform">
                <Scale size={14} className="text-violet-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Regulatory • Compliance</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                Compliance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Audit</span> Center
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-10 leading-relaxed opacity-80">
                Monitor compliance status, track audit activities, and manage certifications to ensure regulatory adherence across all facilities.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  <FileCheck size={18} strokeWidth={3} />
                  New Compliance Task
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3">
                  <Download size={18} />
                  Export Audit Log
                </button>
              </div>
            </div>

            {/* Micro Stats Overlay */}
            <div className="grid grid-cols-2 gap-4 lg:w-[400px]">
               <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 group-hover:-translate-y-1 transition-all duration-300 col-span-2 flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Overall Score</p>
                    <p className="text-6xl font-black text-white">{complianceStats.overallScore.value}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                       <span>Target: 95</span>
                       <span className="text-violet-400">+{complianceStats.overallScore.change}% M/M</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-violet-500 rounded-full" style={{ width: `${complianceStats.overallScore.value}%` }}></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 High-Impact Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Requirements" value={complianceStats.totalRequirements.value} sub="Tracked regulations" icon={Scale} color="text-violet-500" trend={complianceStats.totalRequirements.change} />
        <StatCard label="Compliant" value={complianceStats.compliant.value} sub={`${complianceStats.compliant.percentage}% adherence`} icon={ShieldAlert} color="text-emerald-500" />
        <StatCard label="Non-Compliant" value={complianceStats.nonCompliant.value} sub={`${complianceStats.nonCompliant.percentage}% violations`} icon={AlertTriangle} color="text-rose-500" />
        <StatCard label="Pending Review" value={complianceStats.pending.value} sub={`${complianceStats.pending.percentage}% awaiting assessment`} icon={Clock} color="text-amber-500" />
      </section>

      {/* 🛠️ Main Analytics */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 glass-card p-10 rounded-[3rem] shadow-premium">
          <SectionHeader title="Compliance Trajectory" subtitle="Overall score progression over 6 months" icon={Activity} iconColor="bg-violet-500" />
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complianceTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill:'#94a3b8'}} dy={10} />
                <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill:'#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities Sidebar */}
        <div className="glass-card p-8 rounded-[3rem] shadow-premium bg-slate-50/50">
          <SectionHeader title="Recent Activities" subtitle="Latest audits and certifications" icon={Award} iconColor="bg-indigo-500" />
          <div className="space-y-4">
            {recentActivities.map(act => (
              <div key={act.id} className="p-5 rounded-3xl bg-white border border-slate-100 flex flex-col gap-3 hover:border-violet-200 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 line-clamp-1 pr-4">{act.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{act.type} | {act.id}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase whitespace-nowrap ${
                    act.status === 'Compliant' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    act.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    act.status === 'Non-Compliant' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    act.status === 'In Progress' ? 'bg-violet-50 text-violet-600 border border-violet-100' :
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {act.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-500">Due {act.dueDate}</span>
                  <div className="flex items-center gap-2">
                     <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${act.priority === 'Critical' ? 'text-rose-500 bg-rose-50' : act.priority === 'High' ? 'text-orange-500 bg-orange-50' : 'text-blue-500 bg-blue-50'}`}>
                       {act.priority}
                     </span>
                     <ArrowRight size={14} className="text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-800 transition-all">
            View All Activities
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardCompliancePage;