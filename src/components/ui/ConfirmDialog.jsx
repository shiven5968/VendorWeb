import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false
}) => (
  <Modal isOpen={isOpen} onClose={onCancel} maxWidth="max-w-sm">
    <div className="flex flex-col items-center text-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
        isDangerous ? 'bg-rose-50 dark:bg-rose-950/40' : 'bg-amber-50 dark:bg-amber-950/40'
      }`}>
        <AlertTriangle className={`w-7 h-7 ${isDangerous ? 'text-rose-500' : 'text-amber-500'}`} />
      </div>
      <h3 className="text-base font-black text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{description}</p>
      )}
      <div className="flex gap-3 mt-6 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
            isDangerous ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);
