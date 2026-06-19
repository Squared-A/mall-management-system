import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Receipt, DollarSign, Calendar, Tag } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import SearchInput from "../../components/common/SearchInput";
import DataTable from "../../components/tables/DataTable";
import TableActions from "../../components/tables/TableActions";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import TextInput from "../../components/forms/TextInput";
import SelectInput from "../../components/forms/SelectInput";
import TextArea from "../../components/forms/TextArea";
import { useForm } from "../../hooks/useForm";
import { useFetch } from "../../hooks/useFetch";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import { expenseService } from "../../services/miscServices";
import { useMall } from "../../context/MallContext";
import { ROUTES } from "../../constants/routes";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { isRequired, isPositiveNumber } from "../../utils/validators";
import { buildModelPayload } from "../../utils/payload";

const CATEGORY_OPTIONS = [
  { value: "UTILITy", label: "UTILITIES" },
  { value: "MAINTENANCE", label: "MAINTENANCE" },
  { value: "SECURITY", label: "SECURITY" },
  { value: "CLEANING", label: "CLEANING" },
  { value: "MARKETING", label: "MARKETING" },
  { value: "SALARIES", label: "SALARIES" },
  { value: "INSURANCE", label: "INSURANCE" },
  { value: "OTHER", label: "OTHER" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "BANK", label: "Bank Transfer" },
  { value: "CASH", label: "Cash" },
];

/* ─────────── Expense List ─────────── */
export const ExpenseList = () => {
  const navigate = useNavigate();
  const { activeMallId } = useMall();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const {
    data = [],
    loading,
    refetch,
  } = useFetch(async () => {
    return await expenseService.list();
  }, [activeMallId]);

  const filtered = useMemo(() => {
    let items = data || [];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(
        (e) =>
          e.category?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.vendor?.toLowerCase().includes(q),
      );
    }
    return items;
  }, [data, debouncedSearch]);

  const {
    paginatedItems,
    page,
    pageSize,
    totalPages,
    goToPage,
    changePageSize,
  } = usePagination(filtered);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await expenseService.remove(deleteTarget._id);
      toast.success("Expense deleted");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const totalSpent = (data || []).reduce((sum, e) => sum + (e.amount || 0), 0);

  const columns = [
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-100">
          {row.category || "Other"}
        </span>
      ),
    },
    { key: "description", header: "Description" },
    { key: "vendor", header: "Vendor", render: (row) => row.vendor || "—" },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: "expenseDate",
      header: "Date",
      render: (row) => formatDate(row.expenseDate),
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: (row) => <TableActions onDelete={() => setDeleteTarget(row)} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={`${formatCurrency(totalSpent)} total recorded`}
        breadcrumbs={[{ label: "Expenses" }]}
        actions={
          <Button icon={Plus} onClick={() => navigate(ROUTES.EXPENSE_ADD)}>
            Add Expense
          </Button>
        }
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by category, vendor, description..."
          className="max-w-xs"
        />
      </div>
      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyTitle="No expenses recorded"
        emptyMessage="Start tracking your mall's operating expenses."
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
        title="Delete expense?"
        message={`Delete this ${deleteTarget?.category || ""} expense of ${formatCurrency(deleteTarget?.amount)}? This cannot be undone.`}
        confirmLabel="Delete Expense"
      />
    </>
  );
};

/* ─────────── Add Expense ─────────── */
export const AddExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleSubmit } = useForm(
    {
      category: "",
      description: "",
      amount: "",
      expenseDate: "",
      paymentMethod: "bank",
      vendor: "",
    },
    {
      category: [(v) => (!isRequired(v) ? "Category is required" : null)],
      amount: [
        (v) => (!isRequired(v) ? "Amount is required" : null),
        (v) =>
          !isPositiveNumber(v) ? "Amount must be a positive number" : null,
      ],
      expenseDate: [(v) => (!isRequired(v) ? "Date is required" : null)],
    },
    async (vals) => {
      setLoading(true);
      try {
        const payload = buildModelPayload(
          vals,
          [
            "category",
            "description",
            "amount",
            "expenseDate",
            "paymentMethod",
            "vendor",
          ],
          ["amount"],
        );
        await expenseService.create(payload);
        toast.success("Expense recorded!");
        navigate(ROUTES.EXPENSES);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to record expense");
      } finally {
        setLoading(false);
      }
    },
  );

  return (
    <>
      <PageHeader
        title="Add Expense"
        breadcrumbs={[
          { label: "Expenses", to: ROUTES.EXPENSES },
          { label: "Add Expense" },
        ]}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Expense Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              label="Category"
              name="category"
              icon={Tag}
              options={CATEGORY_OPTIONS}
              value={values.category}
              onChange={handleChange}
              error={errors.category}
              required
            />
            <TextInput
              label="Amount ($)"
              name="amount"
              type="number"
              icon={DollarSign}
              placeholder="500"
              value={values.amount}
              onChange={handleChange}
              error={errors.amount}
              required
            />
            <TextInput
              label="Date"
              name="expenseDate"
              type="date"
              icon={Calendar}
              value={values.expenseDate}
              onChange={handleChange}
              error={errors.expenseDate}
              required
            />
            <SelectInput
              label="Payment Method"
              name="paymentMethod"
              options={PAYMENT_METHOD_OPTIONS}
              value={values.paymentMethod}
              onChange={handleChange}
            />
            <TextInput
              label="Vendor"
              name="vendor"
              icon={Receipt}
              placeholder="Vendor or supplier name"
              value={values.vendor}
              onChange={handleChange}
            />
            <TextArea
              label="Description"
              name="description"
              placeholder="What was this expense for?"
              value={values.description}
              onChange={handleChange}
              rows={3}
              className="sm:col-span-2"
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
          <Button type="submit" loading={loading}>
            Record Expense
          </Button>
        </div>
      </form>
    </>
  );
};
