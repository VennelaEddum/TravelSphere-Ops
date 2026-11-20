import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../components/layout/Layout';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Unauthorized } from '../pages/system/Unauthorized';
import { UserProfile } from '../pages/system/UserProfile';
import { Settings } from '../pages/system/Settings';
import { ROLES } from '../utils/rolePermissions';

// Consolidated Pages
import { FranchiseUserManagement } from '../pages/consolidated/FranchiseUserManagement';
import { FinanceBranchPerformance } from '../pages/consolidated/FinanceBranchPerformance';
import { BookingTravelResources } from '../pages/consolidated/BookingTravelResources';
import { WorkforceTasks } from '../pages/consolidated/WorkforceTasks';
import { CustomerMarketing } from '../pages/consolidated/CustomerMarketing';
import { FranchiseIntelligence } from '../pages/consolidated/FranchiseIntelligence';
import { AIAssistant } from '../pages/assistant/AIAssistant';
import { Notifications } from '../pages/notifications/Notifications';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication & Error Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated Application Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 1. Overview */}
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route
          path="franchise-management"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER]}>
              <FranchiseUserManagement />
            </ProtectedRoute>
          }
        />

        {/* 2. Operational Agents */}
        <Route
          path="finance-performance"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER]}>
              <FinanceBranchPerformance />
            </ProtectedRoute>
          }
        />

        <Route
          path="booking-resources"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF]}>
              <BookingTravelResources />
            </ProtectedRoute>
          }
        />

        <Route
          path="workforce"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF]}>
              <WorkforceTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="customer-marketing"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF]}>
              <CustomerMarketing />
            </ProtectedRoute>
          }
        />

        {/* 3. AI Intelligence & System */}
        <Route
          path="franchise-intelligence"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER]}>
              <FranchiseIntelligence />
            </ProtectedRoute>
          }
        />

        <Route
          path="ai-assistant"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF]}>
              <AIAssistant />
            </ProtectedRoute>
          }
        />

        <Route
          path="notifications"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF]}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Account & Profile */}
        <Route path="profile" element={<UserProfile />} />
        <Route path="settings" element={<Settings />} />

        {/* Backward Compatibility Redirects for Legacy URLs */}
        <Route path="franchises" element={<Navigate to="/franchise-management?tab=directory" replace />} />
        <Route path="performance" element={<Navigate to="/finance-performance?tab=performance" replace />} />
        <Route path="packages" element={<Navigate to="/booking-resources?tab=packages" replace />} />
        <Route path="bookings" element={<Navigate to="/booking-resources?tab=bookings" replace />} />
        <Route path="customers" element={<Navigate to="/customer-marketing?tab=customers" replace />} />
        <Route path="staff" element={<Navigate to="/workforce?tab=directory" replace />} />
        <Route path="marketing" element={<Navigate to="/customer-marketing?tab=marketing" replace />} />
        <Route path="finance" element={<Navigate to="/finance-performance?tab=finance" replace />} />
        <Route path="partners" element={<Navigate to="/booking-resources?tab=partners" replace />} />
        <Route path="feedback" element={<Navigate to="/customer-marketing?tab=feedback" replace />} />
        <Route path="audit" element={<Navigate to="/franchise-intelligence?tab=audit" replace />} />
        <Route path="insights" element={<Navigate to="/franchise-intelligence?tab=insights" replace />} />
        <Route path="reports" element={<Navigate to="/finance-performance?tab=reports" replace />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
