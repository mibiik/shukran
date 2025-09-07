import React, { useState, useEffect, useMemo } from 'react';
import { getPublicEntriesForDate } from '../services/gratitudeService';
import { GratitudeEntry } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import PublicGratitudeItem from './PublicGratitudeItem';
import GratitudeDetailModal from './GratitudeDetailModal';

const ExplorePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<GratitudeEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const publicEntries = await getPublicEntriesForDate(currentDate, user.id);
        setEntries(publicEntries);
      } catch (error) {
        console.error("Failed to fetch public entries:", error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [currentDate, user]);

  const handleDateChange = (days: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  const handleShowDetail = (entry: GratitudeEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const isToday = useMemo(() => {
    const today = new Date();
    return currentDate.getDate() === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  }, [currentDate]);

  const formattedDate = new Intl.DateTimeFormat(language, {
    dateStyle: 'full',
  }).format(currentDate);

  return (
    <div className="w-full">
      {/* Date Navigation */}
      <div className="flex items-center justify-between p-4 mb-8 bg-sand-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
        <button onClick={() => handleDateChange(-1)} className="px-5 py-2 text-base font-medium text-ocean-800 bg-white/70 rounded-xl hover:bg-ocean-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 transition-colors">
          {t('previousDay')}
        </button>
        <h2 className="text-xl font-serif font-semibold text-ocean-900 text-center">{formattedDate}</h2>
        <button onClick={() => handleDateChange(1)} disabled={isToday} className="px-5 py-2 text-base font-medium text-ocean-800 bg-white/70 rounded-xl hover:bg-ocean-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {t('nextDay')}
        </button>
      </div>

      {/* Entries */}
      {isLoading ? (
        <div className="text-center text-ocean-800/80 py-10">
          <p>Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="p-12 text-center bg-sand-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 text-ocean-900/60">
          <p className="text-lg">{t('noPublicEntries')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {entries.map((entry, index) => (
            <div 
              key={entry.publicId || entry.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {entry.publicId && (
                <PublicGratitudeItem 
                  text={entry.text} 
                  onShowDetail={() => handleShowDetail(entry)}
                  publicId={entry.publicId}
                  user_email={entry.user_email}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedEntry && (
        <GratitudeDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          entry={selectedEntry}
        />
      )}
    </div>
  );
};

export default ExplorePage;