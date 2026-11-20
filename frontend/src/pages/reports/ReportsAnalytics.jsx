import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  FileText,
  Download,
  Calendar,
  Building2,
  Filter,
  Search,
  Printer,
  Mail,
  CheckCircle2,
  BarChart3,
  DollarSign,
  Package,
  Star,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_BOOKINGS } from '../../mock/bookingData';
import { INITIAL_PACKAGES } from '../../mock/packageData';
import { BRANCH_SATISFACTION } from '../../mock/feedbackData';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

// Branch Performance Dataset
const REPORT_PERFORMANCE_DATA = [
  { branch: 'Mumbai', target: 1000000, revenue: 950000, bookings: 180, cancellations: 9, cancelRate: 5.0, achievement: 95.0, status: 'On Track' },
  { branch: 'Pune', target: 750000, revenue: 720000, bookings: 135, cancellations: 8, cancelRate: 5.93, achievement: 96.0, status: 'On Track' },
  { branch: 'Bengaluru', target: 800000, revenue: 800000, bookings: 150, cancellations: 7, cancelRate: 4.67, achievement: 100.0, status: 'Target Met' },
  { branch: 'Hyderabad', target: 600000, revenue: 430000, bookings: 90, cancellations: 6, cancelRate: 6.67, achievement: 71.67, status: 'Deficit Alert' },
  { branch: 'Nagpur', target: 350000, revenue: 250000, bookings: 110, cancellations: 18, cancelRate: 16.36, achievement: 71.43, status: 'Critical Deficit' }
];

// Financial & Royalty Dataset
const REPORT_FINANCE_DATA = [
  { branch: 'Mumbai', revenue: 950000, expenses: 680000, netProfit: 270000, margin: 28.4, royaltyFee: 76000, paymentStatus: 'Settled' },
  { branch: 'Pune', revenue: 720000, expenses: 510000, netProfit: 210000, margin: 29.2, royaltyFee: 57600, paymentStatus: 'Settled' },
  { branch: 'Bengaluru', revenue: 800000, expenses: 560000, netProfit: 240000, margin: 30.0, royaltyFee: 64000, paymentStatus: 'Settled' },
  { branch: 'Hyderabad', revenue: 430000, expenses: 320000, netProfit: 110000, margin: 25.6, royaltyFee: 34400, paymentStatus: 'Pending' },
  { branch: 'Nagpur', revenue: 250000, expenses: 210000, netProfit: 40000, margin: 16.0, royaltyFee: 20000, paymentStatus: 'Audit Hold' }
];

export const ReportsAnalytics = () => {
  const { user, role, selectedBranch } = useAuth();

  const userBranch = (role === ROLES.FRANCHISE_OWNER || role === ROLES.FRANCHISE_MANAGER)
    ? (user?.branchName || 'Mumbai')
    : selectedBranch;

  // Active Report Tab: 'performance' | 'finance' | 'bookings' | 'packages' | 'satisfaction'
  const [activeReportTab, setActiveReportTab] = useState('performance');
  const [dateRange, setDateRange] = useState('Current Month (Nov 2026)');
  const [searchQuery, setSearchQuery] = useState('');

  // Schedule report modal state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState('Weekly');
  const [scheduleEmail, setScheduleEmail] = useState(user?.email || 'admin@travelsphere.demo');
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // 1. Filtered Data by Branch & Search Query
  const filterByBranch = (list, branchField = 'branch') => {
    if (userBranch === 'All Branches') return list;
    return list.filter((item) => item[branchField] === userBranch);
  };

  // Performance Report Data
  const performanceFiltered = filterByBranch(REPORT_PERFORMANCE_DATA).filter((item) =>
    item.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Finance Report Data
  const financeFiltered = filterByBranch(REPORT_FINANCE_DATA).filter((item) =>
    item.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Bookings Report Data
  const bookingsFiltered = filterByBranch(INITIAL_BOOKINGS).filter((item) =>
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tourPackage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Package Occupancy Report Data
  const packagesFiltered = INITIAL_PACKAGES.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Feedback Report Data
  const feedbackFiltered = filterByBranch(BRANCH_SATISFACTION).filter((item) =>
    item.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Real CSV Download Generator
  const handleExportCSV = () => {
    let csvHeaders = [];
    let csvRows = [];
    let filename = `travelsphere-ops-${activeReportTab}-report.csv`;

    if (activeReportTab === 'performance') {
      csvHeaders = ['Branch', 'Target (INR)', 'Revenue (INR)', 'Bookings', 'Cancellations', 'Cancellation Rate (%)', 'Achievement (%)', 'Status'];
      csvRows = performanceFiltered.map((r) => [
        r.branch, r.target, r.revenue, r.bookings, r.cancellations, `${r.cancelRate}%`, `${r.achievement}%`, r.status
      ]);
    } else if (activeReportTab === 'finance') {
      csvHeaders = ['Branch', 'Revenue (INR)', 'Operating Expenses (INR)', 'Net Profit (INR)', 'Margin (%)', '8% Royalty Fee (INR)', 'Payment Status'];
      csvRows = financeFiltered.map((r) => [
        r.branch, r.revenue, r.expenses, r.netProfit, `${r.margin}%`, r.royaltyFee, r.paymentStatus
      ]);
    } else if (activeReportTab === 'bookings') {
      csvHeaders = ['Booking ID', 'Customer Name', 'Branch', 'Tour Package', 'Passengers', 'Amount (INR)', 'Payment Status', 'Travel Date'];
      csvRows = bookingsFiltered.map((r) => [
        r.id, r.customerName, r.branch, r.tourPackage, r.pax, r.amount, r.paymentStatus, r.travelDate
      ]);
    } else if (activeReportTab === 'packages') {
      csvHeaders = ['Package Code', 'Title', 'Destination', 'Duration', 'Price (INR)', 'Total Capacity', 'Booked Slots', 'Remaining Slots', 'Occupancy (%)'];
      csvRows = packagesFiltered.map((r) => [
        r.code, r.name, r.destination, r.duration, r.price, r.totalSlots, r.bookedSlots, r.availableSlots, `${Math.round((r.bookedSlots / r.totalSlots) * 100)}%`
      ]);
    } else if (activeReportTab === 'satisfaction') {
      csvHeaders = ['Branch', 'Total Reviews', 'Average Rating (out of 5)', 'Net Promoter Score (NPS)'];
      csvRows = feedbackFiltered.map((r) => [
        r.branch, r.reviews, r.rating, r.nps
      ]);
    }

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    setScheduleSuccess(true);
    setTimeout(() => {
      setScheduleSuccess(false);
      setIsScheduleOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics Center"
        subtitle="Generate and export multi-branch performance reports, financial ledgers, booking manifests, and agent operational rollups."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Reports & Analytics' }
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
              icon={Printer}
              onClick={handlePrint}
            >
              Print Summary
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={Mail}
              onClick={() => setIsScheduleOpen(true)}
            >
              Schedule Email
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV Report
            </Button>
          </div>
        }
      />

      {/* Report Categories Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveReportTab('performance')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeReportTab === 'performance'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Branch Performance (Milestone 1 Agent)
        </button>

        <button
          onClick={() => setActiveReportTab('finance')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeReportTab === 'finance'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Financial & 8% Royalty Ledger
        </button>

        <button
          onClick={() => setActiveReportTab('bookings')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeReportTab === 'bookings'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Booking & Passenger Manifest
        </button>

        <button
          onClick={() => setActiveReportTab('packages')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeReportTab === 'packages'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Tour Package Occupancy
        </button>

        <button
          onClick={() => setActiveReportTab('satisfaction')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeReportTab === 'satisfaction'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          Customer NPS & Satisfaction
        </button>
      </div>

      {/* Date Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within report records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Reporting Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Current Month (Nov 2026)">Current Month (Nov 2026)</option>
              <option value="Current Quarter (Q4 2026)">Current Quarter (Q4 2026)</option>
              <option value="Year to Date (2026)">Year to Date (2026)</option>
            </select>
          </div>

          <Badge variant="default" size="sm">
            Format: CSV & Print Ready
          </Badge>
        </div>
      </div>

      {/* REPORT CONTENT VIEWS */}
      {activeReportTab === 'performance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Reported Total Revenue"
              value="₹31,50,000"
              subtext="Across 5 operational outlets"
              icon={DollarSign}
              variant="teal"
            />
            <MetricCard
              title="Overall Target"
              value="₹35,00,000"
              subtext="Deficit: ₹3,50,000"
              icon={BarChart3}
              variant="navy"
            />
            <MetricCard
              title="Average Achievement"
              value="90.0%"
              subtext="Mumbai & Pune on track"
              icon={CheckCircle2}
              variant="emerald"
            />
            <MetricCard
              title="Overall Cancellation Rate"
              value="7.17%"
              subtext="42 cancellations out of 586"
              icon={Filter}
              variant="amber"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Branch Performance Summary Table</h3>
              <span className="text-xs text-slate-400">{performanceFiltered.length} Outlets Reported</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 text-right">Target</th>
                    <th className="py-3 px-4 text-right">Revenue</th>
                    <th className="py-3 px-4 text-center">Bookings</th>
                    <th className="py-3 px-4 text-center">Cancellations</th>
                    <th className="py-3 px-4 text-center">Cancel Rate</th>
                    <th className="py-3 px-4 text-center">Achievement</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performanceFiltered.map((r) => (
                    <tr key={r.branch} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        {r.branch}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">{formatCurrency(r.target)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(r.revenue)}</td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-800">{r.bookings}</td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-800">{r.cancellations}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-semibold ${r.cancelRate > 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {r.cancelRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-bold text-xs px-2.5 py-1 rounded-full ${
                          r.achievement >= 95
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.achievement >= 80
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.achievement}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            r.status === 'Target Met' || r.status === 'On Track'
                              ? 'success'
                              : r.status === 'Deficit Alert'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Gross Revenue"
              value="₹31,50,000"
              subtext="Aggregated sales"
              icon={DollarSign}
              variant="teal"
            />
            <MetricCard
              title="Operating Expenses"
              value="₹22,80,000"
              subtext="Vendor & logistics"
              icon={Layers}
              variant="navy"
            />
            <MetricCard
              title="Franchise Royalties (8%)"
              value="₹2,52,000"
              subtext="Head Office receivable"
              icon={CheckCircle2}
              variant="emerald"
            />
            <MetricCard
              title="Average Net Margin"
              value="27.6%"
              subtext="Healthy profitability"
              icon={BarChart3}
              variant="amber"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Franchise Financial & Royalty Settlement Table</h3>
              <span className="text-xs text-slate-400">{financeFiltered.length} Branches</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 text-right">Revenue</th>
                    <th className="py-3 px-4 text-right">Operating Costs</th>
                    <th className="py-3 px-4 text-right">Net Profit</th>
                    <th className="py-3 px-4 text-center">Margin %</th>
                    <th className="py-3 px-4 text-right">8% Royalty Fee</th>
                    <th className="py-3 px-4 text-center">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financeFiltered.map((r) => (
                    <tr key={r.branch} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        {r.branch}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(r.revenue)}</td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">{formatCurrency(r.expenses)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">{formatCurrency(r.netProfit)}</td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-700">{r.margin}%</td>
                      <td className="py-3.5 px-4 text-right font-bold text-teal-700">{formatCurrency(r.royaltyFee)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={r.paymentStatus === 'Settled' ? 'success' : r.paymentStatus === 'Pending' ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {r.paymentStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Passenger Manifest & Booking Ledger</h3>
            <span className="text-xs text-slate-400">{bookingsFiltered.length} Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Tour Package</th>
                  <th className="py-3 px-4 text-center">Pax</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4">Travel Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookingsFiltered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{b.customerName}</td>
                    <td className="py-3.5 px-4">{b.branch}</td>
                    <td className="py-3.5 px-4 font-medium text-teal-700">{b.tourPackage}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{b.pax}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(b.amount)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={b.paymentStatus === 'Paid' ? 'success' : 'warning'} size="sm">
                        {b.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{b.travelDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'packages' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Tour Package Capacity & Occupancy Matrix</h3>
            <span className="text-xs text-slate-400">{packagesFiltered.length} Packages</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="py-3 px-4">Package Code</th>
                  <th className="py-3 px-4">Package Name</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-center">Capacity</th>
                  <th className="py-3 px-4 text-center">Booked</th>
                  <th className="py-3 px-4 text-center">Remaining</th>
                  <th className="py-3 px-4 text-center">Occupancy Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packagesFiltered.map((p) => {
                  const rate = Math.round((p.bookedSlots / p.totalSlots) * 100);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.destination}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.duration}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(p.price)}</td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-700">{p.totalSlots}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-teal-700">{p.bookedSlots}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">{p.availableSlots}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-bold text-xs px-2.5 py-1 rounded-full ${
                          rate >= 85
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'satisfaction' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Franchise Branch Customer NPS Comparison</h3>
            <span className="text-xs text-slate-400">{feedbackFiltered.length} Branches</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4 text-center">Total Customer Reviews</th>
                  <th className="py-3 px-4 text-center">Average Star Rating</th>
                  <th className="py-3 px-4 text-center">Net Promoter Score (NPS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackFiltered.map((f) => (
                  <tr key={f.branch} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      {f.branch} Outlet
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">{f.reviews} Reviews</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-amber-600">★ {f.rating} / 5.0</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block font-bold text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        NPS +{f.nps}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Email Report Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Automated Operational Report"
        subtitle="Receive automated recurring PDF / CSV digests directly in your inbox"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleScheduleSubmit}>
              Schedule Report
            </Button>
          </>
        }
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs sm:text-sm">
          {scheduleSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Automated report schedule configured successfully!
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Email *</label>
                <input
                  type="email"
                  required
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency *</label>
                  <select
                    value={scheduleFreq}
                    onChange={(e) => setScheduleFreq(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Daily">Daily Summary</option>
                    <option value="Weekly">Weekly Digest (Monday 08:00 AM)</option>
                    <option value="Monthly">Monthly Financial P&L</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Format *</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="CSV">CSV Data Ledger</option>
                    <option value="PDF">Formatted PDF Executive Report</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                Scheduled digest will include current filtered branch scope ({userBranch}) and active report modules.
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};
