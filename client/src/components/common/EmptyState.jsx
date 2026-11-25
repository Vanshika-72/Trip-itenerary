import React from 'react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-sand-300 rounded-2xl bg-white/60 ${className}`}
    >
      {Icon && (
        <div className="p-3.5 bg-forest-50 text-forest-800 rounded-2xl mb-4 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-forest-900 font-serif mb-1.5">{title}</h3>
      <p className="text-sm text-charcoal-600 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
