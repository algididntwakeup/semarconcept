// src/components/common/AnimatedGradientBanner/presets/dashboardPresets.ts

import {
  Engineering,
  CheckCircle,
  Build,
  Warning,
  Assessment,
  TrendingUp,
  TrendingDown,
  Error
} from '@mui/icons-material';
import { StatCardProps, AnimatedGradientBannerProps } from '../types';

// Asset Management Dashboard Preset
export const assetManagementPreset = (
  totalAssets = 1247,
  operational = 1089,
  maintenance = 89,
  inactive = 69,
  avgHealth = 84.2,
  critical = 15
): Omit<AnimatedGradientBannerProps, 'title'> => ({
  emoji: '🏭',
  subtitle: 'Monitor asset health, performance, and maintenance status across your organization',
  stats: [
    {
      icon: Engineering,
      value: totalAssets.toLocaleString(),
      label: 'Total Assets',
      trend: TrendingUp,
      trendValue: '+3.2%',
      trendColor: 'success.main'
    },
    {
      icon: CheckCircle,
      value: operational,
      label: 'Operational',
      trendValue: `${((operational / totalAssets) * 100).toFixed(1)}%`
    },
    {
      icon: Build,
      value: maintenance,
      label: 'Maintenance',
      trendValue: `${((maintenance / totalAssets) * 100).toFixed(1)}%`
    },
    {
      icon: Error,
      value: inactive,
      label: 'Inactive',
      trendValue: `${((inactive / totalAssets) * 100).toFixed(1)}%`
    },
    {
      icon: Assessment,
      value: `${avgHealth}%`,
      label: 'Avg Health',
      trend: TrendingUp,
      trendValue: '+2.1%',
      trendColor: 'success.main'
    },
    {
      icon: Warning,
      value: critical,
      label: 'Critical',
      trend: TrendingDown,
      trendValue: '-2',
      trendColor: 'success.main'
    }
  ]
});

// Overview Dashboard Preset
export const overviewPreset = (
  totalAssets = 2547,
  active = 2502,
  maintenance = 35,
  critical = 10
): Omit<AnimatedGradientBannerProps, 'title'> => ({
  emoji: '👋',
  subtitle: "Here's what's happening with your assets today.",
  stats: [
    {
      icon: Engineering,
      value: totalAssets.toLocaleString(),
      label: 'Total Assets',
      trend: TrendingUp,
      trendValue: '+12.5%',
      trendColor: 'success.main'
    },
    {
      icon: CheckCircle,
      value: active,
      label: 'Active',
      trendValue: '98.2%'
    },
    {
      icon: Build,
      value: maintenance,
      label: 'Maintenance',
      trendValue: '1.4%'
    },
    {
      icon: Warning,
      value: critical,
      label: 'Critical',
      trendValue: '0.4%',
      trendColor: 'error.main'
    }
  ]
});
