import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  Download,
  FileText
} from 'lucide-react';

const TemplateAppUserManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Total Personnel', value: '1,284', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Active Identity', value: '1,150', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Suspended', value: '42', icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Pending Auth', value: '92', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const users = [
    { id: 'USR-001', name: 'John Smith', email: 'john.smith@reksolindo.com', role: 'Super Admin', status: 'Active', avatar: 'JS' },
    { id: 'USR-002', name: 'Sarah Johnson', email: 's.johnson@reksolindo.com', role: 'Manager', status: 'Active', avatar: 'SJ' },
    { id: 'USR-003', name: 'Mike Wilson', email: 'm.wilson@reksolindo.com', role: 'Technician', status: 'Inactive', avatar: 'MW' },
    { id: 'USR-004', name: 'Alex Wong', email: 'a.wong@reksolindo.com', role: 'Inspector', status: 'Active', avatar: 'AW' },
    { id: 'USR-005', name: 'Elena Rodriguez', email: 'e.rodriguez@reksolindo.com', role: 'Analyst', status: 'Pending', avatar: 'ER' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Governance • Personnel Control</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">Manager</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Orchestrate enterprise-grade user lifecycle management. Define granular security policies, monitor access patterns, and enforce compliance across the entire organizational hierarchy.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <UserPlus size={18} strokeWidth={3} />
                    Onboard Member
                  </button>
                  <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all">
                    Security Policy
                  </button>
                </div>
             </div>
             
             <div className="hidden lg:grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
                     <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}>
                        <s.icon size={20} />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                     <p className="text-3xl font-black text-white">{s.value}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 🚀 Controls & Directory */}
      <section className="space-y-6">
         <div className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between border border-white/40">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search personnel by ID, name or email..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                  <Filter size={16} /> Filter
               </button>
               <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-indigo-500 transition-all">
                  <Download size={18} />
               </button>
               <div className="h-8 w-[1px] bg-slate-100"></div>
               <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                  <UserPlus size={16} /> Add New
               </button>
            </div>
         </div>

         <div className="glass-card rounded-[2.5rem] shadow-premium border border-white/40 overflow-hidden bg-white/50 backdrop-blur-md">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Team Member</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Role</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Hash</th>
                        <th className="px-8 py-6"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                     {users.map((user) => (
                       <tr key={user.id} className="hover:bg-slate-50/80 transition-all group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                   {user.avatar}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-800 leading-none mb-1">{user.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <Shield size={14} className="text-indigo-400" />
                                <span className="text-xs font-black text-slate-700">{user.role}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                               user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                               user.status === 'Inactive' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                               'bg-amber-50 text-amber-600 border-amber-100'
                             }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  user.status === 'Active' ? 'bg-emerald-500' :
                                  user.status === 'Inactive' ? 'bg-rose-500' :
                                  'bg-amber-500'
                                }`}></div>
                                {user.status}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <code className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{user.id}</code>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"><Edit3 size={18} /></button>
                                <button className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
                                <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all shadow-sm"><MoreVertical size={18} /></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Displaying 5 out of 1,284 entries</p>
                  <div className="h-4 w-[1px] bg-slate-200"></div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows:</span>
                     <select className="bg-transparent border-none text-[10px] font-black text-slate-800 focus:ring-0 cursor-pointer">
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                     </select>
                  </div>
               </div>
               
               <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-900 transition-all shadow-sm disabled:opacity-30"><ChevronLeft size={20} /></button>
                  <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
                     <button className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs">1</button>
                     <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 font-black text-xs">2</button>
                     <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 font-black text-xs">3</button>
                  </div>
                  <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-900 transition-all shadow-sm"><ChevronRight size={20} /></button>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default TemplateAppUserManagementPage;