import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  variant = 'teal', // 'teal' | 'navy' | 'amber' | 'rose' | 'emerald'
  loading = false,
  className = '',
}) => {
  const iconColors = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    navy: 'bg-navy-50 text-navy-800 border-navy-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm animate-pulse ${className}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-7 bg-slate-300 rounded w-32 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-40"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${iconColors[variant] || iconColors.teal}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend && (
            <span className={`inline-flex items-center font-medium gap-1 ${
              trendType === 'up'
                ? 'text-emerald-600'
                : trendType === 'down'
                ? 'text-rose-600'
                : 'text-slate-500'
            }`}>
              {trendType === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : trendType === 'down' ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
          )}
          {subtext && (
            <span className="text-slate-500 truncate ml-auto">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
