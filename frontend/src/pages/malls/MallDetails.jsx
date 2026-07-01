import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Pencil, Building2, Phone, Mail, Globe, MapPin, Store, Users, DollarSign } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { mallService } from '../../services/mallService';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatters';

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
    {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />}
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{value || '—'}</p>
    </div>
  </div>
);

const SEED_MALL = {
  _id: 'm1',
  name: 'Skyline Grand Mall',
  address: '123 Mall Avenue',
  city: 'New York',
  state: 'NY',
  country: 'United States',
  postalCode: '10001',
  phone: '+1 555 000 0000',
  email: 'info@skylinegrand.com',
  website: 'https://skylinegrand.com',
  totalFloors: 4,
  totalShops: 120,
  occupied: 104,
  status: 'active',
  createdAt: '2021-03-15',
  revenue: 1230000,
  description: 'A premier retail destination in the heart of Manhattan featuring luxury brands, dining, and entertainment.',
};

const MallDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: mall, loading } = useFetch(async () => {
    try {
      return await mallService.getById(id);
    } catch {
      return SEED_MALL;
    }
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;

  const occupancy = mall?.totalShops ? Math.round((mall.occupied / mall.totalShops) * 100) : 0;

  return (
    <>
      <PageHeader
        title={mall?.name || 'Mall Details'}
        breadcrumbs={[{ label: 'Malls', to: ROUTES.MALLS }, { label: mall?.name }]}
        actions={
          <Button icon={Pencil} onClick={() => navigate(ROUTES.MALL_EDIT.replace(':id', id))}>
            Edit Mall
          </Button>
        }
      />

      {/* Quick stat cards */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Shops', value: mall?.totalShops, icon: Store, color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' },
          { label: 'Occupied', value: mall?.occupied, icon: Users, color: 'text-success-600 bg-success-50 dark:bg-success-500/10' },
          { label: 'Occupancy Rate', value: formatPercent(occupancy, 0), icon: Building2, color: 'text-info-600 bg-info-50 dark:bg-info-500/10' },
          { label: 'Revenue', value: formatCurrency(mall?.revenue), icon: DollarSign, color: 'text-warning-600 bg-warning-50 dark:bg-warning-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Mall Information" className="lg:col-span-2">
          <InfoRow label="Full Name" value={mall?.name} icon={Building2} />
          <InfoRow label="Address" value={`${mall?.address}, ${mall?.city}, ${mall?.state} ${mall?.postalCode}, ${mall?.country}`} icon={MapPin} />
          <InfoRow label="Phone" value={mall?.phone} icon={Phone} />
          <InfoRow label="Email" value={mall?.email} icon={Mail} />
          <InfoRow label="Website" value={mall?.website} icon={Globe} />
          <InfoRow label="Total Floors" value={mall?.totalFloors} />
          <InfoRow label="Description" value={mall?.description} />
          <InfoRow label="Member Since" value={formatDate(mall?.createdAt)} />
        </Card>

        <div className="space-y-4">
          <Card title="Status">
            <div className="flex items-center gap-3 mt-1">
              <Badge status={mall?.status} />
              <span className="text-sm text-gray-500 dark:text-gray-400">Current status</span>
            </div>
          </Card>

          <Card title="Occupancy">
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Occupied</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{mall?.occupied} / {mall?.totalShops}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
              <p className="text-right text-sm font-semibold text-primary-600">{occupancy}%</p>
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-2">
              <Link to={ROUTES.SHOPS + `?mall=${id}`} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors">
                <Store className="h-4 w-4 text-gray-400" /> View All Shops
              </Link>
              <Link to={ROUTES.TENANTS + `?mall=${id}`} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors">
                <Users className="h-4 w-4 text-gray-400" /> View All Tenants
              </Link>
              <Link to={ROUTES.REPORTS_REVENUE + `?mall=${id}`} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors">
                <DollarSign className="h-4 w-4 text-gray-400" /> Revenue Report
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MallDetails;
