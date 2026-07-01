import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, UserCog, Mail, Phone, User, Shield } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import SearchInput from "../../components/common/SearchInput";
import FilterDropdown from "../../components/common/FilterDropdown";
import DataTable from "../../components/tables/DataTable";
import TableActions from "../../components/tables/TableActions";
import Badge from "../../components/common/Badge";
import Avatar from "../../components/common/Avatar";
import TextInput from "../../components/forms/TextInput";
import SelectInput from "../../components/forms/SelectInput";
import TextArea from "../../components/forms/TextArea";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useFetch } from "../../hooks/useFetch";
import { useForm } from "../../hooks/useForm";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import { staffService } from "../../services/miscServices";
import { useMall } from "../../context/MallContext";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { ROLE_LABELS, ROLES } from "../../constants/roles";
import { formatDate } from "../../utils/formatters";
import {
  isRequired,
  isValidEmail,
  isValidPhone,
  isValidPassword,
} from "../../utils/validators";

const ROLE_OPTIONS = [
  { value: ROLES.MALL_MANAGER, label: ROLE_LABELS[ROLES.MALL_MANAGER] },
  { value: ROLES.ACCOUNTANT, label: ROLE_LABELS[ROLES.ACCOUNTANT] },
];

const ACCOUNTANT_ROLE_OPTIONS = [
  { value: ROLES.ACCOUNTANT, label: ROLE_LABELS[ROLES.ACCOUNTANT] },
];

const ROLE_TO_POSITION = {
  [ROLES.MALL_MANAGER]: "manager",
  [ROLES.ACCOUNTANT]: "accountant",
};

const POSITION_TO_ROLE = {
  manager: ROLES.MALL_MANAGER,
  accountant: ROLES.ACCOUNTANT,
};

const normalizeStaff = (staff = {}) => ({
  ...staff,
  name: staff.name || staff.fullName || "",
  role: staff.role || POSITION_TO_ROLE[staff.position] || staff.position || "",
  mall: staff.mall || staff.mallName || staff.mallId?.name || "",
  mallId: staff.mallId?._id || staff.mallId || "",
  joinedAt: staff.joinedAt || staff.createdAt,
  status: staff.status || (staff.isDeleted ? "inactive" : "active"),
});

const buildStaffPayload = (values, { includePassword = false } = {}) => {
  const payload = {
    fullName: values.name,
    email: values.email,
    phone: values.phone,
    position: ROLE_TO_POSITION[values.role] || values.role,
    mallId: values.mallId,
  };

  if (includePassword) {
    payload.password = values.password;
  }

  return payload;
};
const STATUS_FILTER_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

/* ─────────────────────────────────────────────
   Staff List
───────────────────────────────────────────── */
export const StaffList = () => {
  const navigate = useNavigate();
  const { activeMallId } = useMall();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const {
    data = [],
    loading,
    refetch,
  } = useFetch(async () => {
    const staff = await staffService.list();
    return staff.map(normalizeStaff);
  }, [activeMallId]);

  const filtered = useMemo(() => {
    let items = data || [];
    if (roleFilter) items = items.filter((s) => s.role === roleFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.mall?.toLowerCase().includes(q),
      );
    }
    return items;
  }, [data, debouncedSearch, roleFilter]);

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
      await staffService.remove(deleteTarget._id);
      toast.success("Staff member removed");
      refetch();
    } catch {
      toast.error("Failed to remove staff member");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Staff Member",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {row.name}
            </p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone" },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <span className="badge-info">{ROLE_LABELS[row.role] || row.role}</span>
      ),
    },
    { key: "mall", header: "Assigned Mall" },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: "joinedAt",
      header: "Joined",
      render: (row) => formatDate(row.joinedAt),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (row) => (
        <TableActions
          onEdit={() => navigate(ROUTES.STAFF_EDIT.replace(":id", row._id))}
          onDelete={() => setDeleteTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Staff Management"
        subtitle={`${filtered.length} staff member${filtered.length !== 1 ? "s" : ""}`}
        breadcrumbs={[{ label: "Staff" }]}
        actions={
          <Button icon={Plus} onClick={() => navigate(ROUTES.STAFF_ADD)}>
            Add Staff
          </Button>
        }
      />

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, mall..."
          className="max-w-xs"
        />
        <FilterDropdown
          value={roleFilter}
          onChange={setRoleFilter}
          options={ROLE_OPTIONS}
          placeholder="All Roles"
          icon={Shield}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyTitle="No staff members found"
        emptyMessage="Add staff members to help manage your mall operations."
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
        title="Remove staff member?"
        message={`Remove "${deleteTarget?.name}" from the system? Their account will be deactivated.`}
        confirmLabel="Remove Staff"
      />
    </>
  );
};

/* ─────────────────────────────────────────────
   Shared Staff Form
───────────────────────────────────────────── */
const StaffForm = ({
  initialValues = {},
  onSubmit,
  loading,
  submitLabel,
  isEdit = false,
}) => {
  const { malls, activeMallId } = useMall();
  const { role: currentUserRole } = useAuth();
  const canCreateOnlyAccountants = currentUserRole === ROLES.MALL_MANAGER;
  const roleOptions = canCreateOnlyAccountants && !isEdit ? ACCOUNTANT_ROLE_OPTIONS : ROLE_OPTIONS;

  const defaults = {
    name: "",
    email: "",
    phone: "",
    role: canCreateOnlyAccountants && !isEdit ? ROLES.ACCOUNTANT : ROLES.MALL_MANAGER,
    mallId: activeMallId || "",
    password: "",
    notes: "",
    ...initialValues,
  };

  const rules = {
    name: [(v) => (!isRequired(v) ? "Full name is required" : null)],
    email: [(v) => (!isRequired(v) ? "Email is required" : null)],
    phone: [(v) => (!isRequired(v) ? "Phone is required" : null)],
    role: [(v) => (!isRequired(v) ? "Role is required" : null)],
    mallId: [(v) => (!isRequired(v) ? "Assigned mall is required" : null)],
  };

  if (!isEdit) {
    rules.password = [
      (v) => (!isRequired(v) ? "Password is required" : null),
      (v) =>
        !isValidPassword(v) ? "Password must be at least 8 characters" : null,
    ];
  }

  const { values, errors, handleChange, handleSubmit } = useForm(
    defaults,
    rules,
    onSubmit,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Full Name"
            name="name"
            icon={User}
            placeholder="Jane Doe"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            required
            className="sm:col-span-2"
          />
          <TextInput
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            placeholder="jane@mms.com"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            required
            disabled={isEdit}
          />
          <TextInput
            label="Phone Number"
            name="phone"
            icon={Phone}
            placeholder="+1 555 000 0000"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />
          {!isEdit && (
            <TextInput
              label="Temporary Password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              required
              helperText="Staff member will be prompted to change on first login."
              className="sm:col-span-2"
            />
          )}
        </div>
      </Card>

      <Card title="Role & Assignment">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Role"
            name="role"
            icon={Shield}
            options={roleOptions}
            value={values.role}
            onChange={handleChange}
            error={errors.role}
            required
          />
          <SelectInput
            label="Assigned Mall"
            name="mallId"
            options={malls.map((m) => ({ value: m._id, label: m.name }))}
            value={values.mallId}
            onChange={handleChange}
            error={errors.mallId}
            placeholder="Select a mall"
            required
          />
          <TextArea
            label="Notes"
            name="notes"
            placeholder="Any additional notes about this staff member..."
            value={values.notes}
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
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────
   Add Staff
───────────────────────────────────────────── */
export const AddStaff = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = buildStaffPayload(values, { includePassword: true });
      const resp = await staffService.create(payload);
      console.log(resp);
      toast.success("Staff member added!");
      navigate(ROUTES.STAFF);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Add Staff Member"
        subtitle="Create an account for a new staff member"
        breadcrumbs={[
          { label: "Staff", to: ROUTES.STAFF },
          { label: "Add Staff" },
        ]}
      />
      <StaffForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Add Staff Member"
      />
    </>
  );
};

/* ─────────────────────────────────────────────
   Edit Staff
───────────────────────────────────────────── */
export const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { data: staff, loading } = useFetch(async () => {
    try {
      return normalizeStaff(await staffService.getById(id));
    } catch {
      return SEED_STAFF.find((s) => s._id === id) || SEED_STAFF[0];
    }
  }, [id]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = buildStaffPayload(values);
      await staffService.update(id, payload);
      toast.success("Staff member updated!");
      navigate(ROUTES.STAFF);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update staff member",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <PageHeader
        title="Edit Staff Member"
        subtitle={`Editing profile for "${staff?.name}"`}
        breadcrumbs={[
          { label: "Staff", to: ROUTES.STAFF },
          { label: staff?.name || "Staff Member" },
          { label: "Edit" },
        ]}
      />
      <StaffForm
        initialValues={staff}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Save Changes"
        isEdit
      />
    </>
  );
};





