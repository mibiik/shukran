import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import * as gratitudeService from '../services/gratitudeService';
import { getUserDisplayName } from '../utils/randomNames';

interface PublicGratitudeItemProps {
  text: string;
  onShowDetail: () => void;
  publicId: string;
  date?: string;
  user_id?: string;
  user_email?: string;
}

const PublicGratitudeItem: React.FC<PublicGratitudeItemProps> = ({ text, onShowDetail, publicId, date, user_id, user_email }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Rastgele gradient renkleri
  const gradients = [
    'from-pink-50 to-rose-50',
    'from-blue-50 to-indigo-50', 
    'from-green-50 to-emerald-50',
    'from-purple-50 to-violet-50',
    'from-yellow-50 to-amber-50',
    'from-teal-50 to-cyan-50',
    'from-orange-50 to-red-50',
    'from-lime-50 to-green-50'
  ];

  const gradientIndex = text.length % gradients.length;
  const selectedGradient = gradients[gradientIndex];

  const TRUNCATE_LINES = 4;
  const isLongText = text.split('\n').length > TRUNCATE_LINES || text.length > 200;

  // Beğeni durumunu yükle
  useEffect(() => {
    const loadLikeStatus = async () => {
      if (!publicId || !user?.id) return;
      
      try {
        const status = await gratitudeService.getLikeStatus(publicId, user.id);
        setIsLiked(status.isLiked);
        setLikeCount(status.likeCount);
      } catch (error) {
        console.error('Beğeni durumu yüklenirken hata:', error);
      }
    };
    
    loadLikeStatus();
  }, [publicId, user]);

  // Beğeni fonksiyonu - BASIT VERSİYON
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLikeLoading || !publicId || !user?.id) return;
    
    setIsLikeLoading(true);
    
    try {
      const result = await gratitudeService.toggleLike(publicId, user.id);
      setIsLiked(result.isLiked);
      
      // Beğeni sayısını güncelle
      if (result.isLiked) {
        setLikeCount(prev => prev + 1);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Beğeni hatası:', error);
      alert(t('likeError'));
    } finally {
      setIsLikeLoading(false);
    }
  };

  return (
    <div 
      onClick={onShowDetail}
      className={`relative bg-gradient-to-br ${selectedGradient} backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 cursor-pointer group h-40 sm:h-48 flex flex-col`}
    >
      {/* Beğeni Butonu */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
        <button
          onClick={handleLike}
          disabled={isLikeLoading}
          className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-200 ${
            isLiked 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          } ${isLikeLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          title={isLiked ? t('unlikeAction') : t('likeAction')}
        >
          {isLikeLoading ? (
            <svg className="w-4 h-4 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg 
              className={`w-4 h-4 transition-colors duration-200 ${
                isLiked ? 'text-red-600' : 'text-gray-600'
              }`} 
              fill={isLiked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          )}
          <span className="text-xs font-medium">{likeCount}</span>
        </button>
      </div>

      {/* Ana İçerik */}
      <div className="relative z-10 flex-1 flex flex-col">
        <p className={`text-base text-ocean-950 leading-relaxed whitespace-pre-wrap font-medium group-hover:text-ocean-900 transition-colors duration-300 flex-1 ${
          isLongText ? 'line-clamp-4' : ''
        }`}>
          {text}
        </p>
        {isLongText && (
          <button
            onClick={onShowDetail}
            className="text-xs sm:text-sm font-semibold text-ocean-700 mt-2 sm:mt-3 inline-block self-start hover:underline focus:outline-none focus:ring-2 focus:ring-ocean-500 rounded px-2 py-1 sm:px-0 sm:py-0"
          >
            {t('readMore')}
          </button>
        )}
        
        {/* Kullanıcı İsmi ve Tarih */}
        <div className="mt-3 pt-2 border-t border-white/30">
          {user_email && (
            <p className="text-xs text-ocean-600/90 font-semibold mb-1">
              ✨ {getUserDisplayName({ email: user_email })}
            </p>
          )}
          {date && (
            <p className="text-xs text-ocean-700/80 font-medium">
              {formatDate(date)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicGratitudeItem;