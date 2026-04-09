// platform/frontend-mui/src/pages/risk/RiskAssessmentsPage.tsx
import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  BarChart3, 
  Activity, 
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Clock,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  Zap,
  MoreVertical,
  Target,
  FileText,
  PieChart,
  Layout
} from 'lucide-react';

interface RiskAssessment {
  id: string;
  title: string;
  description: string;
  assetName: string;
  assessmentType: 'Operational' | 'Safety' | 'Environmental' | 'Financial' | 'Compliance';
  riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  riskScore: number;
  status: 'Draft' | 'In Review' | 'Approved' | 'Active' | 'Closed';
  assessor: string;
  nextReview: string;
}

const RiskAssessmentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const assessments: RiskAssessment[] = [
    {
      id: 'RISK001',
      title: 'Pump Cavitation Risk Assessment',
      description: 'Assessment of cavitation risk in high-pressure pump systems',
      assetName: 'Pump A-101',
      assessmentType: 'Operational',
      riskLevel: 'High',
      riskScore: 16,
      status: 'Active',
      assessor: 'John Smith',
      nextReview: '2024-07-15',
    },
    {
      id: 'RISK002',
      title: 'Compressor Overpressure Analysis',
      description: 'Safety risk assessment for compressor overpressure scenarios',
      assetName: 'Compressor C-205',
      assessmentType: 'Safety',
      riskLevel: 'Very High',
      riskScore: 15,
      status: 'In Review',
      assessor: 'Sarah Johnson',
      nextReview: '2024-04-20',
    }
  ];

  const filteredAssessments = assessments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.assetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'Very High':
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Review': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Draft': return 'bg-slate-50 text-slate-500 border-slate-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-orange-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Integrity • Risk Governance</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Intelligence</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Identify, analyze, and mitigate enterprise risks with advanced modeling and deterministic scoring. Protect your assets with proactive safety protocols.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  Register Risk
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <PieChart size={16} />
                  Risk Matrix
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Critical Risks', value: '04', color: 'text-rose-400' },
                 { label: 'High Fragility', value: '12', color: 'text-orange-400' },
                 { label: 'Mitigated', value: '142', color: 'text-emerald-400' },
                 { label: 'Exposure', value: '$2.4M', color: 'text-blue-400' },
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
            placeholder="Search risks, assets, or assessors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Domains
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button className="p-3 text-slate-400 hover:text-rose-600 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* 📑 Premium Content with Navigation */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-8">
           <button 
             onClick={() => setTabValue(0)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 0 ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Inventory
             {tabValue === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-full"></div>}
           </button>
           <button 
             onClick={() => setTabValue(1)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 1 ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Heatmap
             {tabValue === 1 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-full"></div>}
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Boundary</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Vector</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Review</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssessments.map((assessment) => (
                <tr key={assessment.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-rose-100">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{assessment.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{assessment.id} • {assessment.assessmentType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <Target size={14} className="text-slate-300" />
                       <span className="text-xs font-bold text-slate-600">{assessment.assetName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black border ${getRiskStyle(assessment.riskLevel)}`}>
                       {assessment.riskScore} • {assessment.riskLevel}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(assessment.status)}`}>
                      {assessment.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{assessment.assessor}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Next: {assessment.nextReview}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-300">
                       <button className="p-2 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                         <Activity size={18} />
                       </button>
                       <button className="p-2 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                         <MoreVertical size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📑 Premium Pagination */}
        <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Risk Registry Monitoring • {filteredAssessments.length} Active Records
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-rose-600">01</span>
                 <span className="text-xs font-bold text-slate-300">/</span>
                 <span className="text-xs font-black text-slate-400">01</span>
              </div>
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronRight size={18} /></button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentsPage;