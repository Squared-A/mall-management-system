import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Download,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import SearchInput from "../../components/common/SearchInput";
import FilterDropdown from "../../components/common/FilterDropdown";
import DataTable from "../../components/tables/DataTable";
import TableActions from "../../components/tables/TableActions";
import Badge from "../../components/common/Badge";
import TextInput from "../../components/forms/TextInput";
import SelectInput from "../../components/forms/SelectInput";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useFetch } from "../../hooks/useFetch";
import { useForm } from "../../hooks/useForm";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import { paymentService } from "../../services/paymentService";
import { leaseService } from "../../services/leaseService";
import { useMall } from "../../context/MallContext";
import { ROUTES } from "../../constants/routes";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { isRequired, isPositiveNumber } from "../../utils/validators";
import { buildModelPayload } from "../../utils/payload";

const normalizePayment = (payment = {}) => ({
  ...payment,
  invoiceNo: payment.invoiceNo || payment.invoiceNumber || '',
  tenant:
    payment.tenant ||
    payment.tenantId?.businessName ||
    payment.tenantId?.userId?.fullName ||
    '',
  shop:
    payment.shop ||
    (payment.shopId?.shopNumber ? `Shop #${payment.shopId.shopNumber}` : ''),
  method: payment.method || payment.paymentMethod || '',
  paidDate: payment.paidDate || payment.paymentDate,
  dueDate: payment.dueDate || payment.leaseId?.endDate,
});
const SEED_PAYMENTS = [
  {
    _id: "p1",
    invoiceNo: "INV-0001",
    tenant: "Alice Johnson",
    shop: "Shop #112",
    amount: 4500,
    dueDate: "2024-11-01",
    paidDate: "2024-10-29",
    method: "bank_transfer",
    status: "paid",
  },
  {
    _id: "p2",
    invoiceNo: "INV-0002",
    tenant: "Bob Martinez",
    shop: "Shop #204",
    amount: 3800,
    dueDate: "2024-11-01",
    paidDate: null,
    method: null,
    status: "pending",
  },
  {
    _id: "p3",
    invoiceNo: "INV-0003",
    tenant: "Carol White",
    shop: "Shop #318",
    amount: 5200,
    dueDate: "2024-10-15",
    paidDate: null,
    method: null,
    status: "overdue",
  },
  {
    _id: "p4",
    invoiceNo: "INV-0004",
    tenant: "Eva Chen",
    shop: "Shop #205",
    amount: 3200,
    dueDate: "2024-11-05",
    paidDate: "2024-11-04",
    method: "credit_card",
    status: "paid",
  },
  {
    _id: "p5",
    invoiceNo: "INV-0005",
    tenant: "David Lee",
    shop: "Shop #101",
    amount: 4100,
    dueDate: "2024-10-01",
    paidDate: null,
    method: null,
    status: "overdue",
  },
];

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
];

const METHOD_OPTIONS = [
  { value: "bank", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
];

export const PaymentList = () => {
  const navigate = useNavigate();
  const { activeMallId } = useMall();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data = [], loading } = useFetch(async () => {
    const payments = await paymentService.list();
    return payments.map(normalizePayment);
  }, [activeMallId]);

  const filtered = useMemo(() => {
    let items = data || [];
    if (statusFilter) items = items.filter((p) => p.status === statusFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(
        (p) =>
          p.tenant?.toLowerCase().includes(q) ||
          p.invoiceNo?.toLowerCase().includes(q) ||
          p.shop?.toLowerCase().includes(q),
      );
    }
    return items;
  }, [data, debouncedSearch, statusFilter]);

  const {
    paginatedItems,
    page,
    pageSize,
    totalPages,
    goToPage,
    changePageSize,
  } = usePagination(filtered);

  const columns = [
    {
      key: "invoiceNo",
      header: "Invoice #",
      render: (row) => (
        <span className="font-mono font-semibold text-primary-600">
          {row.invoiceNo}
        </span>
      ),
    },
    { key: "tenant", header: "Tenant", sortable: true },
    { key: "shop", header: "Shop" },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: "paidDate",
      header: "Paid Date",
      render: (row) =>
        row.paidDate ? (
          formatDate(row.paidDate)
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (row) => (
        <TableActions
          onView={() => navigate(ROUTES.INVOICE_VIEW.replace(":id", row._id))}
        />
      ),
    },
  ];

  const totalRevenue = (data || [])
    .filter((p) => p.status === "completed" || p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const overdue = (data || []).filter((p) => p.status === "overdue").length;

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Track rent payments and invoices"
        breadcrumbs={[{ label: "Payments" }]}
        actions={
          <Button icon={Plus} onClick={() => navigate(ROUTES.PAYMENT_CREATE)}>
            Record Payment
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Collected",
            value: formatCurrency(totalRevenue),
            color: "text-success-600 bg-success-50 dark:bg-success-500/10",
            icon: DollarSign,
          },
          {
            label: "Pending Payments",
            value: (data || []).filter((p) => p.status === "pending").length,
            color: "text-warning-600 bg-warning-50 dark:bg-warning-500/10",
            icon: CreditCard,
          },
          {
            label: "Overdue",
            value: overdue,
            color: "text-danger-600 bg-danger-50 dark:bg-danger-500/10",
            icon: FileText,
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by tenant, invoice..."
          className="max-w-xs"
        />
        <FilterDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
        />
      </div>
      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyTitle="No payments found"
        pagination={{
          page,
          totalPages,
          totalItems: filtered.length,
          pageSize,
          onPageChange: goToPage,
          onPageSizeChange: changePageSize,
        }}
      />
    </>
  );
};

export const CreatePayment = () => {
  const navigate = useNavigate();
  const { activeMallId } = useMall();
  const [loading, setLoading] = useState(false);
  const [leaseOptions, setLeaseOptions] = useState([]);
  const [loadingLeases, setLoadingLeases] = useState(true);

  // Previously used raw `fetch('/api/leases')`, which sends no
  // Authorization header (axiosClient is what attaches the bearer token)
  // and no mall context — this would 401 against the real backend.
  useFetch(async () => {
    try {
      setLoadingLeases(true);
      const leases = await leaseService.list();
      setLeaseOptions(
        leases
          .filter((l) => l.status === "ACTIVE")
          .map((l) => ({
            value: l._id,
            label: `${l.tenantId?.businessName || "Unknown"} - Shop ${l.shopId?.shopNumber ?? ""} (${formatCurrency(l.monthlyRent)}/month)`,
            tenantId: l.tenantId?._id,
          })),
      );
    } catch (err) {
      console.error("Failed to load leases:", err);
    } finally {
      setLoadingLeases(false);
    }
  }, [activeMallId]);

  const { values, errors, handleChange, handleSubmit } = useForm(
    {
      leaseId: "",
      tenantId: "",
      amount: "",
      paymentDate: "",
      paymentMethod: "bank",
      invoiceNumber: "",
      status: "pending",
    },
    {
      paymentDate: [
        (v) => (!isRequired(v) ? "Payment date is required" : null),
      ],
    },
    async (vals) => {
      setLoading(true);
      try {
        const payload = buildModelPayload(
          vals,
          [
            "leaseId",
            "tenantId",
            "amount",
            "paymentMethod",
            "paymentDate",
            "invoiceNumber",
            "status",
          ],
          ["amount"],
        );
        await paymentService.create(payload);
        toast.success("Payment recorded!");
        navigate(ROUTES.PAYMENTS);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to record payment");
      } finally {
        setLoading(false);
      }
    },
  );

  // Auto-populate tenantId when lease is selected
  const handleLeaseChange = (e) => {
    handleChange(e);
    const selectedLease = leaseOptions.find((l) => l.value === e.target.value);
    if (selectedLease?.tenantId) {
      handleChange({
        target: { name: "tenantId", value: selectedLease.tenantId },
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Record Payment"
        breadcrumbs={[
          { label: "Payments", to: ROUTES.PAYMENTS },
          { label: "Record Payment" },
        ]}
      />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card title="Payment Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              label="Lease"
              name="leaseId"
              options={leaseOptions}
              value={values.leaseId}
              onChange={handleLeaseChange}
              disabled={loadingLeases}
              placeholder={
                loadingLeases ? "Loading leases..." : "Select a lease"
              }
              className="sm:col-span-2"
              required
            />
            <TextInput
              label="Tenant ID"
              name="tenantId"
              placeholder="Auto-populated from lease"
              value={values.tenantId}
              onChange={handleChange}
              disabled
              className="sm:col-span-2"
            />
            <TextInput
              label="Amount ($)"
              name="amount"
              type="number"
              icon={DollarSign}
              placeholder="4500"
              value={values.amount}
              onChange={handleChange}
            />
            <TextInput
              label="Payment Date"
              name="paymentDate"
              type="date"
              icon={Calendar}
              value={values.paymentDate}
              onChange={handleChange}
              error={errors.paymentDate}
              required
            />
            <SelectInput
              label="Payment Method"
              name="paymentMethod"
              options={METHOD_OPTIONS}
              value={values.paymentMethod}
              onChange={handleChange}
            />
            <TextInput
              label="Invoice Number"
              name="invoiceNumber"
              placeholder="INV-001234"
              value={values.invoiceNumber}
              onChange={handleChange}
            />
            <SelectInput
              label="Status"
              name="status"
              options={STATUS_OPTIONS}
              value={values.status}
              onChange={handleChange}
            />
          </div>
        </Card>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading || loadingLeases}>
            Record Payment
          </Button>
        </div>
      </form>
    </>
  );
};

export const PaymentHistory = () => {
  const { activeMallId } = useMall();
  const { data = [], loading } = useFetch(async () => {
    const payments = await paymentService.list();
    return payments.map(normalizePayment);
  }, [activeMallId]);

  const {
    paginatedItems,
    page,
    pageSize,
    totalPages,
    goToPage,
    changePageSize,
  } = usePagination(data || []);
  const columns = [
    {
      key: "invoiceNo",
      header: "Invoice #",
      render: (row) => (
        <span className="font-mono font-semibold text-primary-600">
          {row.invoiceNo}
        </span>
      ),
    },
    { key: "tenant", header: "Tenant" },
    {
      key: "amount",
      header: "Amount",
      render: (row) => formatCurrency(row.amount),
    },
    {
      key: "paidDate",
      header: "Date",
      render: (row) => (row.paidDate ? formatDate(row.paidDate) : "—"),
    },
    {
      key: "method",
      header: "Method",
      render: (row) => row.method?.replace("_", " ") || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
  ];
  return (
    <>
      <PageHeader
        title="Payment History"
        breadcrumbs={[
          { label: "Payments", to: ROUTES.PAYMENTS },
          { label: "History" },
        ]}
      />
      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyTitle="No payment history"
        pagination={{
          page,
          totalPages,
          totalItems: (data || []).length,
          pageSize,
          onPageChange: goToPage,
          onPageSizeChange: changePageSize,
        }}
      />
    </>
  );
};

export const InvoiceView = () => {
  const { id } = useParams();
  const { data: payment, loading } = useFetch(async () => {
    return normalizePayment(await paymentService.getById(id));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <PageHeader
        title={`Invoice ${payment?.invoiceNo}`}
        breadcrumbs={[
          { label: "Payments", to: ROUTES.PAYMENTS },
          { label: payment?.invoiceNo },
        ]}
        actions={
          <Button variant="outline" icon={Download}>
            Download PDF
          </Button>
        }
      />
      <div className="max-w-2xl">
        <Card>
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
                INVOICE
              </p>
              <p className="text-sm text-gray-400">{payment?.invoiceNo}</p>
            </div>
            <Badge status={payment?.status} />
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs text-gray-400 mb-1">From</p>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                Mall Management System
              </p>
              <p className="text-sm text-gray-500">billing@mms.com</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">To</p>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {payment?.tenant}
              </p>
              <p className="text-sm text-gray-500">{payment?.shop}</p>
            </div>
          </div>
          <div className="border-t border-b border-gray-100 dark:border-gray-800 py-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Monthly Rent</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {formatCurrency(payment?.amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Due Date</span>
              <span>{formatDate(payment?.dueDate)}</span>
            </div>
            {payment?.paidDate && (
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Paid Date</span>
                <span className="text-success-600 font-medium">
                  {formatDate(payment?.paidDate)}
                </span>
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

