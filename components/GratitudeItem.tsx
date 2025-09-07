import React, { useState } from 'react';
import { GratitudeEntry } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useGratitude } from '../hooks/useGratitude';
import GratitudeDetailModal from './GratitudeDetailModal';
import EditGratitudeModal from './EditGratitudeModal';
import ConfirmationModal from './ConfirmationModal';

interface GratitudeItemProps {
  entry: GratitudeEntry;
}

const GratitudeItem: React.FC<GratitudeItemProps> = ({ entry }) => {
  const { language, t } = useLanguage();
  const { deleteEntry, updateEntry, toggleShareEntry } = useGratitude();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const date = new Date(entry.date);
  const day = new Intl.DateTimeFormat(language, { day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat(language, { month: 'short' }).format(date);
  const year = new Intl.DateTimeFormat(language, { year: 'numeric' }).format(date);
  
  const TRUNCATE_LINES = 6;
  const isLongText = entry.text.split('\n').length > TRUNCATE_LINES || entry.text.length > 400;

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEntry(entry); // Artık tüm entry objesini gönderiyoruz
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Silme işlemi başarısız:', error);
      // Kullanıcıya bildirim gösterilebilir
    }
  };

  const handleSaveEdit = (newText: string) => {
    if (newText.trim() !== '') {
      updateEntry(entry.id, newText);
    }
    setIsEditModalOpen(false);
  };
  
  const handleToggleShare = () => {
      toggleShareEntry(entry);
  }

  return (
    <>
      <div className="flex items-stretch gap-4">
        {/* Date Card */}
        <div className="flex flex-col items-center justify-center bg-ocean-900 text-white rounded-xl p-3 w-20 text-center shadow-lg flex-shrink-0">
          <span className="text-4xl font-bold font-serif text-sand-100">{day}</span>
          <span className="text-sm uppercase tracking-wider mt-1">{month}</span>
          <span className="text-xs text-ocean-300 mt-1">{year}</span>
        </div>

        {/* Text Card */}
        <div className={`relative flex-1 backdrop-blur-sm rounded-xl shadow-lg border p-5 flex flex-col justify-between ${
          entry.isShared 
            ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border-blue-200/50' 
            : 'bg-white/80 border-sand-200/50'
        }`}>
          <div>
            {/* Paylaşım durumu burada gösterilebilir */}
          </div>
          <p
            className={`text-base text-ocean-950 leading-relaxed whitespace-pre-wrap ${
              isLongText ? 'line-clamp-6' : ''
            }`}
          >
            {entry.text}
          </p>
          {isLongText && (
            <button
              onClick={() => setIsDetailModalOpen(true)}
              className="text-sm font-semibold text-ocean-700 mt-3 inline-block self-start hover:underline focus:outline-none focus:ring-2 focus:ring-ocean-500 rounded"
            >
              {t('readMore')}
            </button>
          )}
          <div className="flex items-center justify-end space-x-2 mt-4 self-end">
            {/* Paylaşma Butonu */}
            <button
              onClick={handleToggleShare}
              aria-label={entry.isShared ? t('unshare') : t('share')}
              className={`p-2 rounded-full transition-colors ${
                  entry.isShared 
                    ? 'text-blue-600 bg-blue-100 hover:bg-blue-200'
                    : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              aria-label={t('edit')}
              className="p-2 text-ocean-600 hover:text-ocean-800 hover:bg-ocean-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              aria-label={t('delete')}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isDetailModalOpen && (
        <GratitudeDetailModal 
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          entry={entry}
        />
      )}

      {isEditModalOpen && (
        <EditGratitudeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          entry={entry}
          onSave={handleSaveEdit}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title={t('deleteGratitudeTitle')}
          message={t('deleteGratitudeMessage')}
          confirmText={t('deleteConfirm')}
          cancelText={t('cancel')}
          type="danger"
        />
      )}
    </>
  );
};

export default GratitudeItem;