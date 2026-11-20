import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  Filter,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  FINANCE_SUMMARY,
  BRANCH_FINANCIALS,
  MONTHLY_FINANCIAL_TREND,
  EXPENSE_CATEGORIES
} from '../../mock/financeData';
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const FinanceRevenue = () => {
  const { user, role, selectedBranch } = useAuth();

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const userBranch = isSuperAdmin ? selectedBranch : (user?.branchName || 'Mumbai');

  const [dateRange, setDateRange] = useState('Current Cycle (Nov 2026)');

  // Filtered branch financials
  const displayBranches = userBranch === 'All Branches'
    ? BRANCH_FINANCIALS
    : BRANCH_FINANCIALS.filter((b) => b.branch === userBranch);

  const totalRevenue = displayBranches.reduce((acc, b) => acc + b.revenue, 0);
  const totalExpenses = displayBranches.reduce((acc, b) => acc + b.operatingCosts, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
  const totalRoyalty = displayBranches.reduce((acc, b) => acc + b.royaltyDue, 0);

  // CSV Export Handler
  const handleExportFinancialReport = () => {
    const headers = 'Branch,Revenue,Operating Costs,Staff Payroll,Marketing,Net Profit,Net Margin (%),Royalty Due (8%),Royalty Status\n';
    const rows = displayBranches.map(b =>
      `"${b.branch}",${b.revenue},${b.operatingCosts},${b.payroll},${b.marketing},${b.netProfit},${b.netMargin},${b.royaltyDue},"${b.royaltyStatus}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_pnl_${userBranch.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Franchise Revenue Management"
        subtitle="Audited financial statements, branch profit & loss accounts, operating expense distributions, and franchise royalty tracking."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Finance & Revenue' }
        ]}
        badge={
          <Badge variant="navy" size="sm" className="bg-teal-500/20 text-teal-700 border-teal-500/30">
            {isSuperAdmin ? 'Head Office Global' : `${userBranch} P&L`}
          </Badge>
        }
        actions={
          <Button variant="secondary" size="md" icon={Download} onClick={handleExportFinancialReport}>
            Export Financial Report (CSV)
          </Button>
        }
      />

      {/* Top 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gross Bookings Revenue"
          value={formatLakhs(totalRevenue)}
          subtext={`Exact: ${formatCurrency(totalRevenue)}`}
          icon={Coins}
          variant="teal"
          trend="+8.2% vs target"
          trendType="up"
        />

        <MetricCard
          title="Operating Expenses"
          value={formatLakhs(totalExpenses)}
          subtext="Hotels, transport & payroll"
          icon={TrendingDown}
          variant="amber"
          trend="Controlled (< 68%)"
          trendType="up"
        />

        <MetricCard
          title="Net Franchise Profit"
          value={formatLakhs(netProfit)}
          subtext={`Net margin: ${profitMargin}%`}
          icon={TrendingUp}
          variant="emerald"
          trend="+14% MoM"
          trendType="up"
        />

        <MetricCard
          title="Franchise Royalty (8%)"
          value={formatCurrency(totalRoyalty)}
          subtext="Head Office entitlement"
          icon={DollarSign}
          variant="navy"
          trend="Collection status: Normal"
          trendType="up"
        />
      </div>

      {/* Visual Analytics: 6-Month Trajectory & Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue & Profit Trajectory Area Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue & Net Profit Trajectory (6 Months)</h3>
              <p className="text-xs text-slate-500">Historical performance from June 2026 to November 2026</p>
            </div>
            <Badge variant="primary" size="sm">H2 2026</Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_FINANCIAL_TREND} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 100000}L`} tickLine={false} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Gross Revenue (₹)" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Net Profit (₹)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operating Expense Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Operating Expense Breakdown</h3>
                <p className="text-xs text-slate-500">Resource and partner disbursements</p>
              </div>
              <Badge variant="default" size="sm">Cost Centers</Badge>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={EXPENSE_CATEGORIES}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {EXPENSE_CATEGORIES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Expense']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Legend List */}
            <div className="space-y-1.5 mt-2">
              {EXPENSE_CATEGORIES.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="text-slate-700 truncate max-w-[180px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Branch P&L and Royalty Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Branch Profit & Loss (P&L) and Royalty Ledger</h3>
            <p className="text-xs text-slate-500">Audited monthly financials with mandatory 8% franchise royalty calculation</p>
          </div>
          <Badge variant="success" size="sm">Current Billing Cycle</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Franchise Branch</th>
                <th className="py-3 px-4 font-semibold">Revenue (₹)</th>
                <th className="py-3 px-4 font-semibold">Target (₹)</th>
                <th className="py-3 px-4 font-semibold">Operating Costs</th>
                <th className="py-3 px-4 font-semibold">Staff Payroll</th>
                <th className="py-3 px-4 font-semibold">Net Profit</th>
                <th className="py-3 px-4 font-semibold">Net Margin</th>
                <th className="py-3 px-4 font-semibold">Royalty Due (8%)</th>
                <th className="py-3 px-4 font-semibold">Royalty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayBranches.map((b) => (
                <tr key={b.branch} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.branch} Outlet</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(b.revenue)}</td>
                  <td className="py-3.5 px-4 text-slate-500">{formatCurrency(b.target)}</td>
                  <td className="py-3.5 px-4 text-slate-700">{formatCurrency(b.operatingCosts)}</td>
                  <td className="py-3.5 px-4 text-slate-700">{formatCurrency(b.payroll)}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">{formatCurrency(b.netProfit)}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{b.netMargin}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{formatCurrency(b.royaltyDue)}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={b.royaltyStatus === 'Paid' ? 'success' : 'warning'} size="sm" dot>
                      {b.royaltyStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
