import React, { useState } from 'react';
import {
  Palmtree,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  IndianRupee,
  Users,
  Eye,
  Edit,
  Power,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Drawer } from '../../components/common/Drawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_PACKAGES } from '../../mock/packageData';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const TourPackages = () => {
  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals & Drawer
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [actionPackage, setActionPackage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    destination: '',
    category: 'Beach & Leisure',
    duration: '5 Days / 4 Nights',
    price: 25000,
    totalSlots: 30,
    nextDeparture: '01 Dec 2026',
    image: '',
    description: ''
  });

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || pkg.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPackages = packages.length;
  const activePackages = packages.filter((p) => p.status === 'Active').length;
  const availableSeats = packages.reduce((acc, p) => acc + p.availableSlots, 0);

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: `PKG-NEW-${Date.now().toString().slice(-3)}`,
      destination: '',
      category: 'Beach & Leisure',
      duration: '5 Days / 4 Nights',
      price: 28000,
      totalSlots: 30,
      nextDeparture: '10 Dec 2026',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      description: 'Exclusive regional guided itinerary with deluxe hotel stays and sightseeing.'
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.destination) return;

    const newPkg = {
      id: Date.now(),
      code: formData.code,
      name: formData.name,
      destination: formData.destination,
      category: formData.category,
      duration: formData.duration,
      price: Number(formData.price),
      totalSlots: Number(formData.totalSlots),
      bookedSlots: 0,
      availableSlots: Number(formData.totalSlots),
      status: 'Active',
      nextDeparture: formData.nextDeparture,
      image: formData.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      description: formData.description,
      highlights: ['Guided City Tour', 'Deluxe Accommodations', 'Private Transfers', 'Breakfast Buffet'],
      inclusions: ['4-Star Hotels', 'Daily Breakfast', 'Sightseeing Coach', 'Tour Coordinator']
    };

    setPackages([newPkg, ...packages]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({ ...pkg });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setPackages(
      packages.map((p) => (p.id === selectedPackage.id ? { ...p, ...formData } : p))
    );
    setIsEditOpen(false);
  };

  const handleOpenView = (pkg) => {
    setSelectedPackage(pkg);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = (pkg) => {
    setActionPackage(pkg);
    setIsConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (!actionPackage) return;
    setPackages(
      packages.map((p) =>
        p.id === actionPackage.id
          ? { ...p, status: p.status === 'Active' ? 'Seasonal' : 'Active' }
          : p
      )
    );
    setIsConfirmOpen(false);
    setActionPackage(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tour Packages & Inventory Agent"
        subtitle="Manage holiday packages, pricing, departure schedules, and real-time seat allotments across Goa, Kerala, Himachal, and Kashmir."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Tour Packages' }
        ]}
        actions={
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            Create New Package
          </Button>
        }
      />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Packages Catalog"
          value={formatNumber(totalPackages)}
          subtext="Domestic & regional tours"
          icon={Palmtree}
          variant="teal"
        />

        <MetricCard
          title="Active Bookable Packages"
          value={formatNumber(activePackages)}
          subtext="Open for customer booking"
          icon={CheckCircle2}
          variant="emerald"
        />

        <MetricCard
          title="Total Available Seats"
          value={`${formatNumber(availableSeats)} Seats`}
          subtext="Unsold across all packages"
          icon={Users}
          variant="indigo"
        />

        <MetricCard
          title="Upcoming Departures"
          value="42 Groups"
          subtext="Next 30 days schedule"
          icon={Calendar}
          variant="navy"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search package name, destination, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto"
          >
            <option value="All">All Categories</option>
            <option value="Beach & Leisure">Beach & Leisure</option>
            <option value="Nature & Wellness">Nature & Wellness</option>
            <option value="Adventure & Mountains">Adventure & Mountains</option>
            <option value="Culture & Heritage">Culture & Heritage</option>
            <option value="Romance & Scenic">Romance & Scenic</option>
            <option value="Island Adventure">Island Adventure</option>
          </select>
        </div>
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <EmptyState
          title="No packages match your search"
          description="Try clearing your filters to see the complete holiday tour catalog."
          onReset={() => {
            setSearchQuery('');
            setCategoryFilter('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const fillPercent = ((pkg.totalSlots - pkg.availableSlots) / pkg.totalSlots) * 100;
            const isLowInventory = pkg.availableSlots <= 4;

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="navy" size="sm" className="bg-navy-950/80 backdrop-blur-xs text-white">
                      {pkg.destination}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={pkg.status === 'Active' ? 'success' : 'default'} size="sm">
                      {pkg.status}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-slate-900 font-bold text-sm shadow-sm flex items-center">
                    {formatCurrency(pkg.price)}
                    <span className="text-[10px] text-slate-500 font-normal ml-1">/ person</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{pkg.code}</span>
                      <span>{pkg.category}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-teal-600 transition-colors">
                      {pkg.name}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {pkg.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Next: {pkg.nextDeparture}
                      </span>
                    </div>
                  </div>

                  {/* Seat Availability Tracker */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Seat Availability:</span>
                      <span className={`font-bold ${isLowInventory ? 'text-rose-600' : 'text-slate-800'}`}>
                        {pkg.availableSlots} of {pkg.totalSlots} slots left
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLowInventory ? 'bg-rose-500' : fillPercent >= 75 ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleOpenView(pkg)}
                      className="flex-1"
                    >
                      Details
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleOpenEdit(pkg)}
                    >
                      Edit
                    </Button>

                    <button
                      onClick={() => handleToggleStatus(pkg)}
                      className={`p-2 rounded-lg text-xs font-medium border ${
                        pkg.status === 'Active'
                          ? 'border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                      title={pkg.status === 'Active' ? 'Set as Seasonal' : 'Activate Package'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Package Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Tour Package"
        subtitle="Publish a new travel package with departure schedule and seat allocations."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Save Package
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Package Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Kashmir Autumn Chinar Explorer"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination *</label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="e.g. Kashmir"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Beach & Leisure">Beach & Leisure</option>
                <option value="Nature & Wellness">Nature & Wellness</option>
                <option value="Adventure & Mountains">Adventure & Mountains</option>
                <option value="Culture & Heritage">Culture & Heritage</option>
                <option value="Romance & Scenic">Romance & Scenic</option>
                <option value="Island Adventure">Island Adventure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="5 Days / 4 Nights"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Slots</label>
              <input
                type="number"
                value={formData.totalSlots}
                onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL (Unsplash)</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </form>
      </Modal>

      {/* Edit Package Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${selectedPackage?.name}`}
        subtitle="Modify package pricing, duration, or available departure slots."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Update Package
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Package Title</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Slots</label>
              <input
                type="number"
                value={formData.totalSlots}
                onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Package Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedPackage?.name}
        subtitle={`${selectedPackage?.destination} &bull; ${selectedPackage?.duration}`}
      >
        {selectedPackage && (
          <div className="space-y-6 text-xs sm:text-sm">
            <img
              src={selectedPackage.image}
              alt={selectedPackage.name}
              className="w-full h-48 object-cover rounded-2xl shadow-sm"
            />

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Package Price</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(selectedPackage.price)}</span>
                <span className="text-[11px] text-slate-400"> / traveler</span>
              </div>
              <Badge variant={selectedPackage.status === 'Active' ? 'success' : 'default'} size="md">
                {selectedPackage.status}
              </Badge>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Overview</h4>
              <p className="text-slate-600 leading-relaxed">{selectedPackage.description}</p>
            </div>

            {selectedPackage.highlights && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Itinerary Highlights</h4>
                <div className="space-y-1.5">
                  {selectedPackage.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPackage.inclusions && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Package Inclusions</h4>
                <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1 text-slate-700">
                  {selectedPackage.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Confirm Status Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmToggleStatus}
        title={`${actionPackage?.status === 'Active' ? 'Set as Seasonal' : 'Activate'} Package`}
        message={`Are you sure you want to change the status of ${actionPackage?.name}?`}
        confirmVariant={actionPackage?.status === 'Active' ? 'danger' : 'primary'}
        confirmText="Confirm Change"
      />
    </div>
  );
};
