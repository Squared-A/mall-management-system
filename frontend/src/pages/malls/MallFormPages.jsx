import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MallForm from './MallForm';
import { mallService } from '../../services/mallService';
import { useFetch } from '../../hooks/useFetch';
import { ROUTES } from '../../constants/routes';
import { buildModelPayload } from '../../utils/payload';
import { useAuth } from '../../hooks/useAuth';

export const AddMall = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await mallService.create(buildModelPayload(values, ['name', 'address', 'city', 'floors', 'totalShops', 'description', 'logo', 'status'], ['floors', 'totalShops']));
      toast.success('Mall created successfully!');
      navigate(ROUTES.MALLS);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create mall');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Add New Mall"
        subtitle="Fill in the details to register a new mall"
        breadcrumbs={[{ label: 'Malls', to: ROUTES.MALLS }, { label: 'Add Mall' }]}
      />
      <MallForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Mall" />
    </>
  );
};

export const EditMall = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const { data: mall, loading } = useFetch(
    async () => {
      try {
        return await mallService.getById(id);
      } catch {
        return {
          _id: id,
          name: 'Skyline Grand Mall',
          address: '123 Mall Ave',
          city: 'New York',
          state: 'NY',
          country: 'United States',
          postalCode: '10001',
          phone: '+1 555 000 0000',
          email: 'info@skyline.com',
          totalFloors: 4,
          totalShops: 120,
          status: 'active',
        };
      }
    },
    [id]
  );

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      await mallService.update(id, user?.role === 'super_admin' ? { status: values.status } : buildModelPayload(values, ['name', 'address', 'city', 'floors', 'totalShops', 'description', 'logo', 'status'], ['floors', 'totalShops']));
      toast.success('Mall updated successfully!');
      navigate(ROUTES.MALLS);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update mall');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <PageHeader
        title="Edit Mall"
        subtitle={`Editing details for "${mall?.name}"`}
        breadcrumbs={[
          { label: 'Malls', to: ROUTES.MALLS },
          { label: mall?.name || 'Mall', to: ROUTES.MALL_DETAILS.replace(':id', id) },
          { label: 'Edit' },
        ]}
      />
      <MallForm
        initialValues={mall}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Save Changes"
      />
    </>
  );
};

