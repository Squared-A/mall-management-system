import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

const TableActions = ({ onView, onEdit, onDelete }) => (
  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
    {onView && (
      <button
        onClick={onView}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-info-50 hover:text-info-600 dark:hover:bg-info-500/10 transition-colors"
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
    )}
    {onEdit && (
      <button
        onClick={onEdit}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 transition-colors"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
    )}
    {onDelete && (
      <button
        onClick={onDelete}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10 transition-colors"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    )}
  </div>
);

export default TableActions;
