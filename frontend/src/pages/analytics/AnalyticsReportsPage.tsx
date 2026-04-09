// platform/frontend-mui/src/pages/analytics/AnalyticsReportsPage.tsx
import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileText, 
  Plus, 
  Download, 
  Share2, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Settings,
  Activity,
  Zap,
  Target
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'table' | 'chart' | 'pdf';
  category: string;
  status: 'ready' | 'generating' | 'error';
  lastGenerated: string;
  size?: string;
  author: string;
  isScheduled: boolean;
}

const AnalyticsReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Asset Performance Summary',
      description: 'Comprehensive overview of asset performance metrics and KPIs',
      type: 'dashboard',
      category: 'Asset Management',
      status: 'ready',
      lastGenerated: '2024-01-20 09:30',
      author: 'John Smith',
      isScheduled: true,
    },
    {
      id: '2',
      name: 'Maintenance Cost Analysis',
      description: 'Detailed breakdown of maintenance costs by asset type',
      type: 'pdf',
      category: 'Maintenance',
      status: 'ready',
      lastGenerated: '2024-01-19 14:45',
      size: '2.4 MB',
      author: 'Sarah Johnson',
      isScheduled: false
    }
  ]);

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || r.category === categoryFilter)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Intelligence • Business Insights</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Engine</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Generate high-fidelity reports and data visualizations. Harness the power of predictive analytics to optimize your enterprise operations.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  New Insight
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Settings size={16} />
                  Engine Config
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Active KPIs', value: '42', color: 'text-indigo-400' },
                 { label: 'Accuracy', value: '98.2%', color: 'text-emerald-400' },
                 { label: 'Processes', value: '1.2k', color: 'text-blue-400' },
                 { label: 'Uptime', value: '99.9%', color: 'text-amber-400' },
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
            placeholder="Search reports or data models..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Categories
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* 📊 Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="glass-card p-8 rounded-[2.5rem] shadow-premium hover:shadow-2xl transition-all group border border-white/40">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-indigo-100">
                {report.type === 'dashboard' ? <BarChart3 size={24} /> : <FileText size={24} />}
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${report.status === 'ready' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {report.status}
                </span>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">{report.name}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">{report.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{report.lastGenerated}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Target size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{report.category}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                  {report.author.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{report.author}</span>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                  <Share2 size={18} />
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all">
                  <Download size={16} />
                  Pull Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📂 Empty State Search */}
      {filteredReports.length === 0 && (
        <div className="glass-card py-24 rounded-[3rem] text-center">
           <Zap size={48} className="mx-auto text-slate-200 mb-4" />
           <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Intelligence Data Found</p>
           <p className="text-slate-400 text-xs mt-1">Adjust your parameters and try a new scan.</p>
        </div>
      )}

      {/* 📑 Premium Pagination */}
      <div className="glass-card px-8 py-5 rounded-[2rem] shadow-premium flex items-center justify-between">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           Mapping {filteredReports.length} reports • System Core v4.2
         </p>
         <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 transition-all"><ChevronLeft size={18} /></button>
            <div className="px-5 py-2 bg-indigo-50 text-indigo-600 font-black text-xs rounded-xl shadow-inner border border-indigo-100">01</div>
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 transition-all"><ChevronRight size={18} /></button>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsReportsPage;