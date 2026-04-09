import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Upload, 
  FileText, 
  PenTool, 
  Image as ImageIcon, 
  CheckCircle2, 
  Download, 
  Eye, 
  Edit2, 
  ChevronRight, 
  ChevronLeft,
  X,
  Filter,
  Activity,
  Box,
  ClipboardList
} from 'lucide-react';

const AssetTechnicalDataPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);

  // Sample technical data
  const technicalData = [
    {
      id: 'TD-001',
      assetId: 'AST-001',
      assetName: 'Pump A-101',
      category: 'Mechanical',
      parameter: 'Flow Rate',
      value: '150',
      unit: 'm³/h',
      tolerance: '±5%',
      lastUpdated: '2025-06-09',
      source: 'Manufacturer Datasheet',
      verified: true
    },
    {
      id: 'TD-002',
      assetId: 'AST-001',
      assetName: 'Pump A-101',
      category: 'Mechanical',
      parameter: 'Head Pressure',
      value: '120',
      unit: 'm',
      tolerance: '±3%',
      lastUpdated: '2025-06-09',
      source: 'Performance Test',
      verified: true
    },
    {
      id: 'TD-003',
      assetId: 'AST-002',
      assetName: 'Compressor C-205',
      category: 'Mechanical',
      parameter: 'RPM',
      value: '3600',
      unit: 'rev/min',
      tolerance: '±1%',
      lastUpdated: '2025-06-10',
      source: 'Field Verification',
      verified: false
    }
  ];

  const specifications = [
    {
      id: 'SPEC-001',
      assetId: 'AST-001',
      assetName: 'Pump A-101',
      title: 'Centrifugal Pump Specification',
      version: '2.1',
      type: 'Technical Specification',
      status: 'Approved',
      lastModified: '2025-06-05',
      size: '2.3 MB'
    },
    {
      id: 'SPEC-002',
      assetId: 'AST-002',
      assetName: 'Compressor C-205',
      title: 'Centrifugal Compressor Data Sheet',
      version: '1.0',
      type: 'Data Sheet',
      status: 'Under Review',
      lastModified: '2025-06-12',
      size: '1.8 MB'
    }
  ];

  const drawings = [
    {
      id: 'DWG-001',
      assetId: 'AST-001',
      assetName: 'Pump A-101',
      title: 'P&ID - Pump A-101 Installation',
      type: 'P&ID',
      number: 'P-001-A101',
      revision: 'C',
      discipline: 'Process',
      lastModified: '2025-06-04',
      size: '4.1 MB'
    }
  ];

  const dataStats = [
    { label: 'Parameters', value: 124, icon: Database, color: 'text-violet-500' },
    { label: 'Verified', value: 98, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Specifications', value: 45, icon: FileText, color: 'text-amber-500' },
    { label: 'Drawings', value: 182, icon: ImageIcon, color: 'text-blue-500' }
  ];

  const filteredData = technicalData.filter(data => {
    const matchesSearch = data.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         data.parameter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAsset = assetFilter === 'all' || data.assetId === assetFilter;
    return matchesSearch && matchesAsset;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-violet-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Engineering Analytics • Technical Inventory</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Data Hub</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Centralized repository for asset parameters, engineering specifications, and technical drawings. Ensure your operational data is accurate and verified.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setModalOpen(true)}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={18} strokeWidth={3} />
                  Add Parameter
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                  <Upload size={18} />
                  Batch Import
                </button>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
               {dataStats.map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 min-w-[120px]">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ Dynamic Navigation & Table Area */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        
        {/* Superior Tabs */}
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-10 overflow-x-auto scrollbar-hide">
           {[
             { label: 'Technical Parameters', icon: ClipboardList },
             { label: 'Engineering Specs', icon: FileText },
             { label: 'Technical Drawings', icon: ImageIcon },
           ].map((tab, i) => (
             <button 
               key={i}
               onClick={() => setTabValue(i)}
               className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 whitespace-nowrap ${tabValue === i ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <tab.icon size={14} />
               {tab.label}
               {tabValue === i && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full"></div>}
             </button>
           ))}
        </div>

        {tabValue === 0 && (
          <div className="p-0 animate-in fade-in duration-500">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
               <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search parameters or asset names..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-indigo-500/50 transition-all font-medium"
                  />
               </div>
               <div className="flex items-center gap-3 w-full md:w-auto">
                 <select 
                   value={assetFilter}
                   onChange={(e) => setAssetFilter(e.target.value)}
                   className="px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                 >
                    <option value="all">All Infrastructure Assets</option>
                    <option value="AST-001">Pump A-101</option>
                    <option value="AST-002">Compressor C-205</option>
                 </select>
                 <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                    <Download size={18} />
                 </button>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Identification</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parameter Key</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Design Threshold</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Provenance</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verification</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((data) => (
                    <tr key={data.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-all">
                              <Box size={16} />
                           </div>
                           <div>
                             <p className="text-sm font-black text-slate-800 leading-none mb-1">{data.assetName}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{data.category}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600">{data.parameter}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                           <span className="text-[14px] font-black text-slate-800">{data.value}</span>
                           <span className="text-[10px] font-bold text-slate-400">{data.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           < PenTool size={10} /> {data.source}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                           {data.verified ? (
                             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] uppercase tracking-wider">
                                <CheckCircle2 size={10} /> Verified
                             </div>
                           ) : (
                             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 font-black text-[9px] uppercase tracking-wider">
                                <Activity size={10} /> Draft
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"><Eye size={18} /></button>
                           <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(tabValue === 1 || tabValue === 2) && (
          <div className="p-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {(tabValue === 1 ? specifications : drawings).map((item: any) => (
               <div key={item.id} className="flex items-center gap-6 p-5 bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-indigo-100 rounded-[2rem] hover:shadow-premium transition-all group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border group-hover:scale-110 transition-transform ${tabValue === 1 ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                    {tabValue === 1 ? <FileText size={24} /> : <ImageIcon size={24} />}
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">{item.title}</h4>
                        {item.status && (
                           <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {item.status}
                           </span>
                        )}
                        {item.type && !item.status && (
                           <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-[8px] font-black uppercase tracking-widest">
                             {item.type}
                           </span>
                        )}
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex flex-wrap items-center gap-x-4">
                        <span>Ref: {item.assetName}</span>
                        {item.version && <span>Version {item.version}</span>}
                        {item.number && <span>Doc#: {item.number}</span>}
                        <span>Size: {item.size}</span>
                     </p>
                  </div>
                  <div className="flex items-center gap-2 pr-4">
                     <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                        <Download size={14} /> Download
                     </button>
                     <button className="p-2.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all">
                        <Eye size={18} />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* 📑 Premium Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Analysis of registered engineering datasets completed
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                 <span className="text-xs font-black text-indigo-600">1</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">12</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* 📦 Add Parameter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-xl relative z-10 flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Register Parameter</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expansion of engineering inventory</p>
               </div>
               <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="form-label">Asset Association</label>
                     <select className="form-input">
                        <option>Pump A-101</option>
                        <option>Compressor C-205</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="form-label">Data Realm</label>
                     <select className="form-input">
                        <option>Mechanical Engineering</option>
                        <option>Electrical Systems</option>
                        <option>Process Control</option>
                     </select>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="form-label">Parameter Specification</label>
                  <input type="text" className="form-input" placeholder="e.g. Design Pressure, Operating Temperature" />
               </div>
               <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-2">
                     <label className="form-label">Threshold Value</label>
                     <input type="text" className="form-input" placeholder="Value" />
                  </div>
                  <div className="space-y-2">
                     <label className="form-label">Metric Unit</label>
                     <input type="text" className="form-input" placeholder="e.g. m/s, bar, C" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="form-label">Provenance Source</label>
                  <input type="text" className="form-input" placeholder="e.g. Manufacturer Datasheet Section 4.2" />
               </div>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setModalOpen(false)} className="btn-secondary-premium">Discard</button>
               <button className="btn-premium">Commit Parameter</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetTechnicalDataPage;