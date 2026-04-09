import React, { useState } from 'react';
import { 
  Network,
  Settings2,
  ListRestart,
  CheckCircle2,
  AlertCircle,
  FileBox,
  KeySquare,
  RefreshCcw,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';

const mockIntegrations = [
  { id: 'INT-01', name: 'SAP ERP Integration', type: 'ERP Connector', status: 'Active', endpoint: 'api.sap.com/v1', lastSync: '2 minutes ago' },
  { id: 'INT-02', name: 'Maximo CMMS', type: 'Maintenance API', status: 'Active', endpoint: 'maximo.corp.local', lastSync: '15 minutes ago' },
  { id: 'INT-03', name: 'Historian Scada Database', type: 'Data Lake', status: 'Error', endpoint: 'scada.internal/query', lastSync: 'Failed (Timeout)' },
  { id: 'INT-04', name: 'DocuSign Enterprise', type: 'Contract Signatures', status: 'Inactive', endpoint: 'docusign.net/rest', lastSync: 'Never' }
];

const AdminIntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('integrations');

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Platform Core • Hub</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">Integrations</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Synchronize master asset data between SEMAR and external authoritative systems like SAP or Maximo.
                </p>
             </div>
             
             <div className="hidden lg:grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Endpoints</p>
                   <p className="text-3xl font-black text-white">4</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Health</p>
                   <p className="text-3xl font-black text-emerald-400">75%</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner col-span-2">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sync Volume (24h)</p>
                         <p className="text-2xl font-black text-blue-400">14.2k <span className="text-sm font-medium text-slate-400">reqs</span></p>
                      </div>
                      <Network className="text-white/20" size={32} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 🚀 Main Interface */}
      <div className="glass-card max-w-7xl mx-auto rounded-[3rem] shadow-premium overflow-hidden border border-slate-100/50 flex flex-col md:flex-row">
         
         <div className="w-full md:w-80 bg-slate-50/80 border-r border-slate-100 p-8 flex flex-col min-h-[500px]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Data Fabric</h3>
            <div className="space-y-2 flex-1">
               {[
                  { id: 'integrations', label: 'Active Endpoints', icon: Network },
                  { id: 'api', label: 'API Keys & Secrets', icon: KeySquare },
                  { id: 'logs', label: 'Transaction Logs', icon: ListRestart },
                  { id: 'settings', label: 'Global Rules', icon: Settings2 }
               ].map((tab) => (
                  <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all ${
                        activeTab === tab.id 
                           ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                           : 'bg-transparent text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm'
                     }`}
                  >
                     <div className="flex items-center gap-3"><tab.icon size={16} /> {tab.label}</div>
                  </button>
               ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
               <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 shadow-xl transition-all">
                  <Plus size={16} /> New Endpoint
               </button>
            </div>
         </div>

         <div className="flex-1 bg-white p-10 overflow-x-auto">
            {activeTab === 'integrations' && (
               <div className="animate-in fade-in slide-in-from-right-8 duration-500 min-w-[600px]">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                     <h2 className="text-xl font-black text-slate-800 tracking-tight">Active Endpoints Tracker</h2>
                  </div>

                  <div className="space-y-4">
                     {mockIntegrations.map(integration => (
                        <div key={integration.id} className="p-6 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group bg-slate-50/50">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${integration.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : integration.status === 'Error' ? 'bg-rose-50 text-rose-600' : 'bg-slate-200 text-slate-400'}`}>
                                 {integration.status === 'Active' ? <CheckCircle2 size={24} /> : integration.status === 'Error' ? <AlertCircle size={24} /> : <FileBox size={24} />}
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-2">{integration.name}</h4>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border bg-white text-slate-500 border-slate-200">
                                       {integration.type}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-slate-400">{integration.endpoint}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-4 text-right">
                                 Last Sync <br/> <span className="text-slate-700">{integration.lastSync}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">Config</button>
                                 <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"><RefreshCcw size={16} /></button>
                                 <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 size={16} /></button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {activeTab !== 'integrations' && (
               <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500 opacity-60 min-h-[300px]">
                  <Settings2 size={48} className="text-slate-300 mb-6 animate-spin-slow" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Advanced Config Pending</h3>
                  <p className="text-[10px] font-bold text-slate-400 max-w-sm leading-relaxed">Establish OAuth token secrets or monitor raw HTTP/SOAP payload exchanges in this subsection.</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default AdminIntegrationsPage;