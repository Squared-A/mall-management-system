import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, FileSignature, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import DataTable from '../../components/tables/DataTable';
import TableActions from '../../components/tables/TableActions';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TextInput from '../../components/forms/TextInput';
import SelectInput from '../../components/forms/SelectInput';
import TextArea from '../../components/forms/TextArea';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { leaseService } from '../../services/leaseService';
import { ROUTES } from '../../constants/routes';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { isRequired, isPositiveNumber } from '../../utils/validators';

const SEED_LEASES = [
  { _id: 'l1', leaseNumber: 'LSE-001', tenant: 'Alice Johnson', shop: 'Shop #112', startDate: '2022-01-10', endDate: '2024-01-09', monthlyRent: 4500, status: 'active' },
  { _id: 'l2', leaseNumber: 'LSE-002', tenant: 'Bob Martinez', shop: 'Shop #204', startDate: '2021-08-15', endDate: '2023-08-14', monthlyRent: 3800, status: 'expired' },
  { _id: 'l3', leaseNumber: 'LSE-003', tenant: 'Carol White', shop: 'Shop #318', startDate: '2023-03-01', endDate: '2025-02-28', monthlyRent: 5200, status: 'active' },
  { _id: 'l4', leaseNumber: 'LSE-004', tenant: 'Eva Chen', shop: 'Shop #205', startDate: '2023-03-05', endDate: '2026-03-04', monthlyRent: 3200, status: 'pending' },
  { _id: 'l5', leaseNumber: 'LSE-005', tenant: 'David Lee', shop: 'Shop #101', startDate: '2019-11-01', endDate: '2022-10-31', monthlyRent: 4100, status: 'terminated' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'pending', label: 'Pending' },
];

export const LeaseList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { data, loading, refetch } = useFetch(async () => {
    try { return await leaseService.list(); }
    catch { return SEED_LEASES; }
  }, []);

  const filtered = useMemo(() => {
    let items = data || SEED_LEASES;
    if (statusFilter) items = items.filter((l) => l.status === statusFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((l) => l.tenant?.toLowerCase().includes(q) || l.shop?.toLowerCase().includes(q) || l.leaseNumber?.toLowerCase().includes(q));
    }
    return items;
  }, [data, debouncedSearch, statusFilter]);

  const { paginatedItems, page, pageSize, totalPages, goToPage, changePageSize } = usePagination(filtered);

  const handleDelete = async () => {
    setDeleting(true);
    try { await leaseService.remove(deleteTarget._id); toast.success('Lease deleted'); refetch(); }
    catch { toast.error('Failed to delete lease'); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const columns = [
    {
      key: 'leaseNumber',
      header: 'Lease #',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FileSignature className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="font-mono font-semibold text-primary-600">{row.leaseNumber}</span>
        </div>
      ),
    },
    { key: 'tenant', header: 'Tenant', sortable: true },
    { key: 'shop', header: 'Shop' },
    { key: 'startDate', header: 'Start Date', render: (row) => formatDate(row.startDate) },
    { key: 'endDate', header: 'End Date', render: (row) => formatDate(row.endDate) },
    { key: 'monthlyRent', header: 'Monthly Rent', render: (row) => formatCurrency(row.monthlyRent) },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> },
    {
      key: 'actions', header: '', className: 'w-24',
      render: (row) => (
        <TableActions
          onView={() => navigate(ROUTES.LEASE_DETAILS.replace(':id', row._id))}
          onDelete={() => setDeleteTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Leases"
        subtitle={`${filtered.length} lease${filtered.length !== 1 ? 's' : ''} found`}
        breadcrumbs={[{ label: 'Leases' }]}
        actions={<Button icon={Plus} onClick={() => navigate(ROUTES.LEASE_CREATE)}>Create Lease</Button>}
      />
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search leases..." className="max-w-xs" />
        <FilterDropdown value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} placeholder="All Statuses" />
      </div>
      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyTitle="No leases found"
        emptyMessage="Create your first lease agreement to get started."
        pagination={{ page, totalPages, totalItems: filtered.length, pageSize, onPageChange: goToPage, onPageSizeChange: changePageSize }}
      />
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete lease?"
        message={`Delete lease "${deleteTarget?.leaseNumber}"? This cannot be undone.`}
        confirmLabel="Delete Lease"
      />
    </>
  );
};

export const CreateLease = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleSubmit } = useForm(
    { tenantId: '', shopId: '', startDate: '', endDate: '', monthlyRent: '', securityDeposit: '', paymentDueDay: '1', notes: '' },
    {
      tenantId: [(v) => (!isRequired(v) ? 'Tenant is required' : null)],
      shopId: [(v) => (!isRequired(v) ? 'Shop is required' : null)],
      startDate: [(v) => (!isRequired(v) ? 'Start date is required' : null)],
      endDate: [(v) => (!isRequired(v) ? 'End date is required' : null)],
      monthlyRent: [
        (v) => (!isRequired(v) ? 'Monthly rent is required' : null),
        (v) => (!isPositiveNumber(v) ? 'Must be a positive number' : null),
      ],
    },
    async (vals) => {
      setLoading(true);
      try { await leaseService.create(vals); toast.success('Lease created!'); navigate(ROUTES.LEASES); }
      catch (err) { toast.error(err?.response?.data?.message || 'Failed to create lease'); }
      finally { setLoading(false); }
    }
  );

  return (
    <>
      <PageHeader title="Create Lease" breadcrumbs={[{ label: 'Leases', to: ROUTES.LEASES }, { label: 'Create' }]} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Lease Parties">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Tenant ID" name="tenantId" placeholder="Search or enter tenant ID" value={values.tenantId} onChange={handleChange} error={errors.tenantId} required />
            <TextInput label="Shop ID" name="shopId" placeholder="Search or enter shop ID" value={values.shopId} onChange={handleChange} error={errors.shopId} required />
          </div>
        </Card>
        <Card title="Lease Terms">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Start Date" name="startDate" type="date" icon={Calendar} value={values.startDate} onChange={handleChange} error={errors.startDate} required />
            <TextInput label="End Date" name="endDate" type="date" icon={Calendar} value={values.endDate} onChange={handleChange} error={errors.endDate} required />
            <TextInput label="Monthly Rent ($)" name="monthlyRent" type="number" icon={DollarSign} placeholder="4500" value={values.monthlyRent} onChange={handleChange} error={errors.monthlyRent} required />
            <TextInput label="Security Deposit ($)" name="securityDeposit" type="number" icon={DollarSign} placeholder="9000" value={values.securityDeposit} onChange={handleChange} />
            <SelectInput label="Payment Due Day" name="paymentDueDay" value={values.paymentDueDay} onChange={handleChange}
              options={Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}${['st','nd','rd'][i] || 'th'} of each month` }))}
            />
            <TextArea label="Notes" name="notes" placeholder="Any special terms or conditions..." value={values.notes} onChange={handleChange} rows={3} className="sm:col-span-2" />
          </div>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Lease</Button>
        </div>
      </form>
    </>
  );
};

const SEED_LEASE = { _id: 'l1', leaseNumber: 'LSE-001', tenant: 'Alice Johnson', tenantEmail: 'alice@brightcoffee.com', shop: 'Shop #112', mall: 'Skyline Grand Mall', startDate: '2022-01-10', endDate: '2024-01-09', monthlyRent: 4500, securityDeposit: 9000, paymentDueDay: 1, status: 'active', notes: 'First month rent-free.' };

export const LeaseDetails = () => {
  const { id } = useParams();
  const { data: lease, loading } = useFetch(async () => {
    try { return await leaseService.getById(id); }
    catch { return SEED_LEASE; }
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <PageHeader
        title={`Lease ${lease?.leaseNumber}`}
        subtitle={`${lease?.tenant} — ${lease?.shop}`}
        breadcrumbs={[{ label: 'Leases', to: ROUTES.LEASES }, { label: lease?.leaseNumber }]}
        actions={<Badge status={lease?.status} />}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Lease Details">
          {[
            { label: 'Lease Number', value: lease?.leaseNumber },
            { label: 'Tenant', value: lease?.tenant },
            { label: 'Tenant Email', value: lease?.tenantEmail },
            { label: 'Shop', value: lease?.shop },
            { label: 'Mall', value: lease?.mall },
            { label: 'Start Date', value: formatDate(lease?.startDate) },
            { label: 'End Date', value: formatDate(lease?.endDate) },
            { label: 'Monthly Rent', value: formatCurrency(lease?.monthlyRent) },
            { label: 'Security Deposit', value: formatCurrency(lease?.securityDeposit) },
            { label: 'Payment Due Day', value: lease?.paymentDueDay ? `${lease.paymentDueDay}${['st','nd','rd'][lease.paymentDueDay - 1] || 'th'} of month` : null },
            { label: 'Notes', value: lease?.notes },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between border-b border-gray-50 dark:border-gray-800 py-2.5 last:border-0">
              <span className="text-sm text-gray-400">{label}</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100 text-right max-w-[60%]">{value || '—'}</span>
            </div>
          ))}
        </Card>
        <Card title="Status &amp; Actions">
          <div className="flex items-center gap-3 mb-4">
            <Badge status={lease?.status} />
            <span className="text-sm text-gray-500 dark:text-gray-400">Current status</span>
          </div>
          {lease?.status === 'active' && (
            <Button variant="danger" className="w-full">Terminate Lease</Button>
          )}
        </Card>
      </div>
    </>
  );
};
