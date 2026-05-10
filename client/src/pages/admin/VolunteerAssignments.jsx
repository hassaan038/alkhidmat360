import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ClipboardList, Plus, Calendar, MapPin, User, Search,
  Pencil, Trash2, Ban, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/common/EmptyState';
import { FormGrid, FormField } from '../../components/ui/FormSection';
import * as svc from '../../services/volunteerAssignmentService';
import { cn, formatApiError, formatDate } from '../../lib/utils';
import { futureOrTodayDateOptionalSchema, todayIso } from '../../lib/validators';

const TASK_CATEGORIES = [
  { value: 'DISTRIBUTION', label: 'Distribution' },
  { value: 'FUNDRAISING', label: 'Fundraising' },
  { value: 'AWARENESS', label: 'Awareness' },
  { value: 'ADMINISTRATIVE', label: 'Administrative' },
  { value: 'FIELD_WORK', label: 'Field work' },
  { value: 'EVENT_SUPPORT', label: 'Event support' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

const STATUS_TONE = {
  assigned: { variant: 'warning', label: 'Assigned' },
  in_progress: { variant: 'info', label: 'In progress' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
};

const PRIORITY_TONE = {
  high: 'error',
  normal: 'primary',
  low: 'neutral',
};

const formSchema = z.object({
  volunteerId: z.coerce.number({ invalid_type_error: 'Pick a volunteer' }).int().positive('Pick a volunteer'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Describe the task in at least 10 characters'),
  category: z.enum(TASK_CATEGORIES.map((c) => c.value)),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  location: z.string().optional(),
  dueDate: futureOrTodayDateOptionalSchema,
});

export default function VolunteerAssignments() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | assignment object
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [list, vols] = await Promise.all([
        svc.adminListAssignments(),
        svc.adminListVolunteers(),
      ]);
      setAssignments(list);
      setVolunteers(vols);
    } catch (err) {
      toast.error('Could not load assignments', { description: formatApiError(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const byStatus = (s) => assignments.filter((a) => a.status === s).length;
    return [
      { label: 'Total', value: assignments.length, icon: ClipboardList, tone: 'primary' },
      { label: 'Open', value: byStatus('assigned') + byStatus('in_progress'), icon: Loader2, tone: 'volunteer' },
      { label: 'Completed', value: byStatus('completed'), icon: CheckCircle2, tone: 'success' },
      { label: 'Cancelled', value: byStatus('cancelled'), icon: Ban, tone: 'neutral' },
    ];
  }, [assignments]);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [a.title, a.description, a.volunteer?.fullName, a.volunteer?.email, a.location].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [assignments, statusFilter, search]);

  const filterChips = [
    { id: 'all', label: 'All' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_progress', label: 'In progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const handleCancel = async (a) => {
    try {
      const next = await svc.adminUpdateAssignmentStatus(a.id, 'cancelled');
      setAssignments((cur) => cur.map((x) => (x.id === a.id ? next : x)));
      toast.success('Assignment cancelled');
    } catch (err) {
      toast.error('Could not cancel', { description: formatApiError(err) });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await svc.adminDeleteAssignment(confirmDelete.id);
      setAssignments((cur) => cur.filter((x) => x.id !== confirmDelete.id));
      toast.success('Assignment deleted');
      setConfirmDelete(null);
    } catch (err) {
      toast.error('Could not delete', { description: formatApiError(err) });
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={ClipboardList}
          accent="volunteer"
          title="Volunteer Assignments"
          description="Hand specific tasks to volunteers and follow up on progress."
          actions={
            <Button leftIcon={Plus} onClick={() => setEditing('new')} disabled={volunteers.length === 0}>
              New assignment
            </Button>
          }
        />

        {volunteers.length === 0 && !loading && (
          <Card className="p-4 border-warning/50 bg-warning-light/40 dark:bg-warning/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning-dark flex-shrink-0 mt-0.5" />
              <div className="text-sm text-warning-dark dark:text-warning-light">
                No active volunteers yet. Once people sign up as volunteers you&apos;ll be able to assign them tasks here.
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input leftIcon={Search} placeholder="Search title, volunteer or location" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filterChips.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setStatusFilter(c.id)}
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                    statusFilter === c.id
                      ? 'bg-volunteer-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              tone="volunteer"
              title={assignments.length === 0 ? 'No assignments yet' : 'No matching assignments'}
              description={assignments.length === 0 ? 'Click "New assignment" to give a volunteer something to do.' : 'Try clearing search or filters.'}
            />
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((a) => (
                <AssignmentRow
                  key={a.id}
                  assignment={a}
                  onEdit={() => setEditing(a)}
                  onCancel={() => handleCancel(a)}
                  onDelete={() => setConfirmDelete(a)}
                />
              ))}
            </ul>
          )}
        </Card>
      </PageContainer>

      <AssignmentFormModal
        open={editing !== null}
        initial={editing && editing !== 'new' ? editing : null}
        volunteers={volunteers}
        onClose={() => setEditing(null)}
        onSaved={(saved, isNew) => {
          setAssignments((cur) => (isNew ? [saved, ...cur] : cur.map((x) => (x.id === saved.id ? saved : x))));
          setEditing(null);
        }}
      />

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete this assignment?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" leftIcon={Trash2} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The volunteer will lose access to this task. If they&apos;ve already done the work, consider keeping the record and just changing the status instead.
        </p>
      </Modal>
    </DashboardLayout>
  );
}

function AssignmentRow({ assignment, onEdit, onCancel, onDelete }) {
  const tone = STATUS_TONE[assignment.status] || STATUS_TONE.assigned;
  const cat = TASK_CATEGORIES.find((c) => c.value === assignment.category)?.label || assignment.category;
  return (
    <li className="px-4 py-4 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{assignment.title}</h3>
            <Badge variant={tone.variant} size="sm" dot>{tone.label}</Badge>
            <Badge variant={PRIORITY_TONE[assignment.priority]} size="sm">{assignment.priority}</Badge>
            <Badge variant="neutral" size="sm">{cat}</Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{assignment.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {assignment.volunteer?.fullName || '—'}
            </span>
            {assignment.dueDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Due {formatDate(assignment.dueDate)}
              </span>
            )}
            {assignment.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {assignment.location}
              </span>
            )}
            {assignment.completedAt && (
              <span className="inline-flex items-center gap-1.5 text-success-dark">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed {formatDate(assignment.completedAt)}
              </span>
            )}
          </div>
          {assignment.completionNotes && (
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-md px-2 py-1.5 border border-gray-100 dark:border-gray-800">
              <span className="font-medium text-gray-700 dark:text-gray-300">Notes from volunteer:</span> {assignment.completionNotes}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
          {assignment.status !== 'cancelled' && assignment.status !== 'completed' && (
            <Button size="sm" variant="outline" leftIcon={Ban} onClick={onCancel}>Cancel</Button>
          )}
          <Button size="sm" variant="outline" leftIcon={Pencil} onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="ghost" leftIcon={Trash2} onClick={onDelete} className="text-error hover:text-error-dark">Delete</Button>
        </div>
      </div>
    </li>
  );
}

function AssignmentFormModal({ open, initial, volunteers, onClose, onSaved }) {
  const isEdit = !!initial;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      volunteerId: '',
      title: '',
      description: '',
      category: 'DISTRIBUTION',
      priority: 'normal',
      location: '',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      volunteerId: initial?.volunteerId ?? '',
      title: initial?.title || '',
      description: initial?.description || '',
      category: initial?.category || 'DISTRIBUTION',
      priority: initial?.priority || 'normal',
      location: initial?.location || '',
      dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
    });
  }, [open, initial, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        location: data.location || null,
        dueDate: data.dueDate || null,
      };
      if (isEdit) {
        const { volunteerId: _v, ...rest } = payload;
        const saved = await svc.adminUpdateAssignment(initial.id, rest);
        toast.success('Assignment updated');
        onSaved(saved, false);
      } else {
        const saved = await svc.adminCreateAssignment(payload);
        toast.success('Assignment created');
        onSaved(saved, true);
      }
    } catch (err) {
      toast.error('Could not save', { description: formatApiError(err) });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit assignment' : 'New volunteer assignment'}
      description={isEdit ? 'Update the task details below.' : 'Pick a volunteer and describe the task they need to do.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create assignment'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isEdit && (
          <FormField label="Volunteer" required htmlFor="vol" error={errors.volunteerId?.message}>
            <Select id="vol" {...register('volunteerId')}>
              <option value="">Pick a volunteer…</option>
              {volunteers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.fullName} — {v.email}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Title" required htmlFor="ttl" error={errors.title?.message}>
          <Input id="ttl" {...register('title')} placeholder="e.g. Distribute ration packs in Korangi" />
        </FormField>

        <FormField label="Description" required htmlFor="desc" error={errors.description?.message}>
          <Textarea id="desc" rows={4} {...register('description')} placeholder="What needs to happen, who to coordinate with, what to bring…" />
        </FormField>

        <FormGrid cols={2}>
          <FormField label="Category" required htmlFor="cat" error={errors.category?.message}>
            <Select id="cat" {...register('category')}>
              {TASK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Priority" htmlFor="pri" error={errors.priority?.message}>
            <Select id="pri" {...register('priority')}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Location" htmlFor="loc" hint="Optional" error={errors.location?.message}>
            <Input id="loc" {...register('location')} placeholder="e.g. Karachi office" />
          </FormField>
          <FormField label="Due date" htmlFor="due" hint="Optional" error={errors.dueDate?.message}>
            <Input id="due" type="date" min={todayIso()} {...register('dueDate')} />
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  );
}
