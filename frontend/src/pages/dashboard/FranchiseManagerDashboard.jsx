import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  CalendarCheck,
  Clock,
  Palmtree,
  Users,
  CheckSquare,
  Bell,
  AlertTriangle,
  Plane,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';

const UPCOMING_TOURS = [
  { id: 'TR-301', destination: 'Kerala Backwaters & Houseboat', departure: 'Tomorrow, 06:00 AM', pax: 18, guide: 'Ramesh K.', status: 'Ready' },
  { id: 'TR-302', destination: 'Goa Coastal Weekend Break', departure: '21 Nov 2026, 09:30 AM', pax: 24, guide: 'Sunita S.', status: 'Finalizing Slots' },
  { id: 'TR-303', destination: 'Himachal Snow Paradise (Shimla/Manali)', departure: '23 Nov 2026, 05:00 AM', pax: 14, guide: 'Amit Verma', status: 'Bookings Open' },
  { id: 'TR-304', destination: 'Golden Triangle Cultural Expedition', departure: '25 Nov 2026, 07:00 AM', pax: 12, guide: 'Priya Nair', status: 'Bookings Open' }
];

const PACKAGE_INVENTORY = [
  { id: 1, name: 'Goa Coastal Weekend Break', totalSlots: 30, booked: 26, available: 4, alert: 'Low Inventory' },
  { id: 2, name: 'Kerala Backwaters Houseboat', totalSlots: 20, booked: 18, available: 2, alert: 'Almost Full' },
  { id: 3, name: 'Himachal Snow Trail', totalSlots: 25, booked: 15, available: 10, alert: 'Normal' },
  { id: 4, name: 'Kashmir Odyssey', totalSlots: 15, booked: 7, available: 8, alert: 'Normal' }
];

const OPERATIONAL_TASKS = [
  { id: 1, task: 'Verify Aadhaar/Passport KYC for booking BK-1082 (Aarav Malhotra)', priority: 'High', due: 'Today, 2:00 PM', done: false },
  { id: 2, task: 'Coordinate airport transfer vehicle for 18 pax Kerala departure', priority: 'High', due: 'Today, 4:30 PM', done: false },
  { id: 3, task: 'Confirm hotel room vouchers with Taj Exotica (Goa weekend tour)', priority: 'Medium', due: 'Tomorrow, 11:00 AM', done: true },
  { id: 4, task: 'Review customer enquiry logs from Mumbai website contact form', priority: 'Low', due: 'Tomorrow, 3:00 PM', done: false }
];

const RECENT_NOTIFICATIONS = [
  { id: 1, message: 'Kerala tour transport confirmed with Sharma Travels vendor.', time: '10 mins ago', type: 'info' },
  { id: 2, message: '3 new booking requests awaiting manager approval.', time: '35 mins ago', type: 'warning' },
  { id: 3, message: 'Staff attendance check: 8 out of 9 agents logged in on time.', time: '2 hours ago', type: 'success' }
];

export const FranchiseManagerDashboard = () => {
  const { user } = useAuth();
  const branchName = user?.branchName || 'Mumbai';

  const [tasks, setTasks] = useState(OPERATIONAL_TASKS);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

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
              {branchName} Outlet &bull; Daily Operations Command
              <Badge variant="navy" size="sm" className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                Franchise Manager
              </Badge>
            </h2>
            <p className="text-xs text-slate-300">
              Shift Lead: <strong>{user?.name}</strong> &bull; Operational control for tours, bookings, staff and inventory.
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
            <CalendarCheck className="w-4 h-4 text-teal-400" />
            <span>Operations Active &bull; Today's Shift</span>
          </div>
        </div>
      </div>

      {/* 4 Core Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Bookings"
          value="14 Bookings"
          subtext="Processed in current shift"
          icon={CalendarCheck}
          variant="teal"
          trend="+4 vs yesterday"
          trendType="up"
        />

        <MetricCard
          title="Pending Bookings"
          value="3 Pending"
          subtext="Awaiting KYC / payment"
          icon={Clock}
          variant="amber"
          trend="Action required"
          trendType="down"
        />

        <MetricCard
          title="Upcoming Tour Departures"
          value="4 Groups"
          subtext="Next 7 days schedule"
          icon={Palmtree}
          variant="indigo"
          trend="68 Total Pax"
          trendType="up"
        />

        <MetricCard
          title="Staff Attendance"
          value="8 / 9 On Duty"
          subtext="88.9% Shift presence"
          icon={Users}
          variant="emerald"
          trend="1 On Approved Leave"
          trendType="up"
        />
      </div>

      {/* Upcoming Tours & Package Slot Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Tour Departures Schedule */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immediate Tour Departures Schedule</h3>
              <p className="text-xs text-slate-500">Upcoming customer group movements from {branchName} hub</p>
            </div>
            <Badge variant="primary" size="sm">Active Schedule</Badge>
          </div>

          <div className="space-y-3">
            {UPCOMING_TOURS.map((tour) => (
              <div key={tour.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{tour.destination}</span>
                    <Badge variant={tour.status === 'Ready' ? 'success' : 'info'} size="sm">
                      {tour.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500 mt-1 flex items-center gap-3">
                    <span><strong>Departure:</strong> {tour.departure}</span>
                    <span>&bull;</span>
                    <span><strong>Lead Guide:</strong> {tour.guide}</span>
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-xs font-bold text-slate-900">{tour.pax} Passengers</span>
                  <p className="text-[10px] text-teal-600 font-semibold">{tour.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Package Inventory Slot Availability */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Package Seat & Room Inventory</h3>
                <p className="text-xs text-slate-500">Real-time availability tracker</p>
              </div>
              <Badge variant="default" size="sm">Live Slots</Badge>
            </div>

            <div className="space-y-4">
              {PACKAGE_INVENTORY.map((pkg) => {
                const fillPercent = (pkg.booked / pkg.totalSlots) * 100;
                return (
                  <div key={pkg.id} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">{pkg.name}</span>
                      <span className={`text-[11px] font-bold ${
                        pkg.available <= 4 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {pkg.available} slots left ({pkg.booked}/{pkg.totalSlots})
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          fillPercent >= 90 ? 'bg-rose-500' : fillPercent >= 75 ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Inventory Status:</span>
            <span className="text-teal-600 font-semibold hover:underline cursor-pointer">
              Request Extra Vendor Allotment &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Operational Tasks Checklist & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Operational Tasks Checklist */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-600" />
              Daily Operational Action Items
            </h3>
            <span className="text-xs text-slate-500">
              {tasks.filter(t => t.done).length} of {tasks.length} completed
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  task.done
                    ? 'bg-slate-50/60 border-slate-100 opacity-60'
                    : 'bg-white border-slate-200 hover:border-teal-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium text-slate-800 ${task.done ? 'line-through text-slate-400' : ''}`}>
                    {task.task}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>Due: {task.due}</span>
                    <span>&bull;</span>
                    <span className={`font-semibold ${
                      task.priority === 'High' ? 'text-rose-600' : 'text-slate-600'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Notifications */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Operational Alerts & Logs
              </h3>
              <Badge variant="warning" size="sm">Branch Live</Badge>
            </div>

            <div className="mt-4 space-y-3">
              {RECENT_NOTIFICATIONS.map((notif) => (
                <div key={notif.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <p className="text-slate-800 font-medium">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <span className="text-xs text-teal-600 font-semibold hover:underline cursor-pointer">
              Go to Notification Center &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
