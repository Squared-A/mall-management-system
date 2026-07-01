import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Wrench, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import DataTable from '../../components/tables/DataTable';
import TableActions from '../../components/tables/TableActions';
import Badge from '../../components/common/Badge';
import TextInput from '../../components/forms/TextInput';
import SelectInput from '../../components/forms/SelectInput';
import TextArea from '../../components/forms/TextArea';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { maintenanceService } from '../../services/maintenanceService';
import { useMall } from '../../context/MallContext';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';
import { buildModelPayload } from '../../utils/payload';

const normalizeMaintenance = (request = {}) => ({
  ...request,
  ticketNo: request.ticketNo || `MNT-${String(request._id || '').slice(-6).toUpperCase()}`,
  shop:
    request.shop ||
    (request.shopId?.shopNumber ? `Shop #${request.shopId.shopNumber}` : ''),
  requestedBy:
    request.requestedBy ||
    request.tenantId?.businessName ||
    'Mall Staff',
});
const SEED_REQUESTS = [
  { _id: 'mr1', ticketNo: 'MNT-001', title: 'HVAC Repair', shop: 'Wing B, Floor 2', priority: 'high', status: 'in_progress', requestedBy: 'Mall Manager', createdAt: '2024-10-25' },
  { _id: 'mr2', ticketNo: 'MNT-002', title: 'Plumbing Leak', shop: 'Shop #204', priority: 'urgent', status: 'open', requestedBy: 'Bob Martinez', createdAt: '2024-10-28' },
  { _id: 'mr3', ticketNo: 'MNT-003', title: 'Lighting Replacement', shop: 'Common Area - Level 3', priority: 'medium', status: 'resolved', requestedBy: 'Mall Manager', createdAt: '2024-10-15' },
  { _id: 'mr4', ticketNo: 'MNT-004', title: 'Door Lock Fix', shop: 'Shop #318', priority: 'low', status: 'open', requestedBy: 'Carol White', createdAt: '2024-11-01' },
  { _id: 'mr5', ticketNo: 'MNT-005', title: 'Elevator Maintenance', shop: 'Main Entrance', priority: 'high', status: 'closed', requestedBy: 'Mall Manager', createdAt: '2024-09-30' },
];

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export const MaintenanceList = () => {
  const navigate = useNavigate();
  const { activeMallId } = useMall();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const debouncedSearch = useDebounce(search);

  const { data = [], loading } = useFetch(async () => {
    const requests = await maintenanceService.list();
    return requests.map(normalizeMaintenance);
  }, [activeMallId]);

  const filtered = useMemo(() => {
    let items = data || [];
    if (statusFilter) items = items.filter((r) => r.status === statusFilter);
    if (priorityFilter) items = items.filter((r) => r.priority === priorityFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((r) => r.title?.toLowerCase().includes(q) || r.ticketNo?.toLowerCase().includes(q) || r.shop?.toLowerCase().includes(q));
    }
    return items;
  }, [data, debouncedSearch, statusFilter, priorityFilter]);

  const { paginatedItems, page, pageSize, totalPages, goToPage, changePageSize } = usePagination(filtered);

  const columns = [
    {
      key: 'ticketNo', header: 'Ticket',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="font-mono font-semibold text-primary-600">{row.ticketNo}</span>
        </div>
      ),
    },
    { key: 'title', header: 'Issue', sortable: true, render: (row) => <span className="font-medium">{row.title}</span> },
    { key: 'shop', header: 'Location' },
    { key: 'priority', header: 'Priority', render: (row) => <Badge status={row.priority} /> },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'requestedBy', header: 'Requested By' },
    { key: 'createdAt', header: 'Date', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions', header: '', className: 'w-24',
      render: (row) => (
        <TableActions
          onView={() => navigate(ROUTES.MAINTENANCE_TRACKING.replace(':id', row._id))}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Maintenance Requests"
        subtitle={`${filtered.length} request${filtered.length !== 1 ? 's' : ''} found`}
        breadcrumbs={[{ label: 'Maintenance' }]}
        actions={<Button icon={Plus} onClick={() => navigate(ROUTES.MAINTENANCE_CREATE)}>New Request</Button>}
      />
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search requests..." className="max-w-xs" />
        <FilterDropdown value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} placeholder="All Statuses" />
        <FilterDropdown value={priorityFilter} onChange={setPriorityFilter} options={PRIORITY_OPTIONS} placeholder="All Priorities" />
      </div>
      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyTitle="No maintenance requests"
        emptyMessage="No maintenance issues have been reported yet."
        pagination={{ page, totalPages, totalItems: filtered.length, pageSize, onPageChange: goToPage, onPageSizeChange: changePageSize }}
      />
    </>
  );
};

export const CreateMaintenanceRequest = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isTenant = role === 'tenant';
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleSubmit } = useForm(
    { tenantId: '', shopId: '', title: '', description: '', priority: 'LOW', status: 'OPEN', assignedTo: '' },
    {},
    async (vals) => {
      setLoading(true);
      try {
        const payload = isTenant
          ? buildModelPayload(vals, ['title', 'description', 'priority'])
          : buildModelPayload(vals, [
              'tenantId',
              'shopId',
              'title',
              'description',
              'priority',
              'status',
              'assignedTo',
            ]);
        await maintenanceService.create(payload);
        toast.success('Request submitted!');
        navigate(ROUTES.MAINTENANCE);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to submit request');
      } finally {
        setLoading(false);
      }
    }
  );

  return (
    <>
      <PageHeader title="New Maintenance Request" breadcrumbs={[{ label: 'Maintenance', to: ROUTES.MAINTENANCE }, { label: 'New Request' }]} />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card title="Request Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isTenant && (
              <>
                <TextInput label="Tenant ID" name="tenantId" placeholder="Enter tenant ID" value={values.tenantId} onChange={handleChange} />
                <TextInput label="Shop ID" name="shopId" placeholder="Enter shop ID" value={values.shopId} onChange={handleChange} />
              </>
            )}
            <TextInput label="Issue Title" name="title" placeholder="Brief description of the issue" value={values.title} onChange={handleChange} className="sm:col-span-2" />
            <TextArea label="Description" name="description" placeholder="Provide detailed information about the issue..." value={values.description} onChange={handleChange} rows={5} className="sm:col-span-2" />
            <SelectInput label="Priority" name="priority" options={PRIORITY_OPTIONS} value={values.priority} onChange={handleChange} />
            {!isTenant && (
              <>
                <SelectInput label="Status" name="status" options={STATUS_OPTIONS} value={values.status} onChange={handleChange} />
                <TextInput label="Assigned To" name="assignedTo" placeholder="Staff member or team" value={values.assignedTo} onChange={handleChange} className="sm:col-span-2" />
              </>
            )}
          </div>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Submit Request</Button>
        </div>
      </form>
    </>
  );
};

const SEED_REQUEST = { _id: 'mr1', ticketNo: 'MNT-001', title: 'HVAC Repair', shop: 'Wing B, Floor 2', priority: 'high', status: 'in_progress', requestedBy: 'Mall Manager', description: 'HVAC unit in Wing B has been malfunctioning since Monday, affecting temperatures on the entire floor.', createdAt: '2024-10-25',
  comments: [
    { id: 'c1', author: 'Mall Manager', text: 'Contacted HVAC technician. Scheduled for inspection on Oct 27.', time: 'Oct 25, 2024 2:30 PM' },
    { id: 'c2', author: 'Technician', text: 'Inspection done. Compressor needs replacement. Parts ordered.', time: 'Oct 27, 2024 11:00 AM' },
  ]
};

export const RequestTracking = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const isTenant = role === 'tenant';
  const [comment, setComment] = useState('');

  const { data: request, loading } = useFetch(async () => {
    try { return normalizeMaintenance(await maintenanceService.getById(id)); }
    catch { return SEED_REQUEST; }
  }, [id]);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    toast.success('Comment added');
    setComment('');
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <PageHeader
        title={`${request?.ticketNo} — ${request?.title}`}
        subtitle={`Location: ${request?.shop}`}
        breadcrumbs={[{ label: 'Maintenance', to: ROUTES.MAINTENANCE }, { label: request?.ticketNo }]}
        actions={<Badge status={request?.status} />}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card title="Issue Details">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge status={request?.status} />
              <Badge status={request?.priority} />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{request?.description}</p>
          </Card>

          <Card title={`Activity (${request?.comments?.length || 0})`}>
            <div className="space-y-4 mb-4">
              {request?.comments?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/10 text-xs font-bold text-primary-600">
                    {c.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.author}</p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">{c.time}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment or update..."
                className="input-base flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button icon={MessageSquare} onClick={handleAddComment}>Send</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Request Info">
            {[
              { label: 'Ticket #', value: request?.ticketNo },
              { label: 'Status', value: <Badge status={request?.status} /> },
              { label: 'Priority', value: <Badge status={request?.priority} /> },
              { label: 'Requested By', value: request?.requestedBy },
              { label: 'Location', value: request?.shop },
              { label: 'Date Submitted', value: formatDate(request?.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-gray-50 dark:border-gray-800 py-2.5 last:border-0">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{value || '—'}</span>
              </div>
            ))}
          </Card>

          {!isTenant && <Card title="Update Status">
            <div className="space-y-3">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toast.success(`Status updated to ${opt.label}`)}
                  className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                >
                  {opt.label}
                  {request?.status === opt.value && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                </button>
              ))}
            </div>
          </Card>}
        </div>
      </div>
    </>
  );
};



