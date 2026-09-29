// platform/frontend-mui/src/config/module-destinations.ts
// Titik-titik destination yang disediakan landing page per root module.
// Diturunkan langsung dari ROUTE_MANIFEST sebagai Single Source of Truth (FE-03).

import { getLandingDestinations, AppModule } from './route-manifest';

export interface ModuleDestinationRef {
  title: string;
  href: string;
}

export type LandingModuleKey =
  | 'assets'
  | 'inspection'
  | 'risk'
  | 'analytics'
  | 'maintenance'
  | 'compliance'
  | 'admin';

const LANDING_MODULES: readonly LandingModuleKey[] = [
  'assets',
  'inspection',
  'risk',
  'analytics',
  'maintenance',
  'compliance',
  'admin',
] as const;

/**
 * MODULE_DESTINATIONS diturunkan langsung dari master ROUTE_MANIFEST.
 */
export const MODULE_DESTINATIONS: Record<LandingModuleKey, ModuleDestinationRef[]> =
  LANDING_MODULES.reduce((acc, module) => {
    const destinations = getLandingDestinations(module as AppModule).map((r) => ({
      title: r.title,
      href: r.path,
    }));
    acc[module] = module === 'risk'
      ? destinations.filter((destination) => destination.href === '/risk/equipment-master')
      : [];
    return acc;
  }, {} as Record<LandingModuleKey, ModuleDestinationRef[]>);

/** Seluruh canonical URL yang aktif sebagai destination landing page. */
export const ALL_LANDING_DESTINATIONS: string[] = Object.values(MODULE_DESTINATIONS)
  .flat()
  .map((d) => d.href);
