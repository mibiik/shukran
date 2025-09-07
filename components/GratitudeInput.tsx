import React, { useState, useEffect } from 'react';
import { useGratitude } from '../hooks/useGratitude';
import { useLanguage } from '../hooks/useLanguage';
import { GratitudeEntry } from '../types';
import GratitudeDetailModal from './GratitudeDetailModal';

const GratitudeInput: React.FC = () => {
  const [text, setText] = useState('');
  const { addEntry, toggleShareEntry, canAddEntryToday, getTodaysEntry } = useGratitude();
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shouldShare, setShouldShare] = useState(false);
  const [canAddToday, setCanAddToday] = useState(true);
  const [isCheckingDailyLimit, setIsCheckingDailyLimit] = useState(true);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');
  const [todaysEntry, setTodaysEntry] = useState<GratitudeEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<GratitudeEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<string>('');

  // Metin kısaltma fonksiyonu
  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isTextLong = (text: string, maxLength: number = 300) => {
    return text.length > maxLength;
  };

  // Modal handling functions
  const handleShowDetail = (entry: GratitudeEntry) => {
    // State'leri tek seferde set et
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  // Gece yarısına kadar kalan süreyi hesapla
  const calculateTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Günlük limit kontrolü ve bugünkü entry'yi getir
  useEffect(() => {
    const checkDailyLimit = async () => {
      try {
        const canAdd = await canAddEntryToday();
        setCanAddToday(canAdd);
        
        // Eğer bugün entry varsa getir
        if (!canAdd) {
          const entry = await getTodaysEntry();
          setTodaysEntry(entry);
        }
      } catch (error) {
        console.error('Günlük limit kontrolü başarısız:', error);
        setCanAddToday(false);
      } finally {
        setIsCheckingDailyLimit(false);
      }
    };

    checkDailyLimit();
  }, [canAddEntryToday, getTodaysEntry]);

  // Günlük sakinleştirici söz seçimi (çok dilli)
  useEffect(() => {
    const quotes = [
      t('dailyQuote1'),
      t('dailyQuote2'),
      t('dailyQuote3'),
      t('dailyQuote4'),
      t('dailyQuote5')
    ];
    
    const index = new Date().getDate() % quotes.length;
    setDailyQuote(quotes[index]);
  }, [language, t]);

  

  // Gece yarısına kadar kalan süreyi güncelle
  useEffect(() => {
    if (!canAddToday) {
      const updateTimer = () => {
        setTimeUntilMidnight(calculateTimeUntilMidnight());
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [canAddToday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '') return;

    setIsSubmitting(true);
    
    try {
      const newEntry = await addEntry(text);

      if (shouldShare) {
          await toggleShareEntry(newEntry);
      }

      setText('');
      setShouldShare(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Şükran ekleme/paylaşma hatası:', error);
      alert(t('errorOccurred') + ' ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingDailyLimit) {
    return (
      <div className="p-8 bg-sand-200/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50">
        <div className="text-center text-ocean-800/80">
          <p>Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!canAddToday) {
    return (
      <div className="relative overflow-hidden">
        {/* Ana Container */}
        <div className="relative bg-gradient-to-br from-white/95 to-ocean-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-12">
          
          {/* Dekoratif Elementler */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-ocean-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            
            {/* Ana Başlık */}
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-light text-ocean-900 mb-3 tracking-wide">
                {t('dailyGratitudeComplete')}
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-ocean-400 to-transparent mx-auto"></div>
            </div>

            {/* Huzurlu Sayaç ve Söz */}
            <div className="mb-10">
              <div className="bg-ocean-50/70 backdrop-blur-sm rounded-2xl p-5 border border-ocean-100/60">
                <p className="text-sm text-ocean-600 mb-2 font-medium">{t('timeUntilNextGratitude')}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-3xl font-light text-ocean-900 tracking-wider">{timeUntilMidnight}</div>
                  <div className="text-ocean-700 text-sm italic leading-relaxed">
                    {dailyQuote}
                  </div>
                </div>
              </div>
            </div>

            {/* Bugünkü Şükran - Ana Focal Point */}
            {todaysEntry && (
              <div className="mb-8 -mx-4 sm:mx-0">
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-ocean-100/50 mx-4 sm:mx-0">
                  {/* Decorative quotes */}
                  <div className="absolute -top-2 -left-2 text-4xl sm:text-6xl text-ocean-200/60 font-serif leading-none">"</div>
                  <div className="absolute -bottom-4 sm:-bottom-6 -right-2 text-4xl sm:text-6xl text-ocean-200/60 font-serif leading-none rotate-180">"</div>
                  
                  <div className="relative z-10">
                    <div className="mb-4">
                      <span className="inline-block px-3 sm:px-4 py-1 bg-ocean-100/60 text-ocean-700 text-xs sm:text-sm font-medium rounded-full">
                        {t('todaysGratitude')}
                      </span>
                    </div>
                    
                    <div className="px-2 sm:px-0">
                      <p className="text-lg sm:text-xl text-ocean-900 leading-relaxed font-light italic mb-4">
                        {isTextLong(todaysEntry.text) ? truncateText(todaysEntry.text) : todaysEntry.text}
                      </p>
                      {isTextLong(todaysEntry.text) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShowDetail(todaysEntry);
                          }}
                          className="text-ocean-600 hover:text-ocean-700 font-medium underline transition-colors text-sm mb-4 cursor-pointer"
                          type="button"
                        >
                          {t('readMore')}
                        </button>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs sm:text-sm text-ocean-500 font-medium">
                        {new Date(todaysEntry.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Teşekkür Mesajı */}
            <div className="mb-8">
              <p className="text-lg text-ocean-700 leading-relaxed font-light">
                {t('thankYouMessage')}
              </p>
            </div>

            {/* Sayaç yukarı taşındı */}
          </div>

          {selectedEntry && isModalOpen && (
            <GratitudeDetailModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              entry={selectedEntry}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-sand-200/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50">
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('inputPlaceholder')}
          className="w-full h-28 p-4 text-lg text-ocean-950 bg-white/70 border border-sand-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors resize-none placeholder:text-ocean-900/40"
          rows={3}
        />

        <div className="mt-4">
            <label className="flex items-center text-ocean-800 select-none">
                <input
                    type="checkbox"
                    checked={shouldShare}
                    onChange={(e) => setShouldShare(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                />
                <span className="ml-3 text-base">{t('shareAnonymously')}</span>
            </label>
        </div>

        <div className="mt-5 flex items-center justify-end">
            {showSuccess && <span className="text-base text-green-700 mr-4 transition-opacity">{t('entryAddedSuccess')}</span>}
            <button
            type="submit"
            disabled={isSubmitting || text.trim() === ''}
            className="px-8 py-3 text-lg font-semibold text-white bg-ocean-800 rounded-xl hover:bg-ocean-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-700 disabled:bg-ocean-300 disabled:cursor-not-allowed transition-colors"
            >
            {isSubmitting ? '...' : t('addButton')}
            </button>
        </div>
      </form>

      
    </div>
  );
};

export default GratitudeInput;