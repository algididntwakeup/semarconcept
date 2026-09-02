// platform/frontend-mui/src/config/module-destinations.ts
// Titik-titik destination yang disediakan landing page per root module.
// Ini hanya kanonik module itu sendiri; child di luar daftar tidak akan
// dirender walau menu tree memuatnya (fallback kontrak FE-00).

export interface ModuleDestinationRef {
  title: string;
  href: string;
}

export const MODULE_DESTINATIONS: Record<string, ModuleDestinationRef[]> = {
  assets: [
    { title: 'Asset Registry', href: '/assets/registry' },
    { title: 'Asset Hierarchy', href: '/assets/hierarchy' },
    { title: 'Technical Data', href: '/assets/technical-data' },
    { title: 'Documents', href: '/assets/documents' },
    { title: 'Import / Export', href: '/assets/import-export' },
    { title: 'Categories', href: '/assets/categories' },
    { title: 'Sites', href: '/assets/sites' },
  ],
  inspection: [
    { title: 'Inspection Plans', href: '/inspection/plans' },
    { title: 'Inspection Tasks', href: '/inspection/tasks' },
    { title: 'Inspection Types', href: '/inspection/types' },
    { title: 'Findings', href: '/inspection/findings' },
    { title: 'Calendar', href: '/inspection/calendar' },
    { title: 'Reports', href: '/inspection/reports' },
  ],
  risk: [
    { title: 'Risk Matrix', href: '/risk/matrix' },
    { title: 'Degradation', href: '/risk/degradation' },
    { title: 'Integrity Assessment', href: '/risk/integrity' },
    { title: 'RBI Reports', href: '/risk/reports' },
    { title: 'Risk Assessments', href: '/risk/assessments' },
    { title: 'Mitigation Actions', href: '/risk/mitigation' },
  ],
  analytics: [
    { title: 'Performance', href: '/analytics/performance' },
    { title: 'Risk Analysis', href: '/analytics/risk' },
    { title: 'Inspection Coverage', href: '/analytics/inspection' },
    { title: 'Maintenance Effectiveness', href: '/analytics/maintenance' },
    { title: 'Compliance Status', href: '/analytics/compliance' },
    { title: 'Reports', href: '/analytics/reports' },
    { title: 'Analytics Dashboard', href: '/analytics/dashboard' },
  ],
  maintenance: [
    { title: 'Work Orders', href: '/maintenance/work-orders' },
    { title: 'Maintenance Plans', href: '/maintenance/plans' },
    { title: 'Maintenance Tasks', href: '/maintenance/tasks' },
    { title: 'Resources', href: '/maintenance/resources' },
    { title: 'Calendar', href: '/maintenance/calendar' },
    { title: 'History', href: '/maintenance/history' },
    { title: 'Schedules', href: '/maintenance/schedules' },
  ],
  compliance: [
    { title: 'Standards', href: '/compliance/standards' },
    { title: 'Requirements', href: '/compliance/requirements' },
    { title: 'Compliance Tasks', href: '/compliance/tasks' },
    { title: 'Audits & Reviews', href: '/compliance/audits' },
    { title: 'Certifications', href: '/compliance/certifications' },
  ],
  admin: [
    { title: 'Users', href: '/admin/users' },
    { title: 'Roles', href: '/admin/roles' },
    { title: 'Permissions', href: '/admin/permissions' },
    { title: 'System Configuration', href: '/admin/system-config' },
    { title: 'Integrations', href: '/admin/integrations' },
    { title: 'Single Sign-On', href: '/admin/sso' },
    { title: 'Backup & Restore', href: '/admin/backup-restore' },
    { title: 'Workflow Engine', href: '/admin/workflow' },
    { title: 'Menu Management', href: '/admin/menu' },
    { title: 'Module Management', href: '/admin/modules' },
    { title: 'Taxonomy', href: '/admin/taxonomy' },
    { title: 'Tenants', href: '/admin/tenants' },
  ],
};

/** Seluruh canonical URL yang valid untuk destination landing page. */
export const ALL_LANDING_DESTINATIONS: string[] = Object.values(MODULE_DESTINATIONS)
  .flat()
  .map((d) => d.href);
