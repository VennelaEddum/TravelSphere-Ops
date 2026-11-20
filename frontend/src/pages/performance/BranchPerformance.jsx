import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  BarChart3,
  Building2,
  CalendarCheck,
  Coins,
  Ban,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Award
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
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

const FULL_BRANCH_METRICS = [
  {
    rank: 1,
    branch: 'Bengaluru',
    revenue: 500000,
    target: 420000,
    bookings: 160,
    cancellations: 7,
    cancellationRate: 4.38,
    achievement: 119.05,
    score: 96.2,
    status: 'Achieved Target'
  },
  {
    rank: 2,
    branch: 'Mumbai',
    revenue: 450000,
    target: 400000,
    bookings: 210,
    cancellations: 12,
    cancellationRate: 5.71,
    achievement: 112.50,
    score: 93.8,
    status: 'Achieved Target'
  },
  {
    rank: 3,
    branch: 'Hyderabad',
    revenue: 420000,
    target: 400000,
    bookings: 190,
    cancellations: 15,
    cancellationRate: 7.89,
    achievement: 105.00,
    score: 88.5,
    status: 'Achieved Target'
  },
  {
    rank: 4,
    branch: 'Pune',
    revenue: 380000,
    target: 400000,
    bookings: 175,
    cancellations: 9,
    cancellationRate: 5.14,
    achievement: 95.00,
    score: 84.0,
    status: 'Below Target'
  },
  {
    rank: 5,
    branch: 'Nagpur',
    revenue: 250000,
    target: 350000,
    bookings: 110,
    cancellations: 18,
    cancellationRate: 16.36,
    achievement: 71.43,
    score: 62.4,
    status: 'Critical Alert'
  }
];

const DAILY_PERF_TREND = [
  { date: '15 Nov', Mumbai: 380000, Bengaluru: 420000, Hyderabad: 350000, Pune: 320000, Nagpur: 220000 },
  { date: '16 Nov', Mumbai: 410000, Bengaluru: 450000, Hyderabad: 380000, Pune: 340000, Nagpur: 230000 },
  { date: '17 Nov', Mumbai: 430000, Bengaluru: 480000, Hyderabad: 400000, Pune: 360000, Nagpur: 240000 },
  { date: '18 Nov', Mumbai: 450000, Bengaluru: 500000, Hyderabad: 420000, Pune: 380000, Nagpur: 250000 }
];

export const BranchPerformance = () => {
  const { user, role, selectedBranch } = useAuth();

  // If role is Franchise Owner, lock down to user's assigned branch
  const activeBranch = role === ROLES.FRANCHISE_OWNER ? (user?.branchName || 'Mumbai') : selectedBranch;

  const displayData = activeBranch === 'All Branches'
    ? FULL_BRANCH_METRICS
    : FULL_BRANCH_METRICS.filter(b => b.branch === activeBranch);

  const totalBranches = displayData.length;
  const totalRevenue = displayData.reduce((acc, c) => acc + c.revenue, 0);
  const totalTarget = displayData.reduce((acc, c) => acc + c.target, 0);
  const totalBookings = displayData.reduce((acc, c) => acc + c.bookings, 0);
  const totalCancellations = displayData.reduce((acc, c) => acc + c.cancellations, 0);
  const overallCancellationRate = totalBookings > 0 ? (totalCancellations / totalBookings) * 100 : 0;
  const avgScore = (displayData.reduce((acc, c) => acc + c.score, 0) / (totalBranches || 1)).toFixed(1);

  // CSV download generator
  const handleExportCSV = () => {
    const headers = 'Rank,Branch,Actual Revenue,Target,Achievement (%),Bookings,Cancellations,Cancellation Rate (%),Performance Score,Status\n';
    const rows = displayData.map(b =>
      `${b.rank},"${b.branch}",${b.revenue},${b.target},${b.achievement}%,${b.bookings},${b.cancellations},${b.cancellationRate}%,${b.score},"${b.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `outlet_performance_${activeBranch.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Performance Analysis"
        subtitle="Milestone 1 Core Module: Audited branch performance metrics, revenue trajectories, target benchmarking, and cancellation scoring."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Branch Performance' }
        ]}
        badge={
          <Badge variant="primary" size="sm" className="bg-teal-50 text-teal-700 border-teal-200">
            Milestone 1 Agent
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg hidden sm:inline-block">
              ⚡ Python Performance Agent Verified Data
            </span>
            <Button variant="secondary" size="md" icon={Download} onClick={handleExportCSV}>
              Export Performance CSV
            </Button>
          </div>
        }
      />

      {/* 5 Milestone 1 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Monitored Branches"
          value={formatNumber(totalBranches)}
          subtext={activeBranch === 'All Branches' ? 'All active franchises' : `${activeBranch} Outlet`}
          icon={Building2}
          variant="teal"
        />

        <MetricCard
          title="Total Bookings"
          value={formatNumber(totalBookings)}
          subtext="Volume processed"
          icon={CalendarCheck}
          variant="navy"
          trend="+12% MoM"
          trendType="up"
        />

        <MetricCard
          title="Actual Revenue"
          value={formatLakhs(totalRevenue)}
          subtext={`Target: ${formatLakhs(totalTarget)}`}
          icon={Coins}
          variant="emerald"
          trend={totalRevenue >= totalTarget ? 'Target Achieved' : 'Deficit'}
          trendType={totalRevenue >= totalTarget ? 'up' : 'down'}
        />

        <MetricCard
          title="Cancellation Rate"
          value={formatPercent(overallCancellationRate)}
          subtext={`${totalCancellations} total cancels`}
          icon={Ban}
          variant="amber"
          trend="Threshold: < 10%"
          trendType={overallCancellationRate < 10 ? 'up' : 'down'}
        />

        <MetricCard
          title="Performance Index"
          value={`${avgScore} / 100`}
          subtext="Multi-factor score"
          icon={Award}
          variant="indigo"
          trend="Strong"
          trendType="up"
        />
      </div>

      {/* Primary Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue vs Target Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Branch Revenue vs. Revenue Target</h3>
              <p className="text-xs text-slate-500">Benchmark comparison of actual revenue vs assigned targets</p>
            </div>
            <Badge variant="primary" size="sm">Milestone 1 Benchmark</Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <h3 className="text-sm font-bold text-slate-900">Daily Revenue Trajectory (15-18 Nov)</h3>
              <p className="text-xs text-slate-500">Trend comparison across franchise network</p>
            </div>
            <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Trajectory
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DAILY_PERF_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {activeBranch === 'All Branches' ? (
                  <>
                    <Line type="monotone" dataKey="Bengaluru" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Mumbai" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Hyderabad" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Pune" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Nagpur" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </>
                ) : (
                  <Line type="monotone" dataKey={activeBranch} stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} name={`${activeBranch} Revenue`} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branch Performance Rankings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Branch Performance Ranking & Scoring Ledger</h3>
            <p className="text-xs text-slate-500">
              Evaluated with Python Agentic heuristics: Achievement % + Booking Volume - Cancellation Penalty
            </p>
          </div>
          <Badge variant="default" size="sm">5 Outlets Evaluated</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-center">Rank</th>
                <th className="py-3 px-4 font-semibold">Franchise Branch</th>
                <th className="py-3 px-4 font-semibold">Actual Revenue</th>
                <th className="py-3 px-4 font-semibold">Target Revenue</th>
                <th className="py-3 px-4 font-semibold">Achievement (%)</th>
                <th className="py-3 px-4 font-semibold">Bookings</th>
                <th className="py-3 px-4 font-semibold">Cancellation Rate</th>
                <th className="py-3 px-4 font-semibold">Score Index</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.map((b) => (
                <tr key={b.branch} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                      b.rank === 1 ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' :
                      b.rank === 2 ? 'bg-slate-200 text-slate-800' :
                      b.rank === 3 ? 'bg-amber-50 text-amber-900' : 'text-slate-500'
                    }`}>
                      {b.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{b.branch}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(b.revenue)}</td>
                  <td className="py-3 px-4 text-slate-500">{formatCurrency(b.target)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${b.achievement >= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatPercent(b.achievement)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{b.bookings} pax</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${b.cancellationRate > 10 ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                      {formatPercent(b.cancellationRate)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {b.score} / 100
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={b.achievement >= 100 ? 'success' : b.cancellationRate > 10 ? 'danger' : 'warning'} size="sm">
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top vs Underperforming Highlights & Heuristic Alerts */}
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
            <Badge variant="success" size="sm">Benchmark</Badge>
          </div>

          <div className="mt-4 space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Bengaluru Flagship Outlet</p>
                <p className="text-xs text-slate-500">₹5,00,000 Revenue &bull; ₹80,000 Surplus &bull; 4.38% Cancel Rate</p>
              </div>
              <span className="text-sm font-bold text-emerald-600">+119.05%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Mumbai West Outlet</p>
                <p className="text-xs text-slate-500">₹4,50,000 Revenue &bull; 210 Bookings (Highest Volume)</p>
              </div>
              <span className="text-sm font-bold text-emerald-600">+112.50%</span>
            </div>
          </div>
        </div>

        {/* Underperforming Outlets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <ArrowDownRight className="w-4 h-4" />
              </span>
              Underperforming Outlets Requiring Intervention
            </h3>
            <Badge variant="danger" size="sm">Action Required</Badge>
          </div>

          <div className="mt-4 space-y-3">
            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Nagpur Central Outlet</p>
                <p className="text-xs text-rose-700">₹1,00,000 Target Deficit &bull; 16.36% Cancellation Spike</p>
              </div>
              <span className="text-sm font-bold text-rose-600">71.43%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Pune Deccan Pride Outlet</p>
                <p className="text-xs text-amber-700">₹20,000 Minor Deficit &bull; 5.14% Cancellation Rate</p>
              </div>
              <span className="text-sm font-bold text-amber-600">95.00%</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Cards (Milestone 1 Agent Heuristics) */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-950 to-teal-950 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">Performance Agent Strategic Recommendations</h3>
          </div>
          <Badge variant="navy" size="sm" className="bg-teal-400/20 text-teal-300 border-teal-400/30">
            Milestone 1 Logic
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-navy-800/60 border border-navy-700/60 text-xs leading-relaxed space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-300">Nagpur Action Plan: Deficit Recovery</span>
              <span className="text-[10px] text-rose-400 font-semibold uppercase">High Priority</span>
            </div>
            <p className="text-slate-300">
              Nagpur is operating ₹1,00,000 below target. Review booking performance and customer enquiries. Reallocate ₹25,000 promotional budget to Goa flash sales and investigate 18 cancellations for vendor refund bottlenecks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-800/60 border border-navy-700/60 text-xs leading-relaxed space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-300">Bengaluru & Mumbai: Capacity Expansion</span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Opportunity</span>
            </div>
            <p className="text-slate-300">
              Both branches have exceeded target (&gt;112%). Booking trends indicate unmet demand for Himachal and Kerala departures. The Performance Agent suggests adding 15 additional seats with airline and hotel partners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
