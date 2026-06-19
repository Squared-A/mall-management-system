import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Home, TrendingDown, Building2, Users, BookOpen } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RevenueChart from '../../components/charts/RevenueChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import OccupancyChart from '../../components/charts/OccupancyChart';
import { useFetch } from '../../hooks/useFetch';
import { reportService, dashboardService } from '../../services/miscServices';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { useMall } from '../../context/MallContext';

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

/* ─────────── Platform Report (Super Admin) ─────────── */
export const PlatformReport = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMalls: 0,
    totalUsers: 0,
    totalTenants: 0,
    totalAnnouncements: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        setLoading(true);
        const [statsRes, revenueRes] = await Promise.all([
          dashboardService.stats(),
          dashboardService.revenueSummary(),
        ]);

        setStats(statsRes);
        setRevenueData(revenueRes.revenueData || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch platform report:', err);
        setError('Failed to load platform data');
        setStats({
          totalMalls: 0,
          totalUsers: 0,
          totalTenants: 0,
          totalAnnouncements: 0,
        });
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'super_admin') {
      fetchPlatformData();
    }
  }, [user]);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Platform Report"
          subtitle="System-wide overview for platform administrators"
          breadcrumbs={[{ label: 'Reports' }, { label: 'Platform' }]}
        />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading platform data...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Platform Report"
          subtitle="System-wide overview for platform administrators"
          breadcrumbs={[{ label: 'Reports' }, { label: 'Platform' }]}
        />
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Platform Report"
        subtitle="System-wide overview for platform administrators"
        breadcrumbs={[{ label: 'Reports' }, { label: 'Platform' }]}
        actions={
          <Button variant="outline" icon={Download}>
            Export CSV
          </Button>
        }
      />

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Malls', value: stats.totalMalls || 0, icon: Building2, color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' },
          { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Total Tenants', value: stats.totalTenants || 0, icon: Home, color: 'text-success-600 bg-success-50 dark:bg-success-500/10' },
          { label: 'Announcements', value: stats.totalAnnouncements || 0, icon: BookOpen, color: 'text-info-600 bg-info-50 dark:bg-info-500/10' },
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
        {revenueData.length > 0 ? (
          <Card title="Platform Revenue Overview">
            <RevenueChart data={revenueData} />
          </Card>
        ) : (
          <Card title="Platform Revenue Overview">
            <div className="h-64 flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          </Card>
        )}

        <Card title="Platform Summary" noPadding>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Registered Malls</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{stats.totalMalls}</p>
              </div>
              <div>
                <p className="text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{stats.totalUsers}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{stats.totalTenants}</p>
              </div>
              <div>
                <p className="text-gray-500">Announcements</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{stats.totalAnnouncements}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};


/* ─────────── Revenue Report ─────────── */
export const RevenueReport = () => {
  const { activeMallId } = useMall();
  const [period, setPeriod] = useState('1y');
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const data = await reportService.revenue({ period });
        setRevenueData(data.revenueData || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch revenue report:', err);
        setError('Failed to load revenue data');
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
    // Previously depended on [period] only; switching the active mall
    // never triggered a refetch, so an owner switching malls kept seeing
    // the previous mall's revenue chart.
  }, [period, activeMallId]);

  const totalRevenue = revenueData.reduce((s, m) => s + (m.revenue || 0), 0);
  const totalExpenses = revenueData.reduce((s, m) => s + (m.expense || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <>
        <PageHeader
          title="Revenue Report"
          subtitle="Comprehensive financial performance overview"
          breadcrumbs={[{ label: 'Reports' }, { label: 'Revenue' }]}
        />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading revenue data...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Revenue Report"
          subtitle="Comprehensive financial performance overview"
          breadcrumbs={[{ label: 'Reports' }, { label: 'Revenue' }]}
        />
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </>
    );
  }

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
        {revenueData.length > 0 ? (
          <Card
            title="Monthly Revenue vs Expenses"
            actions={<PeriodSelector value={period} onChange={setPeriod} />}
          >
            <RevenueChart data={revenueData} />
          </Card>
        ) : (
          <Card title="Monthly Revenue vs Expenses">
            <div className="h-64 flex items-center justify-center text-gray-500">
              No revenue data available for the selected period
            </div>
          </Card>
        )}

        <Card title="Breakdown by Mall" noPadding>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
              <tr>
                {['Month', 'Revenue', 'Expenses', 'Net', 'Margin'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {revenueData.length > 0 ? (
                revenueData.map((month) => {
                  const exp = month.expense || 0;
                  const rev = month.revenue || 0;
                  const net = rev - exp;
                  const margin = rev > 0 ? ((net / rev) * 100).toFixed(1) : 0;
                  return (
                    <tr key={month.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-100">{month.name}</td>
                      <td className="px-5 py-3">{formatCurrency(rev)}</td>
                      <td className="px-5 py-3 text-warning-600">{formatCurrency(exp)}</td>
                      <td className="px-5 py-3 text-success-600 font-semibold">{formatCurrency(net)}</td>
                      <td className="px-5 py-3">{formatPercent(margin, 1)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
};

/* ─────────── Occupancy Report ─────────── */
export const OccupancyReport = () => {
  const { activeMallId } = useMall();
  const [period, setPeriod] = useState('1y');
  const [occupancyData, setOccupancyData] = useState({
    totalShops: 0,
    occupiedShops: 0,
    vacantShops: 0,
    occupancyRate: 0,
    shopDetails: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOccupancyData = async () => {
      try {
        setLoading(true);
        const data = await reportService.occupancy({ period });
        setOccupancyData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch occupancy report:', err);
        setError('Failed to load occupancy data');
        setOccupancyData({
          totalShops: 0,
          occupiedShops: 0,
          vacantShops: 0,
          occupancyRate: 0,
          shopDetails: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOccupancyData();
    // See RevenueReport note above — same stale-mall bug.
  }, [period, activeMallId]);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Occupancy Report"
          subtitle="Shop occupancy rates across all malls"
          breadcrumbs={[{ label: 'Reports' }, { label: 'Occupancy' }]}
        />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading occupancy data...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Occupancy Report"
          subtitle="Shop occupancy rates across all malls"
          breadcrumbs={[{ label: 'Reports' }, { label: 'Occupancy' }]}
        />
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </>
    );
  }

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
          { label: 'Average Occupancy', value: formatPercent(occupancyData.occupancyRate, 0) },
          { label: 'Total Shops', value: occupancyData.totalShops },
          { label: 'Occupied', value: occupancyData.occupiedShops },
          { label: 'Vacant', value: occupancyData.vacantShops },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Overall Occupancy">
          {occupancyData.totalShops > 0 ? (
            <OccupancyChart occupied={occupancyData.occupiedShops} vacant={occupancyData.vacantShops} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No occupancy data available
            </div>
          )}
        </Card>

        <Card title="Status Summary">
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Occupancy Rate</span>
              <span className="text-lg font-bold text-success-600">{formatPercent(occupancyData.occupancyRate, 1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Occupied Shops</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-50">{occupancyData.occupiedShops}/{occupancyData.totalShops}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Shop Details" noPadding>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
            <tr>
              {['Shop Number', 'Status', 'Tenant', 'Rent Amount'].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {occupancyData.shopDetails.length > 0 ? (
              occupancyData.shopDetails.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-100">{shop.shopNumber}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shop.status === 'OCCUPIED'
                        ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-200'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{shop.tenant}</td>
                  <td className="px-5 py-3">{formatCurrency(shop.rentAmount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-gray-500">
                  No shop data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
};

/* ─────────── Expense Report ─────────── */
export const ExpenseReport = () => {
  const { activeMallId } = useMall();
  const [expenseData, setExpenseData] = useState({
    totalExpense: 0,
    byCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setLoading(true);
        const data = await reportService.expense();
        setExpenseData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch expense report:', err);
        setError('Failed to load expense data');
        setExpenseData({
          totalExpense: 0,
          byCategory: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseData();
    // Previously had an empty dependency array, so this report loaded
    // exactly once at mount and never refreshed for any reason — not even
    // a mall switch.
  }, [activeMallId]);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Expense Report"
          subtitle="Operational cost breakdown across categories"
          breadcrumbs={[{ label: 'Reports' }, { label: 'Expenses' }]}
        />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading expense data...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Expense Report"
          subtitle="Operational cost breakdown across categories"
          breadcrumbs={[{ label: 'Reports' }, { label: 'Expenses' }]}
        />
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </>
    );
  }

  const chartData = expenseData.byCategory.map((item) => ({
    name: item._id,
    value: item.amount,
  }));

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
          { label: 'Total Expenses (YTD)', value: formatCurrency(expenseData.totalExpense) },
          { label: 'Monthly Average', value: formatCurrency(expenseData.totalExpense / 12) },
          { label: 'Categories', value: expenseData.byCategory.length },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-50 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {chartData.length > 0 ? (
          <Card title="Expenses by Category">
            <SimpleBarChart data={chartData} dataKey="value" xKey="name" color="#f59e0b" height={280} />
          </Card>
        ) : (
          <Card title="Expenses by Category">
            <div className="h-80 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          </Card>
        )}

        <Card title="Summary">
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
              <span className="text-lg font-bold text-warning-600">{formatCurrency(expenseData.totalExpense)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Categories</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-50">{expenseData.byCategory.length}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Expense Breakdown" noPadding>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
            <tr>
              {['Category', 'Amount', '% of Total', 'Count'].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {expenseData.byCategory.length > 0 ? (
              expenseData.byCategory.map((exp) => {
                const percentage = expenseData.totalExpense > 0 ? ((exp.amount / expenseData.totalExpense) * 100).toFixed(1) : 0;
                return (
                  <tr key={exp._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-100">{exp._id}</td>
                    <td className="px-5 py-3">{formatCurrency(exp.amount)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div className="h-full rounded-full bg-warning-500" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-xs">{percentage}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">{exp.count}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-gray-500">
                  No expense data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
};

