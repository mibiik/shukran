import React, { useEffect, useState } from 'react';
import { GratitudeEntry } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface EditGratitudeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newText: string) => void;
  entry: GratitudeEntry;
}

const EditGratitudeModal: React.FC<EditGratitudeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  entry,
}) => {
  const { t } = useLanguage();
  const [text, setText] = useState(entry.text);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(text);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-gratitude-title"
    >
      <div
        className="relative w-full max-w-2xl bg-sand-50 rounded-2xl shadow-2xl m-4 text-left"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="p-8">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={t('closeButton')}
            >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>

            <h3 id="edit-gratitude-title" className="text-2xl font-serif font-medium leading-6 text-ocean-900 mb-6">
                {t('edit')}
            </h3>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-48 p-4 text-lg text-ocean-950 bg-white border border-sand-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors resize-none"
                rows={6}
            />

            <div className="mt-6 flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 transition-colors"
                >
                    {t('cancelButton')}
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2 text-base font-medium text-white bg-ocean-800 rounded-xl hover:bg-ocean-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-700 transition-colors"
                >
                    {t('saveChanges')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditGratitudeModal;
