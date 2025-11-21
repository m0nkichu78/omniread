import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm animate-fade-in-up ${getStyles()}`}>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;