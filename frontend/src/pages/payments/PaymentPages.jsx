import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Download, CreditCard, DollarSign, Calendar, FileText } from 'lucide-react';
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
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { paymentService } from '../../services/paymentService';
import { ROUTES } from '../../constants/routes';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { isRequired, isPositiveNumber } from '../../utils/validators';

const SEED_PAYMENTS = [
  { _id: 'p1', invoiceNo: 'INV-0001', tenant: 'Alice Johnson', shop: 'Shop #112', amount: 4500, dueDate: '2024-11-01', paidDate: '2024-10-29', method: 'bank_transfer', status: 'paid' },
  { _id: 'p2', invoiceNo: 'INV-0002', tenant: 'Bob Martinez', shop: 'Shop #204', amount: 3800, dueDate: '2024-11-01', paidDate: null, method: null, status: 'pending' },
  { _id: 'p3', invoiceNo: 'INV-0003', tenant: 'Carol White', shop: 'Shop #318', amount: 5200, dueDate: '2024-10-15', paidDate: null, method: null, status: 'overdue' },
  { _id: 'p4', invoiceNo: 'INV-0004', tenant: 'Eva Chen', shop: 'Shop #205', amount: 3200, dueDate: '2024-11-05', paidDate: '2024-11-04', method: 'credit_card', status: 'paid' },
  { _id: 'p5', invoiceNo: 'INV-0005', tenant: 'David Lee', shop: 'Shop #101', amount: 4100, dueDate: '2024-10-01', paidDate: null, method: null, status: 'overdue' },
];

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'failed', label: 'Failed' },
];

const METHOD_OPTIONS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit / Debit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'mobile_money', label: 'Mobile Money' },
];

export const PaymentList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search);

  const { data, loading } = useFetch(async () => {
    try { return await paymentService.list(); }
    catch { return SEED_PAYMENTS; }
  }, []);

  const filtered = useMemo(() => {
    let items = data || SEED_PAYMENTS;
    if (statusFilter) items = items.filter((p) => p.status === statusFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((p) => p.tenant?.toLowerCase().includes(q) || p.invoiceNo?.toLowerCase().includes(q) || p.shop?.toLowerCase().includes(q));
    }
    return items;
  }, [data, debouncedSearch, statusFilter]);

  const { paginatedItems, page, pageSize, totalPages, goToPage, changePageSize } = usePagination(filtered);

  const columns = [
    { key: 'invoiceNo', header: 'Invoice #', render: (row) => <span className="font-mono font-semibold text-primary-600">{row.invoiceNo}</span> },
    { key: 'tenant', header: 'Tenant', sortable: true },
    { key: 'shop', header: 'Shop' },
    { key: 'amount', header: 'Amount', render: (row) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
    { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
    { key: 'paidDate', header: 'Paid Date', render: (row) => row.paidDate ? formatDate(row.paidDate) : <span className="text-gray-400">—</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> },
    {
      key: 'actions', header: '', className: 'w-24',
      render: (row) => (
        <TableActions
          onView={() => navigate(ROUTES.INVOICE_VIEW.replace(':id', row._id))}
        />
      ),
    },
  ];

  const totalRevenue = (data || SEED_PAYMENTS).filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const overdue = (data || SEED_PAYMENTS).filter((p) => p.status === 'overdue').length;

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Track rent payments and invoices"
        breadcrumbs={[{ label: 'Payments' }]}
        actions={<Button icon={Plus} onClick={() => navigate(ROUTES.PAYMENT_CREATE)}>Record Payment</Button>}
      />
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Collected', value: formatCurrency(totalRevenue), color: 'text-success-600 bg-success-50 dark:bg-success-500/10', icon: DollarSign },
          { label: 'Pending Payments', value: (data || SEED_PAYMENTS).filter((p) => p.status === 'pending').length, color: 'text-warning-600 bg-warning-50 dark:bg-warning-500/10', icon: CreditCard },
          { label: 'Overdue', value: overdue, color: 'text-danger-600 bg-danger-50 dark:bg-danger-500/10', icon: FileText },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-50">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by tenant, invoice..." className="max-w-xs" />
        <FilterDropdown value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} placeholder="All Statuses" />
      </div>
      <DataTable columns={columns} data={paginatedItems} loading={loading} emptyTitle="No payments found"
        pagination={{ page, totalPages, totalItems: filtered.length, pageSize, onPageChange: goToPage, onPageSizeChange: changePageSize }}
      />
    </>
  );
};

export const CreatePayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleSubmit } = useForm(
    { leaseId: '', amount: '', paymentDate: '', method: 'bank_transfer', reference: '', notes: '' },
    {
      leaseId: [(v) => (!isRequired(v) ? 'Lease is required' : null)],
      amount: [(v) => (!isRequired(v) ? 'Amount is required' : null), (v) => (!isPositiveNumber(v) ? 'Must be positive' : null)],
      paymentDate: [(v) => (!isRequired(v) ? 'Payment date is required' : null)],
      method: [(v) => (!isRequired(v) ? 'Payment method is required' : null)],
    },
    async (vals) => {
      setLoading(true);
      try { await paymentService.create(vals); toast.success('Payment recorded!'); navigate(ROUTES.PAYMENTS); }
      catch (err) { toast.error(err?.response?.data?.message || 'Failed to record payment'); }
      finally { setLoading(false); }
    }
  );

  return (
    <>
      <PageHeader title="Record Payment" breadcrumbs={[{ label: 'Payments', to: ROUTES.PAYMENTS }, { label: 'Record Payment' }]} />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card title="Payment Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Lease ID" name="leaseId" placeholder="Enter lease ID" value={values.leaseId} onChange={handleChange} error={errors.leaseId} required className="sm:col-span-2" />
            <TextInput label="Amount ($)" name="amount" type="number" icon={DollarSign} placeholder="4500" value={values.amount} onChange={handleChange} error={errors.amount} required />
            <TextInput label="Payment Date" name="paymentDate" type="date" icon={Calendar} value={values.paymentDate} onChange={handleChange} error={errors.paymentDate} required />
            <SelectInput label="Payment Method" name="method" options={METHOD_OPTIONS} value={values.method} onChange={handleChange} error={errors.method} required />
            <TextInput label="Reference Number" name="reference" placeholder="TXN-001234" value={values.reference} onChange={handleChange} />
            <TextInput label="Notes" name="notes" placeholder="Optional notes" value={values.notes} onChange={handleChange} className="sm:col-span-2" />
          </div>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Record Payment</Button>
        </div>
      </form>
    </>
  );
};

export const PaymentHistory = () => {
  const { data, loading } = useFetch(async () => {
    try { return await paymentService.list(); }
    catch { return SEED_PAYMENTS; }
  }, []);

  const { paginatedItems, page, pageSize, totalPages, goToPage, changePageSize } = usePagination(data || SEED_PAYMENTS);
  const columns = [
    { key: 'invoiceNo', header: 'Invoice #', render: (row) => <span className="font-mono font-semibold text-primary-600">{row.invoiceNo}</span> },
    { key: 'tenant', header: 'Tenant' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'paidDate', header: 'Date', render: (row) => row.paidDate ? formatDate(row.paidDate) : '—' },
    { key: 'method', header: 'Method', render: (row) => row.method?.replace('_', ' ') || '—' },
    { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> },
  ];
  return (
    <>
      <PageHeader title="Payment History" breadcrumbs={[{ label: 'Payments', to: ROUTES.PAYMENTS }, { label: 'History' }]} />
      <DataTable columns={columns} data={paginatedItems} loading={loading} emptyTitle="No payment history"
        pagination={{ page, totalPages, totalItems: (data || SEED_PAYMENTS).length, pageSize, onPageChange: goToPage, onPageSizeChange: changePageSize }}
      />
    </>
  );
};

export const InvoiceView = () => {
  const { id } = useParams();
  const { data: payment, loading } = useFetch(async () => {
    try { return await paymentService.getById(id); }
    catch { return SEED_PAYMENTS[0]; }
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <PageHeader
        title={`Invoice ${payment?.invoiceNo}`}
        breadcrumbs={[{ label: 'Payments', to: ROUTES.PAYMENTS }, { label: payment?.invoiceNo }]}
        actions={<Button variant="outline" icon={Download}>Download PDF</Button>}
      />
      <div className="max-w-2xl">
        <Card>
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-50">INVOICE</p>
              <p className="text-sm text-gray-400">{payment?.invoiceNo}</p>
            </div>
            <Badge status={payment?.status} />
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs text-gray-400 mb-1">From</p>
              <p className="font-semibold text-gray-800 dark:text-gray-100">Mall Management System</p>
              <p className="text-sm text-gray-500">billing@mms.com</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">To</p>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{payment?.tenant}</p>
              <p className="text-sm text-gray-500">{payment?.shop}</p>
            </div>
          </div>
          <div className="border-t border-b border-gray-100 dark:border-gray-800 py-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Monthly Rent</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(payment?.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Due Date</span>
              <span>{formatDate(payment?.dueDate)}</span>
            </div>
            {payment?.paidDate && (
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Paid Date</span>
                <span className="text-success-600 font-medium">{formatDate(payment?.paidDate)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-50">
            <span>Total</span>
            <span>{formatCurrency(payment?.amount)}</span>
          </div>
        </Card>
      </div>
    </>
  );
};
