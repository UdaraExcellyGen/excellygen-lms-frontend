//src/features/Coordinator/coodinatorCourseView/CoordiatorCourseOverciew/components/ConfirmationDialog.tsx
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  message,
  title = "Confirm Action",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'info',
  icon
}) => {
  if (!isOpen) {
    return null;
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
          icon: icon || <Trash2 className="w-6 h-6 text-red-500" />
        };
      case 'warning':
        return {
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          icon: icon || <AlertTriangle className="w-6 h-6 text-yellow-500" />
        };
      case 'success':
        return {
          confirmButton: 'bg-green-500 hover:bg-green-600 text-white',
          icon: icon || <CheckCircle className="w-6 h-6 text-green-500" />
        };
      default:
        return {
          confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white',
          icon: icon || <AlertTriangle className="w-6 h-6 text-blue-500" />
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          {typeStyles.icon}
          <h2 className="text-xl font-bold ml-3">{title}</h2>
        </div>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${typeStyles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing confirmation dialogs
interface UseConfirmationDialogReturn {
  showConfirmation: (config: {
    message: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    icon?: React.ReactNode;
    onConfirm: () => void;
  }) => void;
  ConfirmationDialog: React.FC;
}

export const useConfirmationDialog = (): UseConfirmationDialogReturn => {
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    message: string;
    title: string;
    confirmText: string;
    cancelText: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    icon?: React.ReactNode;
    onConfirm: () => void;
  } | null>(null);

  const showConfirmation = (config: {
    message: string;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    icon?: React.ReactNode;
    onConfirm: () => void;
  }) => {
    setDialogConfig({
      isOpen: true,
      message: config.message,
      title: config.title || "Confirm Action",
      confirmText: config.confirmText || "Confirm",
      cancelText: config.cancelText || "Cancel",
      type: config.type || 'info',
      icon: config.icon,
      onConfirm: config.onConfirm
    });
  };

  const handleConfirm = () => {
    if (dialogConfig?.onConfirm) {
      dialogConfig.onConfirm();
    }
    setDialogConfig(null);
  };

  const handleCancel = () => {
    setDialogConfig(null);
  };

  const DialogComponent = () => (
    <ConfirmationDialog
      isOpen={dialogConfig?.isOpen || false}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      message={dialogConfig?.message || ''}
      title={dialogConfig?.title}
      confirmText={dialogConfig?.confirmText}
      cancelText={dialogConfig?.cancelText}
      type={dialogConfig?.type}
      icon={dialogConfig?.icon}
    />
  );

  return {
    showConfirmation,
    ConfirmationDialog: DialogComponent
  };
};

