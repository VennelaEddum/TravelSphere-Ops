import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';
import {
  MessageSquareQuote,
  Star,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Building2,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  FEEDBACK_SUMMARY,
  RATING_DISTRIBUTION,
  BRANCH_SATISFACTION,
  INITIAL_REVIEWS
} from '../../mock/feedbackData';
import { formatNumber } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const CustomerFeedback = () => {
  const { user, role, selectedBranch } = useAuth();

  const userBranch = (role === ROLES.FRANCHISE_OWNER || role === ROLES.FRANCHISE_MANAGER)
    ? (user?.branchName || 'Mumbai')
    : selectedBranch;

  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All');

  // Response modal state
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Branch filtering
  const branchScopedReviews = userBranch === 'All Branches'
    ? reviews
    : reviews.filter((r) => r.branch === userBranch);

  const filteredReviews = branchScopedReviews.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tourPackage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = sentimentFilter === 'All' || r.sentiment === sentimentFilter;
    return matchesSearch && matchesSentiment;
  });

  const handleOpenReply = (r) => {
    setSelectedReview(r);
    setReplyText(r.officialResponse || '');
    setIsReplyOpen(true);
  };

  const handleSaveReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id
          ? { ...r, officialResponse: replyText, responseStatus: 'Responded' }
          : r
      )
    );
    setIsReplyOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Feedback & NPS Analytics"
        subtitle="Analyze post-tour traveler reviews, satisfaction metrics, Net Promoter Score (NPS), and resolve customer grievance tickets."
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: 'Customer Feedback' }
        ]}
        badge={
          userBranch !== 'All Branches' && (
            <Badge variant="primary" size="sm">
              Scope: {userBranch}
            </Badge>
          )
        }
      />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Average Customer Rating"
          value="4.7 / 5.0"
          subtext="Based on 342 reviews"
          icon={Star}
          variant="amber"
          trend="Top Tier"
          trendType="up"
        />

        <MetricCard
          title="Net Promoter Score"
          value={`+${FEEDBACK_SUMMARY.npsScore}`}
          subtext="World-class (>+70)"
          icon={Smile}
          variant="emerald"
          trend="+4 points MoM"
          trendType="up"
        />

        <MetricCard
          title="Positive Satisfaction"
          value={FEEDBACK_SUMMARY.positivePercentage}
          subtext="4 and 5 star ratings"
          icon={ThumbsUp}
          variant="teal"
        />

        <MetricCard
          title="Critical Complaints"
          value={FEEDBACK_SUMMARY.negativePercentage}
          subtext="1 and 2 star feedback"
          icon={AlertTriangle}
          variant="rose"
        />

        <MetricCard
          title="Total Reviews Collected"
          value={formatNumber(FEEDBACK_SUMMARY.totalReviews)}
          subtext="Automated survey feed"
          icon={MessageSquareQuote}
          variant="navy"
        />
      </div>

      {/* Visual Analytics: Rating Distribution & Branch-wise Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rating Breakdown Bar Chart */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Star Rating Distribution</h3>
              <p className="text-xs text-slate-500">67.8% of customers award 5-star ratings</p>
            </div>
            <Badge variant="success" size="sm">High Satisfaction</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RATING_DISTRIBUTION} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis dataKey="rating" type="category" stroke="#64748b" fontSize={12} tickLine={false} width={65} />
                <Tooltip
                  formatter={(val) => [`${val} reviews`, 'Total Reviews']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch-wise Satisfaction Comparison */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Franchise Branch Satisfaction Comparison</h3>
                <p className="text-xs text-slate-500">NPS and average rating by outlet</p>
              </div>
              <Badge variant="default" size="sm">Branch Benchmark</Badge>
            </div>

            <div className="space-y-3">
              {BRANCH_SATISFACTION.map((b) => (
                <div key={b.branch} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{b.branch} Outlet</span>
                    <span className="text-[11px] text-slate-500">{b.reviews} Verified Customer Reviews</span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="font-bold text-amber-600 block">★ {b.rating}</span>
                      <span className="text-[10px] text-slate-400">Avg Rating</span>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <span className="font-bold text-emerald-600 block">NPS {b.nps}</span>
                      <span className="text-[10px] text-slate-400">Promoter Score</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Feed Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer reviews, feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Sentiments</option>
              <option value="Positive">Positive Reviews (★ 4-5)</option>
              <option value="Negative">Grievances / Negative (★ 1-2)</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <EmptyState
            title="No feedback reviews found"
            description="Adjust your search query or reset the sentiment filter."
            onReset={() => {
              setSearchQuery('');
              setSentimentFilter('All');
            }}
          />
        ) : (
          <div className="divide-y divide-slate-100 p-4 sm:p-5 space-y-4">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-500 text-sm">
                      {'★'.repeat(rev.rating)}
                      <span className="text-slate-300">{'★'.repeat(5 - rev.rating)}</span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{rev.customerName}</span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs text-teal-700 font-medium">{rev.tourPackage}</span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Badge variant="default" size="sm">
                      {rev.branch} Outlet
                    </Badge>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                {/* Official Response if available */}
                {rev.officialResponse && (
                  <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-100 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-teal-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      Official Franchise Response:
                    </span>
                    <p className="text-slate-600 leading-relaxed">{rev.officialResponse}</p>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Reply}
                    onClick={() => handleOpenReply(rev)}
                    className="text-xs text-teal-600 hover:text-teal-700"
                  >
                    {rev.officialResponse ? 'Edit Response' : 'Reply to Customer'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={isReplyOpen}
        onClose={() => setIsReplyOpen(false)}
        title={`Respond to ${selectedReview?.customerName}`}
        subtitle={`${selectedReview?.tourPackage} &bull; Rating: ★ ${selectedReview?.rating} / 5`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsReplyOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveReply}>
              Publish Response
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveReply} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
            "{selectedReview?.comment}"
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Response *</label>
            <textarea
              rows={4}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a courteous and constructive response to the customer..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
