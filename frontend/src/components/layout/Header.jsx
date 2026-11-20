import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  Menu,
  Bell,
  MapPin,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Building,
  Check,
  Shield,
  Sparkles
} from 'lucide-react';

const BRANCH_OPTIONS = [
  'All Branches',
  'Mumbai',
  'Pune',
  'Hyderabad',
  'Nagpur',
  'Bengaluru'
];

// Title helper mapping routes to titles
const PAGE_TITLES = {
  '/dashboard': 'Executive Dashboard',
  '/franchise-management': 'Franchise & User Management',
  '/finance-performance': 'Finance & Branch Performance',
  '/booking-resources': 'Booking & Travel Resources',
  '/workforce': 'Workforce & Tasks',
  '/customer-marketing': 'Customer & Marketing',
  '/franchise-intelligence': 'Franchise Intelligence',
  '/ai-assistant': 'TravelSphere AI Assistant',
  '/notifications': 'Alerts & Workflow Notifications',
  '/profile': 'User Profile',
  '/settings': 'System Settings',

  // Legacy mappings for backward compatibility
  '/franchises': 'Franchise Directory',
  '/performance': 'Branch Performance Analytics',
  '/packages': 'Tour Packages & Inventory',
  '/bookings': 'Bookings Management',
  '/customers': 'Customer Management & CRM',
  '/staff': 'Staff & HR Operations',
  '/marketing': 'Marketing & Lead Campaigns',
  '/finance': 'Finance & Franchise Revenue',
  '/partners': 'Travel Partners & Vendors',
  '/feedback': 'Customer Feedback & Reviews',
  '/audit': 'Audit & SOP Compliance',
  '/insights': 'AI Intelligence & Agent Insights',
  '/reports': 'Reports & Analytics Center'
};

export const Header = ({ onOpenMobileMenu, isCollapsed }) => {
  const { user, role, selectedBranch, setSelectedBranch, logout, isDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const branchMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (branchMenuRef.current && !branchMenuRef.current.contains(event.target)) {
        setIsBranchMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentTitle = PAGE_TITLES[location.pathname] || 'TravelSphere Ops';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Left section: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand emblem */}
        <div className="lg:hidden flex items-center">
          <img
            src="/assets/travelsphere-ops-emblem.png"
            alt="TRAVELSPHERE OPS"
            className="w-7 h-7 object-contain"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {currentTitle}
            {location.pathname === '/dashboard' && isDemo && (
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Demo Mode
              </span>
            )}
          </h1>
          <span className="text-xs text-slate-500 hidden sm:block">
            TRAVELSPHERE OPS &bull; Smart Franchise Management & Performance Intelligence
          </span>
        </div>
      </div>

      {/* Right section: Branch Filter (Super Admin) / Branch Badge (Owner/Manager/Staff) & User Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Branch Context Selector for Super Admin */}
        {role === ROLES.SUPER_ADMIN ? (
          <div className="relative" ref={branchMenuRef}>
            <button
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors"
            >
              <Building className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-slate-900">{selectedBranch}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isBranchMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Branch Scope
                  </p>
                  <p className="text-xs text-slate-500">Super Admin perspective</p>
                </div>
                {BRANCH_OPTIONS.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsBranchMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-left hover:bg-slate-50 transition-colors ${
                      selectedBranch === branch ? 'text-teal-600 font-semibold bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{branch}</span>
                    {selectedBranch === branch && (
                      <Check className="w-4 h-4 text-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Branch:</span>
            <span className="font-bold text-slate-900">{user?.branchName || 'Mumbai'}</span>
          </div>
        )}

        {/* Notifications Icon Button */}
        <Link
          to="/notifications"
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </Link>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="User menu"
          >
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</span>
              <span className="text-[10px] text-teal-600 font-semibold">{user?.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    {user?.role}
                  </span>
                  {role !== ROLES.SUPER_ADMIN && user?.branchName && (
                    <span className="text-[10px] font-medium text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-full">
                      {user?.branchName}
                    </span>
                  )}
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Your Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Preferences & Settings</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
