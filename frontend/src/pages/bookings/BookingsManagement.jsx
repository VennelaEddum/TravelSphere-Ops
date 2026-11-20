import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  Eye,
  Check,
  X,
  CreditCard,
  User,
  Calendar,
  IndianRupee,
  MapPin,
  Download
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Drawer } from '../../components/common/Drawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_BOOKINGS } from '../../mock/bookingData';
import { INITIAL_PACKAGES } from '../../mock/packageData';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const BookingsManagement = () => {
  const { user, role, selectedBranch } = useAuth();

  // If Franchise Owner or Manager, data is scoped strictly to user's assigned branch
  const userBranch = (role === ROLES.FRANCHISE_OWNER || role === ROLES.FRANCHISE_MANAGER)
    ? (user?.branchName || 'Mumbai')
    : selectedBranch;

  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    packageName: 'Goa Coastal Weekend Break',
    branchName: userBranch === 'All Branches' ? 'Mumbai' : userBranch,
    travelDate: '25 Nov 2026',
    pax: 2,
    totalAmount: 37000,
    specialRequests: ''
  });

  // Role branch filtering
  const branchScopedBookings = userBranch === 'All Branches'
    ? bookings
    : bookings.filter((b) => b.branchName === userBranch);

  // Search & Filter
  const filteredBookings = branchScopedBookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.branchName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;
    const matchesPayment = paymentFilter === 'All' || b.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalCount = branchScopedBookings.length;
  const confirmedCount = branchScopedBookings.filter((b) => b.bookingStatus === 'Confirmed').length;
  const pendingCount = branchScopedBookings.filter((b) => b.bookingStatus === 'Pending').length;
  const cancelledCount = branchScopedBookings.filter((b) => b.bookingStatus === 'Cancelled').length;

  // Actions
  const handleOpenAdd = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      packageName: 'Goa Coastal Weekend Break',
      branchName: userBranch === 'All Branches' ? 'Mumbai' : userBranch,
      travelDate: '25 Nov 2026',
      pax: 2,
      totalAmount: 37000,
      specialRequests: ''
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.customerName) return;

    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail || 'customer@gmail.com',
      customerPhone: formData.customerPhone || '+91 98000 00000',
      packageName: formData.packageName,
      branchName: formData.branchName,
      bookingDate: 'Today',
      travelDate: formData.travelDate,
      pax: Number(formData.pax),
      totalAmount: Number(formData.totalAmount),
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      specialRequests: formData.specialRequests || 'Standard package inclusions.'
    };

    setBookings([newBooking, ...bookings]);
    setIsAddOpen(false);
  };

  const handleOpenView = (b) => {
    setSelectedBooking(b);
    setIsDrawerOpen(true);
  };

  const handleConfirmStatus = (bookingId) => {
    setBookings(
      bookings.map((b) => (b.id === bookingId ? { ...b, bookingStatus: 'Confirmed', paymentStatus: 'Paid' } : b))
    );
  };

  const handlePromptCancel = (b) => {
    setBookingToCancel(b);
    setIsConfirmCancelOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!bookingToCancel) return;
    setBookings(
      bookings.map((b) =>
        b.id === bookingToCancel.id ? { ...b, bookingStatus: 'Cancelled' } : b
      )
    );
    setIsConfirmCancelOpen(false);
    setBookingToCancel(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings Management"
        subtitle="Track customer reservation manifests, payments, ticket issuance, and cancellation processing."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Bookings Management' }
        ]}
        badge={
          userBranch !== 'All Branches' && (
            <Badge variant="primary" size="sm">
              Scope: {userBranch}
            </Badge>
          )
        }
        actions={
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            Create New Booking
          </Button>
        }
      />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Bookings"
          value={formatNumber(totalCount)}
          subtext="Reservations in branch scope"
          icon={CalendarCheck}
          variant="teal"
        />

        <MetricCard
          title="Confirmed Bookings"
          value={formatNumber(confirmedCount)}
          subtext="Vouchers issued & active"
          icon={CheckCircle2}
          variant="emerald"
        />

        <MetricCard
          title="Pending Verification"
          value={formatNumber(pendingCount)}
          subtext="Awaiting KYC / payment"
          icon={Clock}
          variant="amber"
        />

        <MetricCard
          title="Cancelled Bookings"
          value={formatNumber(cancelledCount)}
          subtext="Refunds processed"
          icon={Ban}
          variant="rose"
        />
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search booking ID, customer, package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Booking Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Payment Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredBookings.length === 0 ? (
          <EmptyState
            title="No bookings match your filter criteria"
            description="Adjust your search query or reset the status filters to view reservations."
            onReset={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setPaymentFilter('All');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Booking ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Package Tour</th>
                  <th className="py-3 px-4 font-semibold">Branch</th>
                  <th className="py-3 px-4 font-semibold">Travel Date</th>
                  <th className="py-3 px-4 font-semibold">Pax</th>
                  <th className="py-3 px-4 font-semibold">Total Amount</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{b.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{b.customerName}</span>
                      <span className="text-[11px] text-slate-400 block">{b.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 truncate max-w-[200px]">
                      {b.packageName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{b.branchName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{b.travelDate}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{b.pax} pax</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(b.totalAmount)}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={b.paymentStatus === 'Paid' ? 'success' : b.paymentStatus === 'Partial' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {b.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          b.bookingStatus === 'Confirmed'
                            ? 'success'
                            : b.bookingStatus === 'Completed'
                            ? 'primary'
                            : b.bookingStatus === 'Pending'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                        dot
                      >
                        {b.bookingStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(b)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg"
                          title="View Manifest"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {b.bookingStatus === 'Pending' && (
                          <button
                            onClick={() => handleConfirmStatus(b.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Confirm Booking"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {b.bookingStatus !== 'Cancelled' && (
                          <button
                            onClick={() => handlePromptCancel(b)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Cancel Booking"
                          >
                            <X className="w-4 h-4" />
                          </button>
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

      {/* Create New Booking Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Booking"
        subtitle="Book travelers for scheduled regional tour package."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Confirm Booking
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="+91 98000 00000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Tour Package *</label>
            <select
              value={formData.packageName}
              onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {INITIAL_PACKAGES.map((pkg) => (
                <option key={pkg.id} value={pkg.name}>
                  {pkg.name} ({pkg.destination}) - {formatCurrency(pkg.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Travel Date</label>
              <input
                type="text"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Passengers (Pax)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.pax}
                onChange={(e) => setFormData({ ...formData, pax: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Amount (₹)</label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requests & Inclusions</label>
            <textarea
              rows={2}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="Dietary preferences, hotel room requests, or airport transfer details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </form>
      </Modal>

      {/* Booking Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Booking ${selectedBooking?.id}`}
        subtitle={`${selectedBooking?.customerName} &bull; ${selectedBooking?.packageName}`}
      >
        {selectedBooking && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total Fare Paid</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(selectedBooking.totalAmount)}</span>
              </div>
              <Badge variant={selectedBooking.bookingStatus === 'Confirmed' ? 'success' : 'warning'} size="md">
                {selectedBooking.bookingStatus}
              </Badge>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Passenger & Booking Info</h4>
              <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-semibold text-slate-800">{selectedBooking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Address:</span>
                  <span className="text-slate-700">{selectedBooking.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone Number:</span>
                  <span className="text-slate-700">{selectedBooking.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Number of Passengers:</span>
                  <span className="font-semibold text-slate-800">{selectedBooking.pax} Adults</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Travel Date:</span>
                  <span className="font-medium text-teal-600">{selectedBooking.travelDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Originating Branch:</span>
                  <span className="text-slate-800">{selectedBooking.branchName}</span>
                </div>
              </div>
            </div>

            {selectedBooking.specialRequests && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Special Requests</h4>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed text-xs">
                  {selectedBooking.specialRequests}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Confirm Cancellation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmCancelOpen}
        onClose={() => setIsConfirmCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Confirm Booking Cancellation"
        message={`Are you sure you want to cancel booking ${bookingToCancel?.id} for ${bookingToCancel?.customerName}? This will notify the customer and trigger the refund SLA workflow.`}
        confirmVariant="danger"
        confirmText="Cancel Reservation"
      />
    </div>
  );
};
