// platform/frontend-mui/src/pages/inspection/InspectionPlansPage.tsx
import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Play,
  Settings,
  AlertCircle,
  MoreVertical,
  X
} from 'lucide-react';
import { 
  useInspectionPlans, 
  useInspectionStatistics,
  useCreateInspectionPlan 
} from '../../features/inspection/api/inspectionQueries';
import { PlanStatus, PlanPriority } from '../../features/inspection/types';

const InspectionPlansPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    assetTag: '',
    assetName: '',
    inspectionType: 'Visual Inspection',
    frequency: 'Annual',
    nextInspectionDate: new Date().toISOString().split('T')[0],
    assignedTeam: 'NDT Team',
    standard: 'API 510',
    priority: 'Medium' as PlanPriority,
  });

  // Query Server State via TanStack Query
  const { 
    data: plansResponse, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useInspectionPlans({ search: searchTerm });

  const { data: stats } = useInspectionStatistics();
  const createPlanMutation = useCreateInspectionPlan();

  const plans = plansResponse?.data ?? [];

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'Active':
      case 'Scheduled':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Draft':
        return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'In-Progress':
      case 'In Progress':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Overdue':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Paused':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'High':
        return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Medium':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title.trim()) return;

    await createPlanMutation.mutateAsync({
      title: newPlan.title,
      assetTag: newPlan.assetTag || 'AST-001',
      assetName: newPlan.assetName || 'Crude Unit Equipment',
      inspectionType: newPlan.inspectionType,
      frequency: newPlan.frequency,
      nextInspectionDate: newPlan.nextInspectionDate,
      assignedTeam: newPlan.assignedTeam,
      standard: newPlan.standard,
      priority: newPlan.priority,
    });

    setIsModalOpen(false);
    setNewPlan({
      title: '',
      assetTag: '',
      assetName: '',
      inspectionType: 'Visual Inspection',
      frequency: 'Annual',
      nextInspectionDate: new Date().toISOString().split('T')[0],
      assignedTeam: 'NDT Team',
      standard: 'API 510',
      priority: 'Medium',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol • Asset Integrity</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Inspection <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Strategy</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Architect comprehensive inspection frameworks. Define routine, detailed, and comprehensive protocols to maintain absolute system reliability.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} strokeWidth={3} />
                  Design Plan
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Settings size={16} />
                   Protocols
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Active Plans', value: stats ? String(stats.activePlans) : '12', color: 'text-emerald-400' },
                 { label: 'Compliance', value: stats ? `${stats.complianceRate}%` : '94%', color: 'text-teal-400' },
                 { label: 'Overdue', value: stats ? String(stats.overduePlans) : '02', color: 'text-rose-400' },
                 { label: 'Total Protocols', value: stats ? String(stats.totalPlans) : '15', color: 'text-blue-400' },
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
            placeholder="Search plans, assets, or protocols..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Protocols
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className={`p-3 text-slate-400 hover:text-emerald-600 transition-colors ${isFetching ? 'animate-spin text-emerald-600' : ''}`}
            title="Refresh plans"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* Error state */}
      {isError && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-rose-500" size={20} />
            <p className="text-sm font-bold text-rose-700">
              Gagal memuat rencana inspeksi: {error?.message || 'Network error'}
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

      {/* 📑 Premium Content with Navigation */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-8">
           <button 
             onClick={() => setTabValue(0)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 0 ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Active Plans ({plans.length})
             {tabValue === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"></div>}
           </button>
           <button 
             onClick={() => setTabValue(1)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 1 ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Schedule View
             {tabValue === 1 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"></div>}
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan & Asset Architecture</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Priority</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Horizon</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-48 bg-slate-200 rounded"></div>
                          <div className="h-3 w-32 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="h-6 w-20 bg-slate-200 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="h-6 w-16 bg-slate-200 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 w-28 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="h-8 w-8 bg-slate-200 rounded-xl ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                    <ClipboardList className="mx-auto mb-3 text-slate-300" size={32} />
                    <p className="font-bold text-slate-600">Tidak ada rencana inspeksi yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-emerald-100">
                          <ClipboardList size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1">{plan.title || plan.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{plan.assetName} • {plan.assetTag || 'TAG'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(plan.status)}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityStyle(plan.priority)}`}>
                        {plan.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <Calendar size={14} className="text-slate-300" />
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                           Due {plan.nextInspectionDate || plan.nextDue || 'TBD'}
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-300">
                         <button className="p-2 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                           <Play size={18} />
                         </button>
                         <button className="p-2 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                           <MoreVertical size={18} />
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
             Operations Governance • Orchestrating {plans.length} structural protocols
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

      {/* Modal Design Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Design Inspection Plan</h3>
                  <p className="text-xs font-medium text-slate-400">Buat strategi inspeksi berkala baru</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Judul Protokol</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Annual Ultrasonic Thickness Survey"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Asset Tag</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CDU-101"
                    value={newPlan.assetTag}
                    onChange={(e) => setNewPlan({ ...newPlan, assetTag: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nama Asset</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Crude Column"
                    value={newPlan.assetName}
                    onChange={(e) => setNewPlan({ ...newPlan, assetName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Metode Inspeksi</label>
                  <select
                    value={newPlan.inspectionType}
                    onChange={(e) => setNewPlan({ ...newPlan, inspectionType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Visual Inspection">Visual (VT)</option>
                    <option value="Ultrasonic Thickness (UTM)">Ultrasonic (UTM)</option>
                    <option value="Magnetic Particle (MT)">Magnetic Particle (MT)</option>
                    <option value="Radiography (RT)">Radiography (RT)</option>
                    <option value="Eddy Current (ECT)">Eddy Current (ECT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Frekuensi</label>
                  <select
                    value={newPlan.frequency}
                    onChange={(e) => setNewPlan({ ...newPlan, frequency: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="5-Year Cycle">5-Year Cycle</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createPlanMutation.isPending}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {createPlanMutation.isPending ? 'Menyimpan...' : 'Simpan Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InspectionPlansPage;