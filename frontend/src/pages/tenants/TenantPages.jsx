import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, Building2, FileText, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import TextInput from '../../components/forms/TextInput';
import TextArea from '../../components/forms/TextArea';
import SelectInput from '../../components/forms/SelectInput';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { useForm } from '../../hooks/useForm';
import { useFetch } from '../../hooks/useFetch';
import { tenantService } from '../../services/tenantService';
import { useMall } from '../../context/MallContext';
import { isRequired, isValidEmail, isValidPhone, isValidPassword } from '../../utils/validators';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';

const normalizeTenant = (tenant = {}) => ({
  ...tenant,
  name: tenant.name || tenant.fullName || tenant.userId?.fullName || '',
  fullName: tenant.fullName || tenant.name || tenant.userId?.fullName || '',
  email: tenant.email || tenant.userId?.email || '',
  phone: tenant.phone || tenant.userId?.phone || '',
  mallId: tenant.mallId?._id || tenant.mallId || '',
  status: tenant.status || (tenant.userId?.isActive === false ? 'inactive' : 'active'),
});

const buildTenantPayload = (values, { includeCredentials = false } = {}) => {
  const payload = {
    businessName: values.businessName,
    tradeLicense: values.tradeLicense,
    tinNumber: values.tinNumber,
    emergencyContact: values.emergencyContact,
    mallId: values.mallId,
  };

  if (includeCredentials) {
    payload.fullName = values.fullName;
    payload.email = values.email;
    payload.phone = values.phone;
    payload.password = values.password;
  }

  return payload;
};
// Previously this form only collected business details (businessName,
// tradeLicense, tinNumber, emergencyContact) and submitted them straight
// to tenantService.create(). The backend's registerTenant requires email,
// password, and fullName to create the linked login (User) account — none
// of those fields existed here, so every tenant created through this form
// would fail validation (or, before the backend fix, would create a
// Tenant profile with no way to ever log in). isEdit hides the
// credential fields since editing a tenant shouldn't touch their login.
const TenantForm = ({ initialValues = {}, onSubmit, loading, submitLabel, isEdit = false }) => {
  const { malls, activeMallId } = useMall();
  const defaults = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    tradeLicense: '',
    tinNumber: '',
    emergencyContact: '',
    mallId: activeMallId || '',
    ...initialValues
  };

  const rules = {
    businessName: [(v) => (!isRequired(v) ? 'Business name is required' : null)],
    mallId: [(v) => (!isRequired(v) ? 'A mall must be selected' : null)],
  };

  if (!isEdit) {
    rules.fullName = [(v) => (!isRequired(v) ? 'Full name is required' : null)];
    rules.email = [
      (v) => (!isRequired(v) ? 'Email is required' : null),
      (v) => (!isValidEmail(v) ? 'Enter a valid email' : null),
    ];
    rules.password = [
      (v) => (!isRequired(v) ? 'Password is required' : null),
      (v) => (!isValidPassword(v) ? 'Password must be at least 8 characters' : null),
    ];
  }

  const { values, errors, handleChange, handleSubmit } = useForm(defaults, rules, onSubmit);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEdit && (
        <Card title="Login Account">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Full Name"
              name="fullName"
              icon={User}
              placeholder="Jane Doe"
              value={values.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />
            <TextInput
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="tenant@example.com"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <TextInput
              label="Temporary Password"
              name="password"
              type="password"
              icon={Lock}
              placeholder="Min. 8 characters"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              required
              helperText="The tenant will use this, with their email, to log in."
              className="sm:col-span-2"
            />
          </div>
        </Card>
      )}
      <Card title="Business Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Business Name"
            name="businessName"
            icon={Building2}
            placeholder="Your Business Name"
            value={values.businessName}
            onChange={handleChange}
            error={errors.businessName}
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
          <TextInput
            label="Trade License"
            name="tradeLicense"
            placeholder="Trade License Number"
            value={values.tradeLicense}
            onChange={handleChange}
          />
          <TextInput
            label="TIN Number"
            name="tinNumber"
            type="number"
            placeholder="Tax ID Number"
            value={values.tinNumber}
            onChange={handleChange}
          />
          <TextInput
            label="Phone"
            name="phone"
            type="tel"
            icon={Phone}
            placeholder="Contact Number"
            value={values.phone}
            onChange={handleChange}
          />
          <TextInput
            label="Emergency Contact"
            name="emergencyContact"
            type="tel"
            icon={Phone}
            placeholder="Emergency Contact Number"
            value={values.emergencyContact}
            onChange={handleChange}
          />
        </div>
      </Card>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

const SEED_TENANT = { _id: 't1', businessName: 'Bright Coffee Co.', tradeLicense: 'TL-12345', tinNumber: 1234567890, emergencyContact: 5551234567, createdAt: '2022-01-10' };

export const AddTenant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (values) => {
    setLoading(true);
    try { await tenantService.create(buildTenantPayload(values, { includeCredentials: true })); toast.success('Tenant added!'); navigate(ROUTES.TENANTS); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to add tenant'); }
    finally { setLoading(false); }
  };
  return (
    <>
      <PageHeader title="Add Tenant" breadcrumbs={[{ label: 'Tenants', to: ROUTES.TENANTS }, { label: 'Add Tenant' }]} />
      <TenantForm onSubmit={handleSubmit} loading={loading} submitLabel="Add Tenant" />
    </>
  );
};

export const EditTenant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { data: tenant, loading } = useFetch(async () => { try { return normalizeTenant(await tenantService.getById(id)); } catch { return SEED_TENANT; } }, [id]);
  const handleSubmit = async (values) => {
    setSaving(true);
    try { await tenantService.update(id, buildTenantPayload(values)); toast.success('Tenant updated!'); navigate(ROUTES.TENANTS); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to update tenant'); }
    finally { setSaving(false); }
  };
  if (loading) return <LoadingSpinner fullScreen />;
  return (
    <>
      <PageHeader title="Edit Tenant" breadcrumbs={[{ label: 'Tenants', to: ROUTES.TENANTS }, { label: tenant?.name }, { label: 'Edit' }]} />
      <TenantForm initialValues={tenant} onSubmit={handleSubmit} loading={saving} submitLabel="Save Changes" isEdit />
    </>
  );
};

export const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tenant, loading } = useFetch(async () => { try { return normalizeTenant(await tenantService.getById(id)); } catch { return SEED_TENANT; } }, [id]);
  if (loading) return <LoadingSpinner fullScreen />;
  return (
    <>
      <PageHeader
        title={tenant?.businessName}
        breadcrumbs={[{ label: 'Tenants', to: ROUTES.TENANTS }, { label: tenant?.businessName }]}
        actions={<Button onClick={() => navigate(ROUTES.TENANT_EDIT.replace(':id', id))}>Edit</Button>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Tenant Information">
          {[
            { label: 'Business Name', value: tenant?.businessName },
            { label: 'Trade License', value: tenant?.tradeLicense || '—' },
            { label: 'TIN Number', value: tenant?.tinNumber || '—' },
            { label: 'Emergency Contact', value: tenant?.emergencyContact || '—' },
            { label: 'Member Since', value: formatDate(tenant?.createdAt) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between border-b border-gray-50 dark:border-gray-800 py-2.5 last:border-0">
              <span className="text-sm text-gray-400">{label}</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100 text-right max-w-[60%]">{value || '—'}</span>
            </div>
          ))}
        </Card>
        <div className="space-y-4">
          <Card title="Quick Actions">
            <div className="space-y-2">
              {[
                { label: 'View Lease', to: ROUTES.LEASES },
                { label: 'Payment History', to: ROUTES.PAYMENT_HISTORY },
                { label: 'Maintenance Requests', to: ROUTES.MAINTENANCE },
              ].map((action) => (
                <a key={action.label} href={action.to} className="flex w-full items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                  {action.label}
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

