import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, pauseCloudAutomations, resumeCloudAutomations } from '../lib/supabase';
import { api } from '../lib/api';

export const ADMIN_EMAIL = 'brenooodesena@gmail.com';

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'user';
  organization_id: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  dbUser: DbUser | null;
  isAdmin: boolean;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ data?: any; error: any }>;
  signInWithGoogleIdToken: (idToken: string) => Promise<{ data?: any; error: any }>;
  signInWithFacebook: () => Promise<{ data?: any; error: any }>;
  signInWithEmail: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ data?: any; error: any }>;
  syncDatabaseUser: (overrideUser?: any) => Promise<DbUser | null>;
  updateAvatar: (avatarUrl: string) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bexly_current_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const syncDatabaseUser = async (u?: User | null): Promise<DbUser | null> => {
    const targetUser = u || user;
    if (!targetUser?.email) return null;
    try {
      const res = await api.syncUser({
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.user_metadata?.full_name || targetUser.email.split('@')[0],
      });
      if (res?.user) {
        setDbUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('bexly_current_user', JSON.stringify(res.user));
        }
        return res.user;
      }
    } catch (err) {
      console.warn('[AuthContext] Falha ao sincronizar usuário no banco Bexly:', err);
    }
    return null;
  };

  const applyCustomAvatar = (u: User | null): User | null => {
    if (!u) return null;
    if (typeof window === 'undefined') return u;
    const customAvatar = (u.id && localStorage.getItem(`bexly_avatar_${u.id}`)) || localStorage.getItem('bexly_custom_avatar');
    if (!customAvatar) return u;
    return {
      ...u,
      user_metadata: {
        ...u.user_metadata,
        avatar_url: customAvatar,
        picture: customAvatar,
      },
    };
  };

  const updateAvatar = async (avatarUrl: string): Promise<{ success: boolean; error?: any }> => {
    try {
      if (typeof window !== 'undefined') {
        if (user?.id) {
          localStorage.setItem(`bexly_avatar_${user.id}`, avatarUrl);
        }
        localStorage.setItem('bexly_custom_avatar', avatarUrl);
      }

      // Atualiza metadados no Supabase Auth se estiver online/configurado
      if (isSupabaseConfigured) {
        supabase.auth.updateUser({
          data: {
            avatar_url: avatarUrl,
            picture: avatarUrl,
          },
        }).catch((err) => console.warn('[AuthContext] Falha ao sincronizar avatar no Supabase:', err));
      }

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            avatar_url: avatarUrl,
            picture: avatarUrl,
          },
        };
      });

      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] Erro ao atualizar avatar:', err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    // 1. Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = applyCustomAvatar(session?.user ?? null);
      setUser(currentUser);
      if (currentUser) {
        syncDatabaseUser(currentUser);
        resumeCloudAutomations().catch(() => {});
      }
      setLoading(false);
    }).catch((err) => {
      console.error('[AuthContext] Erro ao recuperar sessão:', err);
      setLoading(false);
    });

    // 2. Ouvir mudanças no estado de autenticação (OAuth callback, refresh, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = applyCustomAvatar(session?.user ?? null);
      setUser(currentUser);
      if (currentUser) {
        syncDatabaseUser(currentUser);
        resumeCloudAutomations().catch(() => {});
      } else {
        setDbUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bexly_current_user');
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase ainda não configurado. Por favor, adicione sua VITE_SUPABASE_ANON_KEY no arquivo .env.'
        ),
      };
    }

    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    return { data, error };
  };

  const signInWithGoogleIdToken = async (idToken: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase ainda não configurado. Por favor, adicione sua VITE_SUPABASE_ANON_KEY no arquivo .env.'
        ),
      };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    return { data, error };
  };

  const signInWithFacebook = async () => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase ainda não configurado. Por favor, adicione sua VITE_SUPABASE_ANON_KEY no arquivo .env.'
        ),
      };
    }

    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUrl,
      },
    });

    return { data, error };
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase ainda não configurado. Por favor, adicione sua VITE_SUPABASE_ANON_KEY no arquivo .env.'
        ),
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data?.user) {
      await syncDatabaseUser(data.user);
    }

    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase ainda não configurado. Por favor, adicione sua VITE_SUPABASE_ANON_KEY no arquivo .env.'
        ),
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    // Registra imediatamente o usuário e cria sua organização isolada no banco de dados Bexly
    if (data?.user) {
      await syncDatabaseUser(data.user);
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      await pauseCloudAutomations();
    } catch {}
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setDbUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bexly_current_user');
    }
  };

  const isAdmin = Boolean(
    dbUser?.role === 'admin' ||
    user?.email?.toLowerCase() === ADMIN_EMAIL
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        dbUser,
        isAdmin,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithGoogle,
        signInWithGoogleIdToken,
        signInWithFacebook,
        signInWithEmail,
        signUpWithEmail,
        syncDatabaseUser,
        updateAvatar,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
