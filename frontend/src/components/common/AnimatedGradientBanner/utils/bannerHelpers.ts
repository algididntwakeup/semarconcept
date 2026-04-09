// src/components/common/AnimatedGradientBanner/utils/bannerHelpers.ts

import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { StatCardProps } from '../types';

/**
 * Creates a trend indicator based on value comparison
 */
export const createTrendIndicator = (
  currentValue: number, 
  previousValue: number,
  format: 'percentage' | 'number' = 'percentage'
) => {
  const difference = currentValue - previousValue;
  const isPositive = difference >= 0;
  const formattedValue = format === 'percentage' 
    ? `${Math.abs(difference).toFixed(1)}%` 
    : Math.abs(difference).toString();

  return {
    trend: isPositive ? TrendingUp : TrendingDown,
    trendValue: `${isPositive ? '+' : '-'}${formattedValue}`,
    trendColor: isPositive ? 'success.main' : 'error.main'
  };
};

/**
 * Formats numbers for display in stat cards
 */
export const formatStatValue = (value: number, format: 'compact' | 'full' | 'percentage' = 'compact'): string => {
  switch (format) {
    case 'compact':
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    
    case 'percentage':
      return `${value.toFixed(1)}%`;
    
    case 'full':
    default:
      return value.toLocaleString();
  }
};

/**
 * Creates stat cards with common patterns
 */
export const createStatCard = (
  icon: any,
  value: number,
  label: string,
  previousValue?: number,
  format: 'compact' | 'full' | 'percentage' = 'compact'
): StatCardProps => {
  const formattedValue = formatStatValue(value, format);
  const trendData = previousValue !== undefined 
    ? createTrendIndicator(value, previousValue, format === 'percentage' ? 'percentage' : 'number')
    : undefined;

  return {
    icon,
    value: formattedValue,
    label,
    ...trendData
  };
};