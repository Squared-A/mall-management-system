import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import DataTable from '../../components/tables/DataTable';
import TableActions from '../../components/tables/TableActions';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { shopService } from '../../services/shopService';
import { useMall } from '../../context/MallContext';
import { ROUTES } from '../../constants/routes';
import { formatCurrency } from '../../utils/formatters';

const normalizeStatus = (status) => {
  const normalized = String(status || '').toLowerCase();
  return normalized === 'available' ? 'vacant' : normalized;
};

const normalizeShop = (shop = {}) => ({
  ...shop,
  name: shop.name || shop.category || `Shop ${shop.shopNumber ?? ''}`.trim(),
  mallName: shop.mallName || shop.mallId?.name || '',
  size: shop.size ?? 0,
  rent: shop.rent ?? shop.monthlyRent ?? 0,
  tenant: shop.tenant || shop.tenantId?.businessName || '',
  status: normalizeStatus(shop.status),
});
const SEED_SHOPS = [
  { _id: 's1', shopNumber: '101', name: 'Urban Eats', floor: 1, size: 450, rent: 4500, status: 'occupied', mallName: 'Skyline Grand Mall', tenant: 'Fresh Foods Inc.' },
  { _id: 's2', shopNumber: '102', name: 'TechZone', floor: 1, size: 320, rent: 3800, status: 'occupied', mallName: 'Skyline Grand Mall', tenant: 'Tech Hub Ltd.' },
  { _id: 's3', shopNumber: '201', name: 'Fashion Hub', floor: 2, size: 550, rent: 5200, status: 'vacant', mallName: 'Harbor View Plaza', tenant: null },
  { _id: 's4', shopNumber: '202', name: 'Bright Coffee', floor: 2, size: 180, rent: 2800, status: 'occupied', mallName: 'Harbor View Plaza', tenant: 'Coffee Roasters LLC' },
  { _id: 's5', shopNumber: '301', name: 'Kids Zone', floor: 3, size: 800, rent: 6000, status: 'maintenance', mallName: 'Central Park Mall', tenant: null },
  { _id: 's6', shopNumber: '302', name: 'Book Corner', floor: 3, size: 250, rent: 2400, status: 'vacant', mallName: 'Central Park Mall', tenant: null },
  { _id: 's7', shopNumber: '103', name: 'Beauty Lounge', floor: 1, size: 200, rent: 3200, status: 'occupied', mallName: 'Westfield Galleria', tenant: 'Glam Studios' },
  { _id: 's8', shopNumber: '203', name: 'Sports Outlet', floor: 2, size: 670, rent: 5800, status: 'occupied', mallName: 'Westfield Galleria', tenant: 'AthleteGear Inc.' },
];

const STATUS_OPTIONS = [
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'maintenance', label: 'Maintenance' },
];

const ShopList = () => {
  const navigate = useNavigate();
  const { activeMallId } = useMall();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);

  // Previously fetched once with an empty dependency array, so switching
  // the active mall (now possible via MallSelector) never refreshed this
  // list — an owner viewing Mall B's shops would keep seeing Mall A's
  // results until a full page reload.
  const { data = [], loading, refetch } = useFetch(async () => {
    const shops = await shopService.list();
    return shops.map(normalizeShop);
  }, [activeMallId]);

  const filtered = useMemo(() => {
    let items = data || [];
    if (statusFilter) items = items.filter((s) => s.status === statusFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((s) =>
        s.name?.toLowerCase().includes(q) ||
        String(s.shopNumber || '').toLowerCase().includes(q) ||
        s.mallName?.toLowerCase().includes(q) ||
        s.tenant?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, debouncedSearch, statusFilter]);

  const { paginatedItems, page, pageSize, totalPages, goToPage, changePageSize } = usePagination(filtered);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await shopService.remove(deleteTarget._id);
      toast.success('Shop deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete shop');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: 'shopNumber',
      header: 'Shop #',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-500/10 text-xs font-bold text-primary-600">
            {row.shopNumber}
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">{row.name}</p>
            <p className="text-xs text-gray-400">Floor {row.floor}</p>
          </div>
        </div>
      ),
    },
    { key: 'mallName', header: 'Mall', sortable: true },
    {
      key: 'size',
      header: 'Size (sqft)',
      render: (row) => row.size?.toLocaleString(),
    },
    {
      key: 'rent',
      header: 'Monthly Rent',
      render: (row) => formatCurrency(row.rent),
    },
    {
      key: 'tenant',
      header: 'Tenant',
      render: (row) => row.tenant || <span className="text-gray-400 text-xs">Unoccupied</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (row) => (
        <TableActions
          onView={() => navigate(ROUTES.SHOP_DETAILS.replace(':id', row._id))}
          onEdit={() => navigate(ROUTES.SHOP_EDIT.replace(':id', row._id))}
          onDelete={() => setDeleteTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Shops"
        subtitle={`${filtered.length} shop${filtered.length !== 1 ? 's' : ''} found`}
        breadcrumbs={[{ label: 'Shops' }]}
        actions={
          <Button icon={Plus} onClick={() => navigate(ROUTES.SHOP_ADD)}>
            Add Shop
          </Button>
        }
      />

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, number, mall..." className="max-w-xs" />
        <FilterDropdown value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} placeholder="All Statuses" />
      </div>

      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyTitle="No shops found"
        emptyMessage="Start adding shops to your malls."
        pagination={{ page, totalPages, totalItems: filtered.length, pageSize, onPageChange: goToPage, onPageSizeChange: changePageSize }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete shop?"
        message={`Delete shop "${deleteTarget?.shopNumber} — ${deleteTarget?.name}"? This action is irreversible.`}
        confirmLabel="Delete Shop"
      />
    </>
  );
};

export default ShopList;


