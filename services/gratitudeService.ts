import { supabase } from '../lib/supabase';
import { GratitudeEntry, PublicGratitudeEntry, LikeStatus } from '../types';

// Kullanıcının kişisel şükranlarını getir
export const getEntries = async (userId: string): Promise<GratitudeEntry[]> => {
  const { data, error } = await supabase
    .from('gratitudes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Şükranlar getirilirken hata:', error);
    throw error;
  }

  return data.map(entry => ({
    id: entry.id,
    text: entry.text,
    date: entry.created_at,
    userId: entry.user_id,
    isShared: entry.is_shared,
    publicId: entry.public_id
  }));
};

// Bugün için şükran var mı kontrol et
export const hasEntryForToday = async (userId: string): Promise<boolean> => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const { data, error } = await supabase
    .from('gratitudes')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .lt('created_at', endOfDay.toISOString())
    .limit(1);

  if (error) {
    console.error('Bugünkü şükran kontrol edilirken hata:', error);
    throw error;
  }

  return data && data.length > 0;
};

// Bugünkü şükranı getir
export const getTodaysEntry = async (userId: string): Promise<GratitudeEntry | null> => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const { data, error } = await supabase
    .from('gratitudes')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .lt('created_at', endOfDay.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Bugünkü şükran getirilirken hata:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const entry = data[0];
  return {
    id: entry.id,
    text: entry.text,
    date: entry.created_at,
    userId: entry.user_id,
    isShared: entry.is_shared,
    publicId: entry.public_id
  };
};

// Yeni şükran ekle
export const addEntry = async (text: string, userId: string): Promise<GratitudeEntry> => {
  const { data, error } = await supabase
    .from('gratitudes')
    .insert({
      user_id: userId,
      text,
      is_shared: false,
      public_id: null
    })
    .select()
    .single();

  if (error) {
    console.error('Şükran eklenirken hata:', error);
    throw error;
  }

  return {
    id: data.id,
    text: data.text,
    date: data.created_at,
    userId: data.user_id,
    isShared: data.is_shared,
    publicId: data.public_id
  };
};

// Şükran sil
export const deleteEntry = async (entry: GratitudeEntry): Promise<void> => {
  // Önce public versiyonunu sil (eğer varsa)
  if (entry.isShared && entry.publicId) {
    // İlgili beğenileri sil
    await supabase
      .from('likes')
      .delete()
      .eq('gratitude_id', entry.publicId);

    // Public gratitude'ı sil
    await supabase
      .from('public_gratitudes')
      .delete()
      .eq('id', entry.publicId);
  }

  // Ana gratitude'ı sil
  const { error } = await supabase
    .from('gratitudes')
    .delete()
    .eq('id', entry.id);

  if (error) {
    console.error('Şükran silinirken hata:', error);
    throw error;
  }
};

// Şükran güncelle
export const updateEntry = async (id: string, text: string): Promise<void> => {
  const { error } = await supabase
    .from('gratitudes')
    .update({ 
      text,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Şükran güncellenirken hata:', error);
    throw error;
  }
};

// Şükranı paylaş/geri çek
export const toggleShareEntry = async (entry: GratitudeEntry): Promise<GratitudeEntry> => {
  if (entry.isShared && entry.publicId) {
    // PAYLAŞIMI GERİ ÇEK
    // İlgili beğenileri sil
    await supabase
      .from('likes')
      .delete()
      .eq('gratitude_id', entry.publicId);

    // Public gratitude'ı sil
    await supabase
      .from('public_gratitudes')
      .delete()
      .eq('id', entry.publicId);

    // Ana entry'yi güncelle
    const { error } = await supabase
      .from('gratitudes')
      .update({ 
        is_shared: false, 
        public_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.id);

    if (error) {
      console.error('Paylaşım geri çekilirken hata:', error);
      throw error;
    }

    return { ...entry, isShared: false, publicId: null };
  } else {
    // YENİ PAYLAŞIM YAP
    // Önce public_gratitudes tablosuna ekle
    const { data: publicData, error: publicError } = await supabase
      .from('public_gratitudes')
      .insert({
        original_author_id: entry.userId,
        original_doc_id: entry.id,
        text: entry.text,
        like_count: 0
      })
      .select()
      .single();

    if (publicError) {
      console.error('Public şükran eklenirken hata:', publicError);
      throw publicError;
    }

    // Ana entry'yi güncelle
    const { error } = await supabase
      .from('gratitudes')
      .update({ 
        is_shared: true, 
        public_id: publicData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.id);

    if (error) {
      console.error('Şükran paylaşılırken hata:', error);
      throw error;
    }

    return { ...entry, isShared: true, publicId: publicData.id };
  }
};

// Belirli bir tarihteki public şükranları getir
export const getPublicEntriesForDate = async (date: Date, userId: string): Promise<GratitudeEntry[]> => {
  const targetDate = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı

  const { data, error } = await supabase
    .from('public_gratitudes')
    .select(`
      *,
      likes!left(*)
    `)
    .gte('created_at', `${targetDate}T00:00:00.000Z`)
    .lt('created_at', `${targetDate}T23:59:59.999Z`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Public şükranlar getirilirken hata:', error);
    throw error;
  }

  return data.map(entry => {
    const isLiked = entry.likes.some((like: any) => like.user_id === userId);
    return {
      id: entry.original_doc_id,
      publicId: entry.id,
      text: entry.text,
      date: entry.created_at,
      userId: entry.original_author_id,
      isShared: true,
      originalAuthorId: entry.original_author_id
    };
  });
};

// Beğeni sistemi - BASIT VERSİYON
export const toggleLike = async (gratitudeId: string, userId: string): Promise<LikeStatus> => {
  // Mevcut beğeniyi kontrol et
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('gratitude_id', gratitudeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingLike) {
    // Beğeniyi kaldır
    await supabase
      .from('likes')
      .delete()
      .eq('gratitude_id', gratitudeId)
      .eq('user_id', userId);

    // Güncel toplam beğeni sayısını al (distinct kullanıcı)
    const { count } = await supabase
      .from('likes')
      .select('user_id', { count: 'exact', head: true })
      .eq('gratitude_id', gratitudeId);

    return { isLiked: false, likeCount: count || 0 };
  } else {
    // Beğeniyi ekle
    await supabase
      .from('likes')
      .insert({
        user_id: userId,
        gratitude_id: gratitudeId
      });

    // Güncel toplam beğeni sayısını al (distinct kullanıcı)
    const { count } = await supabase
      .from('likes')
      .select('user_id', { count: 'exact', head: true })
      .eq('gratitude_id', gratitudeId);

    return { isLiked: true, likeCount: count || 0 };
  }
};

export const getLikeStatus = async (gratitudeId: string, userId: string): Promise<LikeStatus> => {
  // Kullanıcının beğenip beğenmediğini kontrol et
  const { data: likeData } = await supabase
    .from('likes')
    .select('id')
    .eq('gratitude_id', gratitudeId)
    .eq('user_id', userId)
    .maybeSingle();

  // Toplam beğeni sayısını likes tablosundan say
  const { count } = await supabase
    .from('likes')
    .select('user_id', { count: 'exact', head: true })
    .eq('gratitude_id', gratitudeId);

  return {
    isLiked: !!likeData,
    likeCount: count || 0
  };
};

export const getUserFavorites = async (userId: string): Promise<GratitudeEntry[]> => {
  const { data, error } = await supabase
    .from('likes')
    .select(`
      gratitude_id,
      public_gratitudes!inner(*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Favoriler getirilirken hata:', error);
    throw error;
  }

  return data.map((like: any) => {
    const entry = like.public_gratitudes;
    return {
      id: entry.original_doc_id,
      publicId: entry.id,
      text: entry.text,
      date: entry.created_at,
      userId: entry.original_author_id,
      isShared: true,
      originalAuthorId: entry.original_author_id
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const isFavorite = async (gratitudeId: string, userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('gratitude_id', gratitudeId)
    .eq('user_id', userId)
    .single();

  return !!data;
};

// Fake gratitude entries for explore section
export const addFakeGratitudeEntry = async (
  text: string, 
  currentUserId: string, 
  createdAt: Date
): Promise<void> => {
  try {
    // First add to gratitudes table
    const { data: gratitudeData, error: gratitudeError } = await supabase
      .from('gratitudes')
      .insert({
        user_id: currentUserId,
        text,
        is_shared: true,
        created_at: createdAt.toISOString()
      })
      .select()
      .single();

    if (gratitudeError) {
      console.error('Fake gratitude eklenirken hata:', gratitudeError);
      throw gratitudeError;
    }

    // Then add to public_gratitudes table with the correct original_doc_id
    const { data: publicData, error: publicError } = await supabase
      .from('public_gratitudes')
      .insert({
        original_author_id: currentUserId,
        original_doc_id: gratitudeData.id,
        text,
        created_at: createdAt.toISOString(),
        like_count: Math.floor(Math.random() * 15) // Random like count 0-14
      })
      .select()
      .single();

    if (publicError) {
      console.error('Fake public gratitude eklenirken hata:', publicError);
      // Clean up the gratitude entry if public creation fails
      await supabase
        .from('gratitudes')
        .delete()
        .eq('id', gratitudeData.id);
      throw publicError;
    }

    // Update gratitudes table with the public_id
    const { error: updateGratitudeError } = await supabase
      .from('gratitudes')
      .update({ 
        public_id: publicData.id
      })
      .eq('id', gratitudeData.id);

    if (updateGratitudeError) {
      console.error('Fake gratitude güncellenirken hata:', updateGratitudeError);
      throw updateGratitudeError;
    }

  } catch (error) {
    console.error('Error in addFakeGratitudeEntry:', error);
    throw error;
  }
};

// Kullanıcı verilerini temizleme fonksiyonu
export const clearUserData = async (userId: string): Promise<void> => {
  // Kullanıcının beğenilerini sil
  await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId);

  // Kullanıcının public şükranlarını sil
  await supabase
    .from('public_gratitudes')
    .delete()
    .eq('original_author_id', userId);

  // Kullanıcının şükranlarını sil
  await supabase
    .from('gratitudes')
    .delete()
    .eq('user_id', userId);
};