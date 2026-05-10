import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList, Calendar, MapPin, User, Play, Check, FileText,
  Loader2, CheckCircle2, Ban, ArrowRight,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/common/EmptyState';
import * as svc from '../../services/volunteerAssignmentService';
import { cn, formatApiError, formatDate } from '../../lib/utils';

const STATUS_TONE = {
  assigned: { variant: 'warning', label: 'New' },
  in_progress: { variant: 'info', label: 'In progress' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
};

const PRIORITY_TONE = {
  high: 'error',
  normal: 'primary',
  low: 'neutral',
};

const CATEGORY_LABEL = {
  DISTRIBUTION: 'Distribution',
  FUNDRAISING: 'Fundraising',
  AWARENESS: 'Awareness',
  ADMINISTRATIVE: 'Administrative',
  FIELD_WORK: 'Field work',
  EVENT_SUPPORT: 'Event support',
};

export default function MyAssignments() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState('active'); // active | done
  const [completing, setCompleting] = useState(null); // assignment object
  const [completionNotes, setCompletionNotes] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const list = await svc.listMyAssignments();
      setAssignments(list);
    } catch (err) {
      toast.error('Could not load your tasks', { description: formatApiError(err) });
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
      { label: 'New', value: byStatus('assigned'), icon: ClipboardList, tone: 'warning' },
      { label: 'In progress', value: byStatus('in_progress'), icon: Loader2, tone: 'volunteer' },
      { label: 'Completed', value: byStatus('completed'), icon: CheckCircle2, tone: 'success' },
      { label: 'Cancelled', value: byStatus('cancelled'), icon: Ban, tone: 'neutral' },
    ];
  }, [assignments]);

  const visible = useMemo(() => {
    if (tab === 'active') {
      return assignments.filter((a) => a.status === 'assigned' || a.status === 'in_progress');
    }
    return assignments.filter((a) => a.status === 'completed' || a.status === 'cancelled');
  }, [assignments, tab]);

  const handleStart = async (a) => {
    try {
      const next = await svc.updateMyAssignmentStatus(a.id, 'in_progress');
      setAssignments((cur) => cur.map((x) => (x.id === a.id ? next : x)));
      toast.success('Marked as in progress');
    } catch (err) {
      toast.error('Could not update', { description: formatApiError(err) });
    }
  };

  const handleComplete = async () => {
    if (!completing) return;
    try {
      const next = await svc.updateMyAssignmentStatus(completing.id, 'completed', completionNotes);
      setAssignments((cur) => cur.map((x) => (x.id === completing.id ? next : x)));
      toast.success('Task marked done — thank you!');
      setCompleting(null);
      setCompletionNotes('');
    } catch (err) {
      toast.error('Could not update', { description: formatApiError(err) });
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={ClipboardList}
          accent="volunteer"
          title="My Tasks"
          description="Tasks the admin has assigned to you. Mark each one in progress when you start, and complete when it's done."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="flex gap-1.5">
          {[
            { id: 'active', label: 'Active', count: assignments.filter((a) => a.status === 'assigned' || a.status === 'in_progress').length },
            { id: 'done', label: 'History', count: assignments.filter((a) => a.status === 'completed' || a.status === 'cancelled').length },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setTab(c.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                tab === c.id
                  ? 'bg-volunteer-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {c.label}
              <span className={cn('rounded-full px-1.5 text-xs tabular-nums', tab === c.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800')}>
                {c.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <Card className="p-12 text-center text-sm text-gray-500">Loading…</Card>
        ) : visible.length === 0 ? (
          <Card>
            <EmptyState
              icon={ClipboardList}
              tone="volunteer"
              title={tab === 'active' ? 'No active tasks right now' : 'No completed or cancelled tasks yet'}
              description={tab === 'active'
                ? 'When the admin assigns you a task, it’ll show up here.'
                : 'Completed and cancelled tasks live here for your records.'
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onStart={() => handleStart(a)}
                onMarkDone={() => { setCompleting(a); setCompletionNotes(''); }}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <Modal
        open={!!completing}
        onClose={() => { setCompleting(null); setCompletionNotes(''); }}
        title="Mark task as done"
        description={completing?.title}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setCompleting(null); setCompletionNotes(''); }}>Cancel</Button>
            <Button onClick={handleComplete} leftIcon={Check}>Mark done</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Optionally leave a short note for the admin — what got done, anything they should know, problems you ran into.
          </p>
          <Textarea
            rows={4}
            placeholder="e.g. Delivered 25 ration packs to Korangi sector 3, 5 households were not home — list shared with the team lead."
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function AssignmentCard({ assignment, onStart, onMarkDone }) {
  const tone = STATUS_TONE[assignment.status] || STATUS_TONE.assigned;
  const overdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && (assignment.status === 'assigned' || assignment.status === 'in_progress');

  return (
    <Card className={cn('p-4 flex flex-col gap-3', overdue && 'border-error/40 ring-1 ring-error/20')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant={tone.variant} size="sm" dot>{tone.label}</Badge>
            <Badge variant={PRIORITY_TONE[assignment.priority]} size="sm">{assignment.priority}</Badge>
            <Badge variant="neutral" size="sm">{CATEGORY_LABEL[assignment.category] || assignment.category}</Badge>
            {overdue && <Badge variant="error" size="sm">Overdue</Badge>}
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 leading-snug">{assignment.title}</h3>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{assignment.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
        {assignment.dueDate && (
          <span className={cn('inline-flex items-center gap-1.5', overdue && 'text-error font-medium')}>
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
        {assignment.assignedBy?.fullName && (
          <span className="inline-flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            From {assignment.assignedBy.fullName}
          </span>
        )}
      </div>

      {assignment.completionNotes && (
        <div className="rounded-md bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 mb-0.5 text-gray-500 dark:text-gray-500">
            <FileText className="w-3 h-3" />
            <span className="font-medium">Your notes</span>
          </div>
          {assignment.completionNotes}
        </div>
      )}

      {assignment.status === 'assigned' && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" leftIcon={Play} onClick={onStart} className="flex-1">Start</Button>
          <Button size="sm" leftIcon={Check} onClick={onMarkDone} className="flex-1">Mark done</Button>
        </div>
      )}
      {assignment.status === 'in_progress' && (
        <Button size="sm" leftIcon={ArrowRight} onClick={onMarkDone} className="w-full">Mark done</Button>
      )}
    </Card>
  );
}
