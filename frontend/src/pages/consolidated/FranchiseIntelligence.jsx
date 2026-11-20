import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Brain,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  AlertCircle,
  Building2,
  Calendar,
  Eye,
  RefreshCw
} from 'lucide-react';
import { AIInsights } from '../insights/AIInsights';
import { AuditCompliance } from '../audit/AuditCompliance';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  fetchRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest
} from '../../api/authApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const FranchiseIntelligence = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role } = useAuth();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;

  const currentTab = searchParams.get('tab') || 'insights';
  const [activeTab, setActiveTab] = useState(
    currentTab === 'audit' ? 'audit' : currentTab === 'approvals' ? 'approvals' : 'insights'
  );

  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null, req: null });
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'approvals') {
      loadRegistrationQueue();
    }
  }, [activeTab, statusFilter]);

  const loadRegistrationQueue = async () => {
    setLoading(true);
    try {
      const data = await fetchRegistrationRequests(statusFilter);
      if (data) {
        setRequests(data.requests || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.warn('Could not load registrations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleApprove = async () => {
    if (!actionModal.req) return;
    setIsSubmitting(true);
    try {
      await approveRegistrationRequest(actionModal.req.reference_id, user?.name || 'Super Admin');
      setActionModal({ isOpen: false, type: null, req: null });
      loadRegistrationQueue();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!actionModal.req) return;
    setIsSubmitting(true);
    try {
      await rejectRegistrationRequest(
        actionModal.req.reference_id,
        rejectReason || 'Application does not satisfy network qualification guidelines.',
        user?.name || 'Super Admin'
      );
      setActionModal({ isOpen: false, type: null, req: null });
      setRejectReason('');
      loadRegistrationQueue();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('insights')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'insights'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>AI Insights & Forecasting</span>
        </button>

        <button
          onClick={() => handleTabChange('audit')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'audit'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit & SOP Compliance</span>
        </button>

        <button
          onClick={() => handleTabChange('approvals')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'approvals'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Franchise Approval Queue</span>
          {summary.pending > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {summary.pending}
            </span>
          )}
        </button>
      </div>

      {/* Render Active View */}
      {activeTab === 'insights' && <AIInsights />}
      {activeTab === 'audit' && <AuditCompliance />}

      {/* Approval Queue Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Applications</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.total}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-amber-600 font-medium">Pending Review</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{summary.pending}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-emerald-600 font-medium">Approved Accounts</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.approved}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-rose-600 font-medium">Rejected / On Hold</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">{summary.rejected}</p>
            </div>
          </div>

          {/* Filter Bar with Official Branding */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                <img
                  src="/assets/travelsphere-ops-logo.png"
                  alt="TRAVELSPHERE OPS"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Franchise & Branch Manager Applications</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review submitted registration credentials before granting system access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved Only</option>
                <option value="REJECTED">Rejected Only</option>
              </select>

              <button
                onClick={loadRegistrationQueue}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh queue"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Requested Role</th>
                    <th className="py-3 px-4">Franchise / Branch</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Status</th>
                    {isSuperAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 7 : 6} className="text-center py-8 text-slate-500">
                        Loading application queue...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 7 : 6} className="text-center py-8 text-slate-500">
                        No registration applications matching this filter.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r.reference_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{r.reference_id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{r.name}</div>
                          <div className="text-[11px] text-slate-500">{r.email} &bull; {r.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{r.requested_role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{r.franchise_name || 'N/A'}</div>
                          <div className="text-[11px] text-slate-500">{r.branch_city || 'HQ'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              r.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        {isSuperAdmin && (
                          <td className="py-3 px-4 text-right">
                            {r.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setActionModal({ isOpen: true, type: 'APPROVE', req: r })}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => setActionModal({ isOpen: true, type: 'REJECT', req: r })}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">Reviewed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Modal */}
          {actionModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  {actionModal.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                </h3>
                <p className="text-xs text-slate-600">
                  {actionModal.type === 'APPROVE'
                    ? `Are you sure you want to approve ${actionModal.req?.name} (${actionModal.req?.requested_role})? An active account will be provisioned in the SQLite database.`
                    : `Please specify the reason for rejecting ${actionModal.req?.name}'s application.`}
                </p>

                {actionModal.type === 'REJECT' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Rejection Reason</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="e.g. Incomplete franchise verification documentation..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                    ></textarea>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActionModal({ isOpen: false, type: null, req: null })}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={actionModal.type === 'APPROVE' ? handleApprove : handleReject}
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
                      actionModal.type === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isSubmitting ? 'Processing...' : actionModal.type === 'APPROVE' ? 'Approve & Activate' : 'Reject Application'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
