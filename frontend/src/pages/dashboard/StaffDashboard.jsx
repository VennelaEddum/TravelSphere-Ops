import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  Send,
  Sparkles,
  MapPin,
  Building,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { fetchWorkforceTasks, fetchScopedBookings } from '../../api/authApi';
import { Link } from 'react-router-dom';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const [taskRes, bkRes] = await Promise.all([
          fetchWorkforceTasks(),
          fetchScopedBookings()
        ]);
        if (taskRes && taskRes.tasks) setTasks(taskRes.tasks);
        if (bkRes && bkRes.bookings) setBookings(bkRes.bookings);
      } catch (err) {
        console.error('Failed to load staff personal dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStaffData();
  }, []);

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#142B4A] to-[#0F9D9A] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#2DD4BF] text-xs font-semibold mb-2 backdrop-blur-xs border border-white/10">
              <UserCheck className="w-3.5 h-3.5" /> Staff Personal Work Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Sneha'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
              Track your assigned bookings, customer inquiries, and daily task priorities for {user?.branchName || 'Mumbai'} branch.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <div className="h-9 px-2.5 py-1 bg-white rounded-xl shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/assets/travelsphere-ops-logo.png"
                alt="TRAVELSPHERE OPS"
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1 bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-teal-200 uppercase font-bold tracking-wider">Today's Shift</span>
              <span className="text-xs font-bold">09:30 AM - 06:30 PM</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                ● Logged In (On Duty)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Personal Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Open Tasks"
          value={formatNumber(pendingTasks.length)}
          subtext="High & Medium priorities"
          icon={CheckSquare}
          variant="amber"
        />

        <MetricCard
          title="My Booking Portfolio"
          value={formatNumber(bookings.length)}
          subtext="Active confirmed itineraries"
          icon={CalendarCheck}
          variant="teal"
        />

        <MetricCard
          title="Client Follow-ups"
          value="5"
          subtext="Warm leads from campaigns"
          icon={Phone}
          variant="emerald"
        />

        <MetricCard
          title="Personal Service SLA"
          value="100%"
          subtext="No delayed client requests"
          icon={ShieldCheck}
          variant="primary"
        />
      </div>

      {/* Two-Column Work Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Assigned Tasks */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-600" />
                My Action Items & Assigned Tasks
              </h2>
              <p className="text-xs text-slate-500">Tasks assigned to you by Branch Manager</p>
            </div>
            <Link
              to="/workforce"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No pending tasks assigned.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.task_id} className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{task.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Due: {task.due_date}</span>
                      <span>&bull;</span>
                      <span>Branch: {task.branch_name || 'Mumbai'}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                    task.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : task.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: My Passenger Bookings */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-teal-600" />
                My Passenger Bookings
              </h2>
              <p className="text-xs text-slate-500">Travel itineraries managed by you</p>
            </div>
            <Link
              to="/booking-resources"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
            >
              All Bookings &rarr;
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No passenger bookings in portfolio.</p>
            ) : (
              bookings.map((bk) => (
                <div key={bk.booking_id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-900">{bk.booking_reference}</span>
                    <Badge variant="success" size="sm">{bk.status}</Badge>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{bk.customer_name}</div>
                  <div className="text-[11px] text-teal-700 font-medium truncate">{bk.package_name}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Travel: {bk.travel_date}</span>
                    <span className="font-bold text-slate-800">{formatCurrency(bk.amount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick AI Assistant Card */}
          <div className="mt-5 p-4 rounded-xl bg-teal-50/60 border border-teal-100">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              TravelSphere AI Operations Co-Pilot
            </div>
            <p className="text-[11px] text-teal-800 leading-relaxed mb-3">
              Need itinerary suggestions, slot availability checks, or passenger follow-up scripts?
            </p>
            <Link to="/ai-assistant">
              <Button variant="primary" size="sm" className="w-full text-xs">
                Open AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
