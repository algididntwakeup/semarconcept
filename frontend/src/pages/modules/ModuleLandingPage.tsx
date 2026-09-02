import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  Blocks,
  BookOpenCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  ClipboardList,
  Database,
  DatabaseBackup,
  FileBarChart,
  FileCheck2,
  FileWarning,
  FolderOpen,
  Gauge,
  GitBranch,
  Grid3X3,
  HeartPulse,
  History,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  ListTodo,
  LogIn,
  MapPinned,
  Menu,
  Network,
  Package,
  PlugZap,
  ScanSearch,
  SearchCheck,
  Settings,
  Shapes,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  SlidersHorizontal,
  Tags,
  TriangleAlert,
  TrendingDown,
  UserCog,
  Users,
  Workflow,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { MODULE_DESTINATIONS } from '../../config/module-destinations';
import { useNavigation } from '../../layouts/MainLayout';
import type { NavItem } from '../../types/navigation';

export type ModuleKey =
  | 'assets'
  | 'inspection'
  | 'risk'
  | 'analytics'
  | 'maintenance'
  | 'compliance'
  | 'admin';

/** Kontrak canonical: href harus ada di MODULE_DESTINATIONS[module]. */
export interface ModuleDestination {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

/** Destination diizinkan bila ada di module destination canonical DAN di
 *  menu runtime user. Superuser melewati pemeriksaan menu. */
export const filterAllowedModuleDestinations = (
  module: ModuleKey,
  destinations: ModuleDestination[],
  topLevelMenuItems: NavItem[],
  isSuperuser: boolean,
  userPermissions: string[] = []
): ModuleDestination[] => {
  const valid = new Set(MODULE_DESTINATIONS[module].map((d) => d.href));
  if (isSuperuser) {
    return destinations.filter((d) => valid.has(d.href));
  }
  const root = topLevelMenuItems.find((item) => (item.url?.replace(/\/$/, '') || '') === `/${module}`);
  const accessibleHrefs = new Set(
    (root?.children ?? [])
      .filter((child) => {
        if (child.visible === false || child.disabled) return false;
        if (child.permissions && child.permissions.length > 0) {
          return child.permissions.some((p) => userPermissions.includes(p));
        }
        return true;
      })
      .map((child) => child.url?.replace(/\/$/, '') ?? '')
  );
  return destinations.filter((d) => valid.has(d.href) && accessibleHrefs.has(d.href));
};

interface ModuleDefinition {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  heroClass: string;
  iconClass: string;
  destinations: ModuleDestination[];
}

export const moduleDefinitions: Record<ModuleKey, ModuleDefinition> = {
  assets: {
    eyebrow: 'Asset foundation',
    title: 'Asset Management',
    description:
      'Kelola master data, hierarki, technical record, lokasi, dan dokumen aset dari satu titik masuk.',
    icon: Package,
    heroClass: 'from-cyan-600 via-blue-600 to-indigo-700',
    iconClass: 'bg-cyan-50 text-cyan-700 group-hover:bg-cyan-600',
    destinations: [
      {
        title: 'Asset Registry',
        description: 'Daftar dan lifecycle seluruh equipment.',
        href: '/assets/registry',
        icon: Database,
      },
      {
        title: 'Asset Hierarchy',
        description: 'Relasi site, unit, equipment, dan component.',
        href: '/assets/hierarchy',
        icon: Network,
      },
      {
        title: 'Technical Data',
        description: 'Spesifikasi dan engineering attributes.',
        href: '/assets/technical-data',
        icon: SlidersHorizontal,
      },
      {
        title: 'Documents',
        description: 'Drawing, datasheet, certificate, dan evidence.',
        href: '/assets/documents',
        icon: FolderOpen,
      },
      {
        title: 'Import / Export',
        description: 'Pertukaran dan validasi bulk asset data.',
        href: '/assets/import-export',
        icon: ArrowLeftRight,
      },
      {
        title: 'Categories',
        description: 'Klasifikasi serta taxonomy equipment.',
        href: '/assets/categories',
        icon: Tags,
      },
      {
        title: 'Sites',
        description: 'Kelola fasilitas dan lokasi operasional.',
        href: '/assets/sites',
        icon: MapPinned,
      },
    ],
  },
  inspection: {
    eyebrow: 'Inspection lifecycle',
    title: 'Inspection Management',
    description:
      'Rencanakan, eksekusi, temukan anomali, dan tutup loop inspeksi aset secara traceable.',
    icon: ClipboardCheck,
    heroClass: 'from-emerald-600 via-teal-600 to-cyan-700',
    iconClass: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600',
    destinations: [
      {
        title: 'Inspection Plans',
        description: 'Program dan interval inspeksi.',
        href: '/inspection/plans',
        icon: ClipboardList,
      },
      {
        title: 'Inspection Tasks',
        description: 'Pekerjaan lapangan dan assignment.',
        href: '/inspection/tasks',
        icon: ListChecks,
      },
      {
        title: 'Inspection Types',
        description: 'Metode, technique, dan checklist.',
        href: '/inspection/types',
        icon: Shapes,
      },
      {
        title: 'Findings',
        description: 'Anomali, defect, dan tindak lanjut.',
        href: '/inspection/findings',
        icon: TriangleAlert,
      },
      {
        title: 'Calendar',
        description: 'Jadwal dan due-date inspection.',
        href: '/inspection/calendar',
        icon: CalendarDays,
      },
      {
        title: 'Reports',
        description: 'Laporan hasil serta evidence inspeksi.',
        href: '/inspection/reports',
        icon: FileBarChart,
      },
    ],
  },
  risk: {
    eyebrow: 'Integrity and reliability',
    title: 'Risk Management',
    description:
      'Nilai degradation, integrity, consequence, dan mitigasi untuk keputusan berbasis risiko.',
    icon: ShieldAlert,
    heroClass: 'from-amber-500 via-orange-600 to-rose-700',
    iconClass: 'bg-amber-50 text-amber-700 group-hover:bg-amber-600',
    destinations: [
      {
        title: 'Risk Matrix',
        description: 'Visualisasi probability dan consequence.',
        href: '/risk/matrix',
        icon: Grid3X3,
      },
      {
        title: 'Degradation',
        description: 'Monitoring mechanism dan degradation rate.',
        href: '/risk/degradation',
        icon: TrendingDown,
      },
      {
        title: 'Integrity Assessment',
        description: 'Evaluasi kondisi dan remaining life.',
        href: '/risk/integrity',
        icon: HeartPulse,
      },
      {
        title: 'RBI Reports',
        description: 'Dokumen dan hasil risk-based inspection.',
        href: '/risk/reports',
        icon: FileWarning,
      },
      {
        title: 'Risk Assessments',
        description: 'Assessment record dan review status.',
        href: '/risk/assessments',
        icon: ShieldQuestion,
      },
      {
        title: 'Mitigation Actions',
        description: 'Kontrol risiko dan action tracking.',
        href: '/risk/mitigation',
        icon: ShieldCheck,
      },
    ],
  },
  analytics: {
    eyebrow: 'Reliability intelligence',
    title: 'Analytics',
    description:
      'Jelajahi performance, risk, inspection, maintenance, dan compliance read-model SEMAR.',
    icon: BarChart3,
    heroClass: 'from-violet-600 via-purple-600 to-fuchsia-700',
    iconClass: 'bg-violet-50 text-violet-700 group-hover:bg-violet-600',
    destinations: [
      {
        title: 'Performance',
        description: 'Reliability dan asset performance metrics.',
        href: '/analytics/performance',
        icon: Gauge,
      },
      {
        title: 'Risk Analysis',
        description: 'Distribusi serta tren exposure risiko.',
        href: '/analytics/risk',
        icon: ShieldAlert,
      },
      {
        title: 'Inspection Coverage',
        description: 'Coverage, overdue, dan finding trends.',
        href: '/analytics/inspection',
        icon: ScanSearch,
      },
      {
        title: 'Maintenance Effectiveness',
        description: 'Kinerja schedule dan work execution.',
        href: '/analytics/maintenance',
        icon: Wrench,
      },
      {
        title: 'Compliance Status',
        description: 'Coverage requirement dan evidence.',
        href: '/analytics/compliance',
        icon: BadgeCheck,
      },
      {
        title: 'Reports',
        description: 'Reporting dan scheduled distribution.',
        href: '/analytics/reports',
        icon: ChartNoAxesCombined,
      },
      {
        title: 'Analytics Dashboard',
        description: 'Workspace intelligence terkonfigurasi.',
        href: '/analytics/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  maintenance: {
    eyebrow: 'Maintenance execution',
    title: 'Maintenance Management',
    description:
      'Hubungkan strategy, plan, resource, schedule, dan history maintenance dalam satu workflow.',
    icon: Wrench,
    heroClass: 'from-slate-700 via-slate-800 to-zinc-950',
    iconClass: 'bg-slate-100 text-slate-700 group-hover:bg-slate-700',
    destinations: [
      {
        title: 'Work Orders',
        description: 'Backlog dan pelaksanaan pekerjaan.',
        href: '/maintenance/work-orders',
        icon: Wrench,
      },
      {
        title: 'Maintenance Plans',
        description: 'Strategy serta preventive maintenance plan.',
        href: '/maintenance/plans',
        icon: ClipboardList,
      },
      {
        title: 'Maintenance Tasks',
        description: 'Task list dan job execution.',
        href: '/maintenance/tasks',
        icon: ListChecks,
      },
      {
        title: 'Resources',
        description: 'People, tooling, dan resource allocation.',
        href: '/maintenance/resources',
        icon: Users,
      },
      {
        title: 'Calendar',
        description: 'Visual schedule pekerjaan.',
        href: '/maintenance/calendar',
        icon: CalendarDays,
      },
      {
        title: 'History',
        description: 'Riwayat pekerjaan dan feedback.',
        href: '/maintenance/history',
        icon: History,
      },
      {
        title: 'Schedules',
        description: 'Recurring schedule dan due dates.',
        href: '/maintenance/schedules',
        icon: CalendarClock,
      },
    ],
  },
  compliance: {
    eyebrow: 'Assurance and governance',
    title: 'Compliance Management',
    description:
      'Kelola standard, requirement, evidence, audit, dan sertifikasi yang terhubung ke aset.',
    icon: BadgeCheck,
    heroClass: 'from-blue-700 via-indigo-700 to-violet-800',
    iconClass: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600',
    destinations: [
      {
        title: 'Standards',
        description: 'Katalog standard dan applicability.',
        href: '/compliance/standards',
        icon: BookOpenCheck,
      },
      {
        title: 'Requirements',
        description: 'Control dan requirement register.',
        href: '/compliance/requirements',
        icon: FileCheck2,
      },
      {
        title: 'Compliance Tasks',
        description: 'Action dan evidence collection.',
        href: '/compliance/tasks',
        icon: ListTodo,
      },
      {
        title: 'Audits & Reviews',
        description: 'Audit lifecycle dan finding closure.',
        href: '/compliance/audits',
        icon: SearchCheck,
      },
      {
        title: 'Certifications',
        description: 'Certificate, scope, dan expiry tracking.',
        href: '/compliance/certifications',
        icon: Award,
      },
    ],
  },
  admin: {
    eyebrow: 'Platform control center',
    title: 'Administration',
    description:
      'Konfigurasikan identity, tenant, security, integration, workflow, dan struktur aplikasi SEMAR.',
    icon: Settings,
    heroClass: 'from-neutral-700 via-zinc-800 to-black',
    iconClass: 'bg-zinc-100 text-zinc-700 group-hover:bg-zinc-700',
    destinations: [
      {
        title: 'Users',
        description: 'Account dan lifecycle pengguna.',
        href: '/admin/users',
        icon: UserCog,
      },
      {
        title: 'Roles',
        description: 'Role dan responsibility mapping.',
        href: '/admin/roles',
        icon: Users,
      },
      {
        title: 'Permissions',
        description: 'Kontrol akses granular.',
        href: '/admin/permissions',
        icon: KeyRound,
      },
      {
        title: 'System Configuration',
        description: 'Konfigurasi platform terpusat.',
        href: '/admin/system-config',
        icon: SlidersHorizontal,
      },
      {
        title: 'Integrations',
        description: 'Adapter dan external connection.',
        href: '/admin/integrations',
        icon: PlugZap,
      },
      {
        title: 'Single Sign-On',
        description: 'SAML dan OIDC configuration.',
        href: '/admin/sso',
        icon: LogIn,
      },
      {
        title: 'Backup & Restore',
        description: 'Backup policy dan recovery operation.',
        href: '/admin/backup-restore',
        icon: DatabaseBackup,
      },
      {
        title: 'Workflow Engine',
        description: 'Workflow definition dan approval.',
        href: '/admin/workflow',
        icon: Workflow,
      },
      {
        title: 'Menu Management',
        description: 'Navigation structure dan visibility.',
        href: '/admin/menu',
        icon: Menu,
      },
      {
        title: 'Module Management',
        description: 'Feature/module activation.',
        href: '/admin/modules',
        icon: Blocks,
      },
      {
        title: 'Taxonomy',
        description: 'Master classification dan attributes.',
        href: '/admin/taxonomy',
        icon: GitBranch,
      },
      {
        title: 'Tenants',
        description: 'Organization, scope, dan quota.',
        href: '/admin/tenants',
        icon: Building2,
      },
    ],
  },
};

interface ModuleLandingPageProps {
  module: ModuleKey;
}

const ModuleLandingPage = ({ module }: ModuleLandingPageProps) => {
  const definition = moduleDefinitions[module];
  const ModuleIcon = definition.icon;
  const { topLevelMenuItems } = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const userPermissions = user?.permissions ?? [];
  const isSuperuser = Boolean(
    user?.is_superuser || (user as { isSuperuser?: boolean } | null)?.isSuperuser
  );

  const visibleDestinations = filterAllowedModuleDestinations(
    module,
    definition.destinations,
    topLevelMenuItems,
    isSuperuser,
    userPermissions
  );
  const totalAreas = visibleDestinations.length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${definition.heroClass} px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10`}
      >
        <div
          className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-black/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex max-w-4xl items-start gap-5">
          <div className="rounded-2xl border border-white/20 bg-white/15 p-3.5 shadow-inner backdrop-blur-sm">
            <ModuleIcon className="h-8 w-8" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              {definition.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {definition.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80 sm:text-base">
              {definition.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby={`${module}-destinations`}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Module workspace
            </p>
            <h2 id={`${module}-destinations`} className="mt-1 text-2xl font-bold text-slate-900">
              Pilih area kerja
            </h2>
          </div>
          {totalAreas > 0 && (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
              {totalAreas} area tersedia
            </span>
          )}
        </div>

        {visibleDestinations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Tidak ada area kerja yang dapat diakses pada modul ini.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDestinations.map((destination) => {
              const DestinationIcon = destination.icon;
              return (
                <Link
                  key={destination.href}
                  to={destination.href}
                  className="group flex min-h-40 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors group-hover:text-white ${definition.iconClass}`}
                  >
                    <DestinationIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{destination.title}</h3>
                  <p className="mt-1 flex-1 text-sm leading-6 text-slate-500">
                    {destination.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition-colors group-hover:text-blue-700">
                    Buka area
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default ModuleLandingPage;
