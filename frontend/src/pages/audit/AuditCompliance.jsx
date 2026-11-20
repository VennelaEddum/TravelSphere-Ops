import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  AlertOctagon,
  Award,
  Building2,
  Calendar,
  CheckSquare,
  ClipboardList,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Drawer } from '../../components/common/Drawer';
import { EmptyState } from '../../components/common/EmptyState';
import {
  AUDIT_SUMMARY,
  COMPLIANCE_CHECKLIST,
  INITIAL_AUDITS
} from '../../mock/auditData';

export const AuditCompliance = () => {
  const { user, role, selectedBranch } = useAuth();

  const userBranch = (role === ROLES.FRANCHISE_OWNER || role === ROLES.FRANCHISE_MANAGER)
    ? (user?.branchName || 'Mumbai')
    : selectedBranch;

  const [audits, setAudits] = useState(INITIAL_AUDITS);
  const [sopList, setSopList] = useState(COMPLIANCE_CHECKLIST);
  const [activeTab, setActiveTab] = useState('audits'); // 'audits' | 'sop'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Drawer & Modal state
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Audit Form
  const [newAudit, setNewAudit] = useState({
    branch: userBranch !== 'All Branches' ? userBranch : 'Mumbai',
    auditor: user?.name || 'Snehal Deshpande',
    category: 'Passenger Manifest & Safety Audit',
    score: 95,
    severity: 'Low',
    findings: '',
    correctiveAction: 'Regular monitoring standard.'
  });

  // Scoping audits by branch
  const branchScopedAudits = userBranch === 'All Branches'
    ? audits
    : audits.filter((a) => a.branch === userBranch);

  const filteredAudits = branchScopedAudits.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.auditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.findings.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || a.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleOpenDrawer = (audit) => {
    setSelectedAudit(audit);
    setIsDrawerOpen(true);
  };

  const handleCreateAudit = (e) => {
    e.preventDefault();
    const created = {
      id: `AUD-2026-${String(audits.length + 9).padStart(2, '0')}`,
      branch: newAudit.branch,
      auditor: newAudit.auditor,
      auditDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: newAudit.category,
      score: Number(newAudit.score),
      status: Number(newAudit.score) >= 80 ? 'Compliant' : 'Non-Compliant',
      severity: newAudit.severity,
      findings: newAudit.findings || 'Standard audit inspection conducted with satisfactory baseline adherence.',
      correctiveAction: newAudit.correctiveAction
    };

    setAudits([created, ...audits]);
    setIsAddModalOpen(false);
    setNewAudit({
      branch: 'Mumbai',
      auditor: user?.name || 'Snehal Deshpande',
      category: 'Passenger Manifest & Safety Audit',
      score: 95,
      severity: 'Low',
      findings: '',
      correctiveAction: 'Regular monitoring standard.'
    });
  };

  const toggleSopStatus = (id) => {
    setSopList(
      sopList.map((item) => {
        if (item.id === id) {
          const next = item.status === 'Compliant' ? 'Review Needed' : 'Compliant';
          return { ...item, status: next };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit & Compliance (Audit Agent)"
        subtitle="Standard Operating Procedure (SOP) verification, regulatory checks, booking anomaly detection, and branch inspection logs."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Audit & Compliance' }
        ]}
        badge={
          userBranch !== 'All Branches' && (
            <Badge variant="primary" size="sm">
              Scope: {userBranch}
            </Badge>
          )
        }
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Log New Audit
          </Button>
        }
      />

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Overall Compliance"
          value={AUDIT_SUMMARY.overallComplianceScore}
          subtext="Target benchmark: >90%"
          icon={ShieldCheck}
          variant="emerald"
          trend="+1.8% MoM"
          trendType="up"
        />

        <MetricCard
          title="Completed Audits"
          value={AUDIT_SUMMARY.completedAudits}
          subtext="Across 5 outlets"
          icon={CheckCircle2}
          variant="teal"
        />

        <MetricCard
          title="Pending Audits"
          value={AUDIT_SUMMARY.pendingAudits}
          subtext="Scheduled before month end"
          icon={Clock}
          variant="amber"
        />

        <MetricCard
          title="Critical Flags"
          value={AUDIT_SUMMARY.criticalIssues}
          subtext="Nagpur cancellation SLA"
          icon={AlertOctagon}
          variant="rose"
        />

        <MetricCard
          title="Resolved Action Items"
          value={AUDIT_SUMMARY.resolvedIssues}
          subtext="94.7% resolution rate"
          icon={Award}
          variant="navy"
        />
      </div>

      {/* Critical SLA Flag Banner (if viewing All or Nagpur) */}
      {(userBranch === 'All Branches' || userBranch === 'Nagpur') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Critical Compliance Violation Flagged
                </span>
                <Badge variant="danger" size="sm">Ticket AUD-2026-08</Badge>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Nagpur Outlet: Cancellation & Refund SLA Notification Latency
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                Cancellation processing time exceeded 48 hours for booking BK-1077 with 16.36% aggregate cancellation spike. Corrective action: Deploy automated notification webhook and retrain staff by 25 Nov 2026.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => handleOpenDrawer(audits.find((a) => a.id === 'AUD-2026-08') || audits[0])}
            >
              Inspect Audit Log
            </Button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('audits')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audits'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Branch Inspection Logs ({filteredAudits.length})
        </button>

        <button
          onClick={() => setActiveTab('sop')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'sop'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Standard Operating Procedures (SOP Checklist)
        </button>
      </div>

      {activeTab === 'audits' ? (
        /* AUDITS TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Filter Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit tickets, auditor, category, findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Compliant">Compliant</option>
                  <option value="Non-Compliant">Non-Compliant</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
                <span>Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Critical">Critical</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredAudits.length === 0 ? (
            <EmptyState
              title="No audit records match your filters"
              description="Try adjusting your search query, status or severity criteria."
              onReset={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setSeverityFilter('All');
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Audit ID</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Auditor & Date</th>
                    <th className="py-3 px-4">Audit Category</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Severity</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAudits.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {a.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          {a.branch}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-medium block">{a.auditor}</span>
                        <span className="text-[11px] text-slate-400">{a.auditDate}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-medium">{a.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-bold text-xs px-2.5 py-1 rounded-full ${
                          a.score >= 90
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : a.score >= 80
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {a.score} / 100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            a.severity === 'Critical'
                              ? 'danger'
                              : a.severity === 'Medium'
                              ? 'warning'
                              : 'default'
                          }
                          size="sm"
                        >
                          {a.severity}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={a.status === 'Compliant' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleOpenDrawer(a)}
                          className="text-xs text-teal-600 hover:text-teal-700"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* SOP CHECKLIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Franchise Operating Standard Operating Procedures (SOPs)</h3>
              <p className="text-xs text-slate-500">Mandatory franchise adherence checks verified across all operational branches.</p>
            </div>
            <Badge variant="primary" size="sm">5 Core Directives</Badge>
          </div>

          <div className="space-y-3">
            {sopList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {item.id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    {item.mandatory && (
                      <Badge variant="danger" size="sm">Mandatory</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-1">
                    {item.requirement}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={item.status === 'Compliant' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {item.status}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSopStatus(item.id)}
                    className="text-xs"
                  >
                    {item.status === 'Compliant' ? 'Flag for Review' : 'Mark Verified'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Record Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedAudit ? `Audit Inspection: ${selectedAudit.id}` : 'Audit Record'}
        subtitle={selectedAudit ? `${selectedAudit.branch} Outlet &bull; ${selectedAudit.auditDate}` : ''}
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-slate-500">Auditor: {selectedAudit?.auditor}</span>
            <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedAudit && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Status pill & score */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Audit Status</span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={selectedAudit.status === 'Compliant' ? 'success' : 'danger'} size="md">
                    {selectedAudit.status}
                  </Badge>
                  <Badge variant={selectedAudit.severity === 'Critical' ? 'danger' : 'default'} size="sm">
                    {selectedAudit.severity} Severity
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Quality Score</span>
                <span className="text-2xl font-bold text-slate-900">{selectedAudit.score} <span className="text-sm font-normal text-slate-400">/ 100</span></span>
              </div>
            </div>

            {/* Audit Metadata */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Inspection Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Franchise Branch</span>
                  <span className="font-bold text-slate-800">{selectedAudit.branch}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Inspection Date</span>
                  <span className="font-bold text-slate-800">{selectedAudit.auditDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                  <span className="text-slate-400 block mb-0.5">Audit Category</span>
                  <span className="font-bold text-slate-800">{selectedAudit.category}</span>
                </div>
              </div>
            </div>

            {/* Detailed Findings */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Auditor Findings & Observations</h4>
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-800 leading-relaxed text-xs">
                {selectedAudit.findings}
              </div>
            </div>

            {/* Corrective Action Required */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Mandated Corrective Action</h4>
              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-teal-900 leading-relaxed text-xs">
                {selectedAudit.correctiveAction}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Log New Audit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Franchise Audit Inspection"
        subtitle="Record formal compliance check or branch quality audit report"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateAudit}>
              Save Audit Record
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAudit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Franchise Branch *</label>
              <select
                value={newAudit.branch}
                onChange={(e) => setNewAudit({ ...newAudit, branch: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Auditor *</label>
              <input
                type="text"
                required
                value={newAudit.auditor}
                onChange={(e) => setNewAudit({ ...newAudit, auditor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Category *</label>
            <select
              value={newAudit.category}
              onChange={(e) => setNewAudit({ ...newAudit, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Passenger Manifest & Safety Audit">Passenger Manifest & Safety Audit</option>
              <option value="Cancellation & Refund SLA">Cancellation & Refund SLA</option>
              <option value="Financial Invoicing & GST Reconciliation">Financial Invoicing & GST Reconciliation</option>
              <option value="Tour Partner & Vendor SLA Check">Tour Partner & Vendor SLA Check</option>
              <option value="Staff Training & Emergency Response">Staff Training & Emergency Response</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Score (0 - 100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={newAudit.score}
                onChange={(e) => setNewAudit({ ...newAudit, score: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Severity Flag *</label>
              <select
                value={newAudit.severity}
                onChange={(e) => setNewAudit({ ...newAudit, severity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Findings & Audit Observations *</label>
            <textarea
              rows={3}
              required
              value={newAudit.findings}
              onChange={(e) => setNewAudit({ ...newAudit, findings: e.target.value })}
              placeholder="Detail specific observations, compliance breaches, or commendations..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mandated Corrective Action</label>
            <textarea
              rows={2}
              value={newAudit.correctiveAction}
              onChange={(e) => setNewAudit({ ...newAudit, correctiveAction: e.target.value })}
              placeholder="Corrective actions, deadlines, and staff re-training mandates..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
