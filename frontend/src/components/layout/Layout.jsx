import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          isCollapsed={isCollapsed}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img src="/assets/travelsphere-ops-logo.png" alt="TRAVELSPHERE OPS" className="h-5 w-auto object-contain" />
              <span>&copy; {new Date().getFullYear()} TRAVELSPHERE OPS. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span>Manage Every Journey. Empower Every Franchise.</span>
              <span>&bull;</span>
              <span className="font-semibold text-[#0F9D9A]">Enterprise v2.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
