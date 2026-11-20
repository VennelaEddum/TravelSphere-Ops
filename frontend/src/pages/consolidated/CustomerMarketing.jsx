import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Megaphone, Star, ShieldAlert } from 'lucide-react';
import { CustomerManagement } from '../customers/CustomerManagement';
import { MarketingCampaigns } from '../marketing/MarketingCampaigns';
import { CustomerFeedback } from '../feedback/CustomerFeedback';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rolePermissions';

export const CustomerMarketing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();
  const currentTab = searchParams.get('tab') || 'customers';

  const [activeTab, setActiveTab] = useState(
    currentTab === 'marketing' ? 'marketing' : currentTab === 'feedback' ? 'feedback' : 'customers'
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const isStaff = role === ROLES.STAFF;

  return (
    <div className="space-y-6">
      {/* Staff View Notice if applicable */}
      {isStaff && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-sky-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Staff View:</strong> You have read and customer support access. Campaign creation and broad marketing budget adjustments are reserved for Branch Managers and Franchise Owners.
            </span>
          </div>
          <span className="font-semibold uppercase tracking-wider text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded">
            Role: Staff
          </span>
        </div>
      )}

      {/* Internal Navigation Header */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('customers')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'customers'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Directory & CRM</span>
        </button>

        <button
          onClick={() => handleTabChange('marketing')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'marketing'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Marketing & Campaigns</span>
        </button>

        <button
          onClick={() => handleTabChange('feedback')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'feedback'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Customer Feedback & Reviews</span>
        </button>
      </div>

      {/* Render Consolidated View */}
      {activeTab === 'customers' && <CustomerManagement />}
      {activeTab === 'marketing' && <MarketingCampaigns />}
      {activeTab === 'feedback' && <CustomerFeedback />}
    </div>
  );
};
