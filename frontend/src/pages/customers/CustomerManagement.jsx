import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  CreditCard,
  Eye,
  Edit,
  Sparkles,
  Luggage,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Drawer } from '../../components/common/Drawer';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_CUSTOMERS } from '../../mock/customerData';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const CustomerManagement = () => {
  const { user, role, selectedBranch } = useAuth();

  // Branch filtering based on role
  const branchScope = (role === ROLES.FRANCHISE_OWNER || role === ROLES.FRANCHISE_MANAGER)
    ? (user?.branchName || 'Mumbai')
    : selectedBranch;

  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    tier: 'Silver',
    preferredDestinations: 'Goa, Kerala'
  });

  const branchScopedCustomers = branchScope === 'All Branches'
    ? customers
    : customers.filter((c) => c.assignedBranch === branchScope);

  const filteredCustomers = branchScopedCustomers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'All' || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const totalCount = branchScopedCustomers.length;
  const repeatCount = branchScopedCustomers.filter((c) => c.totalTrips > 1).length;
  const newCount = totalCount - repeatCount;
  const avgLtv = branchScopedCustomers.reduce((acc, c) => acc + c.lifetimeValue, 0) / (totalCount || 1);

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: branchScope === 'All Branches' ? 'Mumbai' : branchScope,
      tier: 'Silver',
      preferredDestinations: 'Goa, Kerala'
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newCust = {
      id: Date.now(),
      name: formData.name,
      email: formData.email || 'guest@travelsphere.demo',
      phone: formData.phone || '+91 98000 00000',
      city: formData.city,
      tier: formData.tier,
      totalTrips: 1,
      lifetimeValue: 35000,
      preferredDestinations: formData.preferredDestinations.split(',').map((s) => s.trim()),
      joinedDate: 'Today',
      assignedBranch: branchScope === 'All Branches' ? 'Mumbai' : branchScope,
      lastTrip: 'Upcoming Reservation',
      history: []
    };

    setCustomers([newCust, ...customers]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (c) => {
    setSelectedCustomer(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      city: c.city,
      tier: c.tier,
      preferredDestinations: c.preferredDestinations.join(', ')
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              city: formData.city,
              tier: formData.tier,
              preferredDestinations: formData.preferredDestinations.split(',').map((s) => s.trim())
            }
          : c
      )
    );
    setIsEditOpen(false);
  };

  const handleOpenView = (c) => {
    setSelectedCustomer(c);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Relationship Management (CRM)"
        subtitle="Manage customer profiles, loyalty tiers, lifetime travel values, and trip histories across franchise outlets."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Customer Management' }
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
            Add Customer Profile
          </Button>
        }
      />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Travelers"
          value={formatNumber(totalCount)}
          subtext="Profiles in active branch scope"
          icon={Users}
          variant="teal"
        />

        <MetricCard
          title="Repeat Holidaymakers"
          value={formatNumber(repeatCount)}
          subtext={`${((repeatCount / (totalCount || 1)) * 100).toFixed(0)}% Retention rate`}
          icon={Award}
          variant="emerald"
        />

        <MetricCard
          title="First-Time Customers"
          value={formatNumber(newCount)}
          subtext="Enrolled this quarter"
          icon={UserPlus}
          variant="navy"
        />

        <MetricCard
          title="Average Lifetime Value"
          value={formatCurrency(avgLtv)}
          subtext="Cumulative traveler spend"
          icon={CreditCard}
          variant="indigo"
        />
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, email, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Loyalty Tiers</option>
              <option value="Platinum">Platinum Tier</option>
              <option value="Gold">Gold Tier</option>
              <option value="Silver">Silver Tier</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title="No customer records found"
            description="Adjust your search filters or add a new customer profile."
            onReset={() => {
              setSearchQuery('');
              setTierFilter('All');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Contact Info</th>
                  <th className="py-3 px-4 font-semibold">City</th>
                  <th className="py-3 px-4 font-semibold">Loyalty Tier</th>
                  <th className="py-3 px-4 font-semibold">Total Trips</th>
                  <th className="py-3 px-4 font-semibold">Lifetime Value</th>
                  <th className="py-3 px-4 font-semibold">Last Trip</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[10px] text-slate-400">Joined {c.joinedDate}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 block">{c.phone}</span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[160px]">{c.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{c.city}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={c.tier === 'Platinum' ? 'navy' : c.tier === 'Gold' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {c.tier}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">{c.totalTrips} completed</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(c.lifetimeValue)}</td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]">{c.lastTrip}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(c)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg"
                          title="View History & Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          title="Edit Customer"
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

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Customer Profile"
        subtitle="Enroll a new traveler into the franchise customer directory."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Save Profile
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
              placeholder="e.g. Meera Nambiar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="meera@domain.com"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loyalty Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Destinations (comma separated)</label>
            <input
              type="text"
              value={formData.preferredDestinations}
              onChange={(e) => setFormData({ ...formData, preferredDestinations: e.target.value })}
              placeholder="e.g. Goa, Kerala, Kashmir"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${selectedCustomer?.name}`}
        subtitle="Update contact coordinates or loyalty classification."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Update Profile
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loyalty Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Customer Profile & Trip History Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedCustomer?.name}
        subtitle={`${selectedCustomer?.city} &bull; ${selectedCustomer?.tier} Member`}
      >
        {selectedCustomer && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total Lifetime Spend</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(selectedCustomer.lifetimeValue)}</span>
              </div>
              <Badge variant={selectedCustomer.tier === 'Platinum' ? 'navy' : 'warning'} size="md">
                {selectedCustomer.tier} Tier
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Contact & Preferences</h4>
              <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-700">{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Completed Trips:</span>
                  <span className="font-bold text-slate-800">{selectedCustomer.totalTrips} Trips</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Favorite Destinations:</span>
                  <span className="text-teal-700 font-medium">{selectedCustomer.preferredDestinations.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Past Booking History */}
            {selectedCustomer.history?.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Historical Trip Ledger</h4>
                <div className="space-y-2">
                  {selectedCustomer.history.map((h, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900 block">{h.package}</span>
                        <span className="text-[11px] text-slate-400">{h.id} &bull; {h.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 block">{formatCurrency(h.amount)}</span>
                        <Badge variant={h.status === 'Confirmed' ? 'success' : 'default'} size="sm">
                          {h.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
