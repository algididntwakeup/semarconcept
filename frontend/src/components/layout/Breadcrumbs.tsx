// platform/frontend-mui/src/components/layout/Breadcrumbs.tsx
import React, { useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast?: boolean;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  // Enhanced breadcrumb generation
  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    if (pathSegments.length === 0) {
      return [{ label: 'Dashboard', path: '/dashboard', isLast: true }];
    }

    // Enhanced label mapping
    const labelMap: Record<string, { label: string }> = {
      'dashboard': { label: 'Dashboard' },
      'admin': { label: 'Administration' },
      'users': { label: 'Users' },
      'roles': { label: 'Roles' },
      'permissions': { label: 'Permissions' },
      'system-config': { label: 'System Config' },
      'user-management': { label: 'User Management' },
    };

    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const mapping = labelMap[segment] || { 
        label: segment.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') 
      };

      breadcrumbs.push({
        label: mapping.label,
        path: currentPath,
        isLast: index === pathSegments.length - 1,
      });
    });

    return breadcrumbs;
  }, [location.pathname]);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-[11px] text-slate-500 max-w-full overflow-x-auto no-scrollbar">
      {/* Home Link */}
      <RouterLink 
        to="/dashboard"
        className="flex items-center space-x-1 hover:text-primary-600 hover:bg-primary-50 px-2 py-1 rounded-md transition-colors font-medium text-primary-600"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </RouterLink>

      {/* Dynamic Breadcrumbs */}
      {breadcrumbItems.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400" />
          {breadcrumb.isLast ? (
            <span className="flex items-center px-2 py-1 font-semibold text-slate-800">
              {breadcrumb.label}
            </span>
          ) : (
            <RouterLink
              to={breadcrumb.path}
              className="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors hover:text-primary-600 hover:bg-primary-50"
            >
              <span className="inline whitespace-nowrap">
                {breadcrumb.label}
              </span>
            </RouterLink>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;