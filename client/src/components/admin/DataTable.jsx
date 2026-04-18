import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { toast } from 'sonner';
import { imageUrl } from '../../lib/imageUrl';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: Check },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: X },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: Check },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: Check },
    under_review: { label: 'Under Review', color: 'bg-orange-100 text-orange-800', icon: Clock },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default function DataTable({ columns, data, onStatusUpdate, type }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    setPendingAction(null);
    try {
      await onStatusUpdate(id, newStatus);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 4} className="px-4 py-12 text-center text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <>
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    #{row.id}
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    {row.status === 'pending' && (
                      pendingAction?.id === row.id ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-700">
                            Confirm {pendingAction.action}?
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(row.id, pendingAction.action === 'approve' ? 'approved' : 'rejected')}
                            disabled={updatingId === row.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Yes, Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPendingAction(null)}
                            disabled={updatingId === row.id}
                            className="border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setPendingAction({ id: row.id, action: 'approve' })}
                            disabled={updatingId === row.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPendingAction({ id: row.id, action: 'reject' })}
                            disabled={updatingId === row.id}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRow(row.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedRow === row.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedRow === row.id && (
                  <tr>
                    <td colSpan={columns.length + 4} className="px-4 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {Object.entries(row).map(([key, value]) => {
                          if (key === 'id' || key === 'userId' || key === 'user' || key === 'createdAt' || key === 'updatedAt') {
                            return null;
                          }
                          // Special-case payment screenshot — render as clickable thumbnail
                          if (key === 'paymentScreenshotUrl' && value) {
                            const url = imageUrl(value);
                            return (
                              <div key={`${row.id}-${key}`} className="md:col-span-2">
                                <span className="font-medium text-gray-700">
                                  Payment Screenshot:
                                </span>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 inline-block"
                                >
                                  <img
                                    src={url}
                                    alt="Payment"
                                    className="mt-1 w-32 h-20 object-cover rounded border border-gray-200 hover:opacity-80 transition"
                                  />
                                </a>
                              </div>
                            );
                          }
                          return (
                            <div key={`${row.id}-${key}`}>
                              <span className="font-medium text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {typeof value === 'boolean'
                                  ? value ? 'Yes' : 'No'
                                  : value?.toString() || 'N/A'}
                              </span>
                            </div>
                          );
                        })}
                        {row.user && (
                          <>
                            <div>
                              <span className="font-medium text-gray-700">User Name:</span>
                              <span className="ml-2 text-gray-900">{row.user.fullName}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">User Email:</span>
                              <span className="ml-2 text-gray-900">{row.user.email}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">User Phone:</span>
                              <span className="ml-2 text-gray-900">{row.user.phoneNumber}</span>
                            </div>
                          </>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Created At:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(row.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
