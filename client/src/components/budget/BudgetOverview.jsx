import React from 'react';
import { Wallet, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BudgetOverview = ({ budgetData }) => {
  if (!budgetData) return null;

  const {
    totalBudget = 0,
    totalPlannedCost = 0,
    remainingBudget = 0,
    budgetPercentage = 0,
    isOverBudget = false,
    currency = 'USD',
  } = budgetData;

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Trip Budget
            </span>
            <Wallet className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900 font-serif">
            {formatCurrency(totalBudget, currency)}
          </div>
          <p className="text-xs text-charcoal-400 mt-1">Set limit for the trip</p>
        </div>

        {/* Planned Cost Card */}
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Planned Expenses
            </span>
            <TrendingUp className="w-4 h-4 text-sage-600" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900 font-serif">
            {formatCurrency(totalPlannedCost, currency)}
          </div>
          <p className="text-xs text-charcoal-400 mt-1">Sum of activity estimates</p>
        </div>

        {/* Remaining Budget Card */}
        <div
          className={`p-5 rounded-2xl border shadow-sm ${
            isOverBudget
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-white border-sand-200 text-charcoal-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isOverBudget ? 'text-red-700' : 'text-charcoal-500'
              }`}
            >
              {isOverBudget ? 'Over Budget By' : 'Remaining Budget'}
            </span>
            {isOverBudget ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-forest-700" />
            )}
          </div>
          <div
            className={`text-2xl font-extrabold font-serif ${
              isOverBudget ? 'text-red-700' : 'text-forest-900'
            }`}
          >
            {formatCurrency(Math.abs(remainingBudget), currency)}
          </div>
          <p
            className={`text-xs mt-1 ${
              isOverBudget ? 'text-red-600 font-medium' : 'text-charcoal-400'
            }`}
          >
            {isOverBudget ? 'Planned costs exceed budget' : 'Available to allocate'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {totalBudget > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-700">
            <span>Budget Allocation Progress</span>
            <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-forest-800'}>
              {budgetPercentage}% used
            </span>
          </div>

          <div className="w-full bg-sand-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-red-500' : 'bg-forest-800'
              }`}
              style={{ width: `${Math.min(100, budgetPercentage)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
