import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';

interface RiskMitigationData {
  id: string;
  mitigationCode: string;
  riskTitle: string;
  assetTag: string;
  strategy: string;
  status: 'Completed' | 'In-Progress' | 'Pending-Approval' | 'Delayed';
  targetDate: string;
  owner: string;
  effectiveness: string;
}

const mockData: RiskMitigationData[] = [
  { 
    id: '1', 
    mitigationCode: 'MIT-2026-01', 
    riskTitle: 'High Temperature Sulfidic Corrosion', 
    assetTag: 'CDU-V-101', 
    strategy: 'Cladding UT scan every 6 months and metallurgical upgrade in next TA', 
    status: 'In-Progress', 
    targetDate: '2026-10-15',
    owner: 'Mechanical Integrity Lead',
    effectiveness: 'High (85% Risk Reduction)'
  },
  { 
    id: '2', 
    mitigationCode: 'MIT-2026-02', 
    riskTitle: 'CUI on Pipe Rack Hydrogen Line', 
    assetTag: 'PIP-8-HYD-201', 
    strategy: 'Pulsed Eddy Current (PEC) screening and insulation re-wrap', 
    status: 'In-Progress', 
    targetDate: '2026-09-30',
    owner: 'Piping Inspector',
    effectiveness: 'Medium (70% Risk Reduction)'
  },
  { 
    id: '3', 
    mitigationCode: 'MIT-2026-03', 
    riskTitle: 'Chloride SCC on Heat Exchanger', 
    assetTag: 'E-201A', 
    strategy: 'Dye Penetrant Testing (PT) and chemical wash inhibitor dosing', 
    status: 'Completed', 
    targetDate: '2026-08-15',
    owner: 'Chemical Corrosion Specialist',
    effectiveness: 'High (90% Risk Reduction)'
  },
  { 
    id: '4', 
    mitigationCode: 'MIT-2026-04', 
    riskTitle: 'Cavitation on Slurry Pump', 
    assetTag: 'P-105B', 
    strategy: 'Suction pressure readjustment & spare impeller procurement', 
    status: 'Pending-Approval', 
    targetDate: '2026-11-01',
    owner: 'Rotating Equipment Lead',
    effectiveness: 'Medium (60% Risk Reduction)'
  },
];

const RiskMitigationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockData.filter(item => {
    const matchSearch = item.riskTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.mitigationCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: RiskMitigationData['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In-Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending-Approval':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Delayed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-primary-600" />
            Risk Mitigation Action Tracker (API 580/581)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Rencana mitigasi dan tindakan perbaikan untuk menurunkan profil risiko aset industri.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-primary-500/20 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Create Mitigation Plan
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Mitigations</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{mockData.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all refinery units</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">In-Progress</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{mockData.filter(i => i.status === 'In-Progress').length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Actively tracked</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{mockData.filter(i => i.status === 'Completed').length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Risk reduced to acceptable</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Approval</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{mockData.filter(i => i.status === 'Pending-Approval').length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Management review needed</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search risk, asset, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending-Approval">Pending-Approval</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Mitigation Code</th>
                <th className="px-5 py-3.5">Risk & Asset</th>
                <th className="px-5 py-3.5">Mitigation Strategy</th>
                <th className="px-5 py-3.5">Target Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Effectiveness</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary-600 font-mono">
                    {row.mitigationCode}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800">{row.riskTitle}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{row.assetTag}</p>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate text-slate-600" title={row.strategy}>
                    {row.strategy}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {row.targetDate}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {row.effectiveness}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors" title="View Detail">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default RiskMitigationPage;
