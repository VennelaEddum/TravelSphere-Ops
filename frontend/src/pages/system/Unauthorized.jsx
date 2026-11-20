import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const attemptedPath = location.state?.attemptedPath || 'the requested resource';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-5">
        <div className="flex items-center justify-center gap-2">
          <img src="/assets/travelsphere-ops-emblem.png" alt="TRAVELSPHERE OPS" className="w-5 h-5 object-contain" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">TravelSphere Ops Security</span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            403 &bull; Access Denied
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
            Restricted Operational Area
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Your authenticated role does not have security clearance to access <code className="text-rose-600 font-semibold px-1 py-0.5 bg-rose-50 rounded">{attemptedPath}</code>.
          </p>
        </div>

        {/* User permissions badge */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-left space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Authenticated User:</span>
            <span className="font-semibold text-slate-800">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Role:</span>
            <span className="font-semibold text-teal-600">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Branch Scope:</span>
            <span className="font-semibold text-slate-800">{user?.branchName || 'Mumbai'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>

          <Button
            variant="navy"
            size="md"
            icon={Home}
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
