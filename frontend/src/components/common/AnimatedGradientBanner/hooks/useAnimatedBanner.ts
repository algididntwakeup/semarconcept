// src/components/common/AnimatedGradientBanner/hooks/useAnimatedBanner.ts

import { useState, useCallback } from 'react';
import { GradientThemes, GradientThemeKey } from '../types';

export interface UseAnimatedBannerProps {
  initialTheme?: GradientThemeKey;
  initialDuration?: number;
}

export const useAnimatedBanner = ({ 
  initialTheme = 'sunset', 
  initialDuration = 15 
}: UseAnimatedBannerProps = {}) => {
  const [currentTheme, setCurrentTheme] = useState<GradientThemeKey>(initialTheme);
  const [animationDuration, setAnimationDuration] = useState(initialDuration);
  const [isPaused, setIsPaused] = useState(false);

  const changeTheme = useCallback((theme: GradientThemeKey) => {
    setCurrentTheme(theme);
  }, []);

  const changeDuration = useCallback((duration: number) => {
    setAnimationDuration(duration);
  }, []);

  const toggleAnimation = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsPaused(false);
    setCurrentTheme(initialTheme);
    setAnimationDuration(initialDuration);
  }, [initialTheme, initialDuration]);

  return {
    currentTheme,
    animationDuration: isPaused ? 0 : animationDuration,
    gradientColors: GradientThemes[currentTheme],
    isPaused,
    changeTheme,
    changeDuration,
    toggleAnimation,
    resetAnimation,
    availableThemes: Object.keys(GradientThemes) as GradientThemeKey[]
  };
};