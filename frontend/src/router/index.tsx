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

// Active pages: primary Dashboard and RBI Equipment Master.
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const EquipmentMasterPage = React.lazy(() => import('../pages/risk/EquipmentMasterPage'));

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

          {/* Dashboard main page only */}
          <Route path="dashboard">
            <Route index element={<DashboardPage />} />
            <Route path="overview" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Active RBI vertical slice only */}
          <Route path="risk">
            <Route index element={<Navigate to="/risk/equipment-master" replace />} />
            <Route path="equipment-master" element={<EquipmentMasterPage />} />
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
        </Route>
        <Route path="*" element={<Navigate to="/404" replace />} />
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
