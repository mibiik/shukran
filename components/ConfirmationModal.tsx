import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger'
}) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: (
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
          cancelButton: 'bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 text-gray-700'
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white',
          cancelButton: 'bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 text-gray-700'
        };
      default:
        return {
          icon: (
            <svg className="w-12 h-12 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
          cancelButton: 'bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 text-gray-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out scale-100">
        <div className="p-8 text-center">
          {/* Icon */}
          {styles.icon}
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>
          
          {/* Buttons */}
          <div className="flex space-x-3 justify-center">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.cancelButton}`}
            >
              {cancelText || t('no')}
            </button>
            <button
              onClick={async () => {
                try {
                  await onConfirm();
                  onClose();
                } catch (error) {
                  // Hata durumunda modal kapanmasın, kullanıcı hatayı görebilsin
                  console.error('Onay işlemi başarısız:', error);
                }
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmButton}`}
            >
              {confirmText || t('yes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
