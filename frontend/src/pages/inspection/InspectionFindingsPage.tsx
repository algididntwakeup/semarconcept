// platform/frontend-mui/src/pages/inspection/InspectionFindingsPage.tsx
import React, { useState } from 'react';
import { 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Camera, 
  Clock, 
  HardHat, 
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RefreshCcw
} from 'lucide-react';
import {
  useInspectionFindings,
  useInspectionStatistics,
  useCreateInspectionFinding,
  useUpdateInspectionFinding,
  useDeleteInspectionFinding
} from '../../features/inspection/api/inspectionQueries';
import { Finding, FindingSeverity, FindingStatus, FindingPriority } from '../../features/inspection/types';

const InspectionFindingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as FindingSeverity,
    category: 'Corrosion',
    assetName: 'Main Process Pipe',
    location: 'Section A - Level 2',
    priority: 'normal' as FindingPriority,
    inspector: 'Budi Santoso',
  });

  // Query Server State via TanStack Query
  const { 
    data: findingsResponse, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useInspectionFindings({
    search: searchTerm,
    severity: severityFilter !== 'all' ? severityFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const { data: stats } = useInspectionStatistics();
  const createMutation = useCreateInspectionFinding();
  const updateMutation = useUpdateInspectionFinding();
  const deleteMutation = useDeleteInspectionFinding();

  const findings = findingsResponse?.data ?? [];

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

  const handleOpenModal = (finding?: Finding) => {
    if (finding) {
      setSelectedFinding(finding);
      setFormData({
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        category: finding.category,
        assetName: finding.assetName,
        location: finding.location,
        priority: finding.priority,
        inspector: finding.inspector,
      });
    } else {
      setSelectedFinding(null);
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        category: 'Corrosion',
        assetName: 'Main Process Pipe',
        location: 'Section A - Level 2',
        priority: 'normal',
        inspector: 'Budi Santoso',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (selectedFinding) {
      await updateMutation.mutateAsync({
        id: selectedFinding.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync({
        ...formData,
        assetId: 'AST-001',
      });
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus temuan inspeksi ini?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Welcome Section */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Surveillance • Quality Control</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Audit <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">Findings</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Systematic registry of structural anomalies, material degradation, and field observations. Coordinate remediation with cryptographic traceability.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => handleOpenModal()} 
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} strokeWidth={3} />
                  Log Finding
                </button>
                <button 
                  onClick={() => refetch()}
                  className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <RefreshCcw size={16} className={isFetching ? 'animate-spin' : ''} />
                  Synchronize
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Total Findings', value: stats ? String(stats.totalFindings) : '156', color: 'text-emerald-400' },
                 { label: 'Critical Risk', value: stats ? String(stats.criticalFindings) : '8', color: 'text-rose-400' },
                 { label: 'Active Issues', value: stats ? String(stats.openFindings) : '42', color: 'text-amber-400' },
                 { label: 'Compliance', value: stats ? `${stats.complianceRate}%` : '94%', color: 'text-cyan-400' },
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
            placeholder="Search findings, equipment, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  severityFilter === sev 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className={`p-3 text-slate-400 hover:text-emerald-600 transition-colors ${isFetching ? 'animate-spin text-emerald-600' : ''}`}
            title="Refresh findings"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* Error State */}
      {isError && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-rose-500" size={20} />
            <p className="text-sm font-bold text-rose-700">
              Gagal memuat temuan inspeksi: {error?.message || 'Network error'}
            </p>
          </div>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 📊 Findings Table */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Anomaly & Context</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Equipment</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Severity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inspection Info</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-8 py-5">
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-slate-200 rounded"></div>
                        <div className="h-3 w-32 bg-slate-100 rounded"></div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="h-6 w-16 bg-slate-200 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="h-6 w-16 bg-slate-200 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 w-28 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="h-8 w-16 bg-slate-200 rounded-xl ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : findings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                    <Bug className="mx-auto mb-3 text-slate-300" size={32} />
                    <p className="font-bold text-slate-600">Tidak ada temuan inspeksi yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter severity.</p>
                  </td>
                </tr>
              ) : (
                findings.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                          <Bug size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-snug mb-1">{f.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.id} • {f.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-xs font-bold text-slate-700">{f.assetName}</p>
                        <p className="text-[10px] text-slate-400">{f.location}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getSeverityStyle(f.severity)}`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <HardHat size={12} className="text-slate-400" />
                          {f.inspector}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <Clock size={12} />
                          {f.inspectionDate}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(f)}
                          className="p-2 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all text-slate-400"
                          title="Edit Finding"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(f.id)}
                          className="p-2 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-slate-400"
                          title="Delete Finding"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Surveillance Audit • Displaying {findings.length} registered anomalies
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-emerald-600">01</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">01</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronRight size={18} /></button>
           </div>
        </div>
      </div>

      {/* 📑 Anomaly Detail & Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {selectedFinding ? 'Edit Observation' : 'Fresh Observation'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Systematic Field Audit Registry</p>
               </div>
               <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                 <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Severity Level</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value as FindingSeverity })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as FindingPriority })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Observation Header</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Wall Thinning on Pipe Bend 4"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Contextual Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide engineering context, UT measurement, safety impact..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Asset Context</label>
                    <input 
                      type="text" 
                      value={formData.assetName}
                      onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                      placeholder="e.g. Atmospheric Column"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Discipline</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="Corrosion">Corrosion</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Vibration">Vibration</option>
                      <option value="Coating">Coating</option>
                      <option value="Insulation">Insulation</option>
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Location</label>
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Unit 01 - Level 2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Inspector</label>
                    <input 
                      type="text" 
                      value={formData.inspector}
                      onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                      placeholder="e.g. API Inspector"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
               </div>

               <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 -mx-8 -mb-6 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setModalOpen(false)} 
                    className="px-6 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Commit Observations'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InspectionFindingsPage;