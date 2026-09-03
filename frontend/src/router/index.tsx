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

// Navigation Logger Component
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
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('../pages/auth/ResetPasswordPage'));

// Main & Search pages
const SearchPage = React.lazy(() => import('../pages/SearchPage'));
const ModuleLandingPage = React.lazy(() => import('../pages/modules/ModuleLandingPage'));

// 1. Dashboard pages
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const DashboardAssetPage = React.lazy(() => import('../pages/dashboard/DashboardAssetPage'));
const DashboardInspectionPage = React.lazy(() => import('../pages/dashboard/DashboardInspectionPage'));
const DashboardMaintenancePage = React.lazy(() => import('../pages/dashboard/DashboardMaintenancePage'));
const DashboardCompliancePage = React.lazy(() => import('../pages/dashboard/DashboardCompliancePage'));

// 2. Asset Management pages
const AssetRegistryPage = React.lazy(() => import('../pages/assets/AssetRegistryPage'));
const AssetHierarchyPage = React.lazy(() => import('../pages/assets/AssetHierarchyPage'));
const AssetTechnicalDataPage = React.lazy(() => import('../pages/assets/AssetTechnicalDataPage'));
const AssetDocumentsPage = React.lazy(() => import('../pages/assets/AssetDocumentsPage'));
const AssetImportExportPage = React.lazy(() => import('../pages/assets/AssetImportExportPage'));
const AssetCategoriesPage = React.lazy(() => import('../pages/assets/AssetCategoriesPage'));
const SiteListPage = React.lazy(() => import('../pages/assets/SiteListPage'));

// 3. Inspection Management pages
const InspectionPlansPage = React.lazy(() => import('../pages/inspection/InspectionPlansPage'));
const InspectionTasksPage = React.lazy(() => import('../pages/inspection/InspectionTasksPage'));
const InspectionTypesPage = React.lazy(() => import('../pages/inspection/InspectionTypesPage'));
const InspectionFindingsPage = React.lazy(() => import('../pages/inspection/InspectionFindingsPage'));
const InspectionCalendarPage = React.lazy(() => import('../pages/inspection/InspectionCalendarPage'));
const InspectionReportsPage = React.lazy(() => import('../pages/inspection/InspectionReportsPage'));

// 4. Risk Management pages (API 580/581)
const RiskMatrixPage = React.lazy(() => import('../pages/risk/RiskMatrixPage'));
const RiskDegradationPage = React.lazy(() => import('../pages/risk/RiskDegradationPage'));
const RiskIntegrityPage = React.lazy(() => import('../pages/risk/RiskIntegrityPage'));
const RiskReportsPage = React.lazy(() => import('../pages/risk/RiskReportsPage'));
const RiskAssessmentsPage = React.lazy(() => import('../pages/risk/RiskAssessmentsPage'));
const RiskMitigationPage = React.lazy(() => import('../pages/risk/RiskMitigationPage'));

// 5. Analytics & Reliability Intelligence pages
const AnalyticsPerformancePage = React.lazy(() => import('../pages/analytics/AnalyticsPerformancePage'));
const AnalyticsRiskPage = React.lazy(() => import('../pages/analytics/AnalyticsRiskPage'));
const AnalyticsInspectionPage = React.lazy(() => import('../pages/analytics/AnalyticsInspectionPage'));
const AnalyticsMaintenancePage = React.lazy(() => import('../pages/analytics/AnalyticsMaintenancePage'));
const AnalyticsCompliancePage = React.lazy(() => import('../pages/analytics/AnalyticsCompliancePage'));
const AnalyticsReportsPage = React.lazy(() => import('../pages/analytics/AnalyticsReportsPage'));
const AnalyticsDashboardPage = React.lazy(() => import('../pages/analytics/AnalyticsDashboardPage'));

// 6. Maintenance Management pages
const MaintenanceWorkOrdersPage = React.lazy(() => import('../pages/maintenance/MaintenanceWorkOrdersPage'));
const MaintenancePlansPage = React.lazy(() => import('../pages/maintenance/MaintenancePlansPage'));
const MaintenanceTasksPage = React.lazy(() => import('../pages/maintenance/MaintenanceTasksPage'));
const MaintenanceResourcesPage = React.lazy(() => import('../pages/maintenance/MaintenanceResourcesPage'));
const MaintenanceCalendarPage = React.lazy(() => import('../pages/maintenance/MaintenanceCalendarPage'));
const MaintenanceHistoryPage = React.lazy(() => import('../pages/maintenance/MaintenanceHistoryPage'));
const MaintenanceSchedulesPage = React.lazy(() => import('../pages/maintenance/MaintenanceSchedulesPage'));

// 7. Compliance Management pages (ISO 14224 / ISO 55000)
const ComplianceStandardsPage = React.lazy(() => import('../pages/compliance/ComplianceStandardsPage'));
const ComplianceRequirementsPage = React.lazy(() => import('../pages/compliance/ComplianceRequirementsPage'));
const ComplianceTasksPage = React.lazy(() => import('../pages/compliance/ComplianceTasksPage'));
const ComplianceAuditsPage = React.lazy(() => import('../pages/compliance/ComplianceAuditsPage'));
const ComplianceCertificationsPage = React.lazy(() => import('../pages/compliance/ComplianceCertificationsPage'));

// 8. Administration pages
const AdminUsersPage = React.lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminRolesPage = React.lazy(() => import('../pages/admin/AdminRolesPage'));
const AdminPermissionsPage = React.lazy(() => import('../pages/admin/AdminPermissionsPage'));
const AdminSystemConfigPage = React.lazy(() => import('../pages/admin/AdminSystemConfigPage'));
const AdminIntegrationsPage = React.lazy(() => import('../pages/admin/AdminIntegrationsPage'));
const AdminSsoConfigPage = React.lazy(() => import('../pages/admin/AdminSsoConfigPage'));
const AdminBackupRestorePage = React.lazy(() => import('../pages/admin/AdminBackupRestorePage'));
const AdminWorkflowPage = React.lazy(() => import('../pages/admin/AdminWorkflowPage'));
const AdminMenuManagementPage = React.lazy(() => import('../pages/admin/AdminMenuManagementPage'));
const AdminModuleManagementPage = React.lazy(() => import('../pages/admin/AdminModuleManagementPage'));
const AdminTaxonomyPage = React.lazy(() => import('../pages/admin/AdminTaxonomyPage'));
const TenantManagementPage = React.lazy(() => import('../pages/admin/TenantManagementPage'));

// Content & Reporting pages
const ContentTypesPage = React.lazy(() => import('../pages/content/ContentTypesPage'));
const ContentItemsPage = React.lazy(() => import('../pages/content/ContentItemsPage'));
const ContentMediaPage = React.lazy(() => import('../pages/content/ContentMediaPage'));
const ContentCategoriesPage = React.lazy(() => import('../pages/content/ContentCategoriesPage'));
const ContentTagsPage = React.lazy(() => import('../pages/content/ContentTagsPage'));
const ContentEntryEditPage = React.lazy(() => import('../pages/content/ContentEntryEditPage'));
const CategoryManagementPage = React.lazy(() => import('../pages/system-configuration/CategoryManagementPage'));
const ReportTemplateListPage = React.lazy(() => import('../pages/reporting/ReportTemplateListPage'));

// Error pages
const AccessInactivePage = React.lazy(() => import('../pages/error/AccessInactivePage'));
const NotFoundPage = React.lazy(() => import('../pages/error/NotFoundPage'));
const ForbiddenPage = React.lazy(() => import('../pages/error/ForbiddenPage'));
const ServerErrorPage = React.lazy(() => import('../pages/error/ServerErrorPage'));

// Layout Components
const MainLayout = React.lazy(() => import('../layouts/MainLayout'));
const ErrorLayout = React.lazy(() => import('../layouts/ErrorLayout'));

// Route Logger Component
const RouteLogger: React.FC = () => {
  usePageLogger();
  return null;
};

// Protected Route Component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  
  const isAuth = isAuthenticated || (token && token !== null);
  
  if (!isAuth) {
    logger.info('Unauthorized access attempt, redirecting to login', {
      path: location.pathname,
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Loading Component
const LoadingFallback: React.FC = () => (
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

// Router Routes Component
export const AppRoutes: React.FC = () => {
  return (
    <>
      <RouteLogger />
      <NavigationLogger />
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        {/* Protected SEMAR Main Application */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Root -> Directly to Mission Control Hub */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Global Search */}
          <Route path="search" element={<SearchPage />} />

          {/* 1. Dashboard Module */}
          <Route path="dashboard">
            <Route index element={<DashboardPage />} />
            <Route path="overview" element={<Navigate to="/dashboard" replace />} />
            <Route path="asset" element={<DashboardAssetPage />} />
            <Route path="inspection" element={<DashboardInspectionPage />} />
            <Route path="maintenance" element={<DashboardMaintenancePage />} />
            <Route path="compliance" element={<DashboardCompliancePage />} />
          </Route>
          
          {/* 2. Asset Management Module (supports both /assets and /asset) */}
          <Route path="assets">
            <Route index element={<ModuleLandingPage module="assets" />} />
            <Route path="registry" element={<AssetRegistryPage />} />
            <Route path="hierarchy" element={<AssetHierarchyPage />} />
            <Route path="technical-data" element={<AssetTechnicalDataPage />} />
            <Route path="documents" element={<AssetDocumentsPage />} />
            <Route path="import-export" element={<AssetImportExportPage />} />
            <Route path="categories" element={<AssetCategoriesPage />} />
            <Route path="sites" element={<SiteListPage />} />
          </Route>
          <Route path="asset">
            <Route index element={<Navigate to="/assets" replace />} />
            <Route path="registry" element={<AssetRegistryPage />} />
            <Route path="hierarchy" element={<AssetHierarchyPage />} />
            <Route path="technical-data" element={<AssetTechnicalDataPage />} />
            <Route path="documents" element={<AssetDocumentsPage />} />
            <Route path="import-export" element={<AssetImportExportPage />} />
          </Route>
          
          {/* 3. Inspection Management Module */}
          <Route path="inspection">
            <Route index element={<ModuleLandingPage module="inspection" />} />
            <Route path="plans" element={<InspectionPlansPage />} />
            <Route path="tasks" element={<InspectionTasksPage />} />
            <Route path="types" element={<InspectionTypesPage />} />
            <Route path="findings" element={<InspectionFindingsPage />} />
            <Route path="calendar" element={<InspectionCalendarPage />} />
            <Route path="reports" element={<InspectionReportsPage />} />
          </Route>
          
          {/* 4. Risk Management Module (RBI / API 580 / 581) */}
          <Route path="risk">
            <Route index element={<ModuleLandingPage module="risk" />} />
            <Route path="matrix" element={<RiskMatrixPage />} />
            <Route path="degradation" element={<RiskDegradationPage />} />
            <Route path="integrity" element={<RiskIntegrityPage />} />
            <Route path="reports" element={<RiskReportsPage />} />
            <Route path="assessments" element={<RiskAssessmentsPage />} />
            <Route path="mitigation" element={<RiskMitigationPage />} />
          </Route>
          
          {/* 5. Analytics & Reliability Intelligence Module */}
          <Route path="analytics">
            <Route index element={<ModuleLandingPage module="analytics" />} />
            <Route path="performance" element={<AnalyticsPerformancePage />} />
            <Route path="risk" element={<AnalyticsRiskPage />} />
            <Route path="inspection" element={<AnalyticsInspectionPage />} />
            <Route path="maintenance" element={<AnalyticsMaintenancePage />} />
            <Route path="compliance" element={<AnalyticsCompliancePage />} />
            <Route path="reports" element={<AnalyticsReportsPage />} />
            <Route path="dashboard" element={<AnalyticsDashboardPage />} />
          </Route>

          {/* 6. Maintenance Management Module */}
          <Route path="maintenance">
            <Route index element={<ModuleLandingPage module="maintenance" />} />
            <Route path="work-orders" element={<MaintenanceWorkOrdersPage />} />
            <Route path="plans" element={<MaintenancePlansPage />} />
            <Route path="tasks" element={<MaintenanceTasksPage />} />
            <Route path="resources" element={<MaintenanceResourcesPage />} />
            <Route path="calendar" element={<MaintenanceCalendarPage />} />
            <Route path="history" element={<MaintenanceHistoryPage />} />
            <Route path="schedules" element={<MaintenanceSchedulesPage />} />
          </Route>
          
          {/* 7. Compliance Management Module */}
          <Route path="compliance">
            <Route index element={<ModuleLandingPage module="compliance" />} />
            <Route path="standards" element={<ComplianceStandardsPage />} />
            <Route path="requirements" element={<ComplianceRequirementsPage />} />
            <Route path="tasks" element={<ComplianceTasksPage />} />
            <Route path="audits" element={<ComplianceAuditsPage />} />
            <Route path="certifications" element={<ComplianceCertificationsPage />} />
          </Route>
          
          {/* 8. Administration Module */}
          <Route path="admin">
            <Route index element={<ModuleLandingPage module="admin" />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="permissions" element={<AdminPermissionsPage />} />
            <Route path="system-config" element={<AdminSystemConfigPage />} />
            <Route path="integrations" element={<AdminIntegrationsPage />} />
            <Route path="sso" element={<AdminSsoConfigPage />} />
            <Route path="backup-restore" element={<AdminBackupRestorePage />} />
            <Route path="workflow" element={<AdminWorkflowPage />} />
            <Route path="menu" element={<AdminMenuManagementPage />} />
            <Route path="modules" element={<AdminModuleManagementPage />} />
            <Route path="taxonomy" element={<AdminTaxonomyPage />} />
            <Route path="tenants" element={<TenantManagementPage />} />
          </Route>

          {/* Content & System Config Utilities */}
          <Route path="content">
            <Route path="types" element={<ContentTypesPage />} />
            <Route path="items" element={<ContentItemsPage />} />
            <Route path="media" element={<ContentMediaPage />} />
            <Route path="categories" element={<ContentCategoriesPage />} />
            <Route path="tags" element={<ContentTagsPage />} />
            <Route path="entry/edit/:id?" element={<ContentEntryEditPage />} />
          </Route>

          <Route path="reporting">
            <Route path="templates" element={<ReportTemplateListPage />} />
          </Route>

          <Route path="system-configuration">
            <Route path="categories" element={<CategoryManagementPage />} />
          </Route>
        </Route>
        
        {/* Error pages */}
        <Route element={<ProtectedRoute><ErrorLayout /></ProtectedRoute>}>
          <Route path="/access-inactive" element={<AccessInactivePage />} />
        </Route>

        <Route element={<ErrorLayout />}>
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
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
