import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  CalendarCheck,
  Coins,
  Ban,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatLakhs, formatPercent, formatNumber } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

// Seed data from TravelSphere SQLite records
const BRANCH_DATA = [
  { branch: 'Bengaluru', revenue: 500000, target: 420000, bookings: 160, cancellations: 7, achievement: 119.05, status: 'Achieved Target' },
  { branch: 'Mumbai', revenue: 450000, target: 400000, bookings: 210, cancellations: 12, achievement: 112.50, status: 'Achieved Target' },
  { branch: 'Hyderabad', revenue: 420000, target: 400000, bookings: 190, cancellations: 15, achievement: 105.00, status: 'Achieved Target' },
  { branch: 'Pune', revenue: 380000, target: 400000, bookings: 175, cancellations: 9, achievement: 95.00, status: 'Below Target' },
  { branch: 'Nagpur', revenue: 250000, target: 350000, bookings: 110, cancellations: 18, achievement: 71.43, status: 'Below Target' }
];

const DAILY_TRENDS = [
  { date: '15 Nov', Mumbai: 380000, Bengaluru: 420000, Hyderabad: 350000, Pune: 320000, Nagpur: 220000 },
  { date: '16 Nov', Mumbai: 410000, Bengaluru: 450000, Hyderabad: 380000, Pune: 340000, Nagpur: 230000 },
  { date: '17 Nov', Mumbai: 430000, Bengaluru: 480000, Hyderabad: 400000, Pune: 360000, Nagpur: 240000 },
  { date: '18 Nov', Mumbai: 450000, Bengaluru: 500000, Hyderabad: 420000, Pune: 380000, Nagpur: 250000 }
];

const RECENT_ACTIVITIES = [
  { id: 1, action: 'Nagpur branch revenue warning triggered by Outlet Agent', time: '12 mins ago', type: 'warning' },
  { id: 2, action: 'Bengaluru achieved 119% of monthly target', time: '45 mins ago', type: 'success' },
  { id: 3, action: 'New tour package "Goa Sun & Sand" published across all branches', time: '2 hours ago', type: 'info' },
  { id: 4, action: 'Mumbai branch processed 210 bookings with 5.7% cancellation rate', time: '4 hours ago', type: 'info' },
  { id: 5, action: 'Weekly SOP audit completed for Hyderabad franchise outlet', time: '1 day ago', type: 'success' }
];

export const SuperAdminDashboard = () => {
  const { selectedBranch } = useAuth();

  // If Super Admin selects a single branch from the header, filter metrics accordingly
  const displayBranches = selectedBranch === 'All Branches'
    ? BRANCH_DATA
    : BRANCH_DATA.filter(b => b.branch === selectedBranch);

  const totalBranches = BRANCH_DATA.length;
  const totalRevenue = displayBranches.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalTarget = displayBranches.reduce((acc, curr) => acc + curr.target, 0);
  const totalBookings = displayBranches.reduce((acc, curr) => acc + curr.bookings, 0);
  const totalCancellations = displayBranches.reduce((acc, curr) => acc + curr.cancellations, 0);
  const overallCancellationRate = totalBookings > 0 ? (totalCancellations / totalBookings) * 100 : 0;
  const overallAchievement = totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Scope banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              Franchise-Wide Executive Command Center
              <Badge variant="navy" size="sm" className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                Head Office
              </Badge>
            </h2>
            <p className="text-xs text-slate-300">
              Active Scope: <strong className="text-white">{selectedBranch}</strong> &bull; Aggregating real-time outlet operations and financial milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="h-9 px-2.5 py-1 bg-white rounded-xl shadow-xs flex items-center justify-center shrink-0">
            <img
              src="/assets/travelsphere-ops-logo.png"
              alt="TRAVELSPHERE OPS"
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="text-right flex items-center gap-2 text-xs text-teal-300 bg-navy-950/60 px-3 py-1.5 rounded-lg border border-navy-700 hidden sm:flex">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Agentic Intelligence Active</span>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Franchise Outlets"
          value={selectedBranch === 'All Branches' ? `${totalBranches} Branches` : '1 Branch'}
          subtext={selectedBranch === 'All Branches' ? 'Active across 5 cities' : `${selectedBranch} Outlet`}
          icon={Building2}
          variant="teal"
          trend="+1 New"
          trendType="up"
        />

        <MetricCard
          title="Total Bookings"
          value={formatNumber(totalBookings)}
          subtext="Combined monthly volume"
          icon={CalendarCheck}
          variant="navy"
          trend="+14.2% MoM"
          trendType="up"
        />

        <MetricCard
          title="Total Revenue"
          value={formatLakhs(totalRevenue)}
          subtext={`Target: ${formatLakhs(totalTarget)} (${formatPercent(overallAchievement)})`}
          icon={Coins}
          variant="emerald"
          trend="+8.5% vs target"
          trendType={overallAchievement >= 100 ? 'up' : 'down'}
        />

        <MetricCard
          title="Cancellation Rate"
          value={formatPercent(overallCancellationRate)}
          subtext={`${totalCancellations} cancelled bookings`}
          icon={Ban}
          variant="amber"
          trend="-1.4% vs last week"
          trendType="up"
        />
      </div>

      {/* Primary Visualizations: Revenue vs Target & Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue vs Target Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Branch Revenue vs. Revenue Target</h3>
              <p className="text-xs text-slate-500">Benchmark comparison of actual revenue against targets</p>
            </div>
            <Badge variant="primary" size="sm">Milestone 1</Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayBranches} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="branch" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Actual Revenue (₹)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target (₹)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Revenue Trend Line Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Revenue Trajectory</h3>
              <p className="text-xs text-slate-500">4-day historical trend across top branches</p>
            </div>
            <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Upward
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DAILY_TRENDS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {selectedBranch === 'All Branches' ? (
                  <>
                    <Line type="monotone" dataKey="Bengaluru" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Mumbai" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Hyderabad" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Pune" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Nagpur" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </>
                ) : (
                  <Line type="monotone" dataKey={selectedBranch} stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} name={`${selectedBranch} Daily Revenue`} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top vs Underperforming Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
              </span>
              Top Performing Outlets
            </h3>
            <Badge variant="success" size="sm">Target Exceeded</Badge>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Bengaluru Outlet</p>
                <p className="text-xs text-slate-500">Revenue: ₹5,00,000 &bull; Target: ₹4,20,000</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600">+119.05%</span>
                <p className="text-[10px] text-slate-400">Lowest Cancellations (4.3%)</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Mumbai Outlet</p>
                <p className="text-xs text-slate-500">Revenue: ₹4,50,000 &bull; Target: ₹4,00,000</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600">+112.50%</span>
                <p className="text-[10px] text-slate-400">210 Bookings (Highest)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Underperforming Attention Needed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <ArrowDownRight className="w-4 h-4" />
              </span>
              Underperforming Branches Needing Attention
            </h3>
            <Badge variant="danger" size="sm">Action Required</Badge>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Nagpur Outlet</p>
                <p className="text-xs text-rose-700">₹1,00,000 below target &bull; 16.3% cancellations</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-rose-600">71.43%</span>
                <p className="text-[10px] text-rose-500">Critical Alert</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Pune Outlet</p>
                <p className="text-xs text-amber-700">₹20,000 below target &bull; 5.1% cancellations</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-600">95.00%</span>
                <p className="text-[10px] text-amber-500">Minor Gap</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Performance Summary Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Outlet Performance Ledger</h3>
            <p className="text-xs text-slate-500">Audited metrics from TravelSphere Ops operational ledger</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Franchise Branch</th>
                <th className="py-3 px-4 font-semibold">Actual Revenue</th>
                <th className="py-3 px-4 font-semibold">Target Revenue</th>
                <th className="py-3 px-4 font-semibold">Achievement (%)</th>
                <th className="py-3 px-4 font-semibold">Bookings</th>
                <th className="py-3 px-4 font-semibold">Cancellations</th>
                <th className="py-3 px-4 font-semibold">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayBranches.map((b) => (
                <tr key={b.branch} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{b.branch}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{formatCurrency(b.revenue)}</td>
                  <td className="py-3 px-4 text-slate-500">{formatCurrency(b.target)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${b.achievement >= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatPercent(b.achievement)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{b.bookings}</td>
                  <td className="py-3 px-4 text-slate-700">{b.cancellations}</td>
                  <td className="py-3 px-4">
                    <Badge variant={b.achievement >= 100 ? 'success' : 'danger'} size="sm">
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent System Activity and AI Insight Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent System Activities */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Recent System Activities
          </h3>
          <div className="space-y-3">
            {RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  act.type === 'warning' ? 'bg-rose-500' : act.type === 'success' ? 'bg-emerald-500' : 'bg-teal-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{act.action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Preview */}
        <div className="lg:col-span-6 bg-gradient-to-br from-teal-900 to-navy-950 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Outlet Performance Agent Recommendation
              </span>
              <Badge variant="navy" size="sm" className="bg-teal-400/20 text-teal-300 border-teal-400/30">
                Automated
              </Badge>
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Action Plan: Rebalance Nagpur & Pune Promotional Allocations
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nagpur is currently lagging with an achievement deficit of ₹1,00,000 and elevated cancellations (16.3%). The Performance Agent recommends deploying the "Heritage Rajasthan" flash discount campaign to Nagpur leads and reviewing supplier cancellation terms.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-800/60 flex items-center justify-between text-xs text-teal-300">
            <span>Confidence Index: 94.8%</span>
            <span className="font-semibold text-white cursor-pointer hover:underline flex items-center gap-1">
              View Detailed AI Analysis &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
