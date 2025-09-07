import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { generateRandomName } from '../utils/randomNames';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  autoSignInAnonymously: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mevcut session'ı kontrol et
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);


  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw new Error(error.message || 'Çıkış yapılırken hata oluştu');
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Çıkış yapılırken hata oluştu');
    }
  };


  const signInAnonymously = async () => {
    try {
      // Rastgele isim oluştur
      const randomName = generateRandomName();
      const anonymousEmail = `${randomName.toLowerCase()}@shukran.local`;
      const anonymousPassword = Math.random().toString(36) + Math.random().toString(36);
      
      const { data, error } = await supabase.auth.signUp({
        email: anonymousEmail,
        password: anonymousPassword,
        options: {
          emailRedirectTo: undefined, // Email doğrulama gerektirmesin
          data: {
            display_name: randomName,
            is_anonymous: true
          }
        }
      });
      if (error) {
        console.error('Anonymous sign in error:', error);
        throw new Error(error.message || 'Anonim giriş yapılırken hata oluştu');
      }
      
      // Anonim kullanıcı için otomatik giriş yap
      if (data.user) {
        console.log('Anonim kullanıcı oluşturuldu:', randomName);
      }
    } catch (error: any) {
      console.error('Anonymous sign in error:', error);
      throw new Error(error.message || 'Anonim giriş yapılırken hata oluştu');
    }
  };

  const autoSignInAnonymously = async () => {
    try {
      // Eğer zaten bir kullanıcı varsa, otomatik giriş yapma
      if (user) {
        return;
      }

      // Rastgele isim oluştur
      const randomName = generateRandomName();
      const anonymousEmail = `${randomName.toLowerCase()}@shukran.local`;
      const anonymousPassword = Math.random().toString(36) + Math.random().toString(36);
      
      const { data, error } = await supabase.auth.signUp({
        email: anonymousEmail,
        password: anonymousPassword,
        options: {
          emailRedirectTo: undefined, // Email doğrulama gerektirmesin
          data: {
            display_name: randomName,
            is_anonymous: true
          }
        }
      });
      
      if (error) {
        console.error('Auto anonymous sign in error:', error);
        // Hata durumunda sessizce devam et, kullanıcıyı rahatsız etme
        return;
      }
      
      // Anonim kullanıcı oluşturuldu
      if (data.user) {
        console.log('Otomatik anonim kullanıcı oluşturuldu:', randomName);
      }
    } catch (error: any) {
      console.error('Auto anonymous sign in error:', error);
      // Hata durumunda sessizce devam et
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signInAnonymously,
    autoSignInAnonymously,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
