import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, DEMO_ACCOUNTS } from '../api/authApi';
import { ROLES, canUserAccessRoute } from '../utils/rolePermissions';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('travelsphere_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('travelsphere_token') || null);
  const [isDemo, setIsDemo] = useState(() => localStorage.getItem('travelsphere_is_demo') === 'true');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // For Super Admin: capability to view as specific branch or 'All Branches'
  const [selectedBranch, setSelectedBranch] = useState(() => {
    return localStorage.getItem('travelsphere_selected_branch') || 'All Branches';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('travelsphere_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('travelsphere_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('travelsphere_token', token);
    } else {
      localStorage.removeItem('travelsphere_token');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('travelsphere_is_demo', isDemo ? 'true' : 'false');
  }, [isDemo]);

  useEffect(() => {
    localStorage.setItem('travelsphere_selected_branch', selectedBranch);
  }, [selectedBranch]);

  // Standard Login
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await loginUser(email, password);
      setUser(result.user);
      setToken(result.token);
      setIsDemo(result.isDemo);
      if (result.user.role === ROLES.SUPER_ADMIN) {
        setSelectedBranch('All Branches');
      } else {
        setSelectedBranch(result.user.branchName || 'Mumbai');
      }
      return result.user;
    } catch (err) {
      const msg = err.message || 'Login failed. Please check credentials.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper (for rapid evaluator role-switching)
  const loginAsDemo = async (roleName) => {
    setLoading(true);
    setAuthError(null);
    try {
      const demoAccount = DEMO_ACCOUNTS[roleName];
      if (!demoAccount) throw new Error(`Demo role ${roleName} not found`);
      
      const demoToken = `demo_jwt_${roleName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
      setUser(demoAccount);
      setToken(demoToken);
      setIsDemo(true);
      if (roleName === ROLES.SUPER_ADMIN) {
        setSelectedBranch('All Branches');
      } else {
        setSelectedBranch(demoAccount.branchName);
      }
      return demoAccount;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsDemo(false);
    setSelectedBranch('All Branches');
    localStorage.removeItem('travelsphere_user');
    localStorage.removeItem('travelsphere_token');
    localStorage.removeItem('travelsphere_is_demo');
    localStorage.removeItem('travelsphere_selected_branch');
  };

  // Permission checkers
  const hasRole = (roleOrRoles) => {
    if (!user) return false;
    if (Array.isArray(roleOrRoles)) {
      return roleOrRoles.includes(user.role);
    }
    return user.role === roleOrRoles;
  };

  const canAccess = (path) => {
    if (!user) return false;
    return canUserAccessRoute(user.role, path);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user && !!token,
        isDemo,
        loading,
        authError,
        selectedBranch,
        setSelectedBranch,
        login,
        loginAsDemo,
        logout,
        hasRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
