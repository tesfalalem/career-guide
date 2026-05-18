import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;   // alias for onCancel
  variant?: 'danger' | 'warning' | 'info';
  type?: string;          // alias for variant
  loading?: boolean;      // ignored — kept for backward compat
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  variant,
  type,
}) => {
  // Support both onCancel and onClose as the dismiss handler
  const handleCancel = onCancel ?? onClose ?? (() => {});
  // Support both variant and type (legacy) for the style
  const resolvedVariant: 'danger' | 'warning' | 'info' =
    (variant as any) ?? (type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'danger');
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <AlertCircle className="text-red-500" size={24} />,
      button: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20',
      bg: 'bg-red-50 dark:bg-red-900/10'
    },
    warning: {
      icon: <AlertCircle className="text-amber-500" size={24} />,
      button: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
      bg: 'bg-amber-50 dark:bg-amber-900/10'
    },
    info: {
      icon: <AlertCircle className="text-careermap-teal" size={24} />,
      button: 'bg-careermap-teal hover:bg-teal-600 text-white shadow-teal-500/20',
      bg: 'bg-teal-50 dark:bg-teal-900/10'
    }
  };

  const style = variantStyles[resolvedVariant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={handleCancel}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-zoom-in">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className={`w-14 h-14 rounded-2xl ${style.bg} flex items-center justify-center`}>
              {style.icon}
            </div>
            <button 
              onClick={handleCancel}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            {title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
