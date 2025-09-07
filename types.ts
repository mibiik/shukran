export enum Language {
  EN = 'en',
  TR = 'tr',
  ES = 'es',
  FR = 'fr',
}

export interface GratitudeEntry {
  id: string; // Supabase'deki ID'si
  text: string;
  date: string; // ISO 8601 format
  userId: string; // Kullanıcı ID'si
  
  // Paylaşım durumu
  isShared?: boolean;
  publicId?: string | null; // Eğer paylaşılmışsa, public_gratitudes tablosundaki ID'si
  originalAuthorId?: string; // Paylaşılan entry için orijinal yazar ID'si
}

export interface PublicGratitudeEntry {
  id: string;
  text: string;
  date: string;
  originalAuthorId: string;
  originalDocId: string;
  likeCount: number;
  isLiked?: boolean;
}

export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}
