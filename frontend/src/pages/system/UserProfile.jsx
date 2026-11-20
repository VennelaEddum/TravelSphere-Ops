import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Shield, Building, MapPin, Key, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const UserProfile = () => {
  const { user, isDemo } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h2>
                <Badge variant="primary" size="md">
                  {user?.role}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{user?.title || 'Franchise Representative'}</p>
            </div>

            {isDemo && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto">
                Evaluation Demo Account
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Mail className="w-4 h-4 text-teal-600" />
              {user?.email}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Building className="w-4 h-4 text-teal-600" />
              Branch: {user?.branchName || 'All Branches'}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-teal-600" />
              Location: {user?.city || 'India'}
            </span>
          </div>
        </div>

        {/* TravelSphere Ops Franchise Membership Card */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#142B4A] to-[#0F9D9A] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 px-2.5 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <img
                src="/assets/travelsphere-ops-logo.png"
                alt="TRAVELSPHERE OPS"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-200 block">
                Verified Franchise Account
              </span>
              <h3 className="text-sm font-bold text-white">TRAVELSPHERE OPS Enterprise Platform</h3>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/20 border border-white/30 text-white hidden sm:block">
            {user?.branchName || 'Head Office'}
          </span>
        </div>

        {/* Security & Access Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-600" />
              Role & Permissions
            </h4>
            <p className="text-xs text-slate-600 mb-2">
              Your role defines page visibility, branch filtering, and financial metrics access.
            </p>
            <span className="inline-block text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
              Authorized Role: {user?.role}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-teal-600" />
              Session Status
            </h4>
            <p className="text-xs text-slate-600 mb-2">
              Authenticated session with JWT token persistence.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified Session
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
