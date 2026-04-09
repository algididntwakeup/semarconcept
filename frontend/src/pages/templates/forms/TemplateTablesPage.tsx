import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';

const mockData = [
  { id: 'TBL-1001', process: 'Authentication Subsystem', status: 'Active', latency: '42ms', requests: '1.2M', author: 'Systems Core', updated: '2 mins ago' },
  { id: 'TBL-1002', process: 'Data Synchronization', status: 'Warning', latency: '850ms', requests: '345K', author: 'Data Pipeline', updated: '15 mins ago' },
  { id: 'TBL-1003', process: 'Background Workers', status: 'Active', latency: '12ms', requests: '8.9M', author: 'Job Queue', updated: 'Just now' },
  { id: 'TBL-1004', process: 'Legacy Database Sync', status: 'Failed', latency: 'TIMEOUT', requests: '0', author: 'DEPRECATED', updated: '2 hours ago' },
  { id: 'TBL-1005', process: 'User Notifications', status: 'Active', latency: '156ms', requests: '2.1M', author: 'Notification Engine', updated: '5 mins ago' }
];

const TemplateTablesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Active': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max"><CheckCircle2 size={12} /> Operational</span>;
      case 'Warning': return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max"><Activity size={12} /> Degraded</span>;
      case 'Failed': return <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max"><AlertCircle size={12} /> Offline</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
         <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
         <div className="absolute -top-10 -right-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-[80px]"></div>
         
         <div className="relative z-10 p-10 sm:p-14">
            <div className="max-w-xl">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                  <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">Data Presentation • Tables</span>
               </div>
               <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tighter leading-tight">
                  High-Density <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Data Grids</span>
               </h1>
               <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                  Advanced structural layouts for complex enterprise data visualization. Designed to handle large datasets natively.
               </p>
            </div>
         </div>
      </section>

      {/* 📊 The Data Grid */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
         
         {/* Toolbar */}
         <div className="bg-slate-50/80 px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                  type="text" 
                  placeholder="Filter processes, identifiers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-medium placeholder:text-slate-400"
               />
               <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all">
                  <Filter size={14} />
               </button>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
               <button className="px-6 py-3 bg-white border border-slate-100 text-slate-600 hover:text-cyan-600 hover:border-cyan-200 rounded-2xl transition-all shadow-sm font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Download size={14} /> Export CSV
               </button>
               <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all shadow-sm">
                  <MoreHorizontal size={18} />
               </button>
            </div>
         </div>

         {/* The Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
               <thead>
                  <tr className="bg-white/50 border-b border-slate-100">
                     {['Process ID', 'System Domain', 'Health State', 'I/O Latency', 'Throughput', 'Owner Thread', ''].map((header, i) => (
                        <th 
                           key={i} 
                           className={`px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${header ? 'cursor-pointer hover:bg-slate-50/50 transition-colors group' : ''}`}
                           onClick={() => header && handleSort(header.toLowerCase())}
                        >
                           <div className="flex items-center gap-2">
                              {header}
                              {header && (
                                 <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300">
                                    <ChevronDown size={12} />
                                 </span>
                              )}
                           </div>
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 bg-white">
                  {mockData.map((row) => (
                     <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-5">
                           <span className="text-[11px] font-black text-slate-800 tracking-wider bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{row.id}</span>
                        </td>
                        <td className="px-8 py-5">
                           <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{row.process}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Last sync: {row.updated}</p>
                        </td>
                        <td className="px-8 py-5">
                           <StatusBadge status={row.status} />
                        </td>
                        <td className="px-8 py-5 text-xs font-mono font-bold text-slate-600">{row.latency}</td>
                        <td className="px-8 py-5 text-xs font-mono font-bold text-slate-600">{row.requests}</td>
                        <td className="px-8 py-5 text-[10px] font-black text-slate-500 tracking-widest uppercase">{row.author}</td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"><Eye size={16} /></button>
                              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                              <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination Footer */}
         <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Showing 1-5 of 124 System Processes
            </p>
            <div className="flex items-center gap-2">
               <button className="px-4 py-2 border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm bg-slate-50 disabled:opacity-50">Rev. Page</button>
               <button className="px-4 py-2 border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-sm bg-slate-50">Next Page</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TemplateTablesPage;
