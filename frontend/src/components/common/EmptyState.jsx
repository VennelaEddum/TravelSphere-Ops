import React from 'react';
import { SearchX, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your current filters or search query.',
  actionLabel,
  onAction,
  onReset
}) => {
  return (
    <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200/80 my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center justify-center gap-2.5">
        {onReset && (
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onReset}>
            Clear Filters
          </Button>
        )}
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
