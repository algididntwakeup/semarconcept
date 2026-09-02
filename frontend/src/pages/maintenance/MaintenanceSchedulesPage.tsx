import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle,
  Filter,
  RefreshCw
} from 'lucide-react';

interface MaintenanceScheduleItem {
  id: string;
  scheduleCode: string;
  assetTag: string;
  assetName: string;
  taskTitle: string;
  frequency: string;
  nextDueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Scheduled' | 'Overdue' | 'In-Progress';
  assignedTeam: string;
}

const mockSchedules: MaintenanceScheduleItem[] = [
  {
    id: '1',
    scheduleCode: 'SCH-PM-01',
    assetTag: 'P-101A',
    assetName: 'Main Crude Feed Pump A',
    taskTitle: 'Monthly vibration analysis & lube oil sampling',
    frequency: 'Monthly (30 Days)',
    nextDueDate: '2026-09-15',
    priority: 'High',
    status: 'Scheduled',
    assignedTeam: 'Rotating Machinery Team'
  },
  {
    id: '2',
    scheduleCode: 'SCH-PM-02',
    assetTag: 'K-201',
    assetName: 'Wet Gas Compressor Stage 1',
    taskTitle: 'Quarterly seal gas differential pressure & filter changeout',
    frequency: 'Quarterly (90 Days)',
    nextDueDate: '2026-09-05',
    priority: 'High',
    status: 'Scheduled',
    assignedTeam: 'Compressor Specialists'
  },
  {
    id: '3',
    scheduleCode: 'SCH-PM-03',
    assetTag: 'CDU-V-101',
    assetName: 'Atmospheric Distillation Column',
    taskTitle: 'Semi-annual PSV pop-test and relief valve inspection',
    frequency: 'Semi-Annual (180 Days)',
    nextDueDate: '2026-08-25',
    priority: 'High',
    status: 'Overdue',
    assignedTeam: 'Safety Relief Valve Shop'
  },
  {
    id: '4',
    scheduleCode: 'SCH-PM-04',
    assetTag: 'PIP-8-HYD-201',
    assetName: 'Pipe Rack Hydrogen Line',
    taskTitle: 'Annual external visual & spring hanger displacement check',
    frequency: 'Annual (365 Days)',
    nextDueDate: '2026-10-30',
    priority: 'Medium',
    status: 'Scheduled',
    assignedTeam: 'Piping & Structural Crew'
  }
];

const MaintenanceSchedulesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockSchedules.filter(item => {
    const matchSearch = item.scheduleCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-primary-600" />
            Preventive Maintenance Schedules
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Penjadwalan pemeliharaan preventif, interval inspeksi rutin, dan tugas servis terencana.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-primary-500/20 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Create Schedule
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Schedules</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{mockSchedules.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Recurring tasks configured</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Scheduled (Upcoming)</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{mockSchedules.filter(i => i.status === 'Scheduled').length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Due in next 30 days</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Overdue</p>
          <p className="text-3xl font-black text-rose-600 mt-1">{mockSchedules.filter(i => i.status === 'Overdue').length}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Immediate action required</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Schedule Compliance</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">94.8%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Target &gt; 90%</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search schedule, asset or task..."
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
            <option value="Scheduled">Scheduled</option>
            <option value="Overdue">Overdue</option>
            <option value="In-Progress">In-Progress</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Schedule ID</th>
                <th className="px-5 py-3.5">Asset</th>
                <th className="px-5 py-3.5">Task Description</th>
                <th className="px-5 py-3.5">Frequency</th>
                <th className="px-5 py-3.5">Next Due Date</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Assigned Team</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary-600 font-mono">
                    {row.scheduleCode}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800">{row.assetTag}</p>
                    <p className="text-[10px] text-slate-400">{row.assetName}</p>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate text-slate-700 font-medium" title={row.taskTitle}>
                    {row.taskTitle}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.frequency}
                  </td>
                  <td className="px-5 py-4 text-slate-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {row.nextDueDate}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {row.assignedTeam}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      row.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors" title="View Detail">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors" title="Edit Schedule">
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

export default MaintenanceSchedulesPage;
