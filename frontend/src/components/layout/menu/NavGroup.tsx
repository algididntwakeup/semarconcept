// platform/frontend-mui/src/components/layout/menu/NavGroup.tsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  alpha,
  styled,
  useTheme 
} from '@mui/material';
import { NavItem as NavItemType } from '../../../types/navigation';

// 🎨 Enhanced Styled Components
const GroupHeader = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2, 3, 1, 3),
  color: theme.palette.text.secondary,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  fontSize: '0.7rem',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&::after': {
    content: '""',
    flex: 1,
    height: 1,
    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
    borderRadius: 1,
  },
}));

const GroupDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 2, 1, 2),
  opacity: 0.3,
  '&::before, &::after': {
    borderColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const GroupContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: theme.spacing(3),
    top: 0,
    bottom: 0,
    width: 2,
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    borderRadius: 1,
  },
}));

interface NavGroupProps {
  item: NavItemType;
  showDivider?: boolean;
  collapsed?: boolean;
}

const NavGroup: React.FC<NavGroupProps> = ({ 
  item, 
  showDivider = true,
  collapsed = false 
}) => {
  const theme = useTheme();

  // Don't render anything if collapsed
  if (collapsed) return null;

  return (
    <GroupContainer>
      {/* Render divider before group (except for first group) */}
      {showDivider && <GroupDivider />}
      
      {/* Group Header */}
      {item.caption && (
        <GroupHeader variant="caption">
          {/* Optional icon for group */}
          {item.icon && React.createElement(item.icon, { 
            fontSize: 'small',
            sx: { 
              color: alpha(theme.palette.primary.main, 0.7),
              width: 16,
              height: 16,
            }
          })}
          {item.caption}
          
          {/* Optional badge for group */}
          {item.badge && (
            <Box
              sx={{
                ml: 'auto',
                px: 1,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontSize: '0.6rem',
                fontWeight: 700,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {typeof item.badge === 'object' ? (item.badge as any)?.count : item.badge}
            </Box>
          )}
        </GroupHeader>
      )}
      
      {/* Group description */}
      {item.description && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 3,
            pb: 1,
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontStyle: 'italic',
            opacity: 0.8,
            lineHeight: 1.3,
          }}
        >
          {item.description}
        </Typography>
      )}
    </GroupContainer>
  );
};

export default NavGroup;
