import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  CalendarCheck,
  Users,
  Megaphone,
  Sparkles,
  Bot,
  Bell,
  ChevronLeft,
  X,
  Compass
} from 'lucide-react';

const NAVIGATION_GROUPS = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Franchise & User Management', path: '/franchise-management', icon: Building2 }
    ]
  },
  {
    title: 'OPERATIONAL AGENTS',
    items: [
      { name: 'Finance & Branch Performance', path: '/finance-performance', icon: BarChart3 },
      { name: 'Booking & Travel Resources', path: '/booking-resources', icon: CalendarCheck },
      { name: 'Workforce & Tasks', path: '/workforce', icon: Users },
      { name: 'Customer & Marketing', path: '/customer-marketing', icon: Megaphone }
    ]
  },
  {
    title: 'AI INTELLIGENCE & SYSTEM',
    items: [
      { name: 'Franchise Intelligence', path: '/franchise-intelligence', icon: Sparkles },
      { name: 'TravelSphere AI Assistant', path: '/ai-assistant', icon: Bot },
      { name: 'Notifications', path: '/notifications', icon: Bell }
    ]
  }
];

export const Sidebar = ({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) => {
  const { canAccess, user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0A1628]/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#142B4A] border-r border-[#1E3A5F] text-slate-300 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header with TravelSphere Ops Emblem & Official Logo */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-[#1E3A5F] bg-[#0E1F38] shrink-0">
          {isCollapsed ? (
            /* Collapsed State: Centered Emblem */
            <div className="flex items-center justify-center w-full">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-black/20 ring-1 ring-white/20 hover:scale-105 transition-transform">
                <img
                  src="/assets/travelsphere-ops-emblem.png"
                  alt="TRAVELSPHERE OPS"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ) : (
            /* Expanded State: Official TRAVELSPHERE OPS Logo */
            <div className="flex items-center overflow-hidden">
              <div className="h-10 px-2.5 py-1 rounded-xl bg-white flex items-center justify-center shadow-md shadow-black/20 ring-1 ring-white/30 shrink-0">
                <img
                  src="/assets/travelsphere-ops-logo.png"
                  alt="TRAVELSPHERE OPS"
                  className="h-full w-auto max-w-[175px] object-contain"
                />
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E3A5F] transition-colors ${
              isCollapsed ? 'hidden' : ''
            }`}
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E3A5F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {NAVIGATION_GROUPS.map((group) => {
            // Filter items that current user's role can access
            const accessibleItems = group.items.filter((item) => canAccess(item.path));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {group.title}
                  </h3>
                )}
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      title={isCollapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#0F9D9A]/20 text-white font-semibold border-l-2 border-[#0F9D9A] shadow-inner'
                            : 'text-slate-300 hover:bg-[#1E3A5F]/60 hover:text-white'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 text-[#2DD4BF]" />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer with Role Scope Indicator */}
        <div className="p-3 border-t border-[#1E3A5F] bg-[#0E1F38]/60 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate font-medium text-slate-300">{user?.role || 'Guest'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0F9D9A]/20 text-[#2DD4BF] font-mono font-bold">
                v2.0
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-[#0F9D9A] animate-pulse" title="System Active" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
