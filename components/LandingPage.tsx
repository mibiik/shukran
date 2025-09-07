import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const { autoSignInAnonymously } = useAuth();

  const handleStart = async () => {
    try {
      await autoSignInAnonymously();
      // Otomatik anonim giriş yapıldı, ana uygulamaya yönlendirilecek
    } catch (error) {
      console.error('Anonim giriş hatası:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-blue-50 to-ocean-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo ve Başlık */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <img src="/journaling.png" alt="Shukran" className="w-24 h-24 sm:w-32 sm:h-32" />
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold text-ocean-900 mb-4 tracking-tight">
            {t('appTitle')}
          </h1>
          <p className="text-xl sm:text-2xl text-ocean-700 font-light mb-6">
            {t('appSubtitle')}
          </p>
          <p className="text-lg text-ocean-600 max-w-xl mx-auto leading-relaxed">
            {t('landingDescription')}
          </p>
        </div>

        {/* Ana Buton */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="px-16 py-5 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:from-ocean-600 hover:to-ocean-700 transition-all duration-300"
          >
            {t('startNow')}
          </button>
        </div>

        {/* Alt Bilgi */}
        <div className="mt-12 text-center">
          <p className="text-sm text-ocean-500/80">
            {t('freeAnonymousSecure')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
