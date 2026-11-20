import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit,
  Eye,
  Power,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  TrendingUp,
  Download,
  Clock,
  UserCheck,
  UserX,
  FileCheck,
  RefreshCw,
  AlertTriangle,
  FileText,
  Key,
  Briefcase,
  Check,
  X
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
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
import {
  fetchRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest
} from '../../api/authApi';

export const FranchiseManagement = () => {
  // Tabs: 'outlets' | 'registrations'
  const [activeTab, setActiveTab] = useState('outlets');

  // Franchise Outlets state
  const [franchises, setFranchises] = useState(INITIAL_FRANCHISES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal / Drawer states for outlets
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);

  // Form state for outlets
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
  // REGISTRATION & APPROVAL WORKFLOW STATE
  // ==========================================
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regSearch, setRegSearch] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('ALL');
  const [regRoleFilter, setRegRoleFilter] = useState('ALL');
  const [regSummary, setRegSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Inspection & Approval Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [targetRequest, setTargetRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Application does not meet franchise territory qualification requirements.');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load registration requests from backend
  const loadRegistrations = async () => {
    setRegLoading(true);
    try {
      const data = await fetchRegistrationRequests('ALL');
      if (data && data.requests) {
        setRegistrationRequests(data.requests);
        if (data.summary) {
          setRegSummary(data.summary);
        } else {
          const pending = data.requests.filter(r => r.status === 'PENDING').length;
          const approved = data.requests.filter(r => r.status === 'APPROVED').length;
          const rejected = data.requests.filter(r => r.status === 'REJECTED').length;
          setRegSummary({ total: data.requests.length, pending, approved, rejected });
        }
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setRegLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  // Handle Approve
  const handleTriggerApprove = (req) => {
    setTargetRequest(req);
    setIsApproveConfirmOpen(true);
  };

  const confirmApprove = async () => {
    if (!targetRequest) return;
    setActionLoading(true);
    try {
      const res = await approveRegistrationRequest(targetRequest.reference_id, 'Head Office Administrator');
      showNotification('success', res.message || `Registration ${targetRequest.reference_id} approved. User account is now active.`);
      setIsApproveConfirmOpen(false);
      setIsDetailsDrawerOpen(false);
      setTargetRequest(null);
      await loadRegistrations();
    } catch (err) {
      showNotification('error', err.message || 'Failed to approve registration.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject
  const handleTriggerReject = (req) => {
    setTargetRequest(req);
    setRejectionReason('Application territory does not meet current expansion criteria.');
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!targetRequest) return;
    setActionLoading(true);
    try {
      const res = await rejectRegistrationRequest(targetRequest.reference_id, rejectionReason, 'Head Office Administrator');
      showNotification('success', res.message || `Registration ${targetRequest.reference_id} has been rejected.`);
      setIsRejectModalOpen(false);
      setIsDetailsDrawerOpen(false);
      setTargetRequest(null);
      await loadRegistrations();
    } catch (err) {
      showNotification('error', err.message || 'Failed to reject registration.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered registrations list
  const filteredRegistrations = registrationRequests.filter((r) => {
    const q = regSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.reference_id?.toLowerCase().includes(q) ||
      r.branch_name?.toLowerCase().includes(q) ||
      r.org_name?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q);

    const matchesStatus = regStatusFilter === 'ALL' || r.status?.toUpperCase() === regStatusFilter.toUpperCase();
    const matchesRole = regRoleFilter === 'ALL' || r.account_type === regRoleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Outlets filter
  const filteredFranchises = franchises.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBranches = franchises.length;
  const activeCount = franchises.filter((f) => f.status === 'Active').length;
  const inactiveCount = totalBranches - activeCount;

  // Handlers for outlets
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: `TS-${Date.now().toString().slice(-4)}`,
      city: '',
      state: '',
      address: '',
      ownerName: '',
      ownerEmail: '',
      managerName: '',
      phone: '',
      target: 400000
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city) return;

    const newBranch = {
      id: Date.now(),
      code: formData.code,
      name: formData.name,
      city: formData.city,
      state: formData.state || 'Maharashtra',
      address: formData.address || 'Commercial Hub',
      ownerName: formData.ownerName || 'Designated Owner',
      ownerEmail: formData.ownerEmail || 'partner@travelsphere.ops',
      managerName: formData.managerName || 'Operations Lead',
      phone: formData.phone || '+91 98200 00000',
      status: 'Active',
      openingDate: new Date().toISOString().split('T')[0],
      licenseExpiry: '2028-12-31',
      totalRevenue: 0,
      target: Number(formData.target) || 400000,
      bookings: 0,
      rating: 4.5
    };

    setFranchises([newBranch, ...franchises]);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (franchise) => {
    setSelectedFranchise(franchise);
    setFormData({
      name: franchise.name,
      code: franchise.code,
      city: franchise.city,
      state: franchise.state,
      address: franchise.address,
      ownerName: franchise.ownerName,
      ownerEmail: franchise.ownerEmail,
      managerName: franchise.managerName,
      phone: franchise.phone,
      target: franchise.target
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedFranchise) return;

    setFranchises(
      franchises.map((f) =>
        f.id === selectedFranchise.id
          ? {
              ...f,
              name: formData.name,
              city: formData.city,
              state: formData.state,
              address: formData.address,
              ownerName: formData.ownerName,
              ownerEmail: formData.ownerEmail,
              managerName: formData.managerName,
              phone: formData.phone,
              target: Number(formData.target)
            }
          : f
      )
    );
    setIsEditModalOpen(false);
  };

  const handleViewDrawer = (franchise) => {
    setSelectedFranchise(franchise);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = (franchise) => {
    setActionTarget(franchise);
    setIsConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (!actionTarget) return;
    setFranchises(
      franchises.map((f) =>
        f.id === actionTarget.id
          ? { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' }
          : f
      )
    );
    setIsConfirmOpen(false);
    setActionTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Franchise Management & Authorizations"
        subtitle="Manage territorial franchise branches, licensing agreements, owner allocations, and evaluate new franchise registration requests."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Franchise Management' }
        ]}
        badge={
          <Badge variant="navy" size="sm" className="bg-teal-500/20 text-teal-700 border-teal-500/30">
            Head Office Only
          </Badge>
        }
        actions={
          activeTab === 'outlets' ? (
            <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
              Add Franchise Outlet
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              icon={RefreshCw}
              onClick={loadRegistrations}
              disabled={regLoading}
              className={regLoading ? 'animate-spin' : ''}
            >
              Refresh Requests
            </Button>
          )
        }
      />

      {/* Global Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('outlets')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'outlets'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Franchise Outlets Directory</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
            {totalBranches}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'registrations'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Registration & Approval Requests</span>
          {regSummary.pending > 0 && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold animate-pulse">
              {regSummary.pending} Pending
            </span>
          )}
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: FRANCHISE OUTLETS DIRECTORY                                   */}
      {/* ==================================================================== */}
      {activeTab === 'outlets' && (
        <div className="space-y-6">
          {/* Top 3 KPI Cards */}
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

          {/* Directory Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by branch name, code, city, or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Outlets</option>
                  <option value="Inactive">Inactive Outlets</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {filteredFranchises.length === 0 ? (
              <EmptyState
                title="No franchises match your criteria"
                description="Try modifying your search query or switching the status filter."
                onReset={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Branch Code</th>
                      <th className="py-3 px-4 font-semibold">Franchise Name</th>
                      <th className="py-3 px-4 font-semibold">City / State</th>
                      <th className="py-3 px-4 font-semibold">Franchise Owner</th>
                      <th className="py-3 px-4 font-semibold">Operations Manager</th>
                      <th className="py-3 px-4 font-semibold">Opening Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredFranchises.map((franchise) => (
                      <tr key={franchise.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          {franchise.code}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{franchise.name}</span>
                            <span className="text-[11px] text-slate-400">{franchise.address}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{franchise.city}, {franchise.state}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-slate-900">{franchise.ownerName}</span>
                            <span className="text-[11px] text-slate-400">{franchise.ownerEmail}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {franchise.managerName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{franchise.openingDate}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={franchise.status === 'Active' ? 'success' : 'danger'} size="sm">
                            {franchise.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewDrawer(franchise)}
                              title="View Details"
                              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(franchise)}
                              title="Edit Branch"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(franchise)}
                              title={franchise.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                franchise.status === 'Active'
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              <Power className="w-4 h-4" />
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
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: REGISTRATION & APPROVAL WORKFLOW                              */}
      {/* ==================================================================== */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards for Registration Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Pending Authorizations"
              value={formatNumber(regSummary.pending)}
              subtext="Awaiting Super Admin review"
              icon={Clock}
              variant="amber"
            />

            <MetricCard
              title="Total Applications"
              value={formatNumber(regSummary.total)}
              subtext="Submitted across network"
              icon={FileText}
              variant="teal"
            />

            <MetricCard
              title="Approved Franchisees"
              value={formatNumber(regSummary.approved)}
              subtext="Active accounts authorized"
              icon={CheckCircle2}
              variant="emerald"
            />

            <MetricCard
              title="Rejected Applications"
              value={formatNumber(regSummary.rejected)}
              subtext="Ineligible or declined"
              icon={XCircle}
              variant="rose"
            />
          </div>

          {/* Registration Requests Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Table Filter Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search applicant name, email, ref ID, branch..."
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={regStatusFilter}
                    onChange={(e) => setRegStatusFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved & Active</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <select
                    value={regRoleFilter}
                    onChange={(e) => setRegRoleFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="Franchise Owner">Franchise Owner</option>
                    <option value="Franchise Manager">Franchise Manager</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Registration Table */}
            {regLoading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                <span className="text-sm font-medium">Fetching registration queue from database...</span>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <EmptyState
                title="No registration requests found"
                description="No submitted applications match the selected search and filter criteria."
                onReset={() => {
                  setRegSearch('');
                  setRegStatusFilter('ALL');
                  setRegRoleFilter('ALL');
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Reference ID</th>
                      <th className="py-3 px-4 font-semibold">Applicant Details</th>
                      <th className="py-3 px-4 font-semibold">Applied Role & License</th>
                      <th className="py-3 px-4 font-semibold">Branch & Territory</th>
                      <th className="py-3 px-4 font-semibold">Submission Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredRegistrations.map((req) => (
                      <tr key={req.id || req.reference_id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Reference ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-800 border border-slate-200">
                            {req.reference_id}
                          </span>
                        </td>

                        {/* Applicant */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{req.full_name}</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {req.email}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {req.phone}
                            </span>
                          </div>
                        </td>

                        {/* Applied Role */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant={req.account_type === 'Franchise Owner' ? 'teal' : 'primary'}
                              size="sm"
                              className="w-fit"
                            >
                              {req.account_type}
                            </Badge>
                            <span className="text-[11px] text-slate-500">
                              {req.license_type || 'Standard Unit Franchise'}
                            </span>
                          </div>
                        </td>

                        {/* Branch / Territory */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{req.branch_name}</span>
                            {req.org_name && (
                              <span className="text-[11px] text-slate-500">{req.org_name}</span>
                            )}
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {req.location}
                            </span>
                            {req.auth_code && (
                              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 w-fit mt-0.5">
                                Auth: {req.auth_code}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Submission Date */}
                        <td className="py-3.5 px-4 text-slate-500">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{req.submitted_at?.substring(0, 10)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{req.submitted_at?.substring(11, 16)} UTC</span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {req.status === 'PENDING' && (
                            <Badge variant="amber" size="sm" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Review
                            </Badge>
                          )}
                          {req.status === 'APPROVED' && (
                            <Badge variant="success" size="sm" className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved & Active
                            </Badge>
                          )}
                          {req.status === 'REJECTED' && (
                            <Badge variant="danger" size="sm" className="flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Rejected
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Drawer */}
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setIsDetailsDrawerOpen(true);
                              }}
                              title="Inspect Application Details"
                              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Pending State Actions: Approve & Reject */}
                            {req.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleTriggerApprove(req)}
                                  title="Approve Franchise Registration"
                                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-1 shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleTriggerReject(req)}
                                  title="Reject Application"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {req.status === 'APPROVED' && (
                              <span className="text-[11px] text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-50 rounded">
                                Activated
                              </span>
                            )}
                            {req.status === 'REJECTED' && (
                              <span className="text-[11px] text-rose-700 font-medium px-2 py-0.5 bg-rose-50 rounded">
                                Declined
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DETAILS DRAWER FOR REGISTRATION APPLICATION                          */}
      {/* ==================================================================== */}
      <Drawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={selectedRequest ? `Application ${selectedRequest.reference_id}` : 'Registration Details'}
        subtitle={selectedRequest ? `${selectedRequest.full_name} • ${selectedRequest.account_type}` : ''}
      >
        {selectedRequest && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Status card */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              selectedRequest.status === 'PENDING'
                ? 'bg-amber-50/70 border-amber-200'
                : selectedRequest.status === 'APPROVED'
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-rose-50/70 border-rose-200'
            }`}>
              <div>
                <span className="text-xs text-slate-500 block">Registration Status</span>
                <span className="text-base font-bold text-slate-900">
                  {selectedRequest.status === 'PENDING'
                    ? 'Pending Head Office Review'
                    : selectedRequest.status === 'APPROVED'
                    ? 'Approved & User Activated'
                    : 'Rejected Application'}
                </span>
              </div>
              <Badge
                variant={
                  selectedRequest.status === 'PENDING'
                    ? 'amber'
                    : selectedRequest.status === 'APPROVED'
                    ? 'success'
                    : 'danger'
                }
                size="md"
              >
                {selectedRequest.status}
              </Badge>
            </div>

            {/* Applicant Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                Applicant & Contact Details
              </h4>
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Full Legal Name:</span>
                  <span className="font-semibold text-slate-900">{selectedRequest.full_name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Email Address:</span>
                  <span className="font-mono text-slate-800">{selectedRequest.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Mobile Phone:</span>
                  <span className="text-slate-800">{selectedRequest.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Account Role:</span>
                  <span className="font-bold text-teal-700">{selectedRequest.account_type}</span>
                </div>
              </div>
            </div>

            {/* Franchise & Business Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Franchise & Territory Details
              </h4>
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Franchise Branch Name:</span>
                  <span className="font-semibold text-slate-900">{selectedRequest.branch_name}</span>
                </div>
                {selectedRequest.org_name && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Organization / Firm:</span>
                    <span className="text-slate-800">{selectedRequest.org_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Location / City:</span>
                  <span className="text-slate-800">{selectedRequest.location}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">License Category:</span>
                  <span className="text-slate-800">{selectedRequest.license_type || 'Standard Unit Franchise'}</span>
                </div>
                {selectedRequest.auth_code && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Manager Authorization Code:</span>
                    <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {selectedRequest.auth_code}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Credential Storage:</span>
                  <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Bcrypt Secure Hash (12 rounds)
                  </span>
                </div>
              </div>
            </div>

            {/* Submission & Audit Trail */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                Audit Trail & Review Information
              </h4>
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Submitted At:</span>
                  <span className="text-slate-800">{selectedRequest.submitted_at}</span>
                </div>
                {selectedRequest.reviewed_at && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Reviewed At:</span>
                    <span className="text-slate-800">{selectedRequest.reviewed_at}</span>
                  </div>
                )}
                {selectedRequest.reviewed_by && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Reviewed By:</span>
                    <span className="text-slate-800 font-semibold">{selectedRequest.reviewed_by}</span>
                  </div>
                )}
                {selectedRequest.rejection_reason && (
                  <div className="py-1">
                    <span className="text-slate-500 block mb-1">Rejection Reason:</span>
                    <p className="p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium">
                      {selectedRequest.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions if Pending */}
            {selectedRequest.status === 'PENDING' && (
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="primary"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  icon={CheckCircle2}
                  onClick={() => {
                    handleTriggerApprove(selectedRequest);
                  }}
                >
                  Approve Application
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  icon={XCircle}
                  onClick={() => {
                    handleTriggerReject(selectedRequest);
                  }}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* ==================================================================== */}
      {/* APPROVE CONFIRMATION DIALOG                                          */}
      {/* ==================================================================== */}
      <ConfirmDialog
        isOpen={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        onConfirm={confirmApprove}
        title="Authorize Franchise Registration?"
        message={`Are you sure you want to approve registration request ${targetRequest?.reference_id} for ${targetRequest?.full_name}? This action will create and activate their user account in the system database, allowing them to sign in immediately as ${targetRequest?.account_type} for ${targetRequest?.branch_name}.`}
        confirmVariant="primary"
        confirmText="Yes, Approve & Activate Account"
      />

      {/* ==================================================================== */}
      {/* REJECT CONFIRMATION MODAL WITH REASON INPUT                          */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Registration Application"
        subtitle={`Request ${targetRequest?.reference_id} - ${targetRequest?.full_name}`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={confirmReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            <span className="font-bold block mb-1">Important:</span>
            Rejecting this request will prevent the applicant from logging in. An explicit rejection notification will be displayed if they attempt authentication.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason for Rejection (Visible to Applicant)
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Territory already assigned to another partner; documentation requirements incomplete..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-500 font-semibold block">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Territory documentation incomplete.',
                'Proposed location already reserved.',
                'Manager invitation authorization code expired or invalid.',
                'Business credentials did not pass compliance screening.'
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectionReason(preset)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-left"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ==================================================================== */}
      {/* OUTLET ADD & EDIT MODALS (PRESERVED)                                  */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Franchise Outlet"
        subtitle="Establish a new physical branch in the TravelSphere Ops network."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveAdd}>
              Save Outlet
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Surat Commercial Hub"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code</label>
              <input
                type="text"
                readOnly
                value={formData.code}
                className="w-full px-3 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Surat"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Gujarat"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Ring Road, Near Diamond Market"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g. Jignesh Patel"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Email</label>
              <input
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                placeholder="jignesh@surattours.in"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manager Name</label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                placeholder="e.g. Rajesh Shah"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98250 11223"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Outlet Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Franchise Details"
        subtitle={`Editing ${selectedFranchise?.name} (${selectedFranchise?.code})`}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveEdit}>
              Update Outlet
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Franchise Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code</label>
              <input
                type="text"
                readOnly
                value={formData.code}
                className="w-full px-3 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target (₹)</label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
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
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Status card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Operational Status</span>
                <span className="text-sm font-bold text-slate-900">{selectedFranchise.status}</span>
              </div>
              <Badge variant={selectedFranchise.status === 'Active' ? 'success' : 'danger'} size="md">
                {selectedFranchise.status}
              </Badge>
            </div>

            {/* Financial & Performance Stats */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Performance Snapshot</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100">
                  <span className="text-[11px] text-teal-700">Actual Revenue</span>
                  <p className="text-base font-bold text-slate-900">{formatCurrency(selectedFranchise.totalRevenue)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500">Target Revenue</span>
                  <p className="text-base font-bold text-slate-900">{formatCurrency(selectedFranchise.target)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500">Bookings Volume</span>
                  <p className="text-base font-bold text-slate-900">{selectedFranchise.bookings} pax</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500">Customer Rating</span>
                  <p className="text-base font-bold text-amber-600">★ {selectedFranchise.rating} / 5.0</p>
                </div>
              </div>
            </div>

            {/* Franchise Agreement & Contact */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Agreement & Contact</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Franchise Owner:</span>
                  <span className="font-semibold text-slate-800">{selectedFranchise.ownerName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Owner Email:</span>
                  <span className="text-slate-700">{selectedFranchise.ownerEmail}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Operations Manager:</span>
                  <span className="font-semibold text-slate-800">{selectedFranchise.managerName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Telephone:</span>
                  <span className="text-slate-700">{selectedFranchise.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Opening Date:</span>
                  <span className="text-slate-700">{selectedFranchise.openingDate}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">License Expiry:</span>
                  <span className="font-medium text-emerald-600">{selectedFranchise.licenseExpiry}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirm Deactivate/Activate Dialog for Outlet */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmToggleStatus}
        title={`${actionTarget?.status === 'Active' ? 'Deactivate' : 'Activate'} Franchise`}
        message={`Are you sure you want to ${
          actionTarget?.status === 'Active' ? 'suspend operations for' : 're-activate'
        } ${actionTarget?.name}? ${
          actionTarget?.status === 'Active'
            ? 'Branch employees will temporarily lose booking submission privileges.'
            : 'Branch employees will regain booking permissions.'
        }`}
        confirmVariant={actionTarget?.status === 'Active' ? 'danger' : 'primary'}
        confirmText={actionTarget?.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
      />
    </div>
  );
};
