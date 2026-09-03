// platform/frontend-mui/src/shared/api/queryKeys.ts

export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...assetKeys.lists(), params ?? {}] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...assetKeys.details(), String(id)] as const,
  statistics: (filters?: Record<string, any>) => [...assetKeys.all, 'statistics', filters ?? {}] as const,
  hierarchy: (params?: Record<string, any>) => [...assetKeys.all, 'hierarchy', params ?? {}] as const,
  sites: (params?: Record<string, any>) => [...assetKeys.all, 'sites', params ?? {}] as const,
  units: (params?: Record<string, any>) => [...assetKeys.all, 'units', params ?? {}] as const,
  components: (params?: Record<string, any>) => [...assetKeys.all, 'components', params ?? {}] as const,
};

export const menuKeys = {
  all: ['menu'] as const,
  userTree: (tenantId?: string | number) => [...menuKeys.all, 'userTree', String(tenantId ?? '')] as const,
};

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export const inspectionKeys = {
  all: ['inspections'] as const,
  plans: (params?: Record<string, any>) => [...inspectionKeys.all, 'plans', params ?? {}] as const,
  plan: (id: string | number) => [...inspectionKeys.all, 'plan', String(id)] as const,
  tasks: (params?: Record<string, any>) => [...inspectionKeys.all, 'tasks', params ?? {}] as const,
  task: (id: string | number) => [...inspectionKeys.all, 'task', String(id)] as const,
  findings: (params?: Record<string, any>) => [...inspectionKeys.all, 'findings', params ?? {}] as const,
  finding: (id: string | number) => [...inspectionKeys.all, 'finding', String(id)] as const,
  statistics: (params?: Record<string, any>) => [...inspectionKeys.all, 'statistics', params ?? {}] as const,
};
