import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Construction, ArrowLeft, Home, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ComingSoon = ({
  title = 'Module in Development',
  description = 'This specialized franchise operations module is scheduled for full deployment in the upcoming implementation phase.',
  moduleCode = 'OPS-AGENT',
  features = []
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Construction className="w-8 h-8" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/assets/travelsphere-ops-emblem.png" alt="TRAVELSPHERE OPS" className="w-5 h-5 object-contain" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TravelSphere Ops Platform</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          <span>Milestone 2 In Development &bull; {moduleCode}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>

        <p className="max-w-xl mx-auto text-sm text-slate-500 mt-2 leading-relaxed">
          {description}
        </p>

        {/* Feature roadmap preview */}
        {features.length > 0 && (
          <div className="max-w-md mx-auto my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Planned Capabilities:
            </h4>
            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Home}
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
