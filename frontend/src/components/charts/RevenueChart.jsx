import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-gray-700 dark:text-gray-200">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

/**
 * @param {Array<{name: string, revenue: number, expenses?: number}>} data
 */
const RevenueChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
      <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs fill-gray-400" />
      <YAxis
        tickLine={false}
        axisLine={false}
        className="text-xs fill-gray-400"
        tickFormatter={(value) => `$${value / 1000}k`}
      />
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revenueGradient)" />
      <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={2} fill="url(#expensesGradient)" />
    </AreaChart>
  </ResponsiveContainer>
);

export default RevenueChart;
