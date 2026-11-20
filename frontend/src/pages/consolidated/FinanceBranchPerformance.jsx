import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, Coins, FileText } from 'lucide-react';
import { BranchPerformance } from '../performance/BranchPerformance';
import { FinanceRevenue } from '../finance/FinanceRevenue';
import { ReportsAnalytics } from '../reports/ReportsAnalytics';

export const FinanceBranchPerformance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'performance';
  const [activeTab, setActiveTab] = useState(
    currentTab === 'finance' ? 'finance' : currentTab === 'reports' ? 'reports' : 'performance'
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      {/* Internal Navigation Header */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => handleTabChange('performance')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'performance'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Branch Performance</span>
        </button>

        <button
          onClick={() => handleTabChange('finance')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'finance'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Finance & Revenue</span>
        </button>

        <button
          onClick={() => handleTabChange('reports')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports & Analytics</span>
        </button>
      </div>

      {/* Render Consolidated View */}
      {activeTab === 'performance' && <BranchPerformance />}
      {activeTab === 'finance' && <FinanceRevenue />}
      {activeTab === 'reports' && <ReportsAnalytics />}
    </div>
  );
};
