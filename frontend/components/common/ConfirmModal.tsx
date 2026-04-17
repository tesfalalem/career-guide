import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200 dark:border-red-800'
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          border: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'info':
        return {
          icon: 'text-secondary',
          confirmButton: 'bg-secondary hover:bg-secondary/90 text-white',
          border: 'border-secondary/20'
        };
      default:
        return {
          icon: 'text-red-500',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200 dark:border-red-800'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 ${styles.icon}`}>
            <AlertTriangle size={24} />
          </div>

          {/* Title */}
          {title && (
            <h3 className="text-xl font-bold text-primary dark:text-white mb-2">
              {title}
            </h3>
          )}

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
