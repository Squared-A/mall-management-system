import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, Building2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import TextInput from '../../components/forms/TextInput';
import TextArea from '../../components/forms/TextArea';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { useForm } from '../../hooks/useForm';
import { useFetch } from '../../hooks/useFetch';
import { tenantService } from '../../services/tenantService';
import { isRequired, isValidEmail, isValidPhone } from '../../utils/validators';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';

const TenantForm = ({ initialValues = {}, onSubmit, loading, submitLabel }) => {
  const defaults = { name: '', email: '', phone: '', businessName: '', businessType: '', nationalId: '', notes: '', ...initialValues };
  const { values, errors, handleChange, handleSubmit } = useForm(defaults, {
    name: [(v) => (!isRequired(v) ? 'Full name is required' : null)],
    email: [
      (v) => (!isRequired(v) ? 'Email is required' : null),
      (v) => (!isValidEmail(v) ? 'Enter a valid email' : null),
    ],
    phone: [(v) => (!isRequired(v) ? 'Phone is required' : null)],
    businessName: [(v) => (!isRequired(v) ? 'Business name is required' : null)],
  }, onSubmit);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="Full Name" name="name" icon={User} placeholder="Jane Doe" value={values.name} onChange={handleChange} error={errors.name} required className="sm:col-span-2" />
          <TextInput label="Email" name="email" type="email" icon={Mail} placeholder="jane@example.com" value={values.email} onChange={handleChange} error={errors.email} required />
          <TextInput label="Phone" name="phone" icon={Phone} placeholder="+1 555 000 0000" value={values.phone} onChange={handleChange} error={errors.phone} required />
          <TextInput label="National ID / Passport" name="nationalId" icon={FileText} placeholder="ID Number" value={values.nationalId} onChange={handleChange} />
        </div>
      </Card>
      <Card title="Business Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="Business Name" name="businessName" icon={Building2} placeholder="Bright Coffee Co." value={values.businessName} onChange={handleChange} error={errors.businessName} required />
          <TextInput label="Business Type" name="businessType" placeholder="Café / Retail / Services..." value={values.businessType} onChange={handleChange} />
          <TextArea label="Notes" name="notes" placeholder="Any additional notes..." value={values.notes} onChange={handleChange} rows={3} className="sm:col-span-2" />
        </div>
      </Card>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" loading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
};

const SEED_TENANT = { _id: 't1', name: 'Alice Johnson', businessName: 'Bright Coffee Co.', email: 'alice@brightcoffee.com', phone: '+1 555 101 2020', businessType: 'Café', nationalId: 'ID-12345', shopNumber: '112', status: 'active', createdAt: '2022-01-10', notes: 'Reliable tenant with consistent payments.' };

export const AddTenant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (values) => {
    setLoading(true);
    try { await tenantService.create(values); toast.success('Tenant added!'); navigate(ROUTES.TENANTS); }
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
  const { data: tenant, loading } = useFetch(async () => { try { return await tenantService.getById(id); } catch { return SEED_TENANT; } }, [id]);
  const handleSubmit = async (values) => {
    setSaving(true);
    try { await tenantService.update(id, values); toast.success('Tenant updated!'); navigate(ROUTES.TENANTS); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to update tenant'); }
    finally { setSaving(false); }
  };
  if (loading) return <LoadingSpinner fullScreen />;
  return (
    <>
      <PageHeader title="Edit Tenant" breadcrumbs={[{ label: 'Tenants', to: ROUTES.TENANTS }, { label: tenant?.name }, { label: 'Edit' }]} />
      <TenantForm initialValues={tenant} onSubmit={handleSubmit} loading={saving} submitLabel="Save Changes" />
    </>
  );
};

export const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tenant, loading } = useFetch(async () => { try { return await tenantService.getById(id); } catch { return SEED_TENANT; } }, [id]);
  if (loading) return <LoadingSpinner fullScreen />;
  return (
    <>
      <PageHeader
        title={tenant?.name}
        subtitle={tenant?.businessName}
        breadcrumbs={[{ label: 'Tenants', to: ROUTES.TENANTS }, { label: tenant?.name }]}
        actions={<Button onClick={() => navigate(ROUTES.TENANT_EDIT.replace(':id', id))}>Edit</Button>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Tenant Profile">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={tenant?.name} size="lg" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{tenant?.name}</p>
              <p className="text-sm text-gray-500">{tenant?.businessName}</p>
              <Badge status={tenant?.status} />
            </div>
          </div>
          {[
            { label: 'Email', value: tenant?.email },
            { label: 'Phone', value: tenant?.phone },
            { label: 'Business Type', value: tenant?.businessType },
            { label: 'National ID', value: tenant?.nationalId },
            { label: 'Shop Number', value: tenant?.shopNumber },
            { label: 'Member Since', value: formatDate(tenant?.createdAt) },
            { label: 'Notes', value: tenant?.notes },
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
