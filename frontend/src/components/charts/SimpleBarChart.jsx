import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * @param {Array<object>} data
 * @param {string} dataKey
 * @param {string} xKey
 * @param {string} color
 */
const SimpleBarChart = ({ data = [], dataKey = 'value', xKey = 'name', color = '#4f46e5', height = 280 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
      <XAxis dataKey={xKey} tickLine={false} axisLine={false} className="text-xs fill-gray-400" />
      <YAxis tickLine={false} axisLine={false} className="text-xs fill-gray-400" />
      <Tooltip
        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
      />
      <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={36} />
    </BarChart>
  </ResponsiveContainer>
);

export default SimpleBarChart;
