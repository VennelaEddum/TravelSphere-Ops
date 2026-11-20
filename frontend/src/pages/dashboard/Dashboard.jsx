import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { FranchiseOwnerDashboard } from './FranchiseOwnerDashboard';
import { FranchiseManagerDashboard } from './FranchiseManagerDashboard';
import { StaffDashboard } from './StaffDashboard';

export const Dashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case ROLES.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    case ROLES.FRANCHISE_OWNER:
      return <FranchiseOwnerDashboard />;
    case ROLES.BRANCH_MANAGER:
    case 'Branch Manager':
    case 'Franchise Manager':
      return <FranchiseManagerDashboard />;
    case ROLES.STAFF:
    case 'Staff':
      return <StaffDashboard />;
    default:
      return <SuperAdminDashboard />;
  }
};
