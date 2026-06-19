import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm">
    <div className="flex flex-col items-center text-center gap-3 py-2">
      <div className="rounded-full bg-danger-50 dark:bg-danger-500/10 p-3">
        <AlertTriangle className="h-6 w-6 text-danger-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
    <div className="mt-6 flex items-center justify-center gap-3">
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant={variant} onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
