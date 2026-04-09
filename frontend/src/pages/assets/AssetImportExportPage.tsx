import React, { useState, useCallback } from 'react';
import { 
  CloudUpload, 
  CloudDownload, 
  FileText, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Calendar, 
  RefreshCcw, 
  Download, 
  Eye, 
  Trash2, 
  Plus, 
  ArrowRight,
  ArrowLeft,
  X,
  FileCode,
  Table as TableIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Clock
} from 'lucide-react';

interface ImportJob {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  createdAt: string;
  completedAt?: string;
  errors: string[];
}

interface ExportJob {
  id: string;
  name: string;
  type: 'assets' | 'maintenance' | 'inspections' | 'all';
  format: 'csv' | 'excel' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileSize?: string;
  createdAt: string;
  downloadUrl?: string;
}

const AssetImportExportPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStep, setImportStep] = useState(0);

  // Sample import jobs
  const [importJobs, setImportJobs] = useState<ImportJob[]>([
    {
      id: '1',
      filename: 'assets_batch_2024.csv',
      status: 'completed',
      progress: 100,
      totalRows: 1250,
      processedRows: 1250,
      successfulRows: 1247,
      failedRows: 3,
      createdAt: '2024-01-20 10:30',
      completedAt: '2024-01-20 10:35',
      errors: ['Row 45: Invalid asset category', 'Row 123: Missing required field']
    },
    {
      id: '2',
      filename: 'maintenance_records.xlsx',
      status: 'processing',
      progress: 65,
      totalRows: 850,
      processedRows: 553,
      successfulRows: 545,
      failedRows: 8,
      createdAt: '2024-01-20 11:15',
      errors: []
    }
  ]);

  // Sample export jobs
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'All Assets Export',
      type: 'assets',
      format: 'excel',
      status: 'completed',
      progress: 100,
      fileSize: '2.4 MB',
      createdAt: '2024-01-20 08:30',
      downloadUrl: '#'
    }
  ]);

  const stats = [
    { label: 'Total Imports', value: 142, icon: CloudUpload, color: 'text-blue-500' },
    { label: 'Total Exports', value: 89, icon: CloudDownload, color: 'text-cyan-500' },
    { label: 'Success Rate', value: '98.2%', icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Data Objects', value: '12.5k', icon: Database, color: 'text-amber-500' }
  ];

  const templates = [
    { name: 'Asset Registry', format: 'CSV', icon: TableIcon },
    { name: 'Maintenance Log', format: 'XLSX', icon: FileText },
    { name: 'Inspection Grid', format: 'CSV', icon: CheckCircle2 },
    { name: 'User Directory', format: 'XLSX', icon: Monitor }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const nextStep = () => setImportStep(prev => prev + 1);
  const prevStep = () => setImportStep(prev => prev - 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-cyan-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Data Synchronization • Batch Operations</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Import <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">& Export</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Connect your infrastructure data. Migrate massive datasets with a secure, multistage pipeline and export insights for external reporting.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setImportModalOpen(true)}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <CloudUpload size={18} strokeWidth={3} />
                  Initiate Import
                </button>
                <button 
                  onClick={() => setExportModalOpen(true)}
                  className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <CloudDownload size={18} />
                  Request Export
                </button>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner group-hover:-translate-y-2 transition-transform duration-500">
               {stats.map((s, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 min-w-[120px]">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                   <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 📋 Template Marketplace */}
      <section className="glass-card p-8 rounded-[2.5rem] shadow-premium">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
               <FileCode size={20} />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Standardized Templates</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ensure schema compatibility across all imports</p>
            </div>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((t, i) => (
              <div key={i} className="group p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-premium transition-all">
                 <div className="flex items-center justify-between mb-4">
                    <t.icon size={24} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-white border border-slate-100 text-slate-400 uppercase">{t.format}</span>
                 </div>
                 <h4 className="text-sm font-black text-slate-700 mb-4">{t.name}</h4>
                 <button className="w-full py-2 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm flex items-center justify-center gap-2">
                    <Download size={14} /> Download Template
                 </button>
              </div>
            ))}
         </div>
      </section>

      {/* 📊 History & Scheduled Tasks */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40 min-h-[500px]">
        {/* Dynamic Tabs */}
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-10 overflow-x-auto scrollbar-hide">
           {[
             { label: 'Import Ingestion', icon: CloudUpload },
             { label: 'Export Archival', icon: CloudDownload },
             { label: 'Automated Sync', icon: RefreshCcw },
           ].map((tab, i) => (
             <button 
               key={i}
               onClick={() => setTabValue(i)}
               className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 whitespace-nowrap ${tabValue === i ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <tab.icon size={14} />
               {tab.label}
               {tabValue === i && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500 rounded-full"></div>}
             </button>
           ))}
        </div>

        {tabValue === 0 && (
          <div className="overflow-x-auto animate-in fade-in duration-500">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Payload</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inflow Progress</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Records</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {importJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-slate-400 group-hover:text-cyan-500 transition-colors">
                            <TableIcon size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800 leading-none mb-1">{job.filename}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job: #{job.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(job.status)}`}>
                         {job.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="w-full max-w-[120px] mx-auto space-y-1.5">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-slate-400">
                             <span>{job.progress}%</span>
                          </div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className={`h-full transition-all duration-1000 ${job.status === 'failed' ? 'bg-rose-400' : 'bg-cyan-500'}`}
                               style={{ width: `${job.progress}%` }}
                             ></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex flex-col items-end">
                          <p className="text-xs font-black text-slate-700">{job.successfulRows.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">of {job.totalRows.toLocaleString()}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-300" /> {job.createdAt}
                       </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"><Eye size={18} /></button>
                          <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 📑 Premium Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Auditing of legacy and active ingestion streams completed
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                 <span className="text-xs font-black text-cyan-600">1</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">8</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* 📦 Import Pipeline Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setImportModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-2xl relative z-10 flex flex-col scale-in overflow-hidden">
            
            {/* Stepper Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  {[1, 2, 3, 4].map((s) => (
                    <React.Fragment key={s}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${importStep + 1 === s ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100' : importStep + 1 > s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                         {importStep + 1 > s ? <CheckCircle2 size={14} /> : s}
                      </div>
                      {s < 4 && <div className={`h-0.5 w-6 rounded-full ${importStep + 1 > s ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>}
                    </React.Fragment>
                  ))}
               </div>
               <button onClick={() => setImportModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>

            <div className="p-10 min-h-[400px]">
               {importStep === 0 && (
                 <div className="flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-inner border border-cyan-100">
                       <CloudUpload size={40} />
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight">Stage Ingestion File</h3>
                       <p className="text-sm font-medium text-slate-500 max-w-sm">Select a CSV, XLSX, or JSON file to begin the validation and mapping process.</p>
                    </div>
                    <label className="w-full p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50 hover:bg-white hover:border-cyan-300 transition-all flex flex-col items-center gap-3 cursor-pointer group">
                       <Plus size={24} className="text-slate-300 group-hover:text-cyan-500 transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Click to locate or drag binary payload</span>
                       <input type="file" className="hidden" />
                    </label>
                 </div>
               )}

               {importStep === 1 && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                       <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1 uppercase">Field Alignment</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect source columns to SEMAR architecture</p>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                       {[
                         { field: 'unique_id', label: 'Primary Key (Asset ID)', required: true },
                         { field: 'display_name', label: 'Object Label', required: true },
                         { field: 'class_id', label: 'Functional Category', required: true },
                         { field: 'geo_point', label: 'Spatial Verification', required: false },
                       ].map((f, i) => (
                         <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex-1 min-w-[140px]">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Field</p>
                               <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                 {f.label} {f.required && <span className="text-rose-500">*</span>}
                               </p>
                            </div>
                            <ArrowRight size={14} className="text-slate-300" />
                            <select className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:border-cyan-500 transition-all">
                               <option>Column {i + 1}</option>
                               <option>Auto-map (Best Match)</option>
                               <option>Manual Reference</option>
                            </select>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {importStep > 1 && (
                  <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                     <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-glow-emerald border border-emerald-100">
                        <CheckCircle2 size={32} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Simulation Success</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">98.4% of objects passed parity validation</p>
                     </div>
                     <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] font-bold text-amber-700 uppercase tracking-widest flex items-center gap-3">
                        <AlertCircle size={16} /> Attention: 23 objects require schema adjustment
                     </div>
                  </div>
               )}
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
               <button 
                 onClick={prevStep}
                 disabled={importStep === 0}
                 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all disabled:opacity-0"
               >
                  <ArrowLeft size={14} /> Back
               </button>
               <div className="flex gap-3">
                  <button onClick={() => setImportModalOpen(false)} className="btn-secondary-premium">Discard</button>
                  <button 
                    onClick={nextStep}
                    className="px-8 py-3 bg-cyan-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-cyan-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {importStep === 3 ? 'Execute Ingestion' : 'Proceed Pipeline'} <ArrowRight size={14} />
                  </button>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* 📦 Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setExportModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-xl relative z-10 flex flex-col scale-in">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Archival Request</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generate persistent data snapshots</p>
               </div>
               <button onClick={() => setExportModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="form-label font-black tracking-widest uppercase text-[9px]">Dataset Identification</label>
                     <input type="text" className="form-input" placeholder="e.g. Q1-2024 Asset Inventory" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="form-label font-black tracking-widest uppercase text-[9px]">Scope Domain</label>
                       <select className="form-input">
                          <option>Full Asset Hierarchy</option>
                          <option>Maintenance History</option>
                          <option>Inspection Meta-data</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="form-label font-black tracking-widest uppercase text-[9px]">Payload Format</label>
                       <select className="form-input">
                          <option>Microsoft Excel (.xlsx)</option>
                          <option>Comma Separated (.csv)</option>
                          <option>Native JSON Stream</option>
                       </select>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4">
                    <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer group hover:border-cyan-200 transition-all">
                       <input type="checkbox" className="w-4 h-4 rounded-md border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                       <div>
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1">Verified Audit Only</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Exclude draft and unverified ingestion objects</p>
                       </div>
                    </label>
                  </div>
               </div>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setExportModalOpen(false)} className="btn-secondary-premium">Cancel</button>
               <button className="px-8 py-3 bg-cyan-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-cyan-100 hover:scale-105 active:scale-95 transition-all">Generate Archival</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetImportExportPage;