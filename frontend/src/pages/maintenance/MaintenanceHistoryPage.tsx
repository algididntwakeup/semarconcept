import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';

interface MaintenanceHistoryRecord {
  id: string;
  workOrderNo: string;
  assetTag: string;
  assetName: string;
  maintenanceType: 'Corrective' | 'Preventive' | 'Predictive' | 'Overhaul';
  failureMechanism: string;
  completedDate: string;
  downtimeHours: number;
  cost: string;
  technician: string;
  status: 'Completed' | 'Verified';
}

const mockHistory: MaintenanceHistoryRecord[] = [
  {
    id: '1',
    workOrderNo: 'WO-2026-0881',
    assetTag: 'P-101A',
    assetName: 'Main Crude Feed Pump A',
    maintenanceType: 'Corrective',
    failureMechanism: 'Mechanical seal leakage due to slurry scoring',
    completedDate: '2026-08-20',
    downtimeHours: 4.5,
    cost: '$2,400',
    technician: 'Agus Santoso',
    status: 'Verified'
  },
  {
    id: '2',
    workOrderNo: 'WO-2026-0742',
    assetTag: 'CDU-V-101',
    assetName: 'Atmospheric Distillation Column',
    maintenanceType: 'Preventive',
    failureMechanism: 'Routine tray inspection and bottom sediment cleanout',
    completedDate: '2026-08-10',
    downtimeHours: 24.0,
    cost: '$14,500',
    technician: 'Rahmat Hidayat',
    status: 'Completed'
  },
  {
    id: '3',
    workOrderNo: 'WO-2026-0690',
    assetTag: 'K-201',
    assetName: 'Wet Gas Compressor Stage 1',
    maintenanceType: 'Predictive',
    failureMechanism: 'High vibration alarm; drive bearing re-greasing',
    completedDate: '2026-07-28',
    downtimeHours: 1.5,
    cost: '$850',
    technician: 'Hendra Gunawan',
    status: 'Verified'
  },
  {
    id: '4',
    workOrderNo: 'WO-2026-0519',
    assetTag: 'E-102B',
    assetName: 'Overhead Condenser B',
    maintenanceType: 'Corrective',
    failureMechanism: 'Tube leak plugged; Eddy Current Testing validation',
    completedDate: '2026-07-15',
    downtimeHours: 12.0,
    cost: '$6,200',
    technician: 'Budi Kurniawan',
    status: 'Verified'
  }
];

const MaintenanceHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filtered = mockHistory.filter(item => {
    const matchSearch = item.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.assetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'ALL' || item.maintenanceType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-primary-600" />
            Maintenance History & Failure Log (ISO 14224)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Riwayat pemeliharaan, perbaikan, downtime, dan catatan kegagalan historis aset.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export Log
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed WOs</p>
          <p className="text-3xl font-black text-slate-800 mt-1">1,248</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ 98.4% completed on-time</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Downtime (YTD)</p>
          <p className="text-3xl font-black text-amber-600 mt-1">142.5 hrs</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Refinery availability: 99.2%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mean Time to Repair (MTTR)</p>
          <p className="text-3xl font-black text-blue-600 mt-1">4.2 hrs</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Target &lt; 5.0 hrs</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maintenance Cost (YTD)</p>
          <p className="text-3xl font-black text-slate-800 mt-1">$482,500</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↓ 6.5% under budget</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search work order, asset tag or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Corrective">Corrective</option>
            <option value="Preventive">Preventive</option>
            <option value="Predictive">Predictive</option>
            <option value="Overhaul">Overhaul</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">WO Number</th>
                <th className="px-5 py-3.5">Asset</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Failure Mechanism & Action</th>
                <th className="px-5 py-3.5">Date Completed</th>
                <th className="px-5 py-3.5">Downtime</th>
                <th className="px-5 py-3.5">Cost</th>
                <th className="px-5 py-3.5">Technician</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary-600 font-mono">
                    {row.workOrderNo}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800">{row.assetTag}</p>
                    <p className="text-[10px] text-slate-400">{row.assetName}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      row.maintenanceType === 'Corrective' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      row.maintenanceType === 'Preventive' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {row.maintenanceType}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate text-slate-600" title={row.failureMechanism}>
                    {row.failureMechanism}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {row.completedDate}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {row.downtimeHours} hrs
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800 font-mono">
                    {row.cost}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.technician}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors" title="View Full Report">
                      <Eye className="w-4 h-4" />
                    </button>
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

export default MaintenanceHistoryPage;
