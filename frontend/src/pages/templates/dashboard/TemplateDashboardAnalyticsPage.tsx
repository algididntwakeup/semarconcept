import React, { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const TemplateDashboardAnalyticsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const mockData = [
    { id: 'ANL-001', name: 'Asset Utilization', status: 'Optimal', value: '94.2%', trend: '+2.5%', lastUpdated: '2025-01-15' },
    { id: 'ANL-002', name: 'Risk Exposure', status: 'Warning', value: '12.8%', trend: '-1.2%', lastUpdated: '2025-01-14' },
    { id: 'ANL-003', name: 'Maintenance Efficiency', status: 'Optimal', value: '88.5%', trend: '+5.7%', lastUpdated: '2025-01-13' },
    { id: 'ANL-004', name: 'Operational Cost', status: 'Critical', value: '$1.2M', trend: '+12.4%', lastUpdated: '2025-01-12' },
    { id: 'ANL-005', name: 'Compliance Score', status: 'Optimal', value: '98.9%', trend: '+0.5%', lastUpdated: '2025-01-11' },
  ];

  const stats = [
    { label: 'Total Analytics', value: '1,284', trend: '+14%', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Active Monitors', value: '842', trend: '+5%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Alerts Raised', value: '12', trend: '-8%', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Mapped Entities', value: '45.2k', trend: '+22%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Intelligence • Real-time Monitoring</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">Insights</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed opacity-80">
                Visualize operational efficiency and security posture with granular data points. Transform raw telemetry into actionable business intelligence.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={18} strokeWidth={3} />
                  New Monitor
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all">
                  Export Report
                </button>
              </div>
            </div>
            
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group-hover:-translate-y-1 transition-transform duration-500">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}>
                    <s.icon size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <span className={`text-[10px] font-bold ${s.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} mb-1`}>{s.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Dynamic Controls */}
      <section className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search metrics by ID, name or status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} />
            Advanced Filters
          </button>
          <div className="h-8 w-[1px] bg-slate-100"></div>
          <button className="px-4 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            Refresh
          </button>
        </div>
      </section>

      {/* 📊 Data Grid */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Value</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">24h Trend</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Synced</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white/50">
              {mockData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{row.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      row.status === 'Optimal' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      row.status === 'Warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        row.status === 'Optimal' ? 'bg-emerald-500' :
                        row.status === 'Warning' ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}></div>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-sm font-black text-slate-700">{row.value}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className={`flex items-center justify-center gap-1 font-bold text-xs ${row.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {row.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {row.trend}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px]">
                      <Clock size={14} />
                      {row.lastUpdated}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"><Eye size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Found {mockData.length} intelligence routines
           </p>
           <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-primary-600">{page}</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">1</span>
              </div>
              <button 
                disabled={true}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

    </div>
  );
};

export default TemplateDashboardAnalyticsPage;
