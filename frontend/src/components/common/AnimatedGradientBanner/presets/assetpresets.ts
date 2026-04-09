// src/components/common/AnimatedGradientBanner/presets/assetPresets.ts

import {
  Engineering,
  CheckCircle,
  Build,
  Error,
  Business as BusinessIcon,
  AccountTree as AccountTreeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { AnimatedGradientBannerProps } from '../types';

// Asset Registry Page Preset
export const assetRegistryPreset = (
  totalAssets: number,
  activeAssets: number,
  maintenanceAssets: number,
  criticalAssets: number
): Omit<AnimatedGradientBannerProps, 'title'> => ({
  emoji: '📋',
  subtitle: 'Manage and monitor all organizational assets with comprehensive tracking and analysis',
  gradientColors: ['#56ab2f', '#a8e6cf', '#7bb3ff', '#ffd3a5'], // green theme
  stats: [
    {
      icon: Engineering,
      value: totalAssets.toString(),
      label: 'Total Assets',
      trendColor: 'primary.main'
    },
    {
      icon: CheckCircle,
      value: activeAssets.toString(),
      label: 'Active',
      trendColor: 'success.main'
    },
    {
      icon: Build,
      value: maintenanceAssets.toString(),
      label: 'Under Maintenance',
      trendColor: 'warning.main'
    },
    {
      icon: Error,
      value: criticalAssets.toString(),
      label: 'Critical Assets',
      trendColor: 'error.main'
    }
  ]
});

// Asset Hierarchy Page Preset
export const assetHierarchyPreset = (
  totalSites: number,
  totalAreas: number,
  totalUnits: number,
  totalSystems: number,
  totalAssets: number
): Omit<AnimatedGradientBannerProps, 'title'> => ({
  emoji: '🏗️',
  subtitle: 'Manage and visualize the hierarchical structure of your assets across sites, areas, units, and systems',
  gradientColors: ['#667eea', '#764ba2', '#8360c3', '#2ebf91'], // purple theme
  stats: [
    {
      icon: BusinessIcon,
      value: totalSites.toString(),
      label: 'Sites',
      trendColor: 'primary.main'
    },
    {
      icon: AccountTreeIcon,
      value: totalAreas.toString(),
      label: 'Areas',
      trendColor: 'success.main'
    },
    {
      icon: Engineering,
      value: totalUnits.toString(),
      label: 'Units',
      trendColor: 'info.main'
    },
    {
      icon: SettingsIcon,
      value: totalSystems.toString(),
      label: 'Systems',
      trendColor: 'warning.main'
    },
    {
      icon: SettingsIcon,
      value: totalAssets.toString(),
      label: 'Assets',
      trendColor: 'default'
    }
  ]
});

// Asset Performance Page Preset (for future use)
export const assetPerformancePreset = (
  avgHealthScore: number,
  assetsAtRisk: number,
  uptime: number,
  efficiency: number
): Omit<AnimatedGradientBannerProps, 'title'> => ({
  emoji: '📈',
  subtitle: 'Monitor and analyze asset performance metrics and efficiency indicators',
  gradientColors: ['#f12711', '#f5af19', '#ff9a9e', '#fecfef'], // fire theme
  stats: [
    {
      icon: Assessment,
      value: `${avgHealthScore}%`,
      label: 'Avg Health Score',
      trendColor: avgHealthScore >= 80 ? 'success.main' : avgHealthScore >= 60 ? 'warning.main' : 'error.main'
    },
    {
      icon: Error,
      value: assetsAtRisk.toString(),
      label: 'Assets at Risk',
      trendColor: 'error.main'
    },
    {
      icon: CheckCircle,
      value: `${uptime}%`,
      label: 'System Uptime',
      trendColor: 'success.main'
    },
    {
      icon: TrendingUp,
      value: `${efficiency}%`,
      label: 'Efficiency',
      trendColor: 'info.main'
    }
  ]
});

// Asset Maintenance Page Preset (for future use)
export const assetMaintenancePreset = (
  scheduledTasks: number,
  overdueTasks: number,
  completedThisMonth: number,
  avgResponseTime: number
): Omit<AnimatedGradientBannerProps, 'title'> => ({
  emoji: '🔧',
  subtitle: 'Manage maintenance schedules, work orders, and service history across all assets',
  gradientColors: ['#a8edea', '#fed6e3', '#e0c3fc', '#9bb5ff'], // cool theme
  stats: [
    {
      icon: Schedule,
      value: scheduledTasks.toString(),
      label: 'Scheduled Tasks',
      trendColor: 'info.main'
    },
    {
      icon: Warning,
      value: overdueTasks.toString(),
      label: 'Overdue Tasks',
      trendColor: 'error.main'
    },
    {
      icon: CheckCircle,
      value: completedThisMonth.toString(),
      label: 'Completed This Month',
      trendColor: 'success.main'
    },
    {
      icon: Build,
      value: `${avgResponseTime}h`,
      label: 'Avg Response Time',
      trendColor: avgResponseTime <= 4 ? 'success.main' : avgResponseTime <= 8 ? 'warning.main' : 'error.main'
    }
  ]
});