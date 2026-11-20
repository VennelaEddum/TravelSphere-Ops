import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings as SettingsIcon, Bell, Shield, Palette, Database } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="pb-4 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-teal-600" />
              TRAVELSPHERE OPS System & Franchise Preferences
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure TravelSphere Ops system notifications, visual theme, and operational alert triggers.
            </p>
          </div>
          <div className="p-2 px-3 rounded-xl bg-white border border-slate-200 shrink-0 self-start sm:self-auto flex items-center shadow-xs">
            <img
              src="/assets/travelsphere-ops-logo.png"
              alt="TRAVELSPHERE OPS"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification settings */}
          <div className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Operational Alerts & Notifications</h4>
                <p className="text-xs text-slate-500">Receive automated alerts when branch performance falls below 80% target.</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded cursor-pointer mt-1" />
          </div>

          {/* AI Insights automation */}
          <div className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Agentic AI Anomaly Detection</h4>
                <p className="text-xs text-slate-500">Automatically flag cancellation surges exceeding 10% threshold.</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded cursor-pointer mt-1" />
          </div>

          {/* Database & sync */}
          <div className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">SQLite Synchronization</h4>
                <p className="text-xs text-slate-500">Connected database: <code className="text-xs text-teal-700 bg-teal-50 px-1 py-0.5 rounded">travelsphere.db</code></p>
              </div>
            </div>
            <span className="text-xs text-emerald-600 font-bold">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
