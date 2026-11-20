import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Users,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
  Power,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Drawer } from '../../components/common/Drawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_FRANCHISES } from '../../mock/franchiseData';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { fetchAllUsers, toggleUserActive, createStaffAccount } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';

export const FranchiseUserManagement = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'directory';
  const [activeTab, setActiveTab] = useState(initialTab === 'users' ? 'users' : 'directory');

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ==========================================
  // FRANCHISE DIRECTORY STATE
  // ==========================================
  const [franchises, setFranchises] = useState(INITIAL_FRANCHISES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    address: '',
    ownerName: '',
    ownerEmail: '',
    managerName: '',
    phone: '',
    target: 400000
  });

  // ==========================================
  // USER MANAGEMENT STATE
  // ==========================================
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    branchId: 1,
    title: 'Travel Consultant & Booking Specialist',
    password: 'Staff@123'
  });
  const [userActionMsg, setUserActionMsg] = useState(null);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await fetchAllUsers(userRoleFilter);
      setUsersList(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [userRoleFilter]);

  const handleToggleUserStatus = async (targetUser) => {
    try {
      const res = await toggleUserActive(targetUser.id);
      setUserActionMsg({
        type: 'success',
        text: res.message || `User status toggled successfully.`
      });
      setTimeout(() => setUserActionMsg(null), 4000);
      setUsersList(usersList.map(u => u.id === targetUser.id ? { ...u, is_active: u.is_active ? 0 : 1 } : u));
    } catch (err) {
      setUserActionMsg({ type: 'error', text: err.message || 'Failed to update user status.' });
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.fullName || !staffForm.email) return;
    try {
      const res = await createStaffAccount(staffForm);
      setUserActionMsg({ type: 'success', text: res.message || 'Staff account created successfully.' });
      setTimeout(() => setUserActionMsg(null), 4000);
      setIsAddStaffOpen(false);
      setStaffForm({ fullName: '', email: '', phone: '', branchId: 1, title: 'Travel Consultant', password: 'Staff@123' });
      await loadUsers();
    } catch (err) {
      setUserActionMsg({ type: 'error', text: err.message || 'Failed to create staff account.' });
    }
  };

  // Filtered lists
  const filteredFranchises = franchises.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.branch_name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const totalBranches = franchises.length;
  const activeCount = franchises.filter((f) => f.status === 'Active').length;
  const inactiveCount = totalBranches - activeCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Franchise & User Management"
        subtitle="Govern territorial franchise outlets, licensing allocations, branch operations, and employee user accounts across the TravelSphere Ops ecosystem."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Franchise & User Management' }
        ]}
        badge={
          <Badge variant="navy" size="sm" className="bg-teal-500/20 text-teal-700 border-teal-500/30">
            Head Office & Principals
          </Badge>
        }
        actions={
          activeTab === 'directory' ? (
            <Button variant="primary" size="md" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
              Add Franchise Outlet
            </Button>
          ) : (
            <Button variant="primary" size="md" icon={UserPlus} onClick={() => setIsAddStaffOpen(true)}>
              Provision Staff Account
            </Button>
          )
        }
      />

      {/* Global Toast */}
      {userActionMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between border shadow-xs animate-fadeIn ${
          userActionMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span className="text-sm font-medium">{userActionMsg.text}</span>
          <button onClick={() => setUserActionMsg(null)} className="text-slate-400 font-bold ml-3">×</button>
        </div>
      )}

      {/* Consolidated Internal Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => handleTabChange('directory')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'directory'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Franchise Directory</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
            {totalBranches}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
            {usersList.length}
          </span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: FRANCHISE DIRECTORY                                           */}
      {/* ==================================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Total Franchise Branches"
              value={formatNumber(totalBranches)}
              subtext="Covering Tier 1 & 2 cities"
              icon={Building2}
              variant="teal"
            />
            <MetricCard
              title="Active Operational Outlets"
              value={formatNumber(activeCount)}
              subtext="Currently processing bookings"
              icon={CheckCircle2}
              variant="emerald"
            />
            <MetricCard
              title="Suspended / Inactive Outlets"
              value={formatNumber(inactiveCount)}
              subtext="Under compliance review"
              icon={XCircle}
              variant="rose"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search branch name, code, city, or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Outlets</option>
                  <option value="Inactive">Inactive Outlets</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Branch Code</th>
                    <th className="py-3 px-4 font-semibold">Franchise Name</th>
                    <th className="py-3 px-4 font-semibold">City / State</th>
                    <th className="py-3 px-4 font-semibold">Franchise Owner</th>
                    <th className="py-3 px-4 font-semibold">Operations Manager</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredFranchises.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{f.code}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{f.name}</div>
                        <div className="text-[11px] text-slate-400">{f.address}</div>
                      </td>
                      <td className="py-3.5 px-4">{f.city}, {f.state}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-medium">{f.ownerName}</div>
                        <div className="text-[11px] text-slate-400">{f.ownerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">{f.managerName}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={f.status === 'Active' ? 'success' : 'danger'} size="sm">
                          {f.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => { setSelectedFranchise(f); setIsDrawerOpen(true); }}
                          className="p-1.5 text-slate-500 hover:text-teal-600 rounded-lg hover:bg-teal-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: USER MANAGEMENT                                               */}
      {/* ==================================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Super Admins"
              value={formatNumber(usersList.filter(u => u.role === ROLES.SUPER_ADMIN).length)}
              subtext="Head Office executive"
              icon={ShieldCheck}
              variant="teal"
            />
            <MetricCard
              title="Franchise Owners"
              value={formatNumber(usersList.filter(u => u.role === ROLES.FRANCHISE_OWNER).length)}
              subtext="Territorial principals"
              icon={Building2}
              variant="primary"
            />
            <MetricCard
              title="Branch Managers"
              value={formatNumber(usersList.filter(u => u.role === ROLES.BRANCH_MANAGER || u.role === 'Franchise Manager').length)}
              subtext="Branch operations leads"
              icon={UserCheck}
              variant="emerald"
            />
            <MetricCard
              title="Staff Specialists"
              value={formatNumber(usersList.filter(u => u.role === ROLES.STAFF || u.role === 'Staff').length)}
              subtext="Frontline consultants"
              icon={Users}
              variant="amber"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name, email, role, or branch..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700"
                >
                  <option value="ALL">All Roles</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Franchise Owner">Franchise Owner</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Staff">Staff</option>
                </select>
                <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadUsers} disabled={usersLoading} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">User Details</th>
                    <th className="py-3 px-4 font-semibold">Assigned Role</th>
                    <th className="py-3 px-4 font-semibold">Job Title</th>
                    <th className="py-3 px-4 font-semibold">Branch Assignment</th>
                    <th className="py-3 px-4 font-semibold">Account Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            u.role === 'Super Admin'
                              ? 'teal'
                              : u.role === 'Franchise Owner'
                              ? 'primary'
                              : u.role === 'Branch Manager'
                              ? 'success'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{u.title || 'Franchise Team Member'}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{u.branch_name || 'Global Network'}</div>
                        {u.franchise_name && (
                          <div className="text-[10px] text-slate-400">{u.franchise_name}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          title={u.is_active ? 'Deactivate User' : 'Activate User'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.is_active ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Provision Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Provision Staff Account"
        subtitle="Create an authorized Staff login under branch supervision."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleCreateStaff}>Create Staff Account</Button>
          </div>
        }
      >
        <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={staffForm.fullName}
              onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              placeholder="rahul.sharma@travelsphere.ops"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={staffForm.phone}
              onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
              placeholder="+91 98200 44556"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
              <select
                value={staffForm.branchId}
                onChange={(e) => setStaffForm({ ...staffForm, branchId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value={1}>Mumbai Hub</option>
                <option value={2}>Pune Gateway</option>
                <option value={3}>Hyderabad Center</option>
                <option value={4}>Nagpur Regional</option>
                <option value={5}>Bengaluru Tech City</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
              <input
                type="text"
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Outlet Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedFranchise?.name}
        subtitle={`${selectedFranchise?.city}, ${selectedFranchise?.state} • ${selectedFranchise?.code}`}
      >
        {selectedFranchise && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Operational Status</span>
                <span className="text-sm font-bold text-slate-900">{selectedFranchise.status}</span>
              </div>
              <Badge variant={selectedFranchise.status === 'Active' ? 'success' : 'danger'} size="md">
                {selectedFranchise.status}
              </Badge>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Franchise Owner:</span>
                <span className="font-semibold text-slate-800">{selectedFranchise.ownerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Owner Email:</span>
                <span className="text-slate-700">{selectedFranchise.ownerEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Operations Manager:</span>
                <span className="font-semibold text-slate-800">{selectedFranchise.managerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Telephone:</span>
                <span className="text-slate-700">{selectedFranchise.phone}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
