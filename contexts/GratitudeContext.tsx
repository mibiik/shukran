import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { GratitudeEntry } from '../types';
import * as gratitudeService from '../services/gratitudeService';
import { useAuth } from './AuthContext';

interface GratitudeContextType {
  entries: GratitudeEntry[];
  addEntry: (text: string) => Promise<void>;
  deleteEntry: (entry: GratitudeEntry) => Promise<void>;
  updateEntry: (id: string, text: string) => Promise<void>;
  toggleShareEntry: (entry: GratitudeEntry) => Promise<void>;
  isLoading: boolean;
  fetchEntries: () => Promise<void>;
  canAddEntryToday: () => Promise<boolean>;
  getTodaysEntry: () => Promise<GratitudeEntry | null>;
}

export const GratitudeContext = createContext<GratitudeContextType | undefined>(undefined);

export const GratitudeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const fetchedEntries = await gratitudeService.getEntries(user.id);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Gece yarısında günlük limiti sıfırla
  useEffect(() => {
    const checkForMidnightReset = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Gece yarısına yakın olduğumuzda (23:59:50-00:00:10) kontrol et
      if ((hours === 23 && minutes === 59 && seconds >= 50) || 
          (hours === 0 && minutes === 0 && seconds <= 10)) {
        // Günlük limit kontrolünü yenile
        fetchEntries();
      }
    };

    const interval = setInterval(checkForMidnightReset, 1000);
    return () => clearInterval(interval);
  }, [fetchEntries]);

  const canAddEntryToday = async (): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    try {
      const hasEntry = await gratitudeService.hasEntryForToday(user.id);
      return !hasEntry;
    } catch (error) {
      console.error('Bugünkü şükran kontrolü başarısız:', error);
      return false;
    }
  };

  const addEntry = async (text: string) => {
    if (!user) {
      throw new Error('Kullanıcı girişi gerekli');
    }
    
    if (!user.id) {
      throw new Error('Kullanıcı ID bulunamadı');
    }
    
    // Bugün için zaten şükran var mı kontrol et
    const canAdd = await canAddEntryToday();
    if (!canAdd) {
      throw new Error('Bugün için zaten bir şükran eklediniz. Her gün sadece bir şükran ekleyebilirsiniz.');
    }
    
    const newEntry = await gratitudeService.addEntry(text, user.id);
    setEntries(prevEntries => [newEntry, ...prevEntries]);
    return newEntry;
  };

  const deleteEntry = async (entry: GratitudeEntry) => {
    try {
      await gratitudeService.deleteEntry(entry);
      setEntries(prevEntries => prevEntries.filter(e => e.id !== entry.id));
    } catch (error) {
      console.error('Context: Silme işlemi başarısız:', error);
      throw error;
    }
  };

  const updateEntry = async (id: string, text: string) => {
    try {
      await gratitudeService.updateEntry(id, text);
      setEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === id ? { ...entry, text } : entry
        )
      );
    } catch (error) {
      console.error('Context: Güncelleme işlemi başarısız:', error);
      throw error;
    }
  };
  
  const toggleShareEntry = async (entry: GratitudeEntry) => {
    try {
      const updatedEntry = await gratitudeService.toggleShareEntry(entry);
      setEntries(prevEntries => 
        prevEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
      );
    } catch (error) {
      console.error('Context: Paylaşma/Geri çekme işlemi başarısız:', error);
      throw error;
    }
  };

  const getTodaysEntry = async (): Promise<GratitudeEntry | null> => {
    if (!user?.id) {
      return null;
    }
    
    try {
      return await gratitudeService.getTodaysEntry(user.id);
    } catch (error) {
      console.error('Bugünkü şükran getirilirken hata:', error);
      return null;
    }
  };

  return (
    <GratitudeContext.Provider value={{ entries, addEntry, isLoading, deleteEntry, updateEntry, toggleShareEntry, fetchEntries, canAddEntryToday, getTodaysEntry }}>
      {children}
    </GratitudeContext.Provider>
  );
};