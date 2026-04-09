import React, { useState } from 'react';
import { 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Clipboard, 
  Camera, 
  FileText, 
  Clock, 
  User, 
  MapPin, 
  HardHat, 
  BarChart3, 
  TrendingUp, 
  Download, 
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  assetId: string;
  assetName: string;
  location: string;
  inspector: string;
  inspectionDate: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  photos: number;
  attachments: number;
  dueDate?: string;
  assignedTo?: string;
  resolution?: string;
  resolvedDate?: string;
}

const InspectionFindingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Sample findings data
  const findings: Finding[] = [
    {
      id: 'FIN-102',
      title: 'Corrosion detected on pipe flange',
      description: 'Significant corrosion observed on the main pipe flange connection. Surface rust and pitting visible.',
      severity: 'high',
      category: 'Corrosion',
      assetId: 'AST-001',
      assetName: 'Main Process Pipe',
      location: 'Section A - Level 2',
      inspector: 'John Smith',
      inspectionDate: '2024-01-20',
      status: 'open',
      priority: 'high',
      photos: 3,
      attachments: 1,
      dueDate: '2024-02-15',
      assignedTo: 'Maintenance Team'
    },
    {
      id: 'FIN-103',
      title: 'Bearing vibration exceeds limits',
      description: 'Motor bearing vibration measurements exceed acceptable limits during routine inspection.',
      severity: 'critical',
      category: 'Mechanical',
      assetId: 'AST-025',
      assetName: 'Centrifugal Pump A',
      location: 'Pump House 1',
      inspector: 'Sarah Johnson',
      inspectionDate: '2024-01-19',
      status: 'in_progress',
      priority: 'urgent',
      photos: 2,
      attachments: 2,
      dueDate: '2024-01-25',
      assignedTo: 'Mike Wilson'
    },
    {
      id: 'FIN-104',
      title: 'Insulation damage',
      description: 'Minor insulation damage found on steam line. No immediate safety concern but requires monitoring.',
      severity: 'medium',
      category: 'Insulation',
      assetId: 'AST-018',
      assetName: 'Steam Distribution Line',
      location: 'Building B - Roof',
      inspector: 'Anna Davis',
      inspectionDate: '2024-01-18',
      status: 'resolved',
      priority: 'normal',
      photos: 1,
      attachments: 0,
      resolution: 'Insulation replaced during scheduled maintenance',
      resolvedDate: '2024-01-22'
    }
  ];

  const stats = [
    { label: 'Total Findings', value: 156, icon: Bug, color: 'text-emerald-500' },
    { label: 'Critical Risk', value: 8, icon: AlertCircle, color: 'text-rose-500' },
    { label: 'Active Issues', value: 42, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Overdue Fixes', value: 5, icon: Clock, color: 'text-indigo-500' }
  ];

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'high': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'medium': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'in_progress': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'open': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const filteredFindings = findings.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.assetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (finding?: Finding) => {
    setSelectedFinding(finding || null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Inspection Intelligence • Quality Assurance</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                Quality <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">Findings</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg mb-8 leading-relaxed">
                Transform observations into actions. Monitor technical discrepancies, manage risk severities, and ensure infrastructure integrity through systematic field auditing.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => handleOpenModal()}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={18} strokeWidth={3} />
                  New Observation
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                   <Download size={18} /> Export Intel
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

      {/* 🛠️ Dynamic Discovery Toolbar */}
      <section className="glass-card p-4 rounded-[2rem] shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search anomaly tags, assets or IDs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
          >
             <option value="all">Priority Spectrum</option>
             <option value="critical">Critical Only</option>
             <option value="high">High Risk</option>
          </select>
          <div className="h-8 w-[1px] bg-slate-100 hidden md:block"></div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
             <Filter size={16} /> Matrix View
          </button>
        </div>
      </section>

      {/* 📊 Findings content */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40 min-h-[500px]">
        {/* Modern Tabs */}
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-10">
           {[
             { label: 'Active Observations', count: 12 },
             { label: 'High Priority', count: 4, color: 'text-rose-500' },
             { label: 'Resolution Archival', count: 144 },
             { label: 'Anomaly Heatmap', icon: BarChart3 }
           ].map((tab, i) => (
             <button 
               key={i}
               onClick={() => setTabValue(i)}
               className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 ${tabValue === i ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {tab.icon && <tab.icon size={14} />}
               {tab.label}
               {tab.count !== undefined && (
                 <span className={`px-1.5 py-0.5 rounded-md bg-slate-100 text-[8px] ${tab.color || 'text-slate-500'}`}>{tab.count}</span>
               )}
               {tabValue === i && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full animate-in slide-in-from-left duration-300"></div>}
             </button>
           ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Anomaly Description</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Correlation</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Index</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Lifecycle</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditor</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFindings.map((f) => (
                <tr key={f.id} className="hover:bg-emerald-50/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${getSeverityStyle(f.severity)}`}>
                        <Bug size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1.5 line-clamp-1">{f.title}</p>
                        <div className="flex gap-2">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.category}</span>
                           <span className="text-slate-200">•</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                             <MapPin size={10} /> {f.location}
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                       <p className="text-xs font-black text-slate-700">{f.assetName}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{f.assetId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${getSeverityStyle(f.severity)}`}>
                       {f.severity}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                     <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 ${getStatusColor(f.status)}`}>
                       {f.status.replace('_', ' ')}
                     </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 border border-white shadow-soft flex items-center justify-center text-[10px] font-black text-slate-500">
                          {f.inspector.split(' ').map(n => n[0]).join('')}
                       </div>
                       <p className="text-xs font-black text-slate-800">{f.inspector}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleOpenModal(f)} className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"><Eye size={18} /></button>
                       <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Inspection findings audited and cryptographically verified
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                 <span className="text-xs font-black text-emerald-600">1</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">14</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* 📦 Finding Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
          <div className="modal-glass w-full max-w-3xl relative z-10 flex flex-col scale-in overflow-hidden max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 sticky top-0 z-20">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedFinding ? 'Anomaly Profile' : 'Fresh Observation'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Systematic Field Audit Registry</p>
               </div>
               <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
               {/* Summary Cards Line */}
               <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                     {selectedFinding ? (
                        <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest w-fit border ${getStatusColor(selectedFinding.status)}`}>
                           {selectedFinding.status}
                        </div>
                     ) : <p className="text-sm font-black text-slate-800 italic">Pre-Ingestion</p>}
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Severity Matrix</p>
                     {selectedFinding ? (
                        <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest w-fit border ${getSeverityStyle(selectedFinding.severity)}`}>
                           {selectedFinding.severity}
                        </div>
                     ) : <p className="text-sm font-black text-slate-800 italic">Pending Assessment</p>}
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Audit Record</p>
                     <p className="text-sm font-black text-slate-800 leading-none">{selectedFinding?.id || 'NEW-FIND'}</p>
                     <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-widest leading-none">Job Ref: #820-22</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="form-label uppercase text-[9px] font-black tracking-widest text-slate-400">Observation Header</label>
                        <input type="text" className="form-input" defaultValue={selectedFinding?.title} placeholder="Describe the finding..." />
                     </div>
                     <div className="space-y-2">
                        <label className="form-label uppercase text-[9px] font-black tracking-widest text-slate-400">Contextual Description</label>
                        <textarea className="form-input min-h-[120px]" defaultValue={selectedFinding?.description} placeholder="Provide engineering context and safety impact..."></textarea>
                     </div>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="form-label uppercase text-[9px] font-black tracking-widest text-slate-400">Asset Verification</label>
                        <select className="form-input">
                           <option>{selectedFinding?.assetName || 'Link to Infrastructure Object...'}</option>
                           <option>Pump A-101</option>
                           <option>Generator C-2</option>
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="form-label uppercase text-[9px] font-black tracking-widest text-slate-400">Spectral Location</label>
                           <input type="text" className="form-input" defaultValue={selectedFinding?.location} placeholder="Level, Section, Grid..." />
                        </div>
                        <div className="space-y-2">
                           <label className="form-label uppercase text-[9px] font-black tracking-widest text-slate-400">Discipline</label>
                           <select className="form-input">
                              <option>{selectedFinding?.category || 'Classification...'}</option>
                              <option>Corrosion</option>
                              <option>Mechanical</option>
                              <option>Electrical</option>
                           </select>
                        </div>
                     </div>
                     {selectedFinding && (
                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between group cursor-pointer hover:border-emerald-200 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-500">
                                 <Camera size={20} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Visual Evidence</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase">{selectedFinding.photos} Cryptographic Captures</p>
                              </div>
                           </div>
                           <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
               <button onClick={() => setModalOpen(false)} className="btn-secondary-premium">Cancel Session</button>
               <button className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all">
                  Commit Observations
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InspectionFindingsPage;