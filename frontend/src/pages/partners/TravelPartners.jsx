import React, { useState } from 'react';
import {
  Handshake,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Star,
  Building,
  Phone,
  Mail,
  Eye,
  Edit,
  FileCheck
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Drawer } from '../../components/common/Drawer';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_PARTNERS } from '../../mock/partnerData';
import { formatNumber } from '../../utils/formatters';

export const TravelPartners = () => {
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedPartner, setSelectedPartner] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hotels & Resorts',
    location: '',
    contactPerson: '',
    email: '',
    phone: '',
    commissionRate: '12.0%',
    contractExpiry: '31 Dec 2027'
  });

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalPartners = partners.length;
  const activePartners = partners.filter((p) => p.contractStatus === 'Active').length;
  const pendingAgreements = totalPartners - activePartners;

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Hotels & Resorts',
      location: '',
      contactPerson: '',
      email: '',
      phone: '',
      commissionRate: '12.0%',
      contractExpiry: '31 Dec 2027'
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newPartner = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      location: formData.location || 'Pan-India',
      contactPerson: formData.contactPerson || 'Vendor Rep',
      email: formData.email || 'partner@hospitality.com',
      phone: formData.phone || '+91 99000 00000',
      commissionRate: formData.commissionRate,
      contractStatus: 'Active',
      contractExpiry: formData.contractExpiry,
      rating: 5.0,
      tripsHandled: 0
    };

    setPartners([newPartner, ...partners]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (p) => {
    setSelectedPartner(p);
    setFormData({ ...p });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setPartners(
      partners.map((p) => (p.id === selectedPartner.id ? { ...p, ...formData } : p))
    );
    setIsEditOpen(false);
  };

  const handleOpenView = (p) => {
    setSelectedPartner(p);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Travel Partners & Vendor Management"
        subtitle="Manage preferred hospitality chains, airline charters, local coach fleets, certified mountaineering guides, and commission agreements."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Travel Partners' }
        ]}
        actions={
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            Register Partner Vendor
          </Button>
        }
      />

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Contracted Vendors"
          value={formatNumber(totalPartners)}
          subtext="Hotels, airlines & fleet"
          icon={Handshake}
          variant="teal"
        />

        <MetricCard
          title="Active Contract Agreements"
          value={formatNumber(activePartners)}
          subtext="Verified SLA & safety compliance"
          icon={CheckCircle2}
          variant="emerald"
        />

        <MetricCard
          title="Agreements Pending Renewal"
          value={formatNumber(pendingAgreements)}
          subtext="Expiring within 60 days"
          icon={Clock}
          variant="amber"
        />
      </div>

      {/* Directory Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search partner name, location, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Categories</option>
              <option value="Hotels & Resorts">Hotels & Resorts</option>
              <option value="Airlines">Airlines</option>
              <option value="Transport">Transport Fleets</option>
              <option value="Tour Guides">Tour Guides</option>
              <option value="Local Tour Services">Local Tour Services</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredPartners.length === 0 ? (
          <EmptyState
            title="No vendor partners found"
            description="Adjust your search criteria or register a new travel supplier."
            onReset={() => {
              setSearchQuery('');
              setCategoryFilter('All');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Vendor Partner</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Location Hub</th>
                  <th className="py-3 px-4 font-semibold">Contact Person</th>
                  <th className="py-3 px-4 font-semibold">Commission / Fee</th>
                  <th className="py-3 px-4 font-semibold">Trips Handled</th>
                  <th className="py-3 px-4 font-semibold">Rating</th>
                  <th className="py-3 px-4 font-semibold">Contract Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 font-medium">{p.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]">{p.location}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-900 font-medium block">{p.contactPerson}</span>
                      <span className="text-[10px] text-slate-400 block">{p.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-teal-800">{p.commissionRate}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{p.tripsHandled} Tours</td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">★ {p.rating}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.contractStatus === 'Active' ? 'success' : 'warning'} size="sm" dot>
                        {p.contractStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(p)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg"
                          title="View SLA & Contract"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          title="Edit Partner"
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

      {/* Add Partner Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Travel Vendor Partner"
        subtitle="Add a new hospitality, airline, or transport partner with contract agreements."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Save Vendor
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Partner Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Radisson Blu Resort Goa"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Hotels & Resorts">Hotels & Resorts</option>
                <option value="Airlines">Airlines</option>
                <option value="Transport">Transport Fleets</option>
                <option value="Tour Guides">Tour Guides</option>
                <option value="Local Tour Services">Local Tour Services</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. South Goa"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Representative</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Full name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Phone</label>
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

      {/* Edit Partner Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${selectedPartner?.name}`}
        subtitle="Update partner coordinates or commission rate."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Update Partner
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Partner Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commission Rate</label>
              <input
                type="text"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
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
          </div>
        </form>
      </Modal>

      {/* Partner Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedPartner?.name}
        subtitle={`${selectedPartner?.category} &bull; ${selectedPartner?.location}`}
      >
        {selectedPartner && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Performance Rating</span>
                <span className="text-xl font-bold text-amber-600">★ {selectedPartner.rating} / 5.0</span>
              </div>
              <Badge variant={selectedPartner.contractStatus === 'Active' ? 'success' : 'warning'} size="md">
                {selectedPartner.contractStatus}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Contract & Terms</h4>
              <div className="p-3.5 rounded-xl border border-slate-100 bg-white space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Commission / Fee:</span>
                  <span className="font-bold text-teal-800">{selectedPartner.commissionRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Representative:</span>
                  <span className="font-semibold text-slate-800">{selectedPartner.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-700">{selectedPartner.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-700">{selectedPartner.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract Expiry:</span>
                  <span className="text-slate-800 font-medium">{selectedPartner.contractExpiry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trips Dispatched:</span>
                  <span className="font-bold text-slate-900">{selectedPartner.tripsHandled} Tours</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
