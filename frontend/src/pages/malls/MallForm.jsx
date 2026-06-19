import React from 'react';
import { Building2, MapPin, Phone, Globe, Mail, Hash } from 'lucide-react';
import TextInput from '../../components/forms/TextInput';
import TextArea from '../../components/forms/TextArea';
import SelectInput from '../../components/forms/SelectInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../hooks/useAuth';
import { isRequired } from '../../utils/validators';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const MallForm = ({ initialValues = {}, onSubmit, loading, submitLabel = 'Save Mall' }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const defaults = {
    name: '',
    address: '',
    city: '',
    floors: '',
    totalShops: '',
    description: '',
    logo: '',
    status: 'PENDING',
    ...initialValues,
  };

  const { values, errors, handleChange, handleSubmit } = useForm(
    defaults,
    isSuperAdmin
      ? { status: [(v) => (!isRequired(v) ? 'Status is required' : null)] }
      : {
          name: [(v) => (!isRequired(v) ? 'Mall name is required' : null)],
          address: [(v) => (!isRequired(v) ? 'Address is required' : null)],
          city: [(v) => (!isRequired(v) ? 'City is required' : null)],
          floors: [(v) => (!isRequired(v) ? 'Total floors is required' : null)],
          totalShops: [(v) => (!isRequired(v) ? 'Total shops is required' : null)],
          description: [(v) => (!isRequired(v) ? 'Description is required' : null)],
          logo: [(v) => (!isRequired(v) ? 'Logo is required' : null)],
        },
    onSubmit
  );

  if (isSuperAdmin) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Mall Approval">
          <SelectInput
            label="Status"
            name="status"
            options={STATUS_OPTIONS}
            value={values.status}
            onChange={handleChange}
            error={errors.status}
            required
          />
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
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Mall Name"
            name="name"
            icon={Building2}
            placeholder="Skyline Grand Mall"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            required
            className="sm:col-span-2"
          />
          <TextInput
            label="Logo URL"
            name="logo"
            icon={Globe}
            placeholder="https://example.com/logo.png"
            value={values.logo}
            onChange={handleChange}
            error={errors.logo}
            required
            className="sm:col-span-2"
          />
        </div>
      </Card>

      <Card title="Location">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Street Address"
            name="address"
            icon={MapPin}
            placeholder="123 Mall Avenue"
            value={values.address}
            onChange={handleChange}
            error={errors.address}
            required
            className="sm:col-span-2"
          />
          <TextInput
            label="City"
            name="city"
            placeholder="New York"
            value={values.city}
            onChange={handleChange}
            error={errors.city}
            required
          />
        </div>
      </Card>

      <Card title="Properties">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextInput
            label="Total Floors"
            name="floors"
            type="number"
            icon={Hash}
            placeholder="4"
            value={values.floors}
            onChange={handleChange}
            error={errors.floors}
            required
          />
          <TextInput
            label="Total Shops"
            name="totalShops"
            type="number"
            icon={Hash}
            placeholder="120"
            value={values.totalShops}
            onChange={handleChange}
            error={errors.totalShops}
            required
          />
          {isSuperAdmin && (
            <SelectInput
              label="Status"
              name="status"
              options={STATUS_OPTIONS}
              value={values.status}
              onChange={handleChange}
            />
          )}
          <TextArea
            label="Description"
            name="description"
            placeholder="Brief description of the mall..."
            value={values.description}
            onChange={handleChange}
            error={errors.description}
            required
            rows={3}
            className="sm:col-span-3"
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

export default MallForm;



