/**
 * TRAVELSPHERE OPS - Role definitions and route capability mappings
 * Four distinct enterprise roles:
 * 1. SUPER_ADMIN - Head Office Administrator (Full network access)
 * 2. FRANCHISE_OWNER - Franchise Partner & Principal (Franchise-level access)
 * 3. BRANCH_MANAGER - Branch Operations Manager (Assigned branch only)
 * 4. STAFF - Travel Consultant & Specialist (Personal assignments only)
 */

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  FRANCHISE_OWNER: 'Franchise Owner',
  BRANCH_MANAGER: 'Branch Manager',
  STAFF: 'Staff',
  // Backward compatibility alias for existing code
  FRANCHISE_MANAGER: 'Branch Manager',
};

export const ROUTE_PERMISSIONS = {
  // 1. Overview
  '/dashboard': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/franchise-management': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],

  // 2. Operational Agents
  '/finance-performance': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],
  '/booking-resources': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/workforce': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/customer-marketing': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],

  // 3. AI Intelligence & System
  '/franchise-intelligence': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],
  '/ai-assistant': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/notifications': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],

  // Account & Profile
  '/profile': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/settings': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],

  // Legacy Route Redirects (for backward compatibility)
  '/franchises': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],
  '/performance': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],
  '/packages': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/bookings': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/customers': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/staff': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/marketing': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],
  '/finance': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],
  '/partners': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER],
  '/feedback': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER, ROLES.BRANCH_MANAGER, ROLES.STAFF],
  '/audit': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],
  '/insights': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],
  '/reports': [ROLES.SUPER_ADMIN, ROLES.FRANCHISE_OWNER],
};

export const canUserAccessRoute = (role, path) => {
  if (!path) return true;
  // Normalize role if alias passed
  const normalizedRole = role === 'Franchise Manager' ? ROLES.BRANCH_MANAGER : role;
  const normalizedPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  const allowedRoles = ROUTE_PERMISSIONS[normalizedPath];
  if (!allowedRoles) return true;
  return allowedRoles.includes(normalizedRole);
};
