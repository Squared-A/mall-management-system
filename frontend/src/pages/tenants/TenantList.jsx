import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/tables/DataTable';
import TableActions from '../../components/tables/TableActions';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { useFetch } from '../../hooks/useFetch';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { tenantService } from '../../services/tenantService';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';

const SEED_TENANTS = [
  { _id: 't1', name: 'Alice Johnson', businessName: 'Bright Coffee Co.', email: 'alice@brightcoffee.com', phone: '+1 555 101 2020', shopNumber: '112', status: 'active', createdAt: '2022-01-10' },
  { _id: 't2', name: 'Bob Martinez', businessName: 'TechZone Electronics', email: 'bob@techzone.com', phone: '+1 555 202 3030', shopNumber: '204', status: 'active', createdAt: '2021-08-15' },
  { _id: 't3', name: 'Carol White', businessName: 'FashionHub', email: 'carol@fashionhub.com', phone: '+1 555 303 4040', shopNumber: '318', status: 'active', createdAt: '2020-05-22' },
  { _id: 't4', name: 'David Lee', businessName: 'Fresh Foods Inc.', email: 'david@freshfoods.com', phone: '+1 555 404 5050', shopNumber: '101', status: 'inactive', createdAt: '2019-11-01' },
  { _id: 't5', name: 'Eva Chen', businessName: 'Beauty Lounge', email: 'eva@beautylnge.com', phone: '+1 555 505 6060', shopNumber: '205', status: 'active', createdAt: '2023-03-05' },
];

const TenantList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { data, loading, refetch } = useFetch(async () => {
    try { return await tenantService.list(); }
    catch { return SEED_TENANTS; }
  }, []);

  const filtered = useMemo(() => {
    const items = data || SEED_TENANTS;
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter((t) =>
      t.name?.toLowerCase().includes(q) ||
      t.businessName?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q)
    );
  }, [data, debouncedSearch]);

  const { paginatedItems, page, pageSize, totalPages, goToPage, changePageSize } = usePagination(filtered);

  const handleDelete = async () => {
    setDeleting(true);
    try { await tenantService.remove(deleteTarget._id); toast.success('Tenant removed'); refetch(); }
    catch { toast.error('Failed to remove tenant'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns = [
    {
      key: 'name',
      header: 'Tenant',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">{row.name}</p>
            <p className="text-xs text-gray-400">{row.businessName}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (row) => <span className="text-sm">{row.email}</span> },
    { key: 'phone', header: 'Phone' },
    { key: 'shopNumber', header: 'Shop #', render: (row) => <span className="badge-gray">{row.shopNumber}</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'createdAt', header: 'Joined', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions', header: '', className: 'w-24',
      render: (row) => (
        <TableActions
          onView={() => navigate(ROUTES.TENANT_DETAILS.replace(':id', row._id))}
          onEdit={() => navigate(ROUTES.TENANT_EDIT.replace(':id', row._id))}
          onDelete={() => setDeleteTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Tenants"
        subtitle={`${filtered.length} tenant${filtered.length !== 1 ? 's' : ''} registered`}
        breadcrumbs={[{ label: 'Tenants' }]}
        actions={<Button icon={Plus} onClick={() => navigate(ROUTES.TENANT_ADD)}>Add Tenant</Button>}
      />
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, business, email..." className="max-w-xs" />
      </div>
      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyTitle="No tenants found"
        emptyMessage="Add your first tenant to begin managing leases and payments."
        pagination={{ page, totalPages, totalItems: filtered.length, pageSize, onPageChange: goToPage, onPageSizeChange: changePageSize }}
      />
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove tenant?"
        message={`Remove "${deleteTarget?.name}" (${deleteTarget?.businessName})? This may affect active leases.`}
        confirmLabel="Remove Tenant"
      />
    </>
  );
};

export default TenantList;
