// src/components/common/AnimatedGradientBanner/index.ts

export { default as AnimatedGradientBanner } from './AnimatedGradientBanner';
export { useAnimatedBanner } from './hooks/useAnimatedBanner';
export { 
  createTrendIndicator, 
  formatStatValue, 
  createStatCard 
} from './utils/bannerHelpers';

// Dashboard presets
export {
  assetManagementPreset,
  overviewPreset
} from './presets/dashboardPresets';

// Asset-specific presets
export {
  assetRegistryPreset,
  assetHierarchyPreset,
  assetPerformancePreset,
  assetMaintenancePreset
} from './presets/assetPresets';

// Types and themes
export {
  GradientThemes,
  type AnimatedGradientBannerProps,
  type StatCardProps,
  type FloatingShape,
  type GradientThemeKey
} from './types';

// ===================================================
// UPDATED IMPORT EXAMPLES FOR YOUR PAGES
// ===================================================

/*
// For AssetRegistryPage.tsx
import { 
  AnimatedGradientBanner,
  assetRegistryPreset 
} from '../../components/common/AnimatedGradientBanner';

// For AssetHierarchyPage.tsx  
import { 
  AnimatedGradientBanner,
  assetHierarchyPreset 
} from '../../components/common/AnimatedGradientBanner';

// For future Asset Performance page
import { 
  AnimatedGradientBanner,
  assetPerformancePreset 
} from '../../components/common/AnimatedGradientBanner';

// For future Asset Maintenance page
import { 
  AnimatedGradientBanner,
  assetMaintenancePreset 
} from '../../components/common/AnimatedGradientBanner';
*/