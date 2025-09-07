import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import { Language } from '../types';
import { View } from '../App';
import { getUserDisplayName, isAnonymousUser } from '../utils/randomNames';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, onLogout }) => {
  const { language, setLanguage, t } = useLanguage();
  const { signOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const title = t('appTitle');
  const subtitle = t('appSubtitle');

  const langButtons = [
    { code: Language.EN, label: 'EN' },
    { code: Language.TR, label: 'TR' },
    { code: Language.ES, label: 'ES' },
    { code: Language.FR, label: 'FR' },
  ];

  return (
    <header className="bg-gradient-to-r from-ocean-50 to-blue-50 border-b border-ocean-200/50 relative">
      {/* Başlık */}
      <div className="text-center py-4">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-ocean-900 mb-1 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-ocean-700/80">{subtitle}</p>
        {user && (
          <p className="text-xs text-ocean-600/70 mt-1 font-medium">
            👋 {getUserDisplayName(user)}
          </p>
        )}
        
      </div>

      {/* Üst Kontroller */}
      <div className="flex items-center justify-between px-0 py-3">
        {/* Sol taraf - Menü Butonu */}
        <div className="hidden md:flex">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-ocean-200/90 hover:bg-ocean-300/90 text-ocean-800 rounded-lg transition-all duration-300 font-medium text-sm backdrop-blur-md border border-ocean-300/70 shadow-sm"
            title={t('menu')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {t('menu')}
          </button>
        </div>

        {/* Sağ taraf - Buy Me a Coffee Butonu */}
        <div className="hidden md:flex">
          <button
            onClick={() => window.open('https://buymeacoffee.com/miracbirlik', '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-200/70 hover:bg-yellow-300/80 text-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-medium text-sm"
          >
            <img src="/coffee.png" alt="Coffee" className="w-4 h-4 object-contain" />
            {t('support')}
          </button>
        </div>

        {/* Mobil Menü */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-1 px-3 py-2 bg-ocean-200/90 hover:bg-ocean-300/90 text-ocean-800 rounded-lg transition-all duration-300 backdrop-blur-md border border-ocean-300/70 shadow-sm"
            title={t('menu')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-medium">{t('menu')}</span>
          </button>

          <button
            onClick={() => window.open('https://buymeacoffee.com/miracbirlik', '_blank')}
            className="flex items-center gap-1 px-3 py-2 bg-yellow-200/70 hover:bg-yellow-300/80 text-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-medium text-xs"
          >
            <img src="/coffee.png" alt="Coffee" className="w-4 h-4 object-contain" />
            {t('support')}
          </button>
        </div>
      </div>

      {/* Açılır Menü - Hem Mobil hem Desktop */}
      {isMobileMenuOpen && (
        <div className="bg-white/95 backdrop-blur-md border-t border-ocean-200/50 rounded-b-2xl shadow-xl animate-fadeIn mx-3 mb-3">
          <div className="px-6 py-6 space-y-6">
            {/* Header */}
            <div className="text-center border-b border-ocean-200/30 pb-4">
              <h3 className="text-lg font-semibold text-ocean-800 mb-1">{t('menu')}</h3>
              <p className="text-sm text-ocean-600">{t('settingsAndOptions')}</p>
            </div>

            {/* Dil Seçenekleri */}
            <div>
              <h4 className="text-sm font-semibold text-ocean-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {t('languageLabel')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {langButtons.map((btn) => (
                  <button
                    key={btn.code}
                    onClick={() => {
                      setLanguage(btn.code);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105
                      ${language === btn.code
                        ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-lg scale-105'
                        : 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100 hover:shadow-md border border-ocean-200/50'
                      }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Çıkış */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] border border-red-200/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="font-semibold">{t('logoutButton')}</span>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-ocean-200/30">
              <p className="text-xs text-ocean-500">
                {t('appFooter')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alt Navigasyon kaldırıldı - ayrı TopNav bileşenine taşındı */}
    </header>
  );
};

export default Header;
