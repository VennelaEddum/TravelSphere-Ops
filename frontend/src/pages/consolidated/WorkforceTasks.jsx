import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  CheckSquare,
  TrendingUp,
  UserCheck,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { StaffManagement } from '../staff/StaffManagement';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import { fetchWorkforceTasks } from '../../api/authApi';
import { Badge } from '../../components/common/Badge';

export const WorkforceTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role, selectedBranch } = useAuth();
  const isStaff = role === ROLES.STAFF;

  const currentTab = searchParams.get('tab') || (isStaff ? 'personal' : 'directory');
  const [activeTab, setActiveTab] = useState(
    isStaff && (currentTab === 'directory' || currentTab === 'productivity')
      ? 'personal'
      : currentTab
  );

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [attendanceStatus, setAttendanceStatus] = useState('CHECKED_IN');
  const [checkInTime, setCheckInTime] = useState('09:15 AM');

  useEffect(() => {
    loadTasks();
  }, [user, role, selectedBranch]);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetchWorkforceTasks(user?.branchId, user?.franchiseId);
      if (res && res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.warn('Failed to load tasks', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleToggleTaskStatus = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.task_id === taskId) {
          const nextStatus = t.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Filter tasks based on view and tab
  const personalTasks = tasks.filter(
    (t) => t.assigned_to === user?.email || t.assigned_staff_id === user?.id || isStaff
  );

  const displayedTasks = activeTab === 'personal'
    ? personalTasks
    : taskFilter === 'ALL'
    ? tasks
    : tasks.filter((t) => t.status === taskFilter);

  return (
    <div className="space-y-6">
      {/* Role Navigation Bar */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {!isStaff && (
          <button
            onClick={() => handleTabChange('directory')}
            className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'directory'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory</span>
          </button>
        )}

        <button
          onClick={() => handleTabChange('tasks')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'tasks'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Task Board & Assignments</span>
        </button>

        <button
          onClick={() => handleTabChange('attendance')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'attendance'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attendance & Shifts</span>
        </button>

        {isStaff && (
          <button
            onClick={() => handleTabChange('personal')}
            className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'personal'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Personal Tasks</span>
          </button>
        )}

        {!isStaff && (
          <button
            onClick={() => handleTabChange('productivity')}
            className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'productivity'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Employee Productivity</span>
          </button>
        )}
      </div>

      {/* Tab: Staff Directory (Admin/Owner/Manager) */}
      {activeTab === 'directory' && !isStaff && <StaffManagement />}

      {/* Tab: Tasks Board or Personal Tasks */}
      {(activeTab === 'tasks' || activeTab === 'personal') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeTab === 'personal' ? 'My Assigned Operational Tasks' : 'Branch Task Assignments Board'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'personal'
                  ? 'All tasks assigned directly to you for today\'s shift at ' + (user?.branchName || 'your branch')
                  : 'Live task board enforcing four-level role isolation and assignment tracking.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <button
                onClick={loadTasks}
                className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Task Cards Grid */}
          {loadingTasks ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading operational tasks...
            </div>
          ) : displayedTasks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No tasks in this view</h3>
              <p className="text-xs text-slate-500 mt-1">All assigned operational duties are up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedTasks.map((t) => (
                <div
                  key={t.task_id}
                  className={`bg-white rounded-xl border p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${
                    t.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          t.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {t.priority} Priority
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className={`font-semibold text-sm text-slate-900 ${t.status === 'COMPLETED' ? 'line-through text-slate-500' : ''}`}>
                      {t.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>Assigned: <span className="font-medium text-slate-700">{t.assigned_to}</span></div>
                      <div>Due: <span className="font-medium text-slate-700">{t.due_date}</span></div>
                    </div>

                    <button
                      onClick={() => handleToggleTaskStatus(t.task_id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                        t.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.status === 'COMPLETED' ? 'Reopen' : 'Done'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Attendance & Shifts */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Shift Attendance Punch</span>
            </h3>
            <p className="text-xs text-slate-500">
              Record your daily branch check-in and checkout for audit compliance.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Employee:</span>
                <span className="font-semibold text-slate-800">{user?.name || 'Staff User'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Branch:</span>
                <span className="font-semibold text-slate-800">{user?.branchName || 'Mumbai HQ'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Shift Schedule:</span>
                <span className="font-semibold text-teal-700">09:00 AM - 06:00 PM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {attendanceStatus} ({checkInTime})
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAttendanceStatus('CHECKED_IN')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  attendanceStatus === 'CHECKED_IN'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Punch In
              </button>
              <button
                onClick={() => setAttendanceStatus('CHECKED_OUT')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  attendanceStatus === 'CHECKED_OUT'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Punch Out
              </button>
            </div>
          </div>

          {/* Shift Schedule Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Weekly Operational Shift Roster</span>
            </h3>
            <p className="text-xs text-slate-500">
              Assigned duties and front-desk coverage for current week.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Day</th>
                    <th className="py-2.5 px-3">Duty Slot</th>
                    <th className="py-2.5 px-3">Branch / Location</th>
                    <th className="py-2.5 px-3">Role Responsibility</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Monday</td>
                    <td className="py-2.5 px-3">09:00 AM - 06:00 PM</td>
                    <td className="py-2.5 px-3">{user?.branchName || 'Mumbai Branch'}</td>
                    <td className="py-2.5 px-3">Customer Desk & Itinerary Support</td>
                    <td className="py-2.5 px-3 text-right"><span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Completed</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Tuesday</td>
                    <td className="py-2.5 px-3">09:00 AM - 06:00 PM</td>
                    <td className="py-2.5 px-3">{user?.branchName || 'Mumbai Branch'}</td>
                    <td className="py-2.5 px-3">Visa Documentation & VFS Submissions</td>
                    <td className="py-2.5 px-3 text-right"><span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Completed</span></td>
                  </tr>
                  <tr className="bg-teal-50/40">
                    <td className="py-2.5 px-3 font-semibold text-teal-900">Today (Wednesday)</td>
                    <td className="py-2.5 px-3 font-medium text-teal-800">09:00 AM - 06:00 PM</td>
                    <td className="py-2.5 px-3">{user?.branchName || 'Mumbai Branch'}</td>
                    <td className="py-2.5 px-3 font-medium text-teal-800">Travel Partner Coordination & Booking Verification</td>
                    <td className="py-2.5 px-3 text-right"><span className="text-teal-700 font-semibold bg-teal-100 px-2 py-0.5 rounded">Active Shift</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Thursday</td>
                    <td className="py-2.5 px-3">09:00 AM - 06:00 PM</td>
                    <td className="py-2.5 px-3">{user?.branchName || 'Mumbai Branch'}</td>
                    <td className="py-2.5 px-3">Customer Support & Payment Vouchers</td>
                    <td className="py-2.5 px-3 text-right"><span className="text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">Scheduled</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Friday</td>
                    <td className="py-2.5 px-3">09:00 AM - 06:00 PM</td>
                    <td className="py-2.5 px-3">{user?.branchName || 'Mumbai Branch'}</td>
                    <td className="py-2.5 px-3">Weekly Booking Reconciliation</td>
                    <td className="py-2.5 px-3 text-right"><span className="text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">Scheduled</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Employee Productivity (Managers, Owners, Admins) */}
      {activeTab === 'productivity' && !isStaff && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">Average Task Turnaround</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">3.4 hrs</p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">18% faster than SLA</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">Monthly Attendance Compliance</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">98.2%</p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Top tier SOP compliance</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500">Customer Satisfaction Index</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">4.8 / 5.0</p>
              <span className="text-xs text-teal-600 font-semibold mt-1 inline-block">Based on 142 client reviews</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Branch Team Performance Matrix</h4>
            <div className="space-y-3">
              {[
                { name: 'Rohan Sharma', role: 'Senior Travel Consultant', completion: 94, tasks: '28 / 30 tasks' },
                { name: 'Pooja Iyer', role: 'Visa & Documentation Officer', completion: 98, tasks: '42 / 43 tasks' },
                { name: 'Kavita Nair', role: 'Staff Operations Executive', completion: 91, tasks: '21 / 23 tasks' },
                { name: 'Amit Patel', role: 'Operations Assistant', completion: 87, tasks: '19 / 22 tasks' }
              ].map((member, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{member.name}</h5>
                    <p className="text-[11px] text-slate-500">{member.role} &bull; {member.tasks}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${member.completion}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-10 text-right">{member.completion}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
