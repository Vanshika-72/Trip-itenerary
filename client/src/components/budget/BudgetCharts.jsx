import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, getCategoryColor } from '../../utils/formatters';

const CATEGORY_COLORS = {
  Sightseeing: '#234638',
  Food: '#bf9868',
  Accommodation: '#46745f',
  Transportation: '#3b82f6',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Other: '#94a3b8',
};

export const BudgetCharts = ({ budgetData }) => {
  if (!budgetData) return null;

  const { chartData = [], byCategory = [], currency = 'USD' } = budgetData;

  const filteredData = chartData.filter((item) => item.amount > 0);

  if (filteredData.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-sand-200 text-center text-charcoal-500 text-sm">
        No planned expenses added to any activities yet.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-charcoal-900 text-white text-xs p-2.5 rounded-lg shadow-lg">
          <p className="font-bold">{payload[0].name}</p>
          <p className="text-sand-200">
            {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Pie Chart */}
      <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-forest-900 font-serif">
          Spending by Category (Proportion)
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {filteredData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-forest-900 font-serif">
          Category Expenses Breakdown
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1efe9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#666' }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#234638" radius={[4, 4, 0, 0]}>
                {filteredData.map((entry) => (
                  <Cell
                    key={`bar-${entry.name}`}
                    fill={CATEGORY_COLORS[entry.name] || '#234638'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Detail Table */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-sand-200">
          <h4 className="text-sm font-bold text-forest-900 font-serif">
            Expenses Summary Table
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-50/70 border-b border-sand-200 uppercase text-charcoal-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Activities</th>
                <th className="px-6 py-3 text-right">Total Planned Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {byCategory.map((cat) => (
                <tr key={cat.category} className="hover:bg-sand-50/50 transition">
                  <td className="px-6 py-3.5 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }}
                    />
                    <span className="font-semibold text-charcoal-800">{cat.category}</span>
                  </td>
                  <td className="px-6 py-3.5 text-charcoal-600 font-medium">
                    {cat.count} {cat.count === 1 ? 'activity' : 'activities'}
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-forest-900">
                    {formatCurrency(cat.total, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetCharts;
