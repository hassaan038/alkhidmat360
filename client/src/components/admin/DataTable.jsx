import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Check, X, Search, Inbox } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { StatusBadge } from '../ui/Badge';
import EmptyState from '../common/EmptyState';
import { toast } from 'sonner';
import { imageUrl } from '../../lib/imageUrl';
import { cn } from '../../lib/utils';

/**
 * DataTable — admin list table with:
 *   - sticky header, zebra hover, expandable rows
 *   - optional search (filters by column.key on the row) + status filter chips
 *   - semantic StatusBadge
 *   - Approve/Reject confirm flow (pending rows only when onStatusUpdate is provided)
 *
 * Props:
 *   columns: Array<{ key, label, render?(row) }>
 *   data: Array<row>
 *   onStatusUpdate?: (id, newStatus) => Promise<void>
 *   searchable?: boolean  (default false)
 *   searchKeys?: string[] (columns to match on; defaults to all column keys + 'id')
 *   statusFilter?: Array<string>  (if provided, renders filter chips)
 *   actionLabels?: { approve?, reject?, approveStatus?, rejectStatus? }
 *   loading?: boolean
 *   emptyTitle?: string
 *   emptyDescription?: string
 */
export default function DataTable({
  columns,
  data,
  onStatusUpdate,
  searchable = false,
  searchKeys,
  statusFilter,
  actionLabels,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'New submissions will appear here.',
}) {
  const { t } = useTranslation();
  const [expandedRow, setExpandedRow] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const labels = {
    approve: t('table.approve'),
    reject: t('table.reject'),
    approveStatus: 'approved',
    rejectStatus: 'rejected',
    ...actionLabels,
  };

  const filtered = useMemo(() => {
    let rows = data || [];
    if (activeFilter !== 'all') {
      rows = rows.filter((r) => r.status === activeFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const keys = searchKeys || ['id', ...columns.map((c) => c.key)];
      rows = rows.filter((r) =>
        keys.some((k) => {
          const v = r[k];
          if (v == null) return false;
          return String(v).toLowerCase().includes(q);
        }) ||
        r.user?.fullName?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, columns, query, activeFilter, searchKeys]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    setPendingAction(null);
    try {
      await onStatusUpdate(id, newStatus);
      const email = data.find((r) => r.id === id)?.user?.email;
      toast.success(
        t('table.statusUpdated'),
        email ? { description: t('table.emailSentTo', { email }) } : undefined,
      );
    } catch {
      toast.error(t('table.statusUpdateFailed'));
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  const hasToolbar = searchable || (statusFilter && statusFilter.length > 0);

  return (
    <div className="rounded-2xl border bg-white shadow-card overflow-hidden border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      {hasToolbar && (
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/40">
          {searchable && (
            <div className="w-full sm:max-w-xs">
              <Input
                leftIcon={Search}
                placeholder={t('common.search') + '…'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search records"
              />
            </div>
          )}
          {statusFilter && statusFilter.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterChip active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
                All
              </FilterChip>
              {statusFilter.map((s) => (
                <FilterChip
                  key={s}
                  active={activeFilter === s}
                  onClick={() => setActiveFilter(s)}
                >
                  {labelize(s)}
                </FilterChip>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 backdrop-blur border-b bg-gray-50/90 border-gray-200 dark:bg-gray-800/90 dark:border-gray-800">
            <tr>
              <Th className="w-20">ID</Th>
              {columns.map((column) => (
                <Th key={column.key}>{column.label}</Th>
              ))}
              <Th>Status</Th>
              {onStatusUpdate && <Th>Actions</Th>}
              <Th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:bg-gray-900 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length + (onStatusUpdate ? 4 : 3)} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onStatusUpdate ? 4 : 3)} className="p-0">
                  <EmptyState
                    icon={Inbox}
                    title={data?.length === 0 ? emptyTitle : t('table.noMatchingRecords')}
                    description={data?.length === 0 ? emptyDescription : t('table.adjustFilters')}
                  />
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <>
                  <tr key={row.id} className="group transition-colors hover:bg-primary-50/40 dark:hover:bg-primary-900/20">
                    <td className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                      #{row.id}
                    </td>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    {onStatusUpdate && (
                      <td className="px-4 py-3">
                        {row.status === 'pending' ? (
                          pendingAction?.id === row.id ? (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-700 whitespace-nowrap">
                                Confirm {pendingAction.action}?
                              </span>
                              <Button
                                size="sm"
                                variant={pendingAction.action === labels.approve ? 'success' : 'destructive'}
                                loading={updatingId === row.id}
                                onClick={() =>
                                  handleStatusUpdate(
                                    row.id,
                                    pendingAction.action === labels.approve
                                      ? labels.approveStatus
                                      : labels.rejectStatus
                                  )
                                }
                              >
                                Yes
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPendingAction(null)}
                                disabled={updatingId === row.id}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                leftIcon={Check}
                                onClick={() =>
                                  setPendingAction({ id: row.id, action: labels.approve })
                                }
                                disabled={updatingId === row.id}
                              >
                                {labels.approve}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={X}
                                className="border-error/40 text-error-dark hover:bg-error-light/60 hover:border-error/60"
                                onClick={() =>
                                  setPendingAction({ id: row.id, action: labels.reject })
                                }
                                disabled={updatingId === row.id}
                              >
                                {labels.reject}
                              </Button>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRow(row.id)}
                        aria-label={expandedRow === row.id ? 'Collapse row' : 'Expand row'}
                        className="rounded-md p-1 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
                      >
                        {expandedRow === row.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr key={`${row.id}-exp`} className="bg-gray-50/60 dark:bg-gray-800/40">
                      <td colSpan={columns.length + (onStatusUpdate ? 4 : 3)} className="px-6 py-5">
                        <ExpandedDetails row={row} />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap',
        className
      )}
    >
      {children}
    </th>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer',
        active
          ? 'bg-primary-600 text-white shadow-sm'
          : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-100'
      )}
    >
      {children}
    </button>
  );
}

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </td>
      ))}
    </tr>
  );
}

function labelize(status) {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function ExpandedDetails({ row }) {
  const skipKeys = new Set(['id', 'userId', 'user', 'createdAt', 'updatedAt']);
  const entries = Object.entries(row).filter(([k]) => !skipKeys.has(k));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
        {entries.map(([key, value]) => {
          if (key === 'paymentScreenshotUrl' && value) {
            const url = imageUrl(value);
            return (
              <div key={key} className="col-span-full">
                <DetailLabel>Payment Screenshot</DetailLabel>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block overflow-hidden rounded-lg border border-gray-200 transition hover:border-primary-300 hover:shadow-sm cursor-pointer"
                >
                  <img src={url} alt="Payment" className="h-32 w-48 object-cover" />
                </a>
              </div>
            );
          }
          if (key === 'cnicDocumentUrl' && value) {
            const url = imageUrl(value);
            return (
              <div key={key} className="col-span-full">
                <DetailLabel>CNIC Document</DetailLabel>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block overflow-hidden rounded-lg border border-gray-200 transition hover:border-primary-300 hover:shadow-sm cursor-pointer"
                >
                  <img src={url} alt="CNIC" className="h-32 w-48 object-cover" />
                </a>
              </div>
            );
          }
          return (
            <div key={key}>
              <DetailLabel>{humanize(key)}</DetailLabel>
              <p className="mt-0.5 text-gray-900 dark:text-gray-100 break-words">
                {typeof value === 'boolean'
                  ? value
                    ? 'Yes'
                    : 'No'
                  : value?.toString() || '—'}
              </p>
            </div>
          );
        })}
        {row.user && (
          <>
            <div>
              <DetailLabel>User Name</DetailLabel>
              <p className="mt-0.5 text-gray-900 dark:text-gray-100">{row.user.fullName}</p>
            </div>
            <div>
              <DetailLabel>User Email</DetailLabel>
              <p className="mt-0.5 text-gray-900 dark:text-gray-100">{row.user.email}</p>
            </div>
            <div>
              <DetailLabel>User Phone</DetailLabel>
              <p className="mt-0.5 text-gray-900 dark:text-gray-100">{row.user.phoneNumber}</p>
            </div>
          </>
        )}
        <div>
          <DetailLabel>Created At</DetailLabel>
          <p className="mt-0.5 text-gray-900 dark:text-gray-100">
            {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailLabel({ children }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {children}
    </span>
  );
}

function humanize(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\bUrl\b/i, '')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}
