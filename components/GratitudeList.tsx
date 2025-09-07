import React from 'react';
import { useGratitude } from '../hooks/useGratitude';
import { useLanguage } from '../hooks/useLanguage';
import GratitudeItem from './GratitudeItem';

const GratitudeList: React.FC = () => {
  const { entries, isLoading } = useGratitude(); // sharedEntries kaldırıldı
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="mt-12 text-center text-ocean-800/80">
        <p>Loading entries...</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
        <h2 className="text-3xl font-serif font-semibold text-ocean-900 mb-6">{t('archive')}</h2>
      {entries.length === 0 ? (
        <div className="p-12 text-center bg-sand-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 text-ocean-900/60">
          <p className="text-lg">{t('emptyState')}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {entries.map((entry) => (
            <GratitudeItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GratitudeList;