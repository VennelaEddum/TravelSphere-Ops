import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  CalendarCheck,
  Coins,
  Ban,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
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
  Area
} from 'recharts';

// Data strictly for Mumbai branch (assigned outlet)
const MUMBAI_DAILY_DATA = [
  { date: '15 Nov', revenue: 380000, target: 400000, bookings: 175, cancellations: 10 },
  { date: '16 Nov', revenue: 410000, target: 400000, bookings: 190, cancellations: 11 },
  { date: '17 Nov', revenue: 430000, target: 400000, bookings: 200, cancellations: 10 },
  { date: '18 Nov', revenue: 450000, target: 400000, bookings: 210, cancellations: 12 },
];

const RECENT_MUMBAI_BOOKINGS = [
  { id: 'BK-1082', customer: 'Aarav Malhotra', package: 'Kerala Backwaters & Tea Gardens', date: '18 Nov 2026', pax: 3, amount: 68000, status: 'Confirmed' },
  { id: 'BK-1081', customer: 'Pooja Deshmukh', package: 'Goa Coastal Adventure', date: '18 Nov 2026', pax: 2, amount: 32000, status: 'Confirmed' },
  { id: 'BK-1080', customer: 'Rohan Joshi', package: 'Shimla & Manali Snow Trail', date: '17 Nov 2026', pax: 4, amount: 95000, status: 'Confirmed' },
  { id: 'BK-1079', customer: 'Sneha Patel', package: 'Golden Triangle Expedition', date: '17 Nov 2026', pax: 2, amount: 48000, status: 'Completed' },
  { id: 'BK-1078', customer: 'Vikram Mehta', package: 'Kashmir Paradise Odyssey', date: '16 Nov 2026', pax: 2, amount: 72000, status: 'Cancelled' }
];

const MUMBAI_FEEDBACK = [
  { id: 1, customer: 'Aarav M.', rating: 5, comment: 'Excellent coordination from Mumbai team! The houseboat experience in Alleppey was seamless.', tour: 'Kerala Tour' },
  { id: 2, customer: 'Pooja D.', rating: 5, comment: 'Prompt responses and great hotel recommendations in South Goa.', tour: 'Goa Package' },
  { id: 3, customer: 'Rohan J.', rating: 4, comment: 'Well organized itinerary. Bus transport could have been slightly earlier.', tour: 'Himachal Trail' }
];

export const FranchiseOwnerDashboard = () => {
  const { user } = useAuth();
  const branchName = user?.branchName || 'Mumbai';

  const latestStats = MUMBAI_DAILY_DATA[MUMBAI_DAILY_DATA.length - 1];
  const achievementRate = (latestStats.revenue / latestStats.target) * 100;
  const cancellationRate = (latestStats.cancellations / latestStats.bookings) * 100;
  const surplus = latestStats.revenue - latestStats.target;

  return (
    <div className="space-y-6">
      {/* Branch Identity Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              {branchName} Franchise Outlet &bull; Operational Dashboard
              <Badge variant="navy" size="sm" className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                Franchise Owner
              </Badge>
            </h2>
            <p className="text-xs text-slate-300">
              Location: <strong>Mumbai, Maharashtra (Western Hub)</strong> &bull; Scoped strictly to your franchise outlet data.
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
          <div className="text-right flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800 hidden sm:flex">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Revenue Target Achieved (112.5%)</span>
          </div>
        </div>
      </div>

      {/* Branch KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Branch Total Bookings"
          value={formatNumber(latestStats.bookings)}
          subtext="Processed this cycle"
          icon={CalendarCheck}
          variant="teal"
          trend="+10 Bookings today"
          trendType="up"
        />

        <MetricCard
          title="Branch Revenue"
          value={formatCurrency(latestStats.revenue)}
          subtext={`Target: ${formatCurrency(latestStats.target)}`}
          icon={Coins}
          variant="emerald"
          trend={`+${formatCurrency(surplus)} surplus`}
          trendType="up"
        />

        <MetricCard
          title="Target Achievement"
          value={formatPercent(achievementRate)}
          subtext="Goal: ₹4,00,000"
          icon={TrendingUp}
          variant="navy"
          trend="Exceeded by 12.5%"
          trendType="up"
        />

        <MetricCard
          title="Cancellation Rate"
          value={formatPercent(cancellationRate)}
          subtext={`${latestStats.cancellations} out of ${latestStats.bookings} bookings`}
          icon={Ban}
          variant="amber"
          trend="Healthy (< 6.0%)"
          trendType="up"
        />
      </div>

      {/* Revenue Progress & Historical Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Branch Target Progress Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Monthly Revenue Goal Status</h3>
              <Badge variant="success" size="sm">112.5% Achieved</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Your branch has surpassed its monthly baseline target by ₹50,000.
            </p>

            {/* Target Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Progress to Target</span>
                <span className="text-emerald-600">{formatPercent(achievementRate)}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(achievementRate, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Baseline: ₹0</span>
                <span>Target: ₹4,00,000</span>
                <span>Current: ₹4,50,000</span>
              </div>
            </div>

            {/* Operational Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bookings:</span>
                <span className="font-bold text-slate-800">210 passengers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Cancellations:</span>
                <span className="font-bold text-slate-800">12 passengers (5.71%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Average Booking Value:</span>
                <span className="font-bold text-slate-800">₹2,142 / booking</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Milestone 1 Benchmark:</span>
            <span className="text-emerald-600 font-bold">Top Tier Outlets</span>
          </div>
        </div>

        {/* 4-Day Daily Revenue Trajectory */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{branchName} Branch Revenue Trajectory</h3>
              <p className="text-xs text-slate-500">Daily revenue trend vs target (15 Nov – 18 Nov)</p>
            </div>
            <Badge variant="primary" size="sm">Daily Growth</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MUMBAI_DAILY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Actual Revenue (₹)" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Customer Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Branch Bookings */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Branch Bookings</h3>
              <p className="text-xs text-slate-500">Latest transactions at Mumbai outlet</p>
            </div>
            <span className="text-xs text-teal-600 font-semibold hover:underline cursor-pointer">
              View all 210 &rarr;
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Booking ID</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Package</th>
                  <th className="py-2.5 px-3 font-semibold">Pax</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECENT_MUMBAI_BOOKINGS.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{b.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{b.customer}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">{b.package}</td>
                    <td className="py-2.5 px-3 text-slate-500">{b.pax}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{formatCurrency(b.amount)}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={b.status === 'Confirmed' ? 'success' : b.status === 'Completed' ? 'primary' : 'danger'} size="sm">
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Feedback Summary */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Customer Satisfaction
              </h3>
              <Badge variant="success" size="sm">NPS 78</Badge>
            </div>

            <div className="my-4 text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-extrabold text-slate-900">4.8</span>
              <span className="text-xs text-slate-400"> / 5.0</span>
              <div className="flex justify-center gap-1 my-1 text-amber-500">
                {'★'.repeat(5)}
              </div>
              <p className="text-[11px] text-slate-500">Based on 84 reviews for Mumbai branch</p>
            </div>

            <div className="space-y-2.5">
              {MUMBAI_FEEDBACK.map((fb) => (
                <div key={fb.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800">{fb.customer}</span>
                    <span className="text-[10px] text-teal-600 font-medium">{fb.tour}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                    "{fb.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <span className="text-xs text-teal-600 font-semibold hover:underline cursor-pointer">
              View all reviews &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
