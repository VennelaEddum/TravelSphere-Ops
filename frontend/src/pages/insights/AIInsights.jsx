import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  Sparkles,
  Cpu,
  BarChart3,
  Package,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search,
  Sliders,
  DollarSign,
  ShieldAlert,
  Zap,
  Bot
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  INSIGHTS_SUMMARY,
  AI_INSIGHT_CARDS
} from '../../mock/insightsData';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const AIInsights = () => {
  const { user, role, selectedBranch } = useAuth();
  const navigate = useNavigate();

  const userBranch = (role === ROLES.FRANCHISE_OWNER || role === ROLES.FRANCHISE_MANAGER)
    ? (user?.branchName || 'Mumbai')
    : selectedBranch;

  const [insights, setInsights] = useState(AI_INSIGHT_CARDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Completed actions state (tracked by insightId-actionIndex)
  const [completedActions, setCompletedActions] = useState({});

  // Execution modal state
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [executionNote, setExecutionNote] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Growth simulation scenario state
  const [selectedScenario, setSelectedScenario] = useState('winter');

  const filteredInsights = insights.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.agent.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAgent = agentFilter === 'All' || item.agent === agentFilter;
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;

    return matchesSearch && matchesAgent && matchesPriority;
  });

  const getAgentIcon = (agentName) => {
    switch (agentName) {
      case 'Outlet Performance Agent':
        return <BarChart3 className="w-4 h-4 text-teal-600" />;
      case 'Inventory Agent':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'Marketing Agent':
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      case 'Audit Agent':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bot className="w-4 h-4 text-teal-600" />;
    }
  };

  const getAgentRoute = (agentName) => {
    switch (agentName) {
      case 'Outlet Performance Agent':
        return '/performance';
      case 'Inventory Agent':
        return '/packages';
      case 'Marketing Agent':
        return '/marketing';
      case 'Audit Agent':
        return '/audit';
      default:
        return '/dashboard';
    }
  };

  const toggleAction = (insightId, actionIdx) => {
    const key = `${insightId}-${actionIdx}`;
    setCompletedActions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleOpenExecute = (item) => {
    setSelectedInsight(item);
    setExecutionNote(`Authorized execution of ${item.title} recommendations by ${user?.name}.`);
    setIsExecuteModalOpen(true);
  };

  const handleConfirmExecution = (e) => {
    e.preventDefault();
    setIsExecuting(true);
    setTimeout(() => {
      setInsights((prev) =>
        prev.map((ins) =>
          ins.id === selectedInsight.id
            ? { ...ins, status: 'Execution Initiated' }
            : ins
        )
      );
      setIsExecuting(false);
      setIsExecuteModalOpen(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Intelligence & Strategic Insights"
        subtitle="Multi-agent cross-module synthesis generating automated revenue deficit recovery, inventory forecasting, marketing optimization, and compliance risk mitigation."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'AI Insights' }
        ]}
        badge={
          <Badge variant="primary" size="sm">
            ⚡ Pre-Integration Agentic AI Engine
          </Badge>
        }
      />

      {/* AI Intelligence Transparency Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-teal-950 text-white shadow-lg border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shrink-0">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Agentic Architecture Active
              </span>
              <span className="text-[11px] bg-teal-500/20 text-teal-200 px-2 py-0.5 rounded-full border border-teal-500/30">
                4 Autonomous Micro-Agents
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Automated Franchise Performance Optimization & Risk Engine
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Synthesizing real-time telemetry from Outlet Performance, Inventory, Marketing, and Audit agents to deliver prioritized operational decisions with quantified revenue impact.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Franchise Health</span>
            <span className="text-2xl font-bold text-teal-400">{INSIGHTS_SUMMARY.healthIndex} <span className="text-xs text-slate-400 font-normal">/ 100</span></span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Health Index"
          value={`${INSIGHTS_SUMMARY.healthIndex} / 100`}
          subtext="Strong Growth & High Resilience"
          icon={TrendingUp}
          variant="emerald"
          trend="+3.4 pts"
          trendType="up"
        />

        <MetricCard
          title="Active AI Insights"
          value={INSIGHTS_SUMMARY.totalInsights}
          subtext="2 Critical Interventions"
          icon={Sparkles}
          variant="teal"
        />

        <MetricCard
          title="Potential Revenue Gain"
          value={formatCurrency(INSIGHTS_SUMMARY.potentialRevenueGain)}
          subtext="Via inventory & campaign shifts"
          icon={DollarSign}
          variant="navy"
          trend="+₹2.8L"
          trendType="up"
        />

        <MetricCard
          title="Risk Mitigation Value"
          value={formatCurrency(INSIGHTS_SUMMARY.riskMitigationValue)}
          subtext="Prevented cancellations & SLA penalties"
          icon={ShieldAlert}
          variant="amber"
        />
      </div>

      {/* Strategic Scenario Simulation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Predictive Strategic Growth Simulator</h3>
              <p className="text-xs text-slate-500">Test autonomous multi-agent recommendations under varying seasonal conditions.</p>
            </div>
          </div>
          <Badge variant="teal" size="sm">Real-time Model</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedScenario('winter')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedScenario === 'winter'
                ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-slate-900">1. Winter Demand Expansion</span>
              <Badge variant="success" size="sm">+₹1.95L Lift</Badge>
            </div>
            <p className="text-xs text-slate-600">
              Acquire +14 hotel blocks in Goa & Kerala. Implement tiered late pricing (+8%).
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedScenario('nagpur')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedScenario === 'nagpur'
                ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-slate-900">2. Nagpur Deficit Recovery</span>
              <Badge variant="warning" size="sm">+₹85K Lift</Badge>
            </div>
            <p className="text-xs text-slate-600">
              Reallocate print ad budget to targeted Instagram weekend packages. Deploy SMS alerts.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedScenario('channel')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedScenario === 'channel'
                ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-slate-900">3. Omnichannel Rebalancing</span>
              <Badge variant="primary" size="sm">+28% Leads</Badge>
            </div>
            <p className="text-xs text-slate-600">
              Shift 20% Google Search spend to Meta Reels in Bengaluru & Hyderabad tech clusters.
            </p>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search AI recommendations, agents, actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Agent:</span>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Autonomous Agents</option>
              <option value="Outlet Performance Agent">Outlet Performance Agent</option>
              <option value="Inventory Agent">Inventory Agent</option>
              <option value="Marketing Agent">Marketing Agent</option>
              <option value="Audit Agent">Audit Agent</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Insight Cards Feed */}
      {filteredInsights.length === 0 ? (
        <EmptyState
          title="No AI insights match your criteria"
          description="Try broadening your agent filter or search terms."
          onReset={() => {
            setSearchQuery('');
            setAgentFilter('All');
            setPriorityFilter('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInsights.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Agent + Priority + Confidence */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                      {getAgentIcon(item.agent)}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{item.agent}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.confidence} Conf.
                    </span>
                    <Badge
                      variant={
                        item.priority === 'Critical'
                          ? 'danger'
                          : item.priority === 'High'
                          ? 'warning'
                          : 'teal'
                      }
                      size="sm"
                    >
                      {item.priority} Priority
                    </Badge>
                  </div>
                </div>

                {/* Title & Category */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                    {item.title}
                  </h3>
                </div>

                {/* Impact Prediction Callout */}
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-900 flex items-start gap-2 text-xs">
                  <Zap className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Predicted Business Impact:</span>
                    <span className="text-teal-800">{item.impactPrediction}</span>
                  </div>
                </div>

                {/* Summary Narrative */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.summary}
                </p>

                {/* Recommended Actions Checklist */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Action Plan Implementation ({item.recommendedActions.length} Steps)
                  </h4>
                  <div className="space-y-2">
                    {item.recommendedActions.map((action, idx) => {
                      const isDone = !!completedActions[`${item.id}-${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleAction(item.id, idx)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                            isDone
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 line-through'
                              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}} // handled by div click
                            className="w-4 h-4 text-teal-600 rounded cursor-pointer mt-0.5 shrink-0"
                          />
                          <span className="leading-relaxed">{action}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => navigate(getAgentRoute(item.agent))}
                  className="text-xs"
                >
                  View Module
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => handleOpenExecute(item)}
                  className="text-xs"
                >
                  {item.status === 'Execution Initiated' ? 'Execution Initiated' : 'Execute Plan'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Execute Action Plan Modal */}
      <Modal
        isOpen={isExecuteModalOpen}
        onClose={() => setIsExecuteModalOpen(false)}
        title="Execute Autonomous Action Plan"
        subtitle={selectedInsight ? `${selectedInsight.title} &bull; ${selectedInsight.agent}` : ''}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsExecuteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isExecuting}
              onClick={handleConfirmExecution}
            >
              Confirm & Dispatch Actions
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 leading-relaxed text-xs">
            <span className="font-bold block mb-1">Impact Forecast:</span>
            {selectedInsight?.impactPrediction}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Execution Directive / Stakeholder Notice *
            </label>
            <textarea
              rows={4}
              value={executionNote}
              onChange={(e) => setExecutionNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1">
            <span className="font-bold text-slate-800 block">Automated Dispatch Targets:</span>
            <p>&bull; Branch Franchise Owner and Operational Desk Manager</p>
            <p>&bull; Head Office Central Performance Monitoring Ledger</p>
            <p>&bull; Webhook notification to automated marketing & inventory queues</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
