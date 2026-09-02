import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ClipboardCheck, 
  ShieldAlert, 
  Wrench, 
  ShieldCheck, 
  LineChart, 
  Settings, 
  Activity, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  FileText, 
  Calendar,
  ChevronRight,
  Sparkles,
  Zap,
  HardHat
} from 'lucide-react';
import { RootState } from '../../store';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hours = currentDate.getHours();
  let greeting = 'Good morning';
  if (hours >= 12 && hours < 18) {
    greeting = 'Good afternoon';
  } else if (hours >= 18) {
    greeting = 'Good evening';
  }

  const userName = user?.first_name || (user as any)?.firstName || (user as any)?.username || 'Asset Manager';

  // KPI Overview
  const kpiStats = [
    {
      title: 'Total Assets',
      value: '1,247',
      subtext: '98.2% Operational',
      icon: Building2,
      color: 'from-blue-500 to-indigo-600',
      badge: '+12% YoY',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Active Inspections',
      value: '89',
      subtext: '12 findings requiring review',
      icon: ClipboardCheck,
      color: 'from-emerald-500 to-teal-600',
      badge: '94% On-Track',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Risk Profile (RBI)',
      value: '5 Critical',
      subtext: 'API 580/581 Monitored',
      icon: ShieldAlert,
      color: 'from-rose-500 to-amber-600',
      badge: 'Action Needed',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      title: 'Work Orders',
      value: '156',
      subtext: '28 In-Progress',
      icon: Wrench,
      color: 'from-amber-500 to-orange-600',
      badge: '91% Schedule Compliant',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Compliance Rating',
      value: '98.4%',
      subtext: 'ISO 14224 / 55000',
      icon: ShieldCheck,
      color: 'from-violet-500 to-purple-600',
      badge: 'Certified',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    },
  ];

  // Core AIMS Feature Portals (Pilihan Modul)
  const portalModules = [
    {
      id: 'assets',
      title: 'Asset Management',
      description: 'Hierarki peralatan ISO 14224, data spesifikasi teknis, dokumen P&ID, dan registry aset industri.',
      icon: Building2,
      gradient: 'from-blue-600 to-indigo-700',
      tag: 'Core AIMS',
      links: [
        { label: 'Asset Registry', url: '/assets/registry' },
        { label: 'Asset Hierarchy Tree', url: '/assets/hierarchy' },
        { label: 'Technical Data', url: '/assets/technical-data' },
        { label: 'Asset Documents', url: '/assets/documents' },
      ],
      primaryAction: { label: 'Explore Assets', url: '/assets/registry' }
    },
    {
      id: 'inspection',
      title: 'Inspection Management',
      description: 'Manajemen rencana inspeksi (IDMS/UT/Visual), temuan korosi/cacat, dan kalender inspeksi berkala.',
      icon: ClipboardCheck,
      gradient: 'from-teal-600 to-emerald-700',
      tag: 'Operations',
      links: [
        { label: 'Inspection Plans', url: '/inspection/plans' },
        { label: 'Inspection Findings', url: '/inspection/findings' },
        { label: 'Active Tasks', url: '/inspection/tasks' },
        { label: 'Schedule Calendar', url: '/inspection/calendar' },
      ],
      primaryAction: { label: 'Manage Inspections', url: '/inspection/plans' }
    },
    {
      id: 'risk',
      title: 'Risk & Reliability (RBI)',
      description: 'Kalkulasi risiko API 580/581, Matriks Risiko 5x5, laju degradasi material, dan asesmen integritas.',
      icon: ShieldAlert,
      gradient: 'from-rose-600 to-orange-700',
      tag: 'API 580/581',
      links: [
        { label: 'Risk Matrix 5x5', url: '/risk/matrix' },
        { label: 'Degradation Rates', url: '/risk/degradation' },
        { label: 'Integrity Assessment', url: '/risk/integrity' },
        { label: 'RBI Reports', url: '/risk/reports' },
      ],
      primaryAction: { label: 'View Risk Matrix', url: '/risk/matrix' }
    },
    {
      id: 'maintenance',
      title: 'Maintenance Management',
      description: 'Perencanaan pemeliharaan preventif (PM), pengelolaan Work Orders, alokasi teknisi, dan suku cadang.',
      icon: Wrench,
      gradient: 'from-amber-600 to-yellow-700',
      tag: 'Maintenance',
      links: [
        { label: 'Work Orders', url: '/maintenance/work-orders' },
        { label: 'Preventive Plans', url: '/maintenance/plans' },
        { label: 'Maintenance Tasks', url: '/maintenance/tasks' },
        { label: 'Resource Allocation', url: '/maintenance/resources' },
      ],
      primaryAction: { label: 'Work Orders', url: '/maintenance/work-orders' }
    },
    {
      id: 'compliance',
      title: 'Compliance & Standards',
      description: 'Kepatuhan standar internasional (ISO 14224, ISO 55000, API 570/579), audit logs, dan sertifikasi.',
      icon: ShieldCheck,
      gradient: 'from-violet-600 to-purple-700',
      tag: 'Governance',
      links: [
        { label: 'ISO/API Standards', url: '/compliance/standards' },
        { label: 'Requirements Checklist', url: '/compliance/requirements' },
        { label: 'Audits & Reviews', url: '/compliance/audits' },
        { label: 'Certifications', url: '/compliance/certifications' },
      ],
      primaryAction: { label: 'Compliance Hub', url: '/compliance/standards' }
    },
    {
      id: 'analytics',
      title: 'Analytics & Intelligence',
      description: 'Intelligence silhouette, analisis keandalan (MTBF/MTTR), tren kegagalan, dan custom reporting.',
      icon: LineChart,
      gradient: 'from-cyan-600 to-blue-700',
      tag: 'Intelligence',
      links: [
        { label: 'Asset Performance', url: '/analytics/performance' },
        { label: 'Risk Analysis Trends', url: '/analytics/risk' },
        { label: 'Inspection Trends', url: '/analytics/inspection' },
        { label: 'Reliability (MTBF/MTTR)', url: '/analytics/maintenance' },
      ],
      primaryAction: { label: 'Open Analytics', url: '/analytics/performance' }
    },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* 🚀 Mission Control Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-slate-800 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 via-slate-900 to-indigo-950/70 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-primary-200">
                SEMAR Enterprise • Mission Control Hub
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-300 to-indigo-300">{userName}</span>
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Sistem manajemen keandalan aset industri (*AIMS*) aktif beroperasi. Pantau status peralatan, temuan inspeksi, matriks risiko, dan jadwal pemeliharaan secara terintegrasi.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => navigate('/assets/registry')}
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-lg shadow-primary-500/30 active:scale-95 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" /> Kelola Asset Registry
              </button>
              <button 
                onClick={() => navigate('/risk/matrix')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold text-xs tracking-wide uppercase transition-all active:scale-95 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Buka Risk Matrix (5x5)
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary-400" /> {formattedDate}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">Online</span>
            </div>
            <div className="h-px bg-white/10 my-1"></div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Overall Health Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-400">94.8%</span>
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Optimal
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300">Semua unit kilang dan fasilitas produksi dalam batas toleransi aman.</p>
          </div>
        </div>
      </section>

      {/* 📊 KPI Summary Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" /> KPI Ringkasan Sistem
          </h2>
          <span className="text-xs text-slate-500 font-medium">Real-time telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiStats.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:border-primary-200 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kpi.badgeColor}`}>
                    {kpi.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{kpi.value}</h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">{kpi.title}</p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{kpi.subtext}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🧭 Core AIMS Portals / Navigation Hub (Pilihan Modul) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Pilihan Modul & Navigasi Utama
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pilih modul untuk mengakses fitur spesifik manajemen keandalan aset
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portalModules.map((portal) => {
            const Icon = portal.icon;
            return (
              <div 
                key={portal.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-primary-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${portal.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {portal.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed mb-6">
                    {portal.description}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Sub-Fitur Utama:</p>
                    {portal.links.map((link, lIdx) => (
                      <button
                        key={lIdx}
                        onClick={() => navigate(link.url)}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-primary-600 hover:bg-primary-50/60 transition-colors flex items-center justify-between"
                      >
                        <span>{link.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <button
                    onClick={() => navigate(portal.primaryAction.url)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-primary-500 text-slate-700 hover:text-white font-bold text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 group/btn shadow-sm"
                  >
                    <span>{portal.primaryAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 📋 Sub-Dashboards Quick Access Banner */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-primary-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Specialized Dashboards
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            Butuh Tampilan Dashboard Khusus Domain?
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Akses dashboard analitik mendalam per bidang untuk Asset Health, Inspection Findings, Maintenance Schedule, atau Compliance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button 
            onClick={() => navigate('/dashboard/asset')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all"
          >
            Asset Dashboard
          </button>
          <button 
            onClick={() => navigate('/dashboard/inspection')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all"
          >
            Inspection Dashboard
          </button>
          <button 
            onClick={() => navigate('/dashboard/maintenance')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all"
          >
            Maintenance Dashboard
          </button>
          <button 
            onClick={() => navigate('/dashboard/compliance')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all"
          >
            Compliance Dashboard
          </button>
        </div>
      </section>

    </div>
  );
};

export default DashboardPage;
