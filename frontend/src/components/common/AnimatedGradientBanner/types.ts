// src/components/common/AnimatedGradientBanner/types.ts
import { ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

export interface FloatingShape {
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

export interface StatCardProps {
  icon?: SvgIconComponent;
  value: string | number;
  label: string;
  trend?: ReactNode;
  trendValue?: string;
  trendColor?: string;
  sx?: SxProps<Theme>;
}

export interface AnimatedGradientBannerProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  actions?: ReactNode;
  stats?: StatCardProps[];
  gradientColors?: string[];
  floatingShapes?: FloatingShape[];
  animationDuration?: number;
  containerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

// Predefined gradient themes
export const GradientThemes = {
  ocean: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
  sunset: ['#ee7752', '#e73c7e', '#23a6d5', '#23d5ab'],
  purple: ['#667eea', '#764ba2', '#8360c3', '#2ebf91'],
  fire: ['#f12711', '#f5af19', '#ff9a9e', '#fecfef'],
  cool: ['#a8edea', '#fed6e3', '#e0c3fc', '#9bb5ff'],
  dark: ['#434343', '#000000', '#667eea', '#764ba2'],
  green: ['#56ab2f', '#a8e6cf', '#7bb3ff', '#ffd3a5'],
  pink: ['#ff9a9e', '#fecfef', '#ffecd2', '#fcb69f']
} as const;

export type GradientThemeKey = keyof typeof GradientThemes;