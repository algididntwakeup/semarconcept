import React, { useState } from 'react';
import { 
   KeyRound, 
   ShieldCheck, 
   Users, 
   RefreshCcw, 
   Settings, 
   Plus,
   AlertCircle,
   CheckCircle2,
   Trash2,
   CloudCog,
   Network,
   MonitorSmartphone
} from 'lucide-react';

const mockProviders = [
  { id: 'azure', name: 'Azure Active Directory', type: 'OAuth2.0', status: 'Active', domain: 'reksolindo.onmicrosoft.com', users: 1247 },
  { id: 'google', name: 'Google Workspace', type: 'OpenID Connect', status: 'Inactive', domain: 'reksolindo.com', users: 0 },
  { id: 'okta', name: 'Okta Enterprise', type: 'SAML 2.0', status: 'Testing', domain: 'reksolindo.okta.com', users: 12 },
  { id: 'ldap', name: 'Corporate LDAP (Legacy)', type: 'LDAP', status: 'Error', domain: 'idp.internal.reksolindo', users: 856 }
];

const AdminSsoConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('providers');

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-teal-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-10 sm:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Platform Core • IAM</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                   Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-teal-300">Federation</span>
                </h1>
                <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80">
                   Unified Single Sign-On (SSO) architecture mapping corporate identities into functional platform roles securely.
                </p>
             </div>
             
             <div className="hidden lg:grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Providers</p>
                   <p className="text-3xl font-black text-white">4</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SSO Auth</p>
                   <p className="text-3xl font-black text-rose-400">92%</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner col-span-2">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mapped Users</p>
                         <p className="text-2xl font-black text-teal-400">2,115</p>
                      </div>
                      <Users className="text-white/20" size={32} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <div className="glass-card max-w-7xl mx-auto rounded-[3rem] shadow-premium overflow-hidden border border-slate-100/50 flex flex-col lg:flex-row">
         
         <div className="w-full lg:w-80 bg-slate-50/80 border-r border-slate-100 p-8 flex flex-col min-h-[600px]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Access Configurations</h3>
            <div className="space-y-2 flex-1">
               {[
                  { id: 'providers', label: 'SSO Directory', icon: Network },
                  { id: 'mappings', label: 'Attribute Mapping', icon: CloudCog },
                  { id: 'security', label: 'Auth Triggers', icon: ShieldCheck },
                  { id: 'sessions', label: 'Session Policies', icon: MonitorSmartphone }
               ].map((tab) => (
                  <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`w-full flex items-center gap-4 px-4 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-wider transition-all ${
                        activeTab === tab.id 
                           ? 'bg-rose-600 text-white shadow-xl shadow-rose-200' 
                           : 'bg-transparent text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm'
                     }`}
                  >
                     <tab.icon size={18} /> {tab.label}
                  </button>
               ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
               <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 shadow-sm transition-all">
                  <Plus size={16} /> New Connection
               </button>
            </div>
         </div>

         <div className="flex-1 bg-white p-10">
            {activeTab === 'providers' && (
               <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                     <h2 className="text-xl font-black text-slate-800 tracking-tight">Identity Providers (IdP)</h2>
                  </div>

                  <div className="space-y-6">
                     {mockProviders.map(provider => (
                        <div key={provider.id} className="p-8 rounded-[2rem] border-2 border-slate-100 hover:border-rose-200 bg-slate-50/30 hover:shadow-xl transition-all group">
                           
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b border-slate-100">
                              <div className="flex items-center gap-4">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${provider.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : provider.status === 'Error' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {provider.status === 'Active' ? <CheckCircle2 size={24} /> : provider.status === 'Error' ? <AlertCircle size={24} /> : <KeyRound size={24} />}
                                 </div>
                                 <div>
                                    <h4 className="text-base font-black text-slate-800 tracking-tight leading-none mb-2">{provider.name}</h4>
                                    <div className="flex items-center gap-2">
                                       <span className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-black text-slate-500 rounded uppercase tracking-widest">{provider.type}</span>
                                       <span className="text-[10px] font-bold text-slate-400">{provider.domain}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">Config</button>
                                 <button className="p-2 border border-slate-200 text-slate-400 bg-white hover:text-rose-600 hover:bg-rose-50 rounded-xl shadow-sm transition-all"><Trash2 size={16} /></button>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State</p>
                                 <p className={`text-xs font-black tracking-widest uppercase ${provider.status === 'Active' ? 'text-emerald-500' : provider.status === 'Error' ? 'text-rose-500' : 'text-slate-600'}`}>{provider.status}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mapped Users</p>
                                 <p className="text-xl font-black text-slate-800 leading-none">{provider.users.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                 <button className="inline-flex items-center gap-2 text-[10px] font-black text-teal-600 uppercase tracking-widest hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-teal-100 mt-2">
                                    <RefreshCcw size={12} /> Sync Directory
                                 </button>
                              </div>
                           </div>
                           
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {activeTab !== 'providers' && (
               <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500 opacity-60">
                  <Settings size={48} className="text-slate-300 mb-6 animate-spin-slow" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">IAM Parameters Placeholder</h3>
                  <p className="text-[10px] font-bold text-slate-400 max-w-sm leading-relaxed">Map OAuth claims (email, given_name, roles) into SEMAR authorization groups directly within this configuration section.</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default AdminSsoConfigPage;