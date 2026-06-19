import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/tables/DataTable';
import TableActions from '../../components/tables/TableActions';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { mallService } from '../../services/mallService';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';

// Seed data when backend is not connected
const SEED_MALLS = [
  { _id: 'm1', name: 'Skyline Grand Mall', city: 'New York', totalShops: 120, occupied: 104, status: 'active', createdAt: '2021-03-15' },
  { _id: 'm2', name: 'Harbor View Plaza', city: 'Miami', totalShops: 88, occupied: 72, status: 'active', createdAt: '2020-07-22' },
  { _id: 'm3', name: 'Central Park Mall', city: 'Chicago', totalShops: 95, occupied: 80, status: 'active', createdAt: '2019-11-10' },
  { _id: 'm4', name: 'Westfield Galleria', city: 'Los Angeles', totalShops: 140, occupied: 128, status: 'active', createdAt: '2022-01-05' },
  { _id: 'm5', name: 'Northgate Center', city: 'Seattle', totalShops: 64, occupied: 51, status: 'maintenance', createdAt: '2020-09-18' },
  { _id: 'm6', name: 'Downtown Square', city: 'Houston', totalShops: 78, occupied: 60, status: 'active', createdAt: '2021-06-30' },
];

const MallList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { data, loading, error, refetch } = useFetch(async () => {
    try {
      return await mallService.list();
    } catch {
      return SEED_MALLS;
    }
  }, []);

  const filtered = useMemo(() => {
    const items = data || SEED_MALLS;
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter(
      (m) => m.name?.toLowerCase().includes(q) || m.city?.toLowerCase().includes(q)
    );
  }, [data, debouncedSearch]);

  const { paginatedItems, page, pageSize, totalPages, goToPage, changePageSize } = usePagination(filtered);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await mallService.remove(deleteTarget._id);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      refetch();
    } catch {
      toast.error('Failed to delete mall');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Mall Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-500/10">
            <Building2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">{row.name}</p>
            <p className="text-xs text-gray-400">{row.city}</p>
          </div>
        </div>
      ),
    },
    { key: 'totalShops', header: 'Total Shops', sortable: true },
    {
      key: 'occupied',
      header: 'Occupancy',
      render: (row) => {
        const pct = row.totalShops ? Math.round((row.occupied / row.totalShops) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm">{pct}%</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (row) => (
        <TableActions
          onView={() => navigate(ROUTES.MALL_DETAILS.replace(':id', row._id))}
          onEdit={() => navigate(ROUTES.MALL_EDIT.replace(':id', row._id))}
          onDelete={() => setDeleteTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Malls"
        subtitle={`${filtered.length} mall${filtered.length !== 1 ? 's' : ''} found`}
        breadcrumbs={[{ label: 'Malls' }]}
        actions={
          <Button icon={Plus} onClick={() => navigate(ROUTES.MALL_ADD)}>
            Add Mall
          </Button>
        }
      />

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or city..."
          className="max-w-xs"
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyTitle="No malls found"
        emptyMessage="Add your first mall to get started managing your properties."
        pagination={{
          page,
          totalPages,
          totalItems: filtered.length,
          pageSize,
          onPageChange: goToPage,
          onPageSizeChange: changePageSize,
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete mall?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated data will be permanently removed.`}
        confirmLabel="Delete Mall"
      />
    </>
  );
};

export default MallList;
