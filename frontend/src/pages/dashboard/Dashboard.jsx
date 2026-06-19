import React from 'react';
import {
  DollarSign,
  Home,
  FileSignature,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import StatCard from './StatCard';
import Card from '../../components/common/Card';
import RevenueChart from '../../components/charts/RevenueChart';
import OccupancyChart from '../../components/charts/OccupancyChart';
import { formatCurrency } from '../../utils/formatters';
import {
  MOCK_STATS,
  MOCK_REVENUE_DATA,
  MOCK_OCCUPANCY,
  MOCK_RECENT_ACTIVITIES,
  MOCK_TOP_SHOPS,
} from './mockData';
import { ROUTES } from '../../constants/routes';

const STAT_ICONS = [DollarSign, Home, FileSignature, CreditCard];

const ACTIVITY_COLORS = {
  success: 'bg-success-500',
  info: 'bg-info-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  primary: 'bg-primary-500',
  gray: 'bg-gray-400',
};

const Dashboard = () => {
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening across your mall operations today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex h-2 w-2 rounded-full bg-success-500 animate-pulse" />
          All systems operational
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {MOCK_STATS.map((stat, idx) => (
          <StatCard
            key={stat.id}
            {...stat}
            icon={STAT_ICONS[idx]}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card
          className="xl:col-span-2"
          title="Revenue Overview"
          subtitle="Monthly revenue vs expenses (current year)"
          actions={
            <Link to={ROUTES.REPORTS_REVENUE} className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
              Full report <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <RevenueChart data={MOCK_REVENUE_DATA} />
        </Card>

        <Card
          title="Occupancy Rate"
          subtitle="Shops occupied vs vacant"
          actions={
            <Link to={ROUTES.REPORTS_OCCUPANCY} className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <OccupancyChart occupied={MOCK_OCCUPANCY.occupied} vacant={MOCK_OCCUPANCY.vacant} />
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary-50 dark:bg-primary-500/10 p-3 text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{MOCK_OCCUPANCY.occupied}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Occupied</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{MOCK_OCCUPANCY.vacant}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vacant</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom row: Activity + Top Shops */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <Card
          title="Recent Activity"
          subtitle="Latest events across your malls"
          actions={
            <span className="badge-gray">Live</span>
          }
        >
          <ul className="space-y-0 divide-y divide-gray-50 dark:divide-gray-800 -mx-5">
            {MOCK_RECENT_ACTIVITIES.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <span className={clsx('mt-2 h-2 w-2 shrink-0 rounded-full', ACTIVITY_COLORS[activity.color])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{activity.time}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Top Performing Shops */}
        <Card
          title="Top Shops by Revenue"
          subtitle="This month's highest earners"
          actions={
            <Link to={ROUTES.SHOPS} className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
              All shops <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <ul className="space-y-3 mt-1">
            {MOCK_TOP_SHOPS.map((shop, idx) => {
              const maxRevenue = MOCK_TOP_SHOPS[0].revenue;
              const pct = Math.round((shop.revenue / maxRevenue) * 100);
              const isPositive = shop.trend.startsWith('+');
              return (
                <li key={shop.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{shop.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(shop.revenue)}</span>
                      <span className={clsx('text-xs font-medium', isPositive ? 'text-success-600' : 'text-danger-600')}>
                        {shop.trend}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
