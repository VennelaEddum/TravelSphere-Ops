import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Building2,
  Clock,
  Filter,
  Search,
  CheckCheck,
  Trash2,
  ArrowRight,
  Eye,
  ShieldAlert,
  Zap,
  MailCheck
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Drawer } from '../../components/common/Drawer';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_NOTIFICATIONS } from '../../mock/notificationsData';

export const Notifications = () => {
  const { user, role, selectedBranch } = useAuth();
  const navigate = useNavigate();

  const userBranch = (role === ROLES.FRANCHISE_OWNER || role === ROLES.FRANCHISE_MANAGER)
    ? (user?.branchName || 'Mumbai')
    : selectedBranch;

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Details drawer state
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Scoping notifications by branch (or show all if branch is 'All Branches')
  const branchScopedNotifications = userBranch === 'All Branches'
    ? notifications
    : notifications.filter((n) => !n.branch || n.branch === userBranch || n.category === 'System');

  const filteredNotifications = branchScopedNotifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.branch && n.branch.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === 'All' || n.category === activeCategory;
    const matchesPriority = priorityFilter === 'All' || n.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const unreadCount = branchScopedNotifications.filter((n) => !n.isRead).length;
  const criticalCount = branchScopedNotifications.filter((n) => n.priority === 'Critical').length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: !n.isRead } : n
      )
    );
  };

  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
  };

  const handleOpenDrawer = (n) => {
    setSelectedNotification(n);
    setIsDrawerOpen(true);
    // Auto mark as read on inspect
    if (!n.isRead) {
      handleToggleRead(n.id);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Critical':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'Warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'Info':
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const categories = ['All', 'Branch Performance', 'Inventory', 'System', 'Bookings', 'Staff', 'Finance'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Operational Notifications"
        subtitle="Unified operational inbox tracking multi-agent alerts, high-cancellation warnings, inventory thresholds, and financial settlements."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Notifications' }
        ]}
        badge={
          userBranch !== 'All Branches' && (
            <Badge variant="primary" size="sm">
              Scope: {userBranch}
            </Badge>
          )
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="md"
              icon={CheckCheck}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={Trash2}
              onClick={handleClearRead}
              className="text-slate-600 hover:text-rose-600"
            >
              Clear Read Alerts
            </Button>
          </div>
        }
      />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Operational Alerts"
          value={branchScopedNotifications.length}
          subtext="Active in your scope"
          icon={Bell}
          variant="teal"
        />

        <MetricCard
          title="Unread Alerts"
          value={unreadCount}
          subtext={unreadCount > 0 ? "Requires attention" : "All caught up"}
          icon={MailCheck}
          variant={unreadCount > 0 ? "amber" : "emerald"}
        />

        <MetricCard
          title="Critical Flags"
          value={criticalCount}
          subtext="High cancellation / deficit alerts"
          icon={AlertOctagon}
          variant="rose"
        />

        <MetricCard
          title="Resolved Today"
          value="4 Actions"
          subtext="Automated workflow resolutions"
          icon={CheckCircle2}
          variant="navy"
        />
      </div>

      {/* Category Pills & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
          {categories.map((cat) => {
            const count = cat === 'All'
              ? branchScopedNotifications.length
              : branchScopedNotifications.filter((n) => n.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Priority Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            title="No notifications found"
            description="You are all caught up with your operational alerts."
            onReset={() => {
              setActiveCategory('All');
              setPriorityFilter('All');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !n.isRead ? 'bg-teal-50/25 hover:bg-teal-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3.5 max-w-3xl">
                  {/* Indicator & Icon */}
                  <div className="flex items-center gap-2 mt-0.5 shrink-0">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        !n.isRead ? 'bg-teal-600' : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`p-2 rounded-xl border ${
                        n.priority === 'Critical'
                          ? 'bg-rose-50 border-rose-200'
                          : n.priority === 'Warning'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      {getPriorityIcon(n.priority)}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`text-sm ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {n.title}
                      </h4>
                      <Badge
                        variant={
                          n.priority === 'Critical'
                            ? 'danger'
                            : n.priority === 'Warning'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {n.priority}
                      </Badge>
                      {n.branch && (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {n.branch}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {n.timestamp}
                      </span>
                      <span>&bull;</span>
                      <span className="text-teal-700 font-medium">{n.category}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {n.actionRoute && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowRight}
                      onClick={() => navigate(n.actionRoute)}
                      className="text-xs"
                    >
                      Take Action
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleOpenDrawer(n)}
                    className="text-xs text-teal-600 hover:text-teal-700"
                  >
                    Inspect
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleToggleRead(n.id)}
                    title={n.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    className="text-xs text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {n.isRead ? 'Unread' : 'Read'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Alert Details & Context"
        subtitle={selectedNotification?.title}
        footer={
          <div className="flex justify-between items-center w-full">
            <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Close
            </Button>
            {selectedNotification?.actionRoute && (
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate(selectedNotification.actionRoute);
                }}
              >
                Go to Module
              </Button>
            )}
          </div>
        }
      >
        {selectedNotification && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Priority</span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant={
                      selectedNotification.priority === 'Critical'
                        ? 'danger'
                        : selectedNotification.priority === 'Warning'
                        ? 'warning'
                        : 'default'
                    }
                    size="md"
                  >
                    {selectedNotification.priority}
                  </Badge>
                  <span className="text-xs text-slate-500">{selectedNotification.category}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Received</span>
                <span className="text-xs font-bold text-slate-800">{selectedNotification.timestamp}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Alert Message</h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 leading-relaxed text-xs sm:text-sm">
                {selectedNotification.message}
              </div>
            </div>

            {selectedNotification.branch && (
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Associated Franchise Outlet: <strong>{selectedNotification.branch}</strong></span>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recommended Resolution</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clicking "Go to Module" will navigate to the associated operational interface (<code>{selectedNotification.actionRoute}</code>) where you can review live data, trigger reallocations, or file corrective reports.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
