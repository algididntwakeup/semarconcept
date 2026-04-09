// platform/frontend-mui/src/router/index.tsx
import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Import logger and hooks
import logger from '../utils/logger';
import usePageLogger from '../hooks/usePageLogger';

// Log router initialization
logger.info('Router initializing');

// --- Navigation Logger Component ---
const NavigationLogger: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    logger.info('Page navigation', {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }, [location]);
  
  return null;
};

// --- Page Components (Lazy Loaded) ---
// Auth pages
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const RegistrationPage = React.lazy(() => import('../pages/auth/RegistrationPage'));

// Main pages
const HomePage = React.lazy(() => import('../pages/HomePage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const LoggingExample = React.lazy(() => import('../components/examples/LoggingExample'));
const TestLoggingPage = React.lazy(() => import('../pages/TestLoggingPage'));

// Dashboard pages
const DashboardOverviewPage = React.lazy(() => import('../pages/dashboard/DashboardOverviewPage'));
const DashboardAssetPage = React.lazy(() => import('../pages/dashboard/DashboardAssetPage'));
const DashboardInspectionPage = React.lazy(() => import('../pages/dashboard/DashboardInspectionPage'));
const DashboardMaintenancePage = React.lazy(() => import('../pages/dashboard/DashboardMaintenancePage'));
const DashboardCompliancePage = React.lazy(() => import('../pages/dashboard/DashboardCompliancePage'));

// Analytics pages
const AnalyticsDashboardPage = React.lazy(() => import('../pages/analytics/AnalyticsDashboardPage'));
const AnalyticsPerformancePage = React.lazy(() => import('../pages/analytics/AnalyticsPerformancePage'));
const AnalyticsRiskPage = React.lazy(() => import('../pages/analytics/AnalyticsRiskPage'));
const AnalyticsInspectionPage = React.lazy(() => import('../pages/analytics/AnalyticsInspectionPage'));
const AnalyticsMaintenancePage = React.lazy(() => import('../pages/analytics/AnalyticsMaintenancePage'));
const AnalyticsCompliancePage = React.lazy(() => import('../pages/analytics/AnalyticsCompliancePage'));
const AnalyticsReportsPage = React.lazy(() => import('../pages/analytics/AnalyticsReportsPage'));

// Asset Management pages
const AssetRegistryPage = React.lazy(() => import('../pages/assets/AssetRegistryPage'));
const AssetHierarchyPage = React.lazy(() => import('../pages/assets/AssetHierarchyPage'));
const AssetTechnicalDataPage = React.lazy(() => import('../pages/assets/AssetTechnicalDataPage'));
const AssetDocumentsPage = React.lazy(() => import('../pages/assets/AssetDocumentsPage'));
const AssetImportExportPage = React.lazy(() => import('../pages/assets/AssetImportExportPage'));

// Inspection Management pages
const InspectionPlansPage = React.lazy(() => import('../pages/inspection/InspectionPlansPage'));
const InspectionTasksPage = React.lazy(() => import('../pages/inspection/InspectionTasksPage'));
const InspectionTypesPage = React.lazy(() => import('../pages/inspection/InspectionTypesPage'));
const InspectionFindingsPage = React.lazy(() => import('../pages/inspection/InspectionFindingsPage'));
const InspectionCalendarPage = React.lazy(() => import('../pages/inspection/InspectionCalendarPage'));

// Risk Management pages
const RiskAssessmentsPage = React.lazy(() => import('../pages/risk/RiskAssessmentsPage'));
const RiskMatrixPage = React.lazy(() => import('../pages/risk/RiskMatrixPage'));
const RiskDegradationPage = React.lazy(() => import('../pages/risk/RiskDegradationPage'));
const RiskIntegrityPage = React.lazy(() => import('../pages/risk/RiskIntegrityPage'));
const RiskReportsPage = React.lazy(() => import('../pages/risk/RiskReportsPage'));

// Maintenance Management pages
const MaintenanceWorkOrdersPage = React.lazy(() => import('../pages/maintenance/MaintenanceWorkOrdersPage'));
const MaintenancePlansPage = React.lazy(() => import('../pages/maintenance/MaintenancePlansPage'));
const MaintenanceTasksPage = React.lazy(() => import('../pages/maintenance/MaintenanceTasksPage'));
const MaintenanceResourcesPage = React.lazy(() => import('../pages/maintenance/MaintenanceResourcesPage'));
const MaintenanceCalendarPage = React.lazy(() => import('../pages/maintenance/MaintenanceCalendarPage'));

// Compliance Management pages
const ComplianceStandardsPage = React.lazy(() => import('../pages/compliance/ComplianceStandardsPage'));
const ComplianceRequirementsPage = React.lazy(() => import('../pages/compliance/ComplianceRequirementsPage'));
const ComplianceTasksPage = React.lazy(() => import('../pages/compliance/ComplianceTasksPage'));
const ComplianceAuditsPage = React.lazy(() => import('../pages/compliance/ComplianceAuditsPage'));
const ComplianceCertificationsPage = React.lazy(() => import('../pages/compliance/ComplianceCertificationsPage'));

// Content Management pages
const ContentTypesPage = React.lazy(() => import('../pages/content/ContentTypesPage'));
const ContentItemsPage = React.lazy(() => import('../pages/content/ContentItemsPage'));
const ContentMediaPage = React.lazy(() => import('../pages/content/ContentMediaPage'));
const ContentCategoriesPage = React.lazy(() => import('../pages/content/ContentCategoriesPage'));
const ContentTagsPage = React.lazy(() => import('../pages/content/ContentTagsPage'));
const ContentEntryEditPage = React.lazy(() => import('../pages/content/ContentEntryEditPage'));

// Administration pages
const AdminUsersPage = React.lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminRolesPage = React.lazy(() => import('../pages/admin/AdminRolesPage'));
const AdminPermissionsPage = React.lazy(() => import('../pages/admin/AdminPermissionsPage'));
const AdminSystemConfigPage = React.lazy(() => import('../pages/admin/AdminSystemConfigPage'));
const AdminBackupRestorePage = React.lazy(() => import('../pages/admin/AdminBackupRestorePage'));
const AdminIntegrationsPage = React.lazy(() => import('../pages/admin/AdminIntegrationsPage'));
const AdminMenuManagementPage = React.lazy(() => import('../pages/admin/AdminMenuManagementPage'));
const AdminModuleManagementPage = React.lazy(() => import('../pages/admin/AdminModuleManagementPage'));
const AdminSsoConfigPage = React.lazy(() => import('../pages/admin/AdminSsoConfigPage'));
const AdminWorkflowPage = React.lazy(() => import('../pages/admin/AdminWorkflowPage'));

// Management pages (existing)
const UserListPage = React.lazy(() => import('../pages/manage/UserListPage'));
const UserDetailPage = React.lazy(() => import('../pages/manage/UserDetailPage'));
const RoleListPage = React.lazy(() => import('../pages/manage/RoleListPage'));
const RoleDetailPage = React.lazy(() => import('../pages/manage/RoleDetailPage'));
const ContentTypeListPage = React.lazy(() => import('../pages/manage/ContentTypeListPage'));
const ContentTypeEditPage = React.lazy(() => import('../pages/manage/ContentTypeEditPage'));
const SystemConfigurationPage = React.lazy(() => import('../pages/manage/SystemConfigurationPage'));
const PermissionListPage = React.lazy(() => import('../pages/manage/PermissionListPage'));
const PermissionDetailPage = React.lazy(() => import('../pages/manage/PermissionDetailPage'));
const BackupRestorePage = React.lazy(() => import('../pages/manage/BackupRestorePage'));
const IntegrationsPage = React.lazy(() => import('../pages/manage/IntegrationsPage'));
const MenuManagementPage = React.lazy(() => import('../pages/manage/MenuManagementPage'));
const ModuleManagementPage = React.lazy(() => import('../pages/manage/ModuleManagementPage'));
const SsoConfigPage = React.lazy(() => import('../pages/manage/SsoConfigPage'));
const WorkflowListPage = React.lazy(() => import('../pages/manage/WorkflowListPage'));
const WorkflowEditPage = React.lazy(() => import('../pages/manage/WorkflowEditPage'));

// Templates pages - NOW UNCOMMENTED (these files exist)
const TemplateDashboardAnalyticsPage = React.lazy(() => import('../pages/templates/dashboard/TemplateDashboardAnalyticsPage'));
const TemplateAppChatPage = React.lazy(() => import('../pages/templates/apps/TemplateAppChatPage'));
const TemplateAppTodoPage = React.lazy(() => import('../pages/templates/apps/TemplateAppTodoPage'));
const TemplateAppCalendarPage = React.lazy(() => import('../pages/templates/apps/TemplateAppCalendarPage'));
const TemplateAppUserManagementPage = React.lazy(() => import('../pages/templates/apps/TemplateAppUserManagementPage'));
const TemplateUITypographyPage = React.lazy(() => import('../pages/templates/ui/TemplateUITypographyPage'));
const TemplateUIColorsPage = React.lazy(() => import('../pages/templates/ui/TemplateUIColorsPage'));
const TemplateUIIconsPage = React.lazy(() => import('../pages/templates/ui/TemplateUIIconsPage'));
const TemplateUICardsPage = React.lazy(() => import('../pages/templates/ui/TemplateUICardsPage'));
const TemplateUIComponentsPage = React.lazy(() => import('../pages/templates/ui/TemplateUIComponentsPage'));
const TemplateUIExtensionsPage = React.lazy(() => import('../pages/templates/ui/TemplateUIExtensionsPage'));
const TemplateFormElementsPage = React.lazy(() => import('../pages/templates/forms/TemplateFormElementsPage'));
const TemplateFormLayoutsPage = React.lazy(() => import('../pages/templates/forms/TemplateFormLayoutsPage'));
const TemplateFormValidationPage = React.lazy(() => import('../pages/templates/forms/TemplateFormValidationPage'));
const TemplateFormWizardPage = React.lazy(() => import('../pages/templates/forms/TemplateFormWizardPage'));
const TemplateTablesPage = React.lazy(() => import('../pages/templates/forms/TemplateTablesPage'));
const TemplateChartsPage = React.lazy(() => import('../pages/templates/charts/TemplateChartsPage'));
const TemplateMapsPage = React.lazy(() => import('../pages/templates/charts/TemplateMapsPage'));
// Note: Template page files have different names than expected by router
// TemplateAuthenticationPage exists, but router expects TemplateAuthPage
// TemplateMiscellaneousPage exists, but router expects TemplateMiscPage  
// TemplateAccountSettingsPage exists, but router expects TemplateAccountPage
const TemplateAuthPage = React.lazy(() => import('../pages/templates/pages/TemplateAuthenticationPage'));
const TemplateMiscPage = React.lazy(() => import('../pages/templates/pages/TemplateMiscellaneousPage'));
const TemplateAccountPage = React.lazy(() => import('../pages/templates/pages/TemplateAccountSettingsPage'));
const TemplateFAQPage = React.lazy(() => import('../pages/templates/pages/TemplateFAQPage'));

// Reporting pages - NOW UNCOMMENTED (this file exists)
const ReportTemplateListPage = React.lazy(() => import('../pages/reporting/ReportTemplateListPage'));

// System Configuration pages - NOW UNCOMMENTED (this file exists)
const CategoryManagementPage = React.lazy(() => import('../pages/system-configuration/CategoryManagementPage'));

// Error pages
const AccessInactivePage = React.lazy(() => import('../pages/error/AccessInactivePage'));

// --- Layout Components ---
const MainLayout = React.lazy(() => import('../layouts/MainLayout'));
const ErrorLayout = React.lazy(() => import('../layouts/ErrorLayout'));

// --- Route Logger Component ---
const RouteLogger: React.FC = () => {
  usePageLogger();
  return null;
};

// --- 🔥 FIXED: Protected Route Component with AUTO-REDIRECT DISABLED ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  
  logger.debug('Authentication check', {
    isAuthenticated,
    hasToken: Boolean(token),
    path: location.pathname,
  });
  
  const isAuth = isAuthenticated || (token && token !== null);
  
  if (!isAuth) {
    logger.info('Unauthorized access attempt, redirecting to login', {
      path: location.pathname,
    });
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// --- Loading Component ---
const LoadingFallback: React.FC = () => {
  const startTimeRef = React.useRef(Date.now());
  
  useEffect(() => {
    return () => {
      const loadTime = Date.now() - startTimeRef.current;
      logger.debug('Component loading complete', {
        loadTime: `${loadTime}ms`,
      });
    };
  }, []);
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

// --- Router Routes Component ---
const AppRoutes: React.FC = () => {
  return (
    <>
      <RouteLogger />
      <NavigationLogger />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        
        {/* Protected routes with MainLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Main routes */}
          <Route index element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="dashboard" element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="logging-example" element={<LoggingExample />} />
          <Route path="test-logging" element={<TestLoggingPage />} />
          
          {/* Dashboard routes */}
          <Route path="dashboard">
            <Route path="overview" element={<DashboardOverviewPage />} />
            <Route path="asset" element={<DashboardAssetPage />} />
            <Route path="inspection" element={<DashboardInspectionPage />} />
            <Route path="maintenance" element={<DashboardMaintenancePage />} />
            <Route path="compliance" element={<DashboardCompliancePage />} />
          </Route>
          
          {/* Analytics routes */}
          <Route path="analytics">
            <Route path="performance" element={<AnalyticsPerformancePage />} />
            <Route path="risk" element={<AnalyticsRiskPage />} />
            <Route path="inspection" element={<AnalyticsInspectionPage />} />
            <Route path="maintenance" element={<AnalyticsMaintenancePage />} />
            <Route path="compliance" element={<AnalyticsCompliancePage />} />
            <Route path="reports" element={<AnalyticsReportsPage />} />
            <Route path="dashboard" element={<AnalyticsDashboardPage />} />
          </Route>
          
          {/* Asset Management routes */}
          <Route path="asset">
            <Route path="registry" element={<AssetRegistryPage />} />
            <Route path="hierarchy" element={<AssetHierarchyPage />} />
            <Route path="technical-data" element={<AssetTechnicalDataPage />} />
            <Route path="documents" element={<AssetDocumentsPage />} />
            <Route path="import-export" element={<AssetImportExportPage />} />
          </Route>
          
          {/* Inspection Management routes */}
          <Route path="inspection">
            <Route path="plans" element={<InspectionPlansPage />} />
            <Route path="tasks" element={<InspectionTasksPage />} />
            <Route path="types" element={<InspectionTypesPage />} />
            <Route path="findings" element={<InspectionFindingsPage />} />
            <Route path="calendar" element={<InspectionCalendarPage />} />
          </Route>
          
          {/* Risk Management routes */}
          <Route path="risk">
            <Route path="assessments" element={<RiskAssessmentsPage />} />
            <Route path="matrix" element={<RiskMatrixPage />} />
            <Route path="degradation" element={<RiskDegradationPage />} />
            <Route path="integrity" element={<RiskIntegrityPage />} />
            <Route path="reports" element={<RiskReportsPage />} />
          </Route>
          
          {/* Maintenance Management routes */}
          <Route path="maintenance">
            <Route path="work-orders" element={<MaintenanceWorkOrdersPage />} />
            <Route path="plans" element={<MaintenancePlansPage />} />
            <Route path="tasks" element={<MaintenanceTasksPage />} />
            <Route path="resources" element={<MaintenanceResourcesPage />} />
            <Route path="calendar" element={<MaintenanceCalendarPage />} />
          </Route>
          
          {/* Compliance Management routes - NOW UNCOMMENTED */}
          <Route path="compliance">
            <Route path="standards" element={<ComplianceStandardsPage />} />
            <Route path="requirements" element={<ComplianceRequirementsPage />} />
            <Route path="tasks" element={<ComplianceTasksPage />} />
            <Route path="audits" element={<ComplianceAuditsPage />} />
            <Route path="certifications" element={<ComplianceCertificationsPage />} />
          </Route>
          
          {/* Content Management routes - NOW UNCOMMENTED */}
          <Route path="content">
            <Route path="types" element={<ContentTypesPage />} />
            <Route path="items" element={<ContentItemsPage />} />
            <Route path="media" element={<ContentMediaPage />} />
            <Route path="categories" element={<ContentCategoriesPage />} />
            <Route path="tags" element={<ContentTagsPage />} />
            <Route path="entry/edit/:id?" element={<ContentEntryEditPage />} />
          </Route>
          
          {/* Administration routes - NOW UNCOMMENTED */}
          <Route path="admin">
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="permissions" element={<AdminPermissionsPage />} />
            <Route path="system-config" element={<AdminSystemConfigPage />} />
            <Route path="backup-restore" element={<AdminBackupRestorePage />} />
            <Route path="integrations" element={<AdminIntegrationsPage />} />
            <Route path="menu" element={<AdminMenuManagementPage />} />
            <Route path="modules" element={<AdminModuleManagementPage />} />
            <Route path="sso" element={<AdminSsoConfigPage />} />
            <Route path="workflow" element={<AdminWorkflowPage />} />
          </Route>
          
          {/* Templates routes - NOW FULLY UNCOMMENTED */}
          <Route path="templates">
            <Route path="dashboards">
              <Route path="analytics" element={<TemplateDashboardAnalyticsPage />} />
            </Route>
            <Route path="apps">
              <Route path="chat" element={<TemplateAppChatPage />} />
              <Route path="todo" element={<TemplateAppTodoPage />} />
              <Route path="calendar" element={<TemplateAppCalendarPage />} />
              <Route path="user-management" element={<TemplateAppUserManagementPage />} />
            </Route>
            <Route path="ui">
              <Route path="typography" element={<TemplateUITypographyPage />} />
              <Route path="colors" element={<TemplateUIColorsPage />} />
              <Route path="icons" element={<TemplateUIIconsPage />} />
              <Route path="cards" element={<TemplateUICardsPage />} />
              <Route path="components" element={<TemplateUIComponentsPage />} />
              <Route path="extensions" element={<TemplateUIExtensionsPage />} />
            </Route>
            <Route path="forms">
              <Route path="elements" element={<TemplateFormElementsPage />} />
              <Route path="layouts" element={<TemplateFormLayoutsPage />} />
              <Route path="validation" element={<TemplateFormValidationPage />} />
              <Route path="wizard" element={<TemplateFormWizardPage />} />
              <Route path="tables" element={<TemplateTablesPage />} />
            </Route>
            <Route path="charts">
              <Route path="charts" element={<TemplateChartsPage />} />
              <Route path="maps" element={<TemplateMapsPage />} />
            </Route>
            <Route path="pages">
              <Route path="auth" element={<TemplateAuthPage />} />
              <Route path="misc" element={<TemplateMiscPage />} />
              <Route path="account" element={<TemplateAccountPage />} />
              <Route path="faq" element={<TemplateFAQPage />} />
            </Route>
          </Route>
          
          {/* Management routes (existing) */}
          <Route path="manage">
            <Route path="users" element={<UserListPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="roles" element={<RoleListPage />} />
            <Route path="roles/:id" element={<RoleDetailPage />} />
            <Route path="content-types" element={<ContentTypeListPage />} />
            <Route path="content-types/:id" element={<ContentTypeEditPage />} />
            <Route path="system-configuration" element={<SystemConfigurationPage />} />
            <Route path="permissions" element={<PermissionListPage />} />
            <Route path="permissions/:id" element={<PermissionDetailPage />} />
            <Route path="backup-restore" element={<BackupRestorePage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="menu-management" element={<MenuManagementPage />} />
            <Route path="module-management" element={<ModuleManagementPage />} />
            <Route path="sso-config" element={<SsoConfigPage />} />
            <Route path="workflow" element={<WorkflowListPage />} />
            <Route path="workflow/:id" element={<WorkflowEditPage />} />
          </Route>
          
          {/* Reporting routes - NOW UNCOMMENTED */}
          <Route path="reporting">
            <Route path="templates" element={<ReportTemplateListPage />} />
          </Route>
          
          {/* System Configuration routes - NOW UNCOMMENTED */}
          <Route path="system-configuration">
            <Route path="categories" element={<CategoryManagementPage />} />
          </Route>

          {/* Note: access-inactive is now moved outside MainLayout */}
        </Route>
        
        {/* Error pages (without MainLayout) */}
        <Route element={<ProtectedRoute><ErrorLayout /></ProtectedRoute>}>
          <Route path="/access-inactive" element={<AccessInactivePage />} />
        </Route>

        <Route element={<ErrorLayout />}>
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
};

// --- App Router ---
const AppRouter: React.FC = () => {
  logger.debug('AppRouter rendering');
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppRoutes />
    </Suspense>
  );
};

export default AppRouter;