import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Hash, DollarSign, Layers, Maximize2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import TextInput from '../../components/forms/TextInput';
import SelectInput from '../../components/forms/SelectInput';
import TextArea from '../../components/forms/TextArea';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useForm } from '../../hooks/useForm';
import { useFetch } from '../../hooks/useFetch';
import { shopService } from '../../services/shopService';
import { isRequired, isPositiveNumber } from '../../utils/validators';
import { ROUTES } from '../../constants/routes';

const STATUS_OPTIONS = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Under Maintenance' },
];

const CATEGORY_OPTIONS = [
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'health_beauty', label: 'Health & Beauty' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

const ShopForm = ({ initialValues = {}, onSubmit, loading, submitLabel = 'Save Shop' }) => {
  const defaults = { shopNumber: '', name: '', floor: '', size: '', monthlyRent: '', category: '', status: 'vacant', description: '', ...initialValues };

  const { values, errors, handleChange, handleSubmit } = useForm(
    defaults,
    {
      shopNumber: [(v) => (!isRequired(v) ? 'Shop number is required' : null)],
      name: [(v) => (!isRequired(v) ? 'Shop name is required' : null)],
      monthlyRent: [
        (v) => (!isRequired(v) ? 'Monthly rent is required' : null),
        (v) => (!isPositiveNumber(v) ? 'Rent must be a positive number' : null),
      ],
    },
    onSubmit
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Shop Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput label="Shop Number" name="shopNumber" icon={Hash} placeholder="101" value={values.shopNumber} onChange={handleChange} error={errors.shopNumber} required />
          <TextInput label="Shop Name" name="name" placeholder="Urban Eats" value={values.name} onChange={handleChange} error={errors.name} required />
          <TextInput label="Floor" name="floor" type="number" icon={Layers} placeholder="1" value={values.floor} onChange={handleChange} />
          <TextInput label="Size (sqft)" name="size" type="number" icon={Maximize2} placeholder="450" value={values.size} onChange={handleChange} />
          <TextInput label="Monthly Rent ($)" name="monthlyRent" type="number" icon={DollarSign} placeholder="4500" value={values.monthlyRent} onChange={handleChange} error={errors.monthlyRent} required />
          <SelectInput label="Category" name="category" options={CATEGORY_OPTIONS} value={values.category} onChange={handleChange} placeholder="Select category" />
          <SelectInput label="Status" name="status" options={STATUS_OPTIONS} value={values.status} onChange={handleChange} />
          <TextArea label="Description" name="description" placeholder="Brief description..." value={values.description} onChange={handleChange} rows={3} className="sm:col-span-2" />
        </div>
      </Card>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" loading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
};

const SEED_SHOP = { _id: 's1', shopNumber: '101', name: 'Urban Eats', floor: 1, size: 450, monthlyRent: 4500, category: 'food_beverage', status: 'occupied', description: 'A popular food court stall.' };

export const AddShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (values) => {
    setLoading(true);
    try { await shopService.create(values); toast.success('Shop created!'); navigate(ROUTES.SHOPS); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to create shop'); }
    finally { setLoading(false); }
  };
  return (
    <>
      <PageHeader title="Add New Shop" breadcrumbs={[{ label: 'Shops', to: ROUTES.SHOPS }, { label: 'Add Shop' }]} />
      <ShopForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Shop" />
    </>
  );
};

export const EditShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { data: shop, loading } = useFetch(async () => { try { return await shopService.getById(id); } catch { return SEED_SHOP; } }, [id]);
  const handleSubmit = async (values) => {
    setSaving(true);
    try { await shopService.update(id, values); toast.success('Shop updated!'); navigate(ROUTES.SHOPS); }
    catch (err) { toast.error(err?.response?.data?.message || 'Failed to update shop'); }
    finally { setSaving(false); }
  };
  if (loading) return <LoadingSpinner fullScreen />;
  return (
    <>
      <PageHeader title="Edit Shop" breadcrumbs={[{ label: 'Shops', to: ROUTES.SHOPS }, { label: shop?.name || 'Shop' }, { label: 'Edit' }]} />
      <ShopForm initialValues={shop} onSubmit={handleSubmit} loading={saving} submitLabel="Save Changes" />
    </>
  );
};

export const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: shop, loading } = useFetch(async () => { try { return await shopService.getById(id); } catch { return { ...SEED_SHOP, tenant: 'Fresh Foods Inc.', leaseEnd: '2025-12-31' }; } }, [id]);
  if (loading) return <LoadingSpinner fullScreen />;
  return (
    <>
      <PageHeader
        title={`Shop #${shop?.shopNumber} — ${shop?.name}`}
        breadcrumbs={[{ label: 'Shops', to: ROUTES.SHOPS }, { label: shop?.name }]}
        actions={<Button icon={() => <span>✏</span>} onClick={() => navigate(ROUTES.SHOP_EDIT.replace(':id', id))}>Edit</Button>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Shop Details">
          {[
            { label: 'Shop Number', value: shop?.shopNumber },
            { label: 'Floor', value: shop?.floor },
            { label: 'Size', value: shop?.size ? `${shop.size} sqft` : null },
            { label: 'Monthly Rent', value: shop?.monthlyRent ? `$${shop.monthlyRent.toLocaleString()}` : null },
            { label: 'Category', value: shop?.category },
            { label: 'Status', value: shop?.status },
            { label: 'Current Tenant', value: shop?.tenant },
            { label: 'Lease End', value: shop?.leaseEnd },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between border-b border-gray-50 dark:border-gray-800 py-2.5 last:border-0">
              <span className="text-sm text-gray-400">{label}</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{value || '—'}</span>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
};
