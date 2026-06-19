import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#e5e7eb'];
const COLORS_DARK = ['#818cf8', '#374151'];

/**
 * @param {{ occupied: number, vacant: number }} data
 */
const OccupancyChart = ({ occupied = 0, vacant = 0 }) => {
  const data = [
    { name: 'Occupied', value: occupied },
    { name: 'Vacant', value: vacant },
  ];
  const total = occupied + vacant;
  const occupancyRate = total ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} className="dark:opacity-90" />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -translate-y-4">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-50">{occupancyRate}%</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Occupied</span>
      </div>
    </div>
  );
};

export default OccupancyChart;
