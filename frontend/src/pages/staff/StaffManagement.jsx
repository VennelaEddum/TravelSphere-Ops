import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  Briefcase,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  Users,
  Edit,
  Eye,
  Mail,
  Phone,
  Building,
  UserCheck
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Drawer } from '../../components/common/Drawer';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_STAFF } from '../../mock/staffData';
import { formatNumber } from '../../utils/formatters';

export const StaffManagement = () => {
  const { user, role, selectedBranch } = useAuth();

  const branchScope = (role === ROLES.FRANCHISE_OWNER || role === ROLES.FRANCHISE_MANAGER)
    ? (user?.branchName || 'Mumbai')
    : selectedBranch;

  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: 'Travel Consultant',
    department: 'Sales & Bookings',
    branch: branchScope === 'All Branches' ? 'Mumbai' : branchScope,
    email: '',
    phone: '',
    shift: 'General (09:30 AM - 06:30 PM)',
    attendance: 'Present'
  });

  const branchScopedStaff = branchScope === 'All Branches'
    ? staffList
    : staffList.filter((s) => s.branch === branchScope);

  const filteredStaff = branchScopedStaff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const totalCount = branchScopedStaff.length;
  const presentCount = branchScopedStaff.filter((s) => s.attendance === 'Present' || s.attendance === 'On Tour').length;
  const onLeaveCount = branchScopedStaff.filter((s) => s.attendance === 'On Leave').length;
  const attendanceRate = ((presentCount / (totalCount || 1)) * 100).toFixed(1);

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      role: 'Senior Travel Consultant',
      department: 'Sales & Bookings',
      branch: branchScope === 'All Branches' ? 'Mumbai' : branchScope,
      email: '',
      phone: '',
      shift: 'General (09:30 AM - 06:30 PM)',
      attendance: 'Present'
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newMember = {
      id: Date.now(),
      name: formData.name,
      code: `EMP-${formData.branch.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      branch: formData.branch,
      role: formData.role,
      department: formData.department,
      email: formData.email || 'employee@travelsphere.demo',
      phone: formData.phone || '+91 99000 00000',
      attendance: formData.attendance,
      shift: formData.shift,
      monthlyBookings: 0,
      productivityScore: 90,
      joinDate: 'Today'
    };

    setStaffList([newMember, ...staffList]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (s) => {
    setSelectedStaff(s);
    setFormData({ ...s });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setStaffList(
      staffList.map((s) => (s.id === selectedStaff.id ? { ...s, ...formData } : s))
    );
    setIsEditOpen(false);
  };

  const handleOpenView = (s) => {
    setSelectedStaff(s);
    setIsDrawerOpen(true);
  };

  const toggleAttendanceStatus = (staffId) => {
    setStaffList(
      staffList.map((s) => {
        if (s.id === staffId) {
          const next = s.attendance === 'Present' ? 'On Leave' : 'Present';
          return { ...s, attendance: next };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & HR Operations (Staff Agent)"
        subtitle="Manage employee rosters, biometric attendance rates, duty shift schedules, and booking productivity indices."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Staff & HR Management' }
        ]}
        badge={
          branchScope !== 'All Branches' && (
            <Badge variant="primary" size="sm">
              Scope: {branchScope}
            </Badge>
          )
        }
        actions={
          <Button variant="primary" size="md" icon={UserPlus} onClick={handleOpenAdd}>
            Add Staff Member
          </Button>
        }
      />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Branch Workforce"
          value={formatNumber(totalCount)}
          subtext="Consultants & tour guides"
          icon={Users}
          variant="teal"
        />

        <MetricCard
          title="Present On Duty Today"
          value={`${formatNumber(presentCount)} Active`}
          subtext="Desk & field tours"
          icon={CheckCircle2}
          variant="emerald"
        />

        <MetricCard
          title="On Scheduled Leave"
          value={`${formatNumber(onLeaveCount)} Members`}
          subtext="Approved leave requests"
          icon={Clock}
          variant="amber"
        />

        <MetricCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          subtext="Current shift adherence"
          icon={Award}
          variant="navy"
          trend="Target: >85%"
          trendType={Number(attendanceRate) >= 85 ? 'up' : 'down'}
        />
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff name, code, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Departments</option>
              <option value="Operations">Operations</option>
              <option value="Sales & Bookings">Sales & Bookings</option>
              <option value="Tour Operations">Tour Operations</option>
              <option value="Support & Grievances">Support & Grievances</option>
              <option value="Documentation">Documentation</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredStaff.length === 0 ? (
          <EmptyState
            title="No staff members found"
            description="Adjust your search filters or add a new team member."
            onReset={() => {
              setSearchQuery('');
              setDeptFilter('All');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Staff Member</th>
                  <th className="py-3 px-4 font-semibold">Department & Role</th>
                  <th className="py-3 px-4 font-semibold">Branch</th>
                  <th className="py-3 px-4 font-semibold">Shift Timing</th>
                  <th className="py-3 px-4 font-semibold">Attendance</th>
                  <th className="py-3 px-4 font-semibold">Productivity</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{s.name}</span>
                      <span className="text-[10px] text-slate-400">{s.code} &bull; {s.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{s.role}</span>
                      <span className="text-[11px] text-slate-500">{s.department}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{s.branch}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.shift}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleAttendanceStatus(s.id)}
                        className="cursor-pointer"
                        title="Click to toggle attendance"
                      >
                        <Badge
                          variant={s.attendance === 'Present' ? 'success' : s.attendance === 'On Tour' ? 'primary' : 'warning'}
                          size="sm"
                          dot
                        >
                          {s.attendance}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        {s.productivityScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(s)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Team Member"
        subtitle="Provision an employee or tour coordinator profile into TravelSphere Ops."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Save Team Member
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Anand Kadam"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Sales & Bookings">Sales & Bookings</option>
                <option value="Operations">Operations</option>
                <option value="Tour Operations">Tour Operations</option>
                <option value="Support & Grievances">Support & Grievances</option>
                <option value="Documentation">Documentation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Branch</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 99000 00000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${selectedStaff?.name}`}
        subtitle="Update employee role, contact info or shift assignment."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Update Member
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift</label>
              <input
                type="text"
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Staff Profile Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedStaff?.name}
        subtitle={`${selectedStaff?.role} &bull; ${selectedStaff?.branch} Outlet`}
      >
        {selectedStaff && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Productivity Index</span>
                <span className="text-xl font-bold text-slate-900">{selectedStaff.productivityScore}%</span>
              </div>
              <Badge variant={selectedStaff.attendance === 'Present' ? 'success' : 'warning'} size="md">
                {selectedStaff.attendance}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Staff Credentials</h4>
              <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedStaff.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">{selectedStaff.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Branch:</span>
                  <span className="text-slate-800">{selectedStaff.branch} Outlet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-700">{selectedStaff.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-700">{selectedStaff.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Shift:</span>
                  <span className="text-teal-700 font-medium">{selectedStaff.shift}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Bookings Processed:</span>
                  <span className="font-bold text-slate-900">{selectedStaff.monthlyBookings} Bookings</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
