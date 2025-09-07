import React, { useEffect } from 'react';
import { GratitudeEntry } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface GratitudeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: GratitudeEntry;
}

const GratitudeDetailModal: React.FC<GratitudeDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
}) => {
  const { language, t } = useLanguage();

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

  if (!isOpen) {
    return null;
  }

  const formattedDate = new Intl.DateTimeFormat(language, {
    dateStyle: 'full',
  }).format(new Date(entry.date));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gratitude-detail-title"
    >
      <div
        className="relative w-full max-w-2xl bg-sand-50 rounded-2xl shadow-2xl m-4 text-left transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="p-8">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={t('closeButton')}
            >
                <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                />
                </svg>
            </button>

            <div className="mb-6">
                <p id="gratitude-detail-title" className="text-base font-semibold text-ocean-700 font-sans">
                {formattedDate}
                </p>
            </div>

            <div className="prose prose-lg max-w-none text-ocean-950 leading-relaxed overflow-y-auto max-h-[60vh] pr-4">
                <p>{entry.text}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GratitudeDetailModal;