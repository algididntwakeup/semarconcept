// platform/frontend-mui/src/pages/compliance/ComplianceCertificationsPage.tsx
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  Award, 
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Clock,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MoreVertical,
  Download,
  FileText,
  Calendar,
  Activity,
  Layout,
  Star,
  Globe
} from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  type: string;
  issuingBody: string;
  certificateNumber: string;
  status: 'valid' | 'expiring' | 'expired' | 'pending' | 'revoked';
  expiryDate: string;
  responsiblePerson: string;
  isStarred: boolean;
}

const ComplianceCertificationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: '1',
      name: 'ISO 9001:2015 Quality Management System',
      type: 'Quality Management',
      issuingBody: 'BSI Group',
      certificateNumber: 'ISO9001-2024-001',
      status: 'valid',
      expiryDate: '2026-03-14',
      responsiblePerson: 'John Smith',
      isStarred: true,
    },
    {
      id: '3',
      name: 'OHSAS 18001 Occupational Health & Safety',
      type: 'Safety',
      issuingBody: 'SGS',
      certificateNumber: 'OHSAS18001-2023-078',
      status: 'expiring',
      expiryDate: '2024-08-19',
      responsiblePerson: 'Mike Wilson',
      isStarred: false,
    }
  ]);

  const filteredCertifications = certifications.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.issuingBody.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'expiring': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'expired': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'pending': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* 👑 Hero Spotlight */}
      <section className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 group-hover:scale-105 transition-transform duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-sans">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Governance • Policy Assurance</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight font-sans">
                Compliance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">Vault</span>
              </h1>
              <p className="text-slate-300 font-medium text-lg leading-relaxed opacity-80 mb-8 font-sans">
                Centralized registry for global certifications and regulatory standards. Ensure continuous compliance with automated renewal tracking and audit-ready documentation.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  Add Certificate
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <Globe size={16} />
                   Global Standards
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-inner min-w-[320px]">
               {[
                 { label: 'Active Certs', value: '18', color: 'text-indigo-400' },
                 { label: 'Expiring', value: '02', color: 'text-amber-400' },
                 { label: 'Audit Score', value: '94%', color: 'text-emerald-400' },
                 { label: 'Standards', value: '06', color: 'text-blue-400' },
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
            placeholder="Search certificates, bodies, or numbers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Filter size={14} />
            Categories
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </section>

      {/* 📑 Premium Content with Navigation */}
      <div className="glass-card overflow-hidden rounded-[2.5rem] shadow-premium border border-white/40">
        <div className="px-8 pt-6 border-b border-slate-100 flex gap-8">
           <button 
             onClick={() => setTabValue(0)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 0 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Registry
             {tabValue === 0 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full"></div>}
           </button>
           <button 
             onClick={() => setTabValue(1)}
             className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${tabValue === 1 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Audit Log
             {tabValue === 1 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full"></div>}
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Certification Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issuing Authority</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validity Period</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCertifications.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-indigo-100 relative">
                        <Award size={20} />
                        {cert.isStarred && (
                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                             <Star size={8} className="text-white fill-white" />
                           </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{cert.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          {cert.certificateNumber} • {cert.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-600">{cert.issuingBody}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gov. ID: AU-9281</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(cert.status)}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <Calendar size={14} className="text-slate-300" />
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Expires {cert.expiryDate}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-300">
                       <button className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                         <Download size={18} />
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
             Compliance Governance • Monitoring {filteredCertifications.length} legal attestations
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <span className="text-xs font-black text-indigo-600">01</span>
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

export default ComplianceCertificationsPage;