import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import { GratitudeEntry } from '../types';
import * as gratitudeService from '../services/gratitudeService';
import PublicGratitudeItem from './PublicGratitudeItem';
import GratitudeDetailModal from './GratitudeDetailModal';

const FavoritesPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<GratitudeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<GratitudeEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userFavorites = await gratitudeService.getUserFavorites(user.id);
        setFavorites(userFavorites);
      } catch (error) {
        console.error('Favoriler yüklenirken hata:', error);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
  }, [user]);

  const handleShowDetail = (entry: GratitudeEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="text-center text-ocean-800/80 py-10">
          <p>{t('loadingFavorites')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-serif font-semibold text-ocean-900 mb-6">{t('myFavorites')}</h2>
      
      {favorites.length === 0 ? (
        <div className="p-12 text-center bg-sand-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 text-ocean-900/60">
          <div className="mb-6">
            <svg className="w-16 h-16 text-ocean-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif font-semibold text-ocean-900 mb-4">{t('noFavoritesYet')}</h3>
          <p className="text-lg mb-6">{t('favoritesWillAppearHere')}</p>
          <p className="text-base text-ocean-700">
            {t('howToAddFavorites')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {favorites.map((entry, index) => (
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
                  date={entry.date}
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

export default FavoritesPage;