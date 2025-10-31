import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAuth } from './contexts/AuthContext';
import PendingApproval from './components/PendingApproval';
import RoleGuard from './components/RoleGuard';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const CreatePropertyPage = lazy(() => import('./pages/CreatePropertyPage'));
const PropertyDetailsPage = lazy(() => import('./pages/PropertyDetailsPage'));
const SpaceAssignmentPage = lazy(() => import('./pages/SpaceAssignmentPage'));
const AllSpacesPage = lazy(() => import('./pages/AllSpacesPage'));
const SpacesByPropertyPage = lazy(() => import('./pages/SpacesByPropertyPage'));
const TenantsPage = lazy(() => import('./pages/TenantsPage'));
const RentPage = lazy(() => import('./pages/RentPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserRoleAssignmentPage = lazy(() => import('./pages/UserRoleAssignmentPage'));
const FirebaseDirectExample = lazy(() => import('./pages/FirebaseDirectExample'));
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage'));
const QuickDataCheck = lazy(() => import('./pages/QuickDataCheck'));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage'));
const SystemReportsPage = lazy(() => import('./pages/admin/SystemReportsPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));

// Protected route wrapper with RBAC
const ProtectedRoute = ({ children }) => {
  const { user, loading, needsRoleAssignment, userProfile } = useAuth();
  const [showPendingApproval, setShowPendingApproval] = useState(false);
  
  useEffect(() => {
    if (user && (needsRoleAssignment || userProfile?.status === 'pending_approval' || userProfile?.status === 'rejected')) {
      setShowPendingApproval(true);
    } else {
      setShowPendingApproval(false);
    }
  }, [user, needsRoleAssignment, userProfile]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      {children}
      <PendingApproval 
        open={showPendingApproval}
        onClose={() => setShowPendingApproval(false)}
      />
    </>
  );
};

// Public route wrapper (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Default route - Login page */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Properties */}
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/new" element={
              <RoleGuard 
                requiredRoles={['super_admin', 'org_admin', 'property_manager']}
              >
                <CreatePropertyPage />
              </RoleGuard>
            } />
            <Route path="properties/:id" element={<PropertyDetailsPage />} />
            <Route path="properties/:id/spaces" element={<SpaceAssignmentPage />} />
            <Route path="spaces" element={<AllSpacesPage />} />
            <Route path="spaces-by-property" element={<SpacesByPropertyPage />} />
            <Route path="tenants" element={<TenantsPage />} />

            {/* Rent Management */}
            <Route path="rent" element={<RentPage />} />

            {/* Invoices */}
            <Route path="invoices" element={<InvoicesPage />} />

            {/* Payment Tracking */}
            <Route path="payments" element={<PaymentsPage />} />

            {/* Profile */}
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Diagnostic Page */}
            <Route path="diagnostic" element={<DiagnosticPage />} />
            
            {/* Quick Data Check */}
            <Route path="data-check" element={<QuickDataCheck />} />
            
            {/* Firebase Direct Example */}
            <Route path="firebase-example" element={<FirebaseDirectExample />} />
            
                   {/* User Role Assignment - Admins only */}
                   <Route path="users/roles" element={
                     <RoleGuard requiredRoles={['org_admin', 'super_admin']}>
                       <UserRoleAssignmentPage />
                     </RoleGuard>
                   } />
                   
                   {/* Admin Routes - Org Admins and Super Admins only */}
                   <Route path="admin" element={
                     <RoleGuard requiredRoles={['org_admin', 'super_admin']}>
                       <AdminDashboardPage />
                     </RoleGuard>
                   } />
                   <Route path="admin/dashboard" element={
                     <RoleGuard requiredRoles={['org_admin', 'super_admin']}>
                       <AdminDashboardPage />
                     </RoleGuard>
                   } />
                   <Route path="admin/analytics" element={
                     <RoleGuard requiredPermissions={['reports:read:organization']}>
                       <AnalyticsPage />
                     </RoleGuard>
                   } />
                   
                   {/* Super Admin Only Routes */}
                   <Route path="admin/users" element={
                     <RoleGuard requiredRoles={['super_admin']}>
                       <AdminUsersPage />
                     </RoleGuard>
                   } />
                   <Route path="admin/system-settings" element={
                     <RoleGuard requiredRoles={['super_admin']}>
                       <SystemSettingsPage />
                     </RoleGuard>
                   } />
                   <Route path="admin/reports" element={
                     <RoleGuard requiredRoles={['super_admin']}>
                       <SystemReportsPage />
                     </RoleGuard>
                   } />
          </Route>

          {/* Backward compatibility routes */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/properties" element={<Navigate to="/app/properties" replace />} />
          <Route path="/spaces" element={<Navigate to="/app/spaces" replace />} />
          <Route path="/tenants" element={<Navigate to="/app/tenants" replace />} />
          <Route path="/rent" element={<Navigate to="/app/rent" replace />} />
          <Route path="/payments" element={<Navigate to="/app/payments" replace />} />
          <Route path="/profile" element={<Navigate to="/app/profile" replace />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Box>
  );
}

export default App;
