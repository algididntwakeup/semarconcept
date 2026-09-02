import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Filter,
  ShieldAlert
} from 'lucide-react';

interface InspectionReport {
  id: string;
  reportNumber: string;
  assetTag: string;
  assetName: string;
  standard: 'API 510' | 'API 570' | 'API 653' | 'ASME Sec VIII';
  inspectionType: string;
  dateConducted: string;
  inspector: string;
  findingsCount: number;
  criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Approved' | 'Under Review' | 'Draft';
}

const mockReports: InspectionReport[] = [
  {
    id: '1',
    reportNumber: 'IR-2026-042',
    assetTag: 'CDU-V-101',
    assetName: 'Atmospheric Distillation Column',
    standard: 'API 510',
    inspectionType: 'Internal & External Visual + UT Thickness',
    dateConducted: '2026-08-15',
    inspector: 'Budi Raharjo (API 510 #44892)',
    findingsCount: 3,
    criticality: 'High',
    status: 'Approved'
  },
  {
    id: '2',
    reportNumber: 'IR-2026-041',
    assetTag: 'PIP-8-HYD-201',
    assetName: 'Pipe Rack Hydrogen Line',
    standard: 'API 570',
    inspectionType: 'Pulsed Eddy Current (PEC) & Radiographic (RT)',
    dateConducted: '2026-08-12',
    inspector: 'Denny Setiawan (API 570 #51203)',
    findingsCount: 1,
    criticality: 'Medium',
    status: 'Approved'
  },
  {
    id: '3',
    reportNumber: 'IR-2026-040',
    assetTag: 'TK-301',
    assetName: 'Crude Oil Storage Tank #1',
    standard: 'API 653',
    inspectionType: 'Floor Magnetic Flux Leakage (MFL) & Shell UT',
    dateConducted: '2026-08-05',
    inspector: 'Fajar Nugroho (API 653 #38910)',
    findingsCount: 0,
    criticality: 'Low',
    status: 'Approved'
  },
  {
    id: '4',
    reportNumber: 'IR-2026-039',
    assetTag: 'E-201A',
    assetName: 'Overhead Condenser Shell',
    standard: 'API 510',
    inspectionType: 'Eddy Current Tube Testing & Hydrotest',
    dateConducted: '2026-08-01',
    inspector: 'Budi Raharjo (API 510 #44892)',
    findingsCount: 5,
    criticality: 'Critical',
    status: 'Under Review'
  }
];

const InspectionReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [standardFilter, setStandardFilter] = useState('ALL');

  const filtered = mockReports.filter(item => {
    const matchSearch = item.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.assetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStandard = standardFilter === 'ALL' || item.standard === standardFilter;
    return matchSearch && matchStandard;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary-600" />
            Inspection Reports Dossier (API 510/570/653)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Laporan hasil inspeksi ketebalan (UT), NDT, finding integritas mekanikal dan sertifikasi aset.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-primary-500/20 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> New Inspection Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports (2026)</p>
          <p className="text-3xl font-black text-slate-800 mt-1">156</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Approved & archived</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">148</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">94.8% passed review</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Under Review</p>
          <p className="text-3xl font-black text-amber-600 mt-1">8</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending SME sign-off</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Critical Findings</p>
          <p className="text-3xl font-black text-rose-600 mt-1">12</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Escalated to Maintenance</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search report no, asset tag or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={standardFilter}
            onChange={(e) => setStandardFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Standards</option>
            <option value="API 510">API 510 (Pressure Vessel)</option>
            <option value="API 570">API 570 (Piping)</option>
            <option value="API 653">API 653 (Storage Tank)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Report No</th>
                <th className="px-5 py-3.5">Asset Tag & Name</th>
                <th className="px-5 py-3.5">Standard</th>
                <th className="px-5 py-3.5">Inspection Scope</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Inspector</th>
                <th className="px-5 py-3.5">Criticality</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary-600 font-mono">
                    {row.reportNumber}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800">{row.assetTag}</p>
                    <p className="text-[10px] text-slate-400">{row.assetName}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 font-mono text-[10px]">
                      {row.standard}
                    </span>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate text-slate-600" title={row.inspectionType}>
                    {row.inspectionType}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {row.dateConducted}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-[11px]">
                    {row.inspector}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      row.criticality === 'Critical' ? 'bg-rose-100 text-rose-800' :
                      row.criticality === 'High' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {row.criticality}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      row.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors" title="View Report">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition-colors" title="Download PDF">
                        <Download className="w-4 h-4" />
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

export default InspectionReportsPage;
