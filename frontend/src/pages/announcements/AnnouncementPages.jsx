import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Megaphone, Pin, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import TextInput from '../../components/forms/TextInput';
import SelectInput from '../../components/forms/SelectInput';
import TextArea from '../../components/forms/TextArea';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { useDebounce } from '../../hooks/useDebounce';
import { announcementService } from '../../services/miscServices';
import { ROUTES } from '../../constants/routes';
import { isRequired } from '../../utils/validators';
import { formatDateTime } from '../../utils/formatters';
import clsx from 'clsx';

const SEED_ANNOUNCEMENTS = [
  { _id: 'an1', title: 'Mall Renovation - Wing A Closure', content: 'Wing A will be temporarily closed for renovation from November 15–30. All affected tenants have been individually notified. We apologize for any inconvenience.', audience: 'all', priority: 'high', createdBy: 'Mall Manager', createdAt: '2024-11-01T09:00:00Z', pinned: true },
  { _id: 'an2', title: 'Holiday Trading Hours', content: 'Extended trading hours will be in effect from December 20 to January 5. All shops must comply with the updated schedule. Full details attached.', audience: 'tenants', priority: 'medium', createdBy: 'Mall Manager', createdAt: '2024-10-28T14:30:00Z', pinned: false },
  { _id: 'an3', title: 'December Promotion Campaign', content: 'We are launching a mall-wide December promotion campaign. Tenants wishing to participate should register by November 25.', audience: 'tenants', priority: 'low', createdBy: 'Marketing', createdAt: '2024-10-25T11:00:00Z', pinned: false },
  { _id: 'an4', title: 'Parking System Upgrade', content: 'The parking management system will be upgraded on Sunday November 10, from 2AM–6AM. Brief service interruption expected.', audience: 'all', priority: 'medium', createdBy: 'IT Admin', createdAt: '2024-10-22T16:00:00Z', pinned: false },
];

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'tenants', label: 'Tenants Only' },
  { value: 'staff', label: 'Staff Only' },
  { value: 'managers', label: 'Managers Only' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const PRIORITY_COLORS = {
  high: 'border-l-danger-500',
  medium: 'border-l-warning-500',
  low: 'border-l-gray-300 dark:border-l-gray-600',
};

/* ─────────── Announcement List ─────────── */
export const AnnouncementList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const { data, loading, refetch } = useFetch(async () => {
    try { return await announcementService.list(); }
    catch { return SEED_ANNOUNCEMENTS; }
  }, []);

  const filtered = useMemo(() => {
    let items = data || SEED_ANNOUNCEMENTS;
    if (audienceFilter) items = items.filter((a) => a.audience === audienceFilter);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((a) => a.title?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q));
    }
    // Pinned first
    return [...items].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [data, debouncedSearch, audienceFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await announcementService.remove(deleteTarget._id);
      toast.success('Announcement deleted');
      refetch();
    } catch {
      toast.error('Failed to delete announcement');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle={`${filtered.length} announcement${filtered.length !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Announcements' }]}
        actions={
          <Button icon={Plus} onClick={() => navigate(ROUTES.ANNOUNCEMENT_CREATE)}>
            New Announcement
          </Button>
        }
      />

      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search announcements..." className="max-w-xs" />
        <FilterDropdown value={audienceFilter} onChange={setAudienceFilter} options={AUDIENCE_OPTIONS} placeholder="All Audiences" icon={Megaphone} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="font-medium text-gray-600 dark:text-gray-300">No announcements found</p>
          <p className="text-sm text-gray-400 mt-1">Create an announcement to notify tenants and staff.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => (
            <div
              key={ann._id}
              className={clsx(
                'card border-l-4 p-5 hover:shadow-md transition-shadow',
                PRIORITY_COLORS[ann.priority] || PRIORITY_COLORS.low
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {ann.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                    <Badge status={ann.priority} />
                    <span className="badge-gray capitalize">{ann.audience}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{ann.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{ann.content}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    By {ann.createdBy} · {formatDateTime(ann.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTarget(ann)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete announcement?"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
};

/* ─────────── Create Announcement ─────────── */
export const CreateAnnouncement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, handleSubmit } = useForm(
    { title: '', content: '', audience: 'all', priority: 'medium', pinned: false },
    {
      title: [(v) => (!isRequired(v) ? 'Title is required' : null)],
      content: [(v) => (!isRequired(v) ? 'Content is required' : null)],
    },
    async (vals) => {
      setLoading(true);
      try {
        await announcementService.create(vals);
        toast.success('Announcement published!');
        navigate(ROUTES.ANNOUNCEMENTS);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to create announcement');
      } finally {
        setLoading(false);
      }
    }
  );

  return (
    <>
      <PageHeader
        title="New Announcement"
        subtitle="Publish a notice to tenants and staff"
        breadcrumbs={[{ label: 'Announcements', to: ROUTES.ANNOUNCEMENTS }, { label: 'New' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card title="Announcement Details">
          <div className="space-y-4">
            <TextInput
              label="Title"
              name="title"
              icon={Megaphone}
              placeholder="Brief, descriptive title"
              value={values.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectInput
                label="Audience"
                name="audience"
                options={AUDIENCE_OPTIONS}
                value={values.audience}
                onChange={handleChange}
              />
              <SelectInput
                label="Priority"
                name="priority"
                options={PRIORITY_OPTIONS}
                value={values.priority}
                onChange={handleChange}
              />
            </div>

            <TextArea
              label="Content"
              name="content"
              placeholder="Write the full announcement content here..."
              value={values.content}
              onChange={handleChange}
              error={errors.content}
              rows={6}
              required
            />

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="pinned"
                checked={values.pinned}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin this announcement</p>
                <p className="text-xs text-gray-400">Pinned announcements appear at the top of the list.</p>
              </div>
            </label>
          </div>
        </Card>

        {/* Preview */}
        {values.title && (
          <Card title="Preview">
            <div className={clsx('rounded-xl border-l-4 p-4', PRIORITY_COLORS[values.priority] || PRIORITY_COLORS.low)}>
              <div className="flex flex-wrap gap-2 mb-2">
                {values.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-600">
                    <Pin className="h-3 w-3" /> Pinned
                  </span>
                )}
                <Badge status={values.priority} />
                <span className="badge-gray capitalize">{values.audience}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">{values.title}</h3>
              {values.content && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{values.content}</p>
              )}
            </div>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Megaphone}>
            Publish Announcement
          </Button>
        </div>
      </form>
    </>
  );
};
