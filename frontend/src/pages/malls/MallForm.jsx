import React from 'react';
import { Building2, MapPin, Phone, Globe, Mail, Hash } from 'lucide-react';
import TextInput from '../../components/forms/TextInput';
import TextArea from '../../components/forms/TextArea';
import SelectInput from '../../components/forms/SelectInput';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useForm } from '../../hooks/useForm';
import { isRequired } from '../../utils/validators';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'closed', label: 'Closed' },
];

const MallForm = ({ initialValues = {}, onSubmit, loading, submitLabel = 'Save Mall' }) => {
  const defaults = {
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    totalFloors: '',
    totalShops: '',
    status: 'active',
    description: '',
    ...initialValues,
  };

  const { values, errors, handleChange, handleSubmit } = useForm(
    defaults,
    {
      name: [(v) => (!isRequired(v) ? 'Mall name is required' : null)],
      address: [(v) => (!isRequired(v) ? 'Address is required' : null)],
      city: [(v) => (!isRequired(v) ? 'City is required' : null)],
      country: [(v) => (!isRequired(v) ? 'Country is required' : null)],
    },
    onSubmit
  );

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
            label="Phone"
            name="phone"
            icon={Phone}
            placeholder="+1 555 000 0000"
            value={values.phone}
            onChange={handleChange}
          />
          <TextInput
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="info@mall.com"
            value={values.email}
            onChange={handleChange}
          />
          <TextInput
            label="Website"
            name="website"
            icon={Globe}
            placeholder="https://mall.com"
            value={values.website}
            onChange={handleChange}
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
          <TextInput
            label="State / Province"
            name="state"
            placeholder="NY"
            value={values.state}
            onChange={handleChange}
          />
          <TextInput
            label="Country"
            name="country"
            placeholder="United States"
            value={values.country}
            onChange={handleChange}
            error={errors.country}
            required
          />
          <TextInput
            label="Postal Code"
            name="postalCode"
            placeholder="10001"
            value={values.postalCode}
            onChange={handleChange}
          />
        </div>
      </Card>

      <Card title="Properties">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextInput
            label="Total Floors"
            name="totalFloors"
            type="number"
            icon={Hash}
            placeholder="4"
            value={values.totalFloors}
            onChange={handleChange}
          />
          <TextInput
            label="Total Shops"
            name="totalShops"
            type="number"
            icon={Hash}
            placeholder="120"
            value={values.totalShops}
            onChange={handleChange}
          />
          <SelectInput
            label="Status"
            name="status"
            options={STATUS_OPTIONS}
            value={values.status}
            onChange={handleChange}
          />
          <TextArea
            label="Description"
            name="description"
            placeholder="Brief description of the mall..."
            value={values.description}
            onChange={handleChange}
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
