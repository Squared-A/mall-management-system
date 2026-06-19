import React, { useState } from 'react';
import { Download, TrendingUp, Home, TrendingDown } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RevenueChart from '../../components/charts/RevenueChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import OccupancyChart from '../../components/charts/OccupancyChart';
import { useFetch } from '../../hooks/useFetch';
import { reportService } from '../../services/miscServices';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, formatPercent } from '../../utils/formatters';

/* ─────────── Shared period selector ─────────── */
const PERIODS = [
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
];

const PeriodSelector = ({ value, onChange }) => (
  <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
    {PERIODS.map((p) => (
      <button
        key={p.value}
        onClick={() => onChange(p.value)}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          value === p.value
            ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-50'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        {p.label}
      </button>
    ))}
  </div>
);

/* ─────────── Seed data ─────────── */
const MONTHLY_REVENUE = [
  { name: 'Jan', revenue: 82000, expenses: 41000 },
  { name: 'Feb', revenue: 74000, expenses: 38000 },
  { name: 'Mar', revenue: 91000, expenses: 44000 },
  { name: 'Apr', revenue: 85000, expenses: 40000 },
  { name: 'May', revenue: 98000, expenses: 46000 },
  { name: 'Jun', revenue: 102000, expenses: 48000 },
  { name: 'Jul', revenue: 110000, expenses: 52000 },
  { name: 'Aug', revenue: 97000, expenses: 45000 },
  { name: 'Sep', revenue: 115000, expenses: 53000 },
  { name: 'Oct', revenue: 121000, expenses: 56000 },
  { name: 'Nov', revenue: 118000, expenses: 54000 },
  { name: 'Dec', revenue: 135000, expenses: 62000 },
];

const MALL_REVENUE = [
  { name: 'Skyline Grand', value: 420000 },
  { name: 'Harbor View', value: 290000 },
  { name: 'Central Park', value: 310000 },
  { name: 'Westfield', value: 380000 },
  { name: 'Northgate', value: 180000 },
];

const OCCUPANCY_DATA = [
  { name: 'Skyline Grand', value: 87 },
  { name: 'Harbor View', value: 82 },
  { name: 'Central Park', value: 84 },
  { name: 'Westfield', value: 91 },
  { name: 'Northgate', value: 80 },
];

const EXPENSE_DATA = [
  { name: 'Maintenance', value: 124000 },
  { name: 'Utilities', value: 98000 },
  { name: 'Security', value: 72000 },
  { name: 'Admin', value: 45000 },
  { name: 'Marketing', value: 38000 },
  { name: 'Insurance', value: 29000 },
];

/* ─────────── Revenue Report ─────────── */
export const RevenueReport = () => {
  const [period, setPeriod] = useState('1y');

  const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = MONTHLY_REVENUE.reduce((s, m) => s + m.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = ((netProfit / totalRevenue) * 100).toFixed(1);

  return (
    <>
      <PageHeader
        title="Revenue Report"
        subtitle="Comprehensive financial performance overview"
        breadcrumbs={[{ label: 'Reports' }, { label: 'Revenue' }]}
        actions={
          <Button variant="outline" icon={Download}>
            Export CSV
          </Button>
        }
      />

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10', icon: TrendingUp },
          { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: 'text-warning-600 bg-warning-50 dark:bg-warning-500/10', icon: TrendingDown },
          { label: 'Net Profit', value: formatCurrency(netProfit), color: 'text-success-600 bg-success-50 dark:bg-success-500/10', icon: TrendingUp },
          { label: 'Profit Margin', value: `${margin}%`, color: 'text-info-600 bg-info-50 dark:bg-info-500/10', icon: TrendingUp },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{kpi.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <Card
          title="Monthly Revenue vs Expenses"
          actions={<PeriodSelector value={period} onChange={setPeriod} />}
        >
          <RevenueChart data={MONTHLY_REVENUE} />
        </Card>

        <Card title="Revenue by Mall">
          <SimpleBarChart data={MALL_REVENUE} dataKey="value" xKey="name" color="#4f46e5" height={260} />
        </Card>

        <Card title="Breakdown by Mall" noPadding>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
              <tr>
                {['Mall', 'Revenue', 'Expenses', 'Net', 'Margin'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {MALL_REVENUE.map((mall) => {
                const exp = Math.round(mall.value * 0.48);
                const net = mall.value - exp;
                return (
                  <tr key={mall.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-100">{mall.name}</td>
                    <td className="px-5 py-3">{formatCurrency(mall.value)}</td>
                    <td className="px-5 py-3 text-warning-600">{formatCurrency(exp)}</td>
                    <td className="px-5 py-3 text-success-600 font-semibold">{formatCurrency(net)}</td>
                    <td className="px-5 py-3">{formatPercent(((net / mall.value) * 100), 1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
};

/* ─────────── Occupancy Report ─────────── */
export const OccupancyReport = () => {
  const [period, setPeriod] = useState('1y');
  const avgOccupancy = Math.round(OCCUPANCY_DATA.reduce((s, d) => s + d.value, 0) / OCCUPANCY_DATA.length);

  return (
    <>
      <PageHeader
        title="Occupancy Report"
        subtitle="Shop occupancy rates across all malls"
        breadcrumbs={[{ label: 'Reports' }, { label: 'Occupancy' }]}
        actions={
          <Button variant="outline" icon={Download}>
            Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Average Occupancy', value: formatPercent(avgOccupancy, 0) },
          { label: 'Total Shops', value: '485' },
          { label: 'Occupied', value: '411' },
          { label: 'Vacant', value: '74' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Overall Occupancy">
          <OccupancyChart occupied={411} vacant={74} />
        </Card>

        <Card title="Occupancy by Mall">
          <SimpleBarChart data={OCCUPANCY_DATA} dataKey="value" xKey="name" color="#10b981" height={260} />
        </Card>
      </div>

      <Card title="Mall-by-Mall Breakdown" noPadding>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
            <tr>
              {['Mall', 'Total Shops', 'Occupied', 'Vacant', 'Rate'].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { name: 'Skyline Grand Mall', total: 120, occ: 104 },
              { name: 'Harbor View Plaza', total: 88, occ: 72 },
              { name: 'Central Park Mall', total: 95, occ: 80 },
              { name: 'Westfield Galleria', total: 140, occ: 128 },
              { name: 'Northgate Center', total: 42, occ: 27 },
            ].map((mall) => {
              const vacant = mall.total - mall.occ;
              const rate = formatPercent((mall.occ / mall.total) * 100, 1);
              return (
                <tr key={mall.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-100">{mall.name}</td>
                  <td className="px-5 py-3">{mall.total}</td>
                  <td className="px-5 py-3 text-success-600 font-semibold">{mall.occ}</td>
                  <td className="px-5 py-3 text-gray-500">{vacant}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div className="h-full rounded-full bg-success-500" style={{ width: rate }} />
                      </div>
                      <span className="text-xs font-medium">{rate}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
};

/* ─────────── Expense Report ─────────── */
export const ExpenseReport = () => {
  const totalExpense = EXPENSE_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <PageHeader
        title="Expense Report"
        subtitle="Operational cost breakdown across categories"
        breadcrumbs={[{ label: 'Reports' }, { label: 'Expenses' }]}
        actions={
          <Button variant="outline" icon={Download}>
            Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Expenses (YTD)', value: formatCurrency(totalExpense) },
          { label: 'Monthly Average', value: formatCurrency(totalExpense / 12) },
          { label: 'Largest Category', value: 'Maintenance' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-50 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Expenses by Category">
          <SimpleBarChart data={EXPENSE_DATA} dataKey="value" xKey="name" color="#f59e0b" height={280} />
        </Card>

        <Card title="Category Breakdown" noPadding>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
              <tr>
                {['Category', 'Amount', '% of Total'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {EXPENSE_DATA.map((exp) => (
                <tr key={exp.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-100">{exp.name}</td>
                  <td className="px-5 py-3">{formatCurrency(exp.value)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div className="h-full rounded-full bg-warning-500" style={{ width: `${((exp.value / totalExpense) * 100).toFixed(0)}%` }} />
                      </div>
                      <span className="text-xs">{formatPercent((exp.value / totalExpense) * 100, 1)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
};
