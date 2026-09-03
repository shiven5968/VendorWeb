import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', className = '' }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={clsx(
        'relative w-full bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-slide-up',
        maxWidth,
        className
      )}>
        {(title || onClose) && (
          <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            {title && (
              <h2 className="text-base font-black text-slate-900 dark:text-white">{title}</h2>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
};
