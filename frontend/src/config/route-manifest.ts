// platform/frontend-mui/src/config/route-manifest.ts
/**
 * Single Authoritative Typed Route Manifest for SEMAR Enterprise AIMS
 * 
 * Provides centralized route definitions, semantic identifiers, canonical paths,
 * access control requirements, module associations, and landing destination flags.
 */

export type AppModule =
  | 'dashboard'
  | 'assets'
  | 'inspection'
  | 'risk'
  | 'analytics'
  | 'maintenance'
  | 'compliance'
  | 'admin'
  | 'content'
  | 'reporting'
  | 'system-configuration'
  | 'auth'
  | 'system';

export interface RouteManifestItem {
  id: string; // Unique semantic slug, e.g. 'assets.registry', 'dashboard.home'
  path: string; // Canonical absolute path, e.g. '/assets/registry', '/dashboard'
  title: string;
  module: AppModule;
  description?: string;
  icon?: string; // Identifier matching icon-mapping.ts or Lucide icons
  permissions?: string[]; // Required permissions for role/permission checking
  isProtected: boolean; // Requires authenticated session
  isLandingDestination?: boolean; // Appears as a destination card on the module landing page
  aliases?: string[]; // Legacy or alternative paths that redirect to this route
}

/**
 * Master Registry of all routes in SEMAR application
 */
export const ROUTE_MANIFEST: readonly RouteManifestItem[] = [
  // --- Auth Module (Public) ---
  {
    id: 'auth.login',
    path: '/login',
    title: 'Login',
    module: 'auth',
    description: 'User authentication and sign in',
    isProtected: false,
  },
  {
    id: 'auth.register',
    path: '/register',
    title: 'Register',
    module: 'auth',
    description: 'New tenant or user registration',
    isProtected: false,
  },
  {
    id: 'auth.forgot-password',
    path: '/forgot-password',
    title: 'Forgot Password',
    module: 'auth',
    description: 'Request password reset email',
    isProtected: false,
  },
  {
    id: 'auth.reset-password',
    path: '/reset-password/:token',
    title: 'Reset Password',
    module: 'auth',
    description: 'Set new password with verification token',
    isProtected: false,
  },

  // --- Global / System Routes ---
  {
    id: 'system.root',
    path: '/',
    title: 'Root',
    module: 'system',
    description: 'Application entry point (redirects to dashboard)',
    isProtected: true,
  },
  {
    id: 'system.search',
    path: '/search',
    title: 'Global Search',
    module: 'system',
    description: 'Universal search across assets, inspections, and work orders',
    icon: 'SearchIcon',
    isProtected: true,
  },

  // --- 1. Dashboard Module ---
  {
    id: 'dashboard.home',
    path: '/dashboard',
    title: 'Mission Control Hub',
    module: 'dashboard',
    description: 'Executive overview and real-time reliability telemetry',
    icon: 'DashboardIcon',
    permissions: ['dashboard:view'],
    isProtected: true,
    aliases: ['/dashboard/overview'],
  },
  {
    id: 'dashboard.asset',
    path: '/dashboard/asset',
    title: 'Asset Health Dashboard',
    module: 'dashboard',
    description: 'Asset performance, health index, and criticality overview',
    icon: 'QueryStatsIcon',
    permissions: ['dashboard:assets'],
    isProtected: true,
  },
  {
    id: 'dashboard.inspection',
    path: '/dashboard/inspection',
    title: 'Inspection Dashboard',
    module: 'dashboard',
    description: 'Inspection execution rate and defect findings metrics',
    icon: 'ChecklistIcon',
    permissions: ['dashboard:inspection'],
    isProtected: true,
  },
  {
    id: 'dashboard.maintenance',
    path: '/dashboard/maintenance',
    title: 'Maintenance Dashboard',
    module: 'dashboard',
    description: 'Maintenance backlog, MTBF, MTTR, and work order progress',
    icon: 'BuildIcon',
    permissions: ['dashboard:maintenance'],
    isProtected: true,
  },
  {
    id: 'dashboard.compliance',
    path: '/dashboard/compliance',
    title: 'Compliance Dashboard',
    module: 'dashboard',
    description: 'Regulatory audit readiness and statutory certifications',
    icon: 'VerifiedUserIcon',
    permissions: ['dashboard:compliance'],
    isProtected: true,
  },

  // --- 2. Asset Management Module ---
  {
    id: 'assets.landing',
    path: '/assets',
    title: 'Asset Management',
    module: 'assets',
    description: 'Asset foundation, lifecycle, hierarchy, and equipment registry',
    icon: 'InventoryIcon',
    permissions: ['asset:view'],
    isProtected: true,
    aliases: ['/asset'],
  },
  {
    id: 'assets.registry',
    path: '/assets/registry',
    title: 'Asset Registry',
    module: 'assets',
    description: 'Daftar dan lifecycle seluruh equipment.',
    icon: 'BusinessIcon',
    permissions: ['asset:registry', 'asset:view'],
    isProtected: true,
    isLandingDestination: true,
    aliases: ['/asset/registry'],
  },
  {
    id: 'assets.hierarchy',
    path: '/assets/hierarchy',
    title: 'Asset Hierarchy',
    module: 'assets',
    description: 'Relasi site, unit, equipment, dan component.',
    icon: 'AccountTreeIcon',
    permissions: ['asset:hierarchy', 'asset:view'],
    isProtected: true,
    isLandingDestination: true,
    aliases: ['/asset/hierarchy'],
  },
  {
    id: 'assets.technical-data',
    path: '/assets/technical-data',
    title: 'Technical Data',
    module: 'assets',
    description: 'Spesifikasi dan engineering attributes.',
    icon: 'SettingsSuggestIcon',
    permissions: ['asset:technical', 'asset:view'],
    isProtected: true,
    isLandingDestination: true,
    aliases: ['/asset/technical-data'],
  },
  {
    id: 'assets.documents',
    path: '/assets/documents',
    title: 'Documents',
    module: 'assets',
    description: 'Drawing, datasheet, certificate, dan evidence.',
    icon: 'FolderIcon',
    permissions: ['asset:documents', 'asset:view'],
    isProtected: true,
    isLandingDestination: true,
    aliases: ['/asset/documents'],
  },
  {
    id: 'assets.import-export',
    path: '/assets/import-export',
    title: 'Import / Export',
    module: 'assets',
    description: 'Pertukaran dan validasi bulk asset data.',
    icon: 'ImportExportIcon',
    permissions: ['asset:import', 'asset:export', 'asset:view'],
    isProtected: true,
    isLandingDestination: true,
    aliases: ['/asset/import-export'],
  },
  {
    id: 'assets.categories',
    path: '/assets/categories',
    title: 'Categories',
    module: 'assets',
    description: 'Klasifikasi serta taxonomy equipment.',
    icon: 'CategoryIcon',
    permissions: ['asset:categories', 'asset:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'assets.sites',
    path: '/assets/sites',
    title: 'Sites',
    module: 'assets',
    description: 'Fasilitas operasional, plant, dan site boundary.',
    icon: 'LocationOnIcon',
    permissions: ['asset:sites', 'asset:view'],
    isProtected: true,
    isLandingDestination: true,
  },

  // --- 3. Inspection Management Module ---
  {
    id: 'inspection.landing',
    path: '/inspection',
    title: 'Inspection Management',
    module: 'inspection',
    description: 'Perencanaan inspeksi, task execution, temuan, dan log kepatuhan',
    icon: 'FindInPageIcon',
    permissions: ['inspection:view'],
    isProtected: true,
  },
  {
    id: 'inspection.plans',
    path: '/inspection/plans',
    title: 'Inspection Plans',
    module: 'inspection',
    description: 'Strategi interval, scope, dan baseline inspeksi.',
    icon: 'AssignmentIcon',
    permissions: ['inspection:plans', 'inspection:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'inspection.tasks',
    path: '/inspection/tasks',
    title: 'Inspection Tasks',
    module: 'inspection',
    description: 'Penugasan lapangan dan checklist eksekusi.',
    icon: 'TaskAltIcon',
    permissions: ['inspection:tasks', 'inspection:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'inspection.types',
    path: '/inspection/types',
    title: 'Inspection Types',
    module: 'inspection',
    description: 'Katalog NDT, visual, visual ultrasonic, dan metode pengujian.',
    icon: 'CategoryIcon',
    permissions: ['inspection:types', 'inspection:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'inspection.findings',
    path: '/inspection/findings',
    title: 'Findings',
    module: 'inspection',
    description: 'Pencatatan anomali, wall thinning, dan defect tracking.',
    icon: 'ReportProblemIcon',
    permissions: ['inspection:findings', 'inspection:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'inspection.calendar',
    path: '/inspection/calendar',
    title: 'Calendar',
    module: 'inspection',
    description: 'Jadwal inspeksi berkala dan shutdown window.',
    icon: 'CalendarMonthIcon',
    permissions: ['inspection:calendar', 'inspection:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'inspection.reports',
    path: '/inspection/reports',
    title: 'Reports',
    module: 'inspection',
    description: 'Dossier, resume engineering, dan sertifikat kelayakan.',
    icon: 'AssessmentIcon',
    permissions: ['inspection:reports', 'inspection:view'],
    isProtected: true,
    isLandingDestination: true,
  },

  // --- 4. Risk Management Module (API 580/581) ---
  {
    id: 'risk.landing',
    path: '/risk',
    title: 'Risk & Integrity Management',
    module: 'risk',
    description: 'Risk-Based Inspection (RBI), degradation modeling, dan mitigasi risiko',
    icon: 'SecurityIcon',
    permissions: ['risk:view'],
    isProtected: true,
  },
  {
    id: 'risk.matrix',
    path: '/risk/matrix',
    title: 'Risk Matrix',
    module: 'risk',
    description: 'Pemetaan matriks PoF vs CoF 5x5 standar industri.',
    icon: 'GridOnIcon',
    permissions: ['risk:matrix', 'risk:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'risk.degradation',
    path: '/risk/degradation',
    title: 'Degradation',
    module: 'risk',
    description: 'Mekanisme kerusakan (korosi, fatigue, creep, erosion).',
    icon: 'TrendingDownIcon',
    permissions: ['risk:degradation', 'risk:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'risk.integrity',
    path: '/risk/integrity',
    title: 'Integrity Assessment',
    module: 'risk',
    description: 'Kalkulasi sisa umur dan Fitness-For-Service (FFS).',
    icon: 'HealthAndSafetyIcon',
    permissions: ['risk:integrity', 'risk:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'risk.equipment-master',
    path: '/risk/equipment-master',
    title: 'Equipment Master',
    module: 'risk',
    description: 'Equipment registry and lifecycle overview for Risk Based Inspection.',
    icon: 'InventoryIcon',
    permissions: ['risk:view', 'asset:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'risk.reports',
    path: '/risk/reports',
    title: 'RBI Reports',
    module: 'risk',
    description: 'Laporan evaluasi kuantitatif dan kualitatif risiko.',
    icon: 'AssessmentIcon',
    permissions: ['risk:reports', 'risk:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'risk.assessments',
    path: '/risk/assessments',
    title: 'Risk Assessments',
    module: 'risk',
    description: 'Worksheet dan audit kalkulasi konsekuensi & kemungkinan.',
    icon: 'FactCheckIcon',
    permissions: ['risk:assessments', 'risk:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'risk.mitigation',
    path: '/risk/mitigation',
    title: 'Mitigation Actions',
    module: 'risk',
    description: 'Rencana aksi korektif untuk menekan level risiko.',
    icon: 'ShieldIcon',
    permissions: ['risk:mitigation', 'risk:view'],
    isProtected: true,
    isLandingDestination: true,
  },

  // --- 5. Analytics & Reliability Intelligence Module ---
  {
    id: 'analytics.landing',
    path: '/analytics',
    title: 'Analytics & Reliability Intelligence',
    module: 'analytics',
    description: 'Predictive intelligence, reliability engineering, dan performance tracking',
    icon: 'InsightsIcon',
    permissions: ['analytics:view'],
    isProtected: true,
  },
  {
    id: 'analytics.performance',
    path: '/analytics/performance',
    title: 'Performance',
    module: 'analytics',
    description: 'KPI ketersediaan, utilisasi, dan efisiensi aset.',
    icon: 'SpeedIcon',
    permissions: ['analytics:performance', 'analytics:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'analytics.risk',
    path: '/analytics/risk',
    title: 'Risk Analysis',
    module: 'analytics',
    description: 'Tren pergeseran risiko dan forecasting kegagalan.',
    icon: 'AnalyticsIcon',
    permissions: ['analytics:risk', 'analytics:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'analytics.inspection',
    path: '/analytics/inspection',
    title: 'Inspection Coverage',
    module: 'analytics',
    description: 'Efektivitas deteksi defect dan rasio temuan.',
    icon: 'QueryStatsIcon',
    permissions: ['analytics:inspection', 'analytics:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'analytics.maintenance',
    path: '/analytics/maintenance',
    title: 'Maintenance Effectiveness',
    module: 'analytics',
    description: 'Rasio preventif vs korektif dan MTBF analytics.',
    icon: 'BuildIcon',
    permissions: ['analytics:maintenance', 'analytics:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'analytics.compliance',
    path: '/analytics/compliance',
    title: 'Compliance Status',
    module: 'analytics',
    description: 'Indeks kepatuhan regulasi dan gap analysis.',
    icon: 'VerifiedUserIcon',
    permissions: ['analytics:compliance', 'analytics:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'analytics.reports',
    path: '/analytics/reports',
    title: 'Reports',
    module: 'analytics',
    description: 'Executive summary dan analitik komprehensif.',
    icon: 'AssessmentIcon',
    permissions: ['analytics:reports', 'analytics:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'analytics.dashboard',
    path: '/analytics/dashboard',
    title: 'Analytics Dashboard',
    module: 'analytics',
    description: 'Visualisasi grafik interaktif dan multi-variable cross tab.',
    icon: 'DashboardIcon',
    permissions: ['analytics:dashboard', 'analytics:view'],
    isProtected: true,
    isLandingDestination: true,
  },

  // --- 6. Maintenance Management Module ---
  {
    id: 'maintenance.landing',
    path: '/maintenance',
    title: 'Maintenance Management',
    module: 'maintenance',
    description: 'Work order execution, PM scheduling, dan riwayat pemeliharaan',
    icon: 'EngineeringIcon',
    permissions: ['maintenance:view'],
    isProtected: true,
  },
  {
    id: 'maintenance.work-orders',
    path: '/maintenance/work-orders',
    title: 'Work Orders',
    module: 'maintenance',
    description: 'Perintah kerja perbaikan, preventif, dan shutdown.',
    icon: 'AssignmentIcon',
    permissions: ['maintenance:work-orders', 'maintenance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'maintenance.plans',
    path: '/maintenance/plans',
    title: 'Maintenance Plans',
    module: 'maintenance',
    description: 'Rencana kerja pemeliharaan berkala dan overhaul.',
    icon: 'ScheduleIcon',
    permissions: ['maintenance:plans', 'maintenance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'maintenance.tasks',
    path: '/maintenance/tasks',
    title: 'Maintenance Tasks',
    module: 'maintenance',
    description: 'Detail tugas teknisi dan instruksi kerja SOP.',
    icon: 'ChecklistIcon',
    permissions: ['maintenance:tasks', 'maintenance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'maintenance.resources',
    path: '/maintenance/resources',
    title: 'Resources',
    module: 'maintenance',
    description: 'Alokasi man-hours, spare parts, dan perkakas khusus.',
    icon: 'GroupIcon',
    permissions: ['maintenance:resources', 'maintenance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'maintenance.calendar',
    path: '/maintenance/calendar',
    title: 'Calendar',
    module: 'maintenance',
    description: 'Timeline jadwal pemeliharaan tim lapangan.',
    icon: 'CalendarMonthIcon',
    permissions: ['maintenance:calendar', 'maintenance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'maintenance.history',
    path: '/maintenance/history',
    title: 'History',
    module: 'maintenance',
    description: 'Catatan historis penanganan kegagalan dan log perbaikan.',
    icon: 'HistoryIcon',
    permissions: ['maintenance:history', 'maintenance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'maintenance.schedules',
    path: '/maintenance/schedules',
    title: 'Schedules',
    module: 'maintenance',
    description: 'Trigger otomasi pemeliharaan berdasarkan runtime & kalender.',
    icon: 'AccessTimeIcon',
    permissions: ['maintenance:schedules', 'maintenance:view'],
    isProtected: true,
    isLandingDestination: true,
  },

  // --- 7. Compliance Management Module ---
  {
    id: 'compliance.landing',
    path: '/compliance',
    title: 'Compliance Management',
    module: 'compliance',
    description: 'Kepatuhan standar ISO 14224 / 55000, audit regulasi, dan sertifikasi',
    icon: 'PolicyIcon',
    permissions: ['compliance:view'],
    isProtected: true,
  },
  {
    id: 'compliance.standards',
    path: '/compliance/standards',
    title: 'Standards',
    module: 'compliance',
    description: 'Katalog acuan standar internasional & regulasi nasional.',
    icon: 'MenuBookIcon',
    permissions: ['compliance:standards', 'compliance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'compliance.requirements',
    path: '/compliance/requirements',
    title: 'Requirements',
    module: 'compliance',
    description: 'Klausul wajib dan parameter verifikasi kepatuhan.',
    icon: 'ChecklistIcon',
    permissions: ['compliance:requirements', 'compliance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'compliance.tasks',
    path: '/compliance/tasks',
    title: 'Compliance Tasks',
    module: 'compliance',
    description: 'Tindakan mitigasi kepatuhan dan review kepatuhan berkala.',
    icon: 'TaskAltIcon',
    permissions: ['compliance:tasks', 'compliance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'compliance.audits',
    path: '/compliance/audits',
    title: 'Audits & Reviews',
    module: 'compliance',
    description: 'Log audit internal, audit eksternal, dan temuan pengawas.',
    icon: 'AssignmentTurnedInIcon',
    permissions: ['compliance:audits', 'compliance:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'compliance.certifications',
    path: '/compliance/certifications',
    title: 'Certifications',
    module: 'compliance',
    description: 'Masa berlaku izin bejana tekan, pipeline, dan sertifikat resmi.',
    icon: 'VerifiedIcon',
    permissions: ['compliance:certifications', 'compliance:view'],
    isProtected: true,
    isLandingDestination: true,
  },

  // --- 8. Administration Module ---
  {
    id: 'admin.landing',
    path: '/admin',
    title: 'Administration',
    module: 'admin',
    description: 'Manajemen pengguna, role, tenant, workflow, dan konfigurasi sistem',
    icon: 'AdminPanelSettingsIcon',
    permissions: ['admin:view'],
    isProtected: true,
  },
  {
    id: 'admin.users',
    path: '/admin/users',
    title: 'Users',
    module: 'admin',
    description: 'Daftar pengguna, kredensial, dan status akun.',
    icon: 'PeopleIcon',
    permissions: ['admin:users', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.roles',
    path: '/admin/roles',
    title: 'Roles',
    module: 'admin',
    description: 'Definisi role, role hierarchy, dan grouping wewenang.',
    icon: 'SecurityIcon',
    permissions: ['admin:roles', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.permissions',
    path: '/admin/permissions',
    title: 'Permissions',
    module: 'admin',
    description: 'Katalog granular action permissions seluruh modul.',
    icon: 'VpnKeyIcon',
    permissions: ['admin:permissions', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.system-config',
    path: '/admin/system-config',
    title: 'System Configuration',
    module: 'admin',
    description: 'Parameter runtime, logging, environment, dan global flags.',
    icon: 'SettingsIcon',
    permissions: ['admin:config', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.integrations',
    path: '/admin/integrations',
    title: 'Integrations',
    module: 'admin',
    description: 'Konektor ERP, SAP, SCADA, sensor IoT, dan webhook API.',
    icon: 'PowerIcon',
    permissions: ['admin:integrations', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.sso',
    path: '/admin/sso',
    title: 'Single Sign-On',
    module: 'admin',
    description: 'Konfigurasi SAML 2.0, OAuth2, dan enterprise IdP provider.',
    icon: 'LoginIcon',
    permissions: ['admin:sso', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.backup-restore',
    path: '/admin/backup-restore',
    title: 'Backup & Restore',
    module: 'admin',
    description: 'Snapshot database, backup berkala, dan restore disaster recovery.',
    icon: 'BackupIcon',
    permissions: ['admin:backup', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.workflow',
    path: '/admin/workflow',
    title: 'Workflow Engine',
    module: 'admin',
    description: 'State machine approval, transisi status, dan notifikasi.',
    icon: 'AltRouteIcon',
    permissions: ['admin:workflow', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.menu',
    path: '/admin/menu',
    title: 'Menu Management',
    module: 'admin',
    description: 'Struktur hierarki menu sidebar, urutan icon, dan link dinamis.',
    icon: 'MenuIcon',
    permissions: ['admin:menu', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.modules',
    path: '/admin/modules',
    title: 'Module Management',
    module: 'admin',
    description: 'Aktivasi fitur modul modular per subscription tier.',
    icon: 'ViewModuleIcon',
    permissions: ['admin:modules', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.taxonomy',
    path: '/admin/taxonomy',
    title: 'Taxonomy',
    module: 'admin',
    description: 'Master classification dan attributes.',
    icon: 'AccountTreeIcon',
    permissions: ['admin:taxonomy', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },
  {
    id: 'admin.tenants',
    path: '/admin/tenants',
    title: 'Tenants',
    module: 'admin',
    description: 'Organization, scope, dan quota.',
    icon: 'ApartmentIcon',
    permissions: ['admin:tenants', 'admin:view'],
    isProtected: true,
    isLandingDestination: true,
  },

  // --- Content & System Config Utilities ---
  {
    id: 'content.types',
    path: '/content/types',
    title: 'Content Types',
    module: 'content',
    description: 'Schema dan model konten kustom',
    icon: 'CategoryIcon',
    permissions: ['content:types', 'content:view'],
    isProtected: true,
  },
  {
    id: 'content.items',
    path: '/content/items',
    title: 'Content Items',
    module: 'content',
    description: 'Entri data konten terstruktur',
    icon: 'DescriptionIcon',
    permissions: ['content:items', 'content:view'],
    isProtected: true,
  },
  {
    id: 'content.media',
    path: '/content/media',
    title: 'Media Library',
    module: 'content',
    description: 'Penyimpanan asset media dan file attachments',
    icon: 'PermMediaIcon',
    permissions: ['content:media', 'content:view'],
    isProtected: true,
  },
  {
    id: 'content.categories',
    path: '/content/categories',
    title: 'Content Categories',
    module: 'content',
    description: 'Kategorisasi dan penandaan konten',
    icon: 'FolderIcon',
    permissions: ['content:categories', 'content:view'],
    isProtected: true,
  },
  {
    id: 'content.tags',
    path: '/content/tags',
    title: 'Content Tags',
    module: 'content',
    description: 'Label dan metadata tag pencarian',
    icon: 'LocalOfferIcon',
    permissions: ['content:tags', 'content:view'],
    isProtected: true,
  },
  {
    id: 'content.entry-edit',
    path: '/content/entry/edit/:id?',
    title: 'Edit Content Entry',
    module: 'content',
    description: 'Form pembuatan atau perubahan konten',
    isProtected: true,
  },
  {
    id: 'reporting.templates',
    path: '/reporting/templates',
    title: 'Report Templates',
    module: 'reporting',
    description: 'Template export laporan PDF dan Excel',
    icon: 'AssessmentIcon',
    permissions: ['reporting:templates', 'reporting:view'],
    isProtected: true,
  },
  {
    id: 'system-configuration.categories',
    path: '/system-configuration/categories',
    title: 'System Categories',
    module: 'system-configuration',
    description: 'Master kategori sistem',
    icon: 'CategoryIcon',
    permissions: ['config:categories', 'admin:view'],
    isProtected: true,
  },

  // --- Error & Access Boundaries ---
  {
    id: 'error.access-inactive',
    path: '/access-inactive',
    title: 'Access Inactive',
    module: 'system',
    description: 'Informasi akun atau tenant tidak aktif',
    isProtected: true,
  },
  {
    id: 'error.forbidden',
    path: '/403',
    title: 'Forbidden',
    module: 'system',
    description: 'Akses ditolak karena kekurangan wewenang atau hak akses',
    isProtected: false,
  },
  {
    id: 'error.server-error',
    path: '/500',
    title: 'Server Error',
    module: 'system',
    description: 'Terjadi kegagalan pemrosesan di server internal',
    isProtected: false,
  },
  {
    id: 'error.not-found',
    path: '/404',
    title: 'Not Found',
    module: 'system',
    description: 'Halaman yang dituju tidak ditemukan',
    isProtected: false,
  },
] as const;

// --- Helper Functions ---

/**
 * Return all registered routes in the manifest
 */
export const getAllRoutes = (): readonly RouteManifestItem[] => {
  return ROUTE_MANIFEST;
};

/**
 * Lookup a route by its semantic ID (slug)
 */
export const getRouteById = (id: string): RouteManifestItem | undefined => {
  return ROUTE_MANIFEST.find((r) => r.id === id);
};

/**
 * Lookup a route by its exact path or recognized alias
 */
export const getRouteByPath = (path: string): RouteManifestItem | undefined => {
  const normalized = path.replace(/\/$/, '') || '/';
  return ROUTE_MANIFEST.find((r) => {
    const routeNorm = r.path.replace(/\/$/, '') || '/';
    if (routeNorm === normalized) return true;
    if (r.aliases && r.aliases.some((a) => (a.replace(/\/$/, '') || '/') === normalized)) {
      return true;
    }
    return false;
  });
};

/**
 * Check if a path is recognized by the manifest (including parameter patterns like :token or :id)
 */
export const isPathValid = (path: string): boolean => {
  const normalized = path.replace(/\/$/, '') || '/';
  // Check exact matches or aliases
  if (getRouteByPath(normalized)) return true;

  // Check parameterized paths (e.g. /reset-password/:token, /content/entry/edit/:id?)
  return ROUTE_MANIFEST.some((r) => {
    if (!r.path.includes(':')) return false;
    const pattern = new RegExp(
      '^' +
        r.path
          .replace(/\/:\w+\?/g, '(/[^/]+)?')
          .replace(/\/:\w+/g, '/[^/]+') +
        '$'
    );
    return pattern.test(normalized);
  });
};

/**
 * Get all landing destinations for a given module
 */
export const getLandingDestinations = (module: AppModule): RouteManifestItem[] => {
  return ROUTE_MANIFEST.filter((r) => r.module === module && r.isLandingDestination === true);
};

/**
 * Check if path requires authentication
 */
export const isPathProtected = (path: string): boolean => {
  const route = getRouteByPath(path);
  return route ? route.isProtected : true; // Default to protected for safety
};

/**
 * Retrieve required permissions for a given route path
 */
export const getRequiredPermissions = (path: string): string[] => {
  const route = getRouteByPath(path);
  return route?.permissions ?? [];
};

import type { NavItem } from '../types/navigation';

export const MANAGED_MODULE_PREFIXES: readonly string[] = [
  'analytics',
  'risk',
  'inspection',
  'maintenance',
  'compliance',
  'assets',
  'asset',
  'content',
  'admin',
  'manage',
  'reporting',
  'system-configuration',
  'dashboard',
] as const;

export const ACCESS_WHITELIST: readonly string[] = [
  '/',
  '/dashboard',
  '/dashboard/',
  '/dashboard/overview',
  '/dashboard/asset',
  '/dashboard/inspection',
  '/dashboard/maintenance',
  '/dashboard/compliance',
  '/login',
  '/register',
  '/forgot-password',
  '/access-inactive',
  '/403',
  '/404',
  '/500',
] as const;

export interface RouteAccessCheck {
  allowed: boolean;
  blocked: boolean;
  foundInMenu: boolean;
  reason?: 'superuser' | 'whitelist' | 'menu_active' | 'menu_inactive' | 'not_in_menu';
}

/**
 * Validates route access for a user against the current runtime menu tree.
 * Prevents unauthorized deep-link access to inactive, hidden, or ungranted modules.
 */
export const checkRouteAccess = (
  items: NavItem[],
  path: string,
  isSuperuser: boolean
): RouteAccessCheck => {
  const normalizedPath = path.replace(/\/$/, '') || '/';

  // 1. Whitelist basic public/error/overview routes
  if (ACCESS_WHITELIST.some((w) => (w.replace(/\/$/, '') || '/') === normalizedPath)) {
    return { allowed: true, blocked: false, foundInMenu: true, reason: 'whitelist' };
  }

  // 2. Superuser bypass
  if (isSuperuser) {
    return { allowed: true, blocked: false, foundInMenu: true, reason: 'superuser' };
  }

  // 3. Search menu tree recursively
  const findInMenu = (
    nodes: NavItem[],
    targetUrl: string,
    parentChain: NavItem[] = []
  ): { blocked: boolean; found: boolean } => {
    for (const item of nodes) {
      const itemUrl = item.url?.replace(/\/$/, '') || '';
      const isExact = itemUrl && itemUrl === targetUrl;
      const isParent = itemUrl && targetUrl.startsWith(itemUrl + '/');

      if (isExact || isParent) {
        const hasInactiveParent = parentChain.some((p) => p.visible === false || p.disabled === true);
        const isThisInactive = item.visible === false || item.disabled === true;

        if (hasInactiveParent || isThisInactive) {
          return { blocked: true, found: true };
        }

        if (isParent && item.children) {
          const childCheck = findInMenu(item.children, targetUrl, [...parentChain, item]);
          if (childCheck.found) return childCheck;
        }

        return { blocked: false, found: true };
      }

      if (item.children) {
        const result = findInMenu(item.children, targetUrl, [...parentChain, item]);
        if (result.found) return result;
      }
    }
    return { blocked: false, found: false };
  };

  const { blocked, found } = findInMenu(items, normalizedPath);

  if (found) {
    if (blocked) {
      return { allowed: false, blocked: true, foundInMenu: true, reason: 'menu_inactive' };
    }
    return { allowed: true, blocked: false, foundInMenu: true, reason: 'menu_active' };
  }

  // If not found in menu, check if it belongs to a managed enterprise module
  const firstSegment = normalizedPath.replace(/^\//, '').split('/')[0];
  const isManaged = MANAGED_MODULE_PREFIXES.includes(firstSegment);

  if (isManaged) {
    return { allowed: false, blocked: true, foundInMenu: false, reason: 'not_in_menu' };
  }

  return { allowed: true, blocked: false, foundInMenu: false };
};
