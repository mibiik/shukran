import React, { useState } from 'react';
import Header from './components/Header';
import GratitudeInput from './components/GratitudeInput';
import GratitudeList from './components/GratitudeList';
import Background from './components/Background';
import LandingPage from './components/LandingPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GratitudeProvider } from './contexts/GratitudeContext';
import ExplorePage from './components/ExplorePage';
import FavoritesPage from './components/FavoritesPage';
import AdminPanel from './components/AdminPanel';
import { useLanguage } from './hooks/useLanguage';

export type View = 'journal' | 'explore' | 'favorites' | 'admin';

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('journal');
  const [showLanding, setShowLanding] = useState(false);
  const [hasAutoSignedIn, setHasAutoSignedIn] = useState(false);
  const { user, loading, autoSignInAnonymously } = useAuth();
  const { t } = useLanguage();

  // Otomatik anonim giriş yap (sadece landing page'den geliyorsa)
  React.useEffect(() => {
    if (!loading && !user && !hasAutoSignedIn && !showLanding) {
      autoSignInAnonymously();
      setHasAutoSignedIn(true);
    }
  }, [loading, user, hasAutoSignedIn, autoSignInAnonymously, showLanding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-lg">{t('loading')}</div>
      </div>
    );
  }

  // Show landing page if requested or no user
  if (showLanding || (!user && !hasAutoSignedIn)) {
    return <LandingPage />;
  }


  return (
    <GratitudeProvider>
      <div className="relative min-h-screen w-full text-gray-800 antialiased font-sans">
        <Background />
        <div className="relative z-10 flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
          <div className="w-full max-w-3xl">
            <Header 
              currentView={view} 
              setView={setView} 
              onLogout={() => setShowLanding(true)}
            />
            {/* Floating TopNav */}
            <div className="sticky top-4 z-50">
              <div className="bg-ocean-200/20 backdrop-blur-xl border border-ocean-300/30 rounded-xl shadow-xl px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  {(['journal','explore','favorites'] as View[]).map((key) => {
                    const label = key === 'journal' ? t('myJournal') : 
                                 key === 'explore' ? t('explore') : 
                                 key === 'favorites' ? t('favorites') : 'Admin';
                    const icon = key === 'journal' ? '/journaling.png' : 
                                key === 'explore' ? '/space-exploration.png' : 
                                key === 'favorites' ? '/heart.png' : '/coffee.png';
                    const isActive = view === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setView(key)}
                        className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-colors duration-300"
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-ocean-300/30 rounded-xl border border-ocean-400/40 shadow-xl backdrop-blur-md" />
                        )}
                        <img src={icon} alt={label} className="w-5 h-5 object-contain relative z-10" />
                        <span className={`font-medium text-sm relative z-10 ${isActive ? 'text-ocean-800' : 'text-gray-600'}`}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <main className="mt-12">
              {view === 'journal' ? (
                <>
                  <GratitudeInput />
                  <GratitudeList />
                </>
              ) : view === 'explore' ? (
                <ExplorePage />
              ) : (
                <FavoritesPage />
              )}
            </main>
          </div>
        </div>
      </div>
    </GratitudeProvider>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
