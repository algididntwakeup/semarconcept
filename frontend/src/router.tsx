import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Loading component
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>Loading...</div>
  </div>
);

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ErrorLayout from './layouts/ErrorLayout';

// Lazy load pages
// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Dashboard pages
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const AnalyticsDashboardPage = lazy(() => import('./pages/analytics/AnalyticsDashboardPage'));

// Management pages
const UserListPage = lazy(() => import('./pages/manage/UserListPage'));
const UserDetailPage = lazy(() => import('./pages/manage/UserDetailPage'));
const RoleListPage = lazy(() => import('./pages/manage/RoleListPage'));
const RoleDetailPage = lazy(() => import('./pages/manage/RoleDetailPage'));
const ContentTypeListPage = lazy(() => import('./pages/manage/ContentTypeListPage'));
const ContentTypeEditPage = lazy(() => import('./pages/manage/ContentTypeEditPage'));
const SystemConfigurationPage = lazy(() => import('./pages/manage/SystemConfigurationPage'));
const PermissionListPage = lazy(() => import('./pages/manage/PermissionListPage'));
const PermissionDetailPage = lazy(() => import('./pages/manage/PermissionDetailPage'));
const BackupRestorePage = lazy(() => import('./pages/manage/BackupRestorePage'));
const IntegrationsPage = lazy(() => import('./pages/manage/IntegrationsPage'));
const MenuManagementPage = lazy(() => import('./pages/manage/MenuManagementPage'));
const ModuleManagementPage = lazy(() => import('./pages/manage/ModuleManagementPage'));
const SsoConfigPage = lazy(() => import('./pages/manage/SsoConfigPage'));
const TaxonomyConfigPage = lazy(() => import('./pages/manage/TaxonomyConfigPage'));
const WorkflowListPage = lazy(() => import('./pages/manage/WorkflowListPage'));
const WorkflowEditPage = lazy(() => import('./pages/manage/WorkflowEditPage'));

// Content pages
const ContentEntryEditPage = lazy(() => import('./pages/content/ContentEntryEditPage'));

// Reporting pages
const ReportTemplateListPage = lazy(() => import('./pages/reporting/ReportTemplateListPage'));

// System Configuration pages
const CategoryManagementPage = lazy(() => import('./pages/system-configuration/CategoryManagementPage'));

// Error pages
const NotFoundPage = lazy(() => import('./pages/error/NotFoundPage'));
// Use the existing error pages
const ForbiddenPage = NotFoundPage;
const ServerErrorPage = NotFoundPage;

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const router = createBrowserRouter([
  // Auth routes
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPasswordPage />,
      },
    ],
  },
  
  // Dashboard route
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      }
    ]
  },
  
  // Analytics routes
  {
    path: '/analytics',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AnalyticsDashboardPage />,
      }
    ]
  },
  
  // Management routes
  {
    path: '/manage',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'users',
        element: <UserListPage />,
      },
      {
        path: 'users/:id',
        element: <UserDetailPage />,
      },
      {
        path: 'roles',
        element: <RoleListPage />,
      },
      {
        path: 'roles/:id',
        element: <RoleDetailPage />,
      },
      {
        path: 'content-types',
        element: <ContentTypeListPage />,
      },
      {
        path: 'content-types/:id',
        element: <ContentTypeEditPage />,
      },
      {
        path: 'system-configuration',
        element: <SystemConfigurationPage />,
      },
      {
        path: 'permissions',
        element: <PermissionListPage />,
      },
      {
        path: 'permissions/:id',
        element: <PermissionDetailPage />,
      },
      {
        path: 'backup-restore',
        element: <BackupRestorePage />,
      },
      {
        path: 'integrations',
        element: <IntegrationsPage />,
      },
      {
        path: 'menu-management',
        element: <MenuManagementPage />,
      },
      {
        path: 'module-management',
        element: <ModuleManagementPage />,
      },
      {
        path: 'sso-config',
        element: <SsoConfigPage />,
      },
      {
        path: 'taxonomy-config',
        element: <TaxonomyConfigPage />,
      },
      {
        path: 'workflow',
        element: <WorkflowListPage />,
      },
      {
        path: 'workflow/:id',
        element: <WorkflowEditPage />,
      }
    ]
  },
  
  // Content routes
  {
    path: '/content',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'entry/edit/:id?',
        element: <ContentEntryEditPage />,
      }
    ]
  },
  
  // Reporting routes
  {
    path: '/reporting',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'templates',
        element: <ReportTemplateListPage />,
      }
    ]
  },
  
  // System Configuration routes
  {
    path: '/system-configuration',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'categories',
        element: <CategoryManagementPage />,
      }
    ]
  },
  
  // Default route
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  
  // Error routes
  {
    path: '/error',
    element: <ErrorLayout />,
    children: [
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '500',
        element: <ServerErrorPage />,
      },
    ],
  },
  
  // Catch-all 404 route
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);

export default router;
