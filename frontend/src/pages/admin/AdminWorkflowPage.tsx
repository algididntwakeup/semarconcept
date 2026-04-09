import React, { useState } from 'react';
import { 
  GitMerge, 
  Activity, 
  Play, 
  Pause, 
  Settings, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Plus,
  Clock,
  ArrowRight
} from 'lucide-react';

const mockWorkflows = [
  { id: 'WF-001', name: 'Asset Approval Sequence', type: 'Asset Management', status: 'Active', steps: 4, executions: '1,245', success: '98.5%' },
  { id: 'WF-002', name: 'Inspection Scheduling', type: 'Inspection', status: 'Active', steps: 3, executions: '890', success: '99.1%' },
  { id: 'WF-003', name: 'Maintenance Request', type: 'Maintenance', status: 'Paused', steps: 5, executions: '3,412', success: '92.4%' },
  { id: 'WF-004', name: 'Compliance Audit Trail', type: 'Compliance', status: 'Draft', steps: 2, executions: '0', success: '0%' }
];

const mockExecutions = [
  { id: 'EXEC-1042', workflow: 'Asset Approval Sequence', status: 'Running', progress: 65, started: '10 mins ago' },
  { id: 'EXEC-1043', workflow: 'Inspection Scheduling', status: 'Pending', progress: 0, started: '15 mins ago' },
  { id: 'EXEC-1041', workflow: 'Maintenance Request', status: 'Completed', progress: 100, started: '1 hour ago' }
];

const AdminWorkflowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workflows');

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Platform Core • Automation</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Workflow <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">Engine</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Design, automate, and monitor complex business process pipelines across the entire enterprise ecosystem.
                </p>
             </div>
             
             <div className="hidden lg:grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Routines</p>
                   <p className="text-3xl font-black text-white">24</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Execution Vol.</p>
                   <p className="text-3xl font-black text-indigo-400">5.5k</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner col-span-2 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                      <p className="text-2xl font-black text-emerald-400">96.8%</p>
                   </div>
                   <Activity className="text-white/20" size={32} />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 🚀 Main Interface */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
         
         <div className="px-8 pt-6 border-b border-slate-100 flex gap-10 overflow-x-auto scrollbar-hide">
            {[
              { id: 'workflows', label: 'Pipeline Configurations', icon: GitMerge },
              { id: 'executions', label: 'Active Executions', icon: Activity },
              { id: 'logs', label: 'System Logs', icon: FileText }
            ].map(tab => (
               <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <tab.icon size={14} /> {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full"></div>}
               </button>
            ))}
         </div>

         {activeTab === 'workflows' && (
            <div className="animate-in fade-in duration-500">
               <div className="p-8 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Registered Automations</h2>
                  <button className="px-6 py-3 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
                     <Plus size={16} /> Create Blueprint
                  </button>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                     <thead>
                        <tr className="bg-white">
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Identity</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Context / Domain</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Steps</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                           <th className="px-8 py-5"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 bg-white">
                        {mockWorkflows.map(row => (
                           <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-8 py-5">
                                 <h4 className="text-sm font-black text-slate-800 mb-1">{row.name}</h4>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.id}</p>
                              </td>
                              <td className="px-8 py-5 text-xs font-bold text-slate-600">{row.type}</td>
                              <td className="px-8 py-5">
                                 {row.status === 'Active' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest"><Play size={10} /> Active</span>}
                                 {row.status === 'Paused' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[9px] font-black uppercase tracking-widest"><Pause size={10} /> Paused</span>}
                                 {row.status === 'Draft' && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest"><Edit2 size={10} /> Draft</span>}
                              </td>
                              <td className="px-8 py-5 text-xs font-black text-slate-400">{row.steps} nodes</td>
                              <td className="px-8 py-5">
                                 <p className="text-xs font-black text-slate-700">{row.success} <span className="text-[10px] font-medium text-slate-400 ml-2">({row.executions} runs)</span></p>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Settings size={16} /></button>
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'executions' && (
            <div className="p-8 animate-in fade-in duration-500 bg-slate-50/30">
               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {mockExecutions.map(exec => (
                     <div key={exec.id} className="p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-premium hover:border-indigo-100 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{exec.id}</p>
                              <h3 className="text-sm font-black text-slate-800">{exec.workflow}</h3>
                           </div>
                           {exec.status === 'Running' && <span className="p-2 bg-indigo-50 text-indigo-500 rounded-xl animate-pulse"><Activity size={16} /></span>}
                           {exec.status === 'Pending' && <span className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Clock size={16} /></span>}
                           {exec.status === 'Completed' && <span className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><CheckCircle2 size={16} /></span>}
                        </div>
                        
                        <div className="space-y-2 mb-6">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400">Progress</span>
                              <span className="text-slate-700">{exec.progress}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${exec.status === 'Running' ? 'bg-indigo-500' : exec.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'}`} style={{ width: `${exec.progress}%` }}></div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Started {exec.started}</p>
                           <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 group-hover:text-indigo-600">
                              Trace <ArrowRight size={14} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
         
         {activeTab === 'logs' && (
            <div className="p-10 animate-in fade-in duration-500 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
               <FileText size={48} className="mx-auto mb-4 opacity-20" />
               Log Stream disconnected. Connect to indexing service.
            </div>
         )}
      </div>

    </div>
  );
};

export default AdminWorkflowPage;