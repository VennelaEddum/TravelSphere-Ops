import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  BarChart2,
  PieChart as PieIcon,
  CheckCircle2,
  Calendar,
  Eye,
  Edit,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_CAMPAIGNS, CHANNEL_DISTRIBUTION, FUNNEL_DATA } from '../../mock/marketingData';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const MarketingCampaigns = () => {
  const { user, selectedBranch } = useAuth();

  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    channel: 'Meta Ads (Instagram & FB)',
    targetBranch: 'All Branches',
    budget: 50000,
    startDate: '01 Dec 2026',
    endDate: '25 Dec 2026'
  });

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetBranch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === 'All' || c.channel.includes(channelFilter);
    return matchesSearch && matchesChannel;
  });

  const activeCount = campaigns.filter((c) => c.status === 'Active').length;
  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leads, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const conversionRate = ((totalConversions / (totalLeads || 1)) * 100).toFixed(1);

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      channel: 'Meta Ads (Instagram & FB)',
      targetBranch: 'All Branches',
      budget: 60000,
      startDate: '01 Dec 2026',
      endDate: '25 Dec 2026'
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newCamp = {
      id: Date.now(),
      name: formData.name,
      channel: formData.channel,
      targetBranch: formData.targetBranch,
      budget: Number(formData.budget),
      spend: 0,
      leads: 0,
      conversions: 0,
      cpc: 20.0,
      roi: 'Projected 300%',
      status: 'Active',
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    setCampaigns([newCamp, ...campaigns]);
    setIsAddOpen(false);
  };

  const handleOpenEdit = (c) => {
    setSelectedCampaign(c);
    setFormData({ ...c });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setCampaigns(
      campaigns.map((c) => (c.id === selectedCampaign.id ? { ...c, ...formData } : c))
    );
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing & Growth Campaigns (Marketing Agent)"
        subtitle="Analyze paid acquisition channels, customer inquiry funnels, conversion rates, and promotional ROI across franchise branches."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Marketing & Campaigns' }
        ]}
        actions={
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            Launch New Campaign
          </Button>
        }
      />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Paid Campaigns"
          value={formatNumber(activeCount)}
          subtext="Meta, Google & Print channels"
          icon={Megaphone}
          variant="teal"
        />

        <MetricCard
          title="Total Marketing Spend"
          value={formatCurrency(totalSpend)}
          subtext="Allocated across all outlets"
          icon={DollarSign}
          variant="navy"
        />

        <MetricCard
          title="Total Inquiries & Leads"
          value={`${formatNumber(totalLeads)} Leads`}
          subtext="Verified traveler inquiries"
          icon={Users}
          variant="indigo"
          trend="+22% this week"
          trendType="up"
        />

        <MetricCard
          title="Inquiry Conversion Rate"
          value={`${conversionRate}%`}
          subtext={`${totalConversions} confirmed bookings`}
          icon={Target}
          variant="emerald"
          trend="Benchmark: >10%"
          trendType="up"
        />
      </div>

      {/* Visual Analytics: Channel Spend & Lead Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Channel Spend Breakdown Bar Chart */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Marketing Channel Budget Distribution</h3>
              <p className="text-xs text-slate-500">Spend comparison across digital and print media</p>
            </div>
            <Badge variant="primary" size="sm">Channel Mix</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHANNEL_DISTRIBUTION} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Budget Spend']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="spend" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Inquiry-to-Booking Conversion Funnel</h3>
                <p className="text-xs text-slate-500">Drop-off analysis from impression to paid booking</p>
              </div>
              <Badge variant="success" size="sm">31.7% Close Rate</Badge>
            </div>

            <div className="space-y-3">
              {FUNNEL_DATA.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{step.stage}</span>
                    <span className="text-slate-500 font-medium">
                      {formatNumber(step.count)} ({step.rate})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-teal-700 h-full rounded-full"
                      style={{ width: `${100 - idx * 18}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Marketing Agent Recommendation:</span>
            <span className="text-teal-600 font-semibold">Scale Meta Video Reels (+3.2x ROI)</span>
          </div>
        </div>
      </div>

      {/* Campaigns Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns, channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Channels</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Google">Google Search</option>
              <option value="Influencer">Influencer</option>
              <option value="Email">Email Blast</option>
              <option value="Offline">Offline Print</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns found"
            description="Adjust your search criteria or create a new campaign."
            onReset={() => {
              setSearchQuery('');
              setChannelFilter('All');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Campaign Name</th>
                  <th className="py-3 px-4 font-semibold">Channel</th>
                  <th className="py-3 px-4 font-semibold">Target Branch</th>
                  <th className="py-3 px-4 font-semibold">Budget (₹)</th>
                  <th className="py-3 px-4 font-semibold">Spend (₹)</th>
                  <th className="py-3 px-4 font-semibold">Leads</th>
                  <th className="py-3 px-4 font-semibold">Conversions</th>
                  <th className="py-3 px-4 font-semibold">ROI</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{c.channel}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{c.targetBranch}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{formatCurrency(c.budget)}</td>
                    <td className="py-3.5 px-4 text-slate-700">{formatCurrency(c.spend)}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-bold">{c.leads}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">{c.conversions}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        {c.roi}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={c.status === 'Active' ? 'success' : 'warning'} size="sm" dot>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                        title="Edit Campaign"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Campaign Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Marketing Campaign"
        subtitle="Set promotional channel, target outlet, and budget parameters."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdd}>
              Launch Campaign
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. New Year Kashmir Honeymoon Blitz"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Channel</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Meta Ads (Instagram & FB)">Meta Ads (Instagram & FB)</option>
                <option value="Google Search Ads">Google Search Ads</option>
                <option value="Influencer & YouTube Collab">Influencer & YouTube</option>
                <option value="Email Marketing (Loyalty)">Email Marketing</option>
                <option value="Offline Newspapers & Banners">Offline Print</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Branch</label>
              <select
                value={formData.targetBranch}
                onChange={(e) => setFormData({ ...formData, targetBranch: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All Branches">All Branches (Franchise-Wide)</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Nagpur">Nagpur</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget (₹)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="text"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${selectedCampaign?.name}`}
        subtitle="Modify budget or timeline."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Update Campaign
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Budget (₹)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
