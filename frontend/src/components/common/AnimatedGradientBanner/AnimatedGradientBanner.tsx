// src/components/common/AnimatedGradientBanner/AnimatedGradientBanner.tsx
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  GlobalStyles,
  useTheme,
  SxProps,
  Theme
} from '@mui/material';
import { AnimatedGradientBannerProps, StatCardProps, FloatingShape } from './types';

// Global styles for animations - extracted to avoid recreating on each render
const createGlobalStyles = () => (
  <GlobalStyles
    styles={{
      '@keyframes gradient': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' }
      },
      '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-20px)' }
      },
      '@keyframes cardEnter': {
        'from': {
          opacity: 0,
          transform: 'translateY(20px) scale(0.95)'
        },
        'to': {
          opacity: 1,
          transform: 'translateY(0) scale(1)'
        }
      }
    }}
  />
);

// FloatingShape Component
const FloatingShapeComponent: React.FC<{ shape: FloatingShape; index: number }> = ({ shape, index }) => (
  <Box
    sx={{
      position: 'absolute',
      top: shape.top,
      left: shape.left,
      right: shape.right,
      bottom: shape.bottom,
      width: shape.size,
      height: shape.size,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite',
      animationDelay: `${index * 2}s`,
      pointerEvents: 'none'
    }}
  />
);

// StatCard Component
const StatCard: React.FC<StatCardProps & { delay?: number }> = ({ 
  icon: Icon, 
  value, 
  label, 
  trend: TrendIcon,
  trendValue, 
  trendColor = 'success.main',
  delay = 0,
  sx = {}
}) => {
  const theme = useTheme();

  return (
    <Card sx={{
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      borderRadius: 3,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'cardEnter 0.6s ease-out',
      animationDelay: `${delay}s`,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      ...sx
    }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          {Icon && (
            <Icon sx={{ 
              fontSize: { xs: 24, md: 32 }, 
              color: theme.palette.primary.main 
            }} />
          )}
          {TrendIcon && trendValue && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: trendColor,
              fontSize: '0.75rem',
              fontWeight: 'medium'
            }}>
              <TrendIcon fontSize="small" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          color="text.primary" 
          sx={{ 
            mb: 0.5, 
            fontSize: { xs: '1.5rem', md: '2rem' } 
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Main AnimatedGradientBanner Component
const AnimatedGradientBanner: React.FC<AnimatedGradientBannerProps> = ({
  title,
  subtitle,
  emoji,
  actions,
  stats,
  gradientColors = ['#ee7752', '#e73c7e', '#23a6d5', '#23d5ab'],
  floatingShapes,
  animationDuration = 15,
  containerSx = {},
  contentSx = {}
}) => {
  // Default floating shapes if none provided
  const defaultFloatingShapes: FloatingShape[] = [
    { size: '80px', top: '40px', left: '40px' },
    { size: '128px', bottom: '40px', right: '80px' },
    { size: '64px', top: '80px', right: '160px' }
  ];

  const shapes = floatingShapes || defaultFloatingShapes;
  const gradientString = gradientColors.join(', ');

  return (
    <Box sx={{ flexGrow: 1 }}>
      {createGlobalStyles()}
      
      {/* Enhanced Header Section with Animated Background */}
      <Box sx={{ 
        position: 'relative',
        mx: -3,
        mt: -3,
        px: 3,
        pt: 6,
        pb: 6,
        mb: 6,
        background: `linear-gradient(-45deg, ${gradientString})`,
        backgroundSize: '400% 400%',
        animation: `gradient ${animationDuration}s ease infinite`,
        overflow: 'hidden',
        borderRadius: '0 0 24px 24px',
        ...containerSx
      }}>
        {/* Floating Shapes */}
        {shapes.map((shape, index) => (
          <FloatingShapeComponent key={index} shape={shape} index={index} />
        ))}

        {/* Header Content */}
        <Box sx={{ 
          position: 'relative',
          zIndex: 10,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: stats ? 4 : 0,
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 3, md: 0 },
          ...contentSx
        }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              mb: 1,
              fontSize: { xs: '2rem', md: '3rem' }
            }}>
              {title} {emoji}
            </Typography>
            {subtitle && (
              <Typography variant="h6" sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {/* Action Controls */}
          {actions && (
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              alignItems: 'center', 
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-end' }
            }}>
              {actions}
            </Box>
          )}
        </Box>

        {/* Enhanced Stats with Glass Morphism */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10">
            {stats.map((stat, index) => (
              <div key={index}>
                <StatCard {...stat} delay={index * 0.1} />
              </div>
            ))}
          </div>
        )}
      </Box>
    </Box>
  );
};

export default AnimatedGradientBanner;
