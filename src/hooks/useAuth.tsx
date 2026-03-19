import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// OneSignal imports
import { initializeOneSignal } from '@/lib/onesignal';
import { syncPlayerIdWithDatabase } from '@/lib/sync-player-id';
import { referralStorage } from '@/utils/referralStorage';
import { analytics } from '@/lib/analytics';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleForRegistration: () => Promise<{ success: boolean; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // OneSignal state - usando useRef para evitar re-renders
  const oneSignalSetup = React.useRef({
    initialized: false,
    currentUserId: null as string | null
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Processar indicação pendente após autenticação
      if (session?.user) {
        await processarIndicacaoPendente(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // OneSignal setup effect - executar apenas uma vez por usuário
  useEffect(() => {
    const setupOneSignal = async () => {
      const userId = user?.id;
      
      // Não executar se não há usuário ou ainda está carregando
      if (!userId || loading) {
        return;
      }

      // Evitar múltiplas execuções para o mesmo usuário
      if (oneSignalSetup.current.currentUserId === userId) {
        return;
      }

      try {
        // Marcar como sendo configurado para este usuário
        oneSignalSetup.current.currentUserId = userId;
        
        // Inicializar OneSignal
        const initialized = await initializeOneSignal(userId);
        
        if (initialized) {
          oneSignalSetup.current.initialized = true;
          
          // Aguardar e sincronizar Player ID (apenas uma vez)
          setTimeout(async () => {
            try {
              await syncPlayerIdWithDatabase(userId);
            } catch (syncError) {
              // Erro não crítico, não logar
            }
          }, 3000);
        }
      } catch (error) {
        console.error('[Auth] Erro na configuração do OneSignal:', error);
        // Reset em caso de erro para tentar novamente
        oneSignalSetup.current.currentUserId = null;
      }
    };

    setupOneSignal();
  }, [user?.id, loading]);

  const processarIndicacaoPendente = async (userId: string) => {
    const referralData = referralStorage.get();
    
    if (referralData && !referralData.processed) {
      try {
        const { error } = await supabase.rpc('registrar_indicacao', {
          p_indicador_id: referralData.indicadorId,
          p_indicado_id: userId
        });
        
        if (!error) {
          referralStorage.markAsProcessed();
        }
      } catch (error) {
        console.warn('Erro ao processar indicação:', error);
      }
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth-callback`
      }
    });

    if (error) {
      console.error('Erro no login Google:', error);
      throw error;
    }
  };

  const signInWithGoogleForRegistration = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`
        }
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      // ✅ ANALYTICS: Logout
      analytics.auth.logout();
      
      // Reset OneSignal state
      oneSignalSetup.current = {
        initialized: false,
        currentUserId: null
      };
      
      // Limpar estado local
      setSession(null);
      setUser(null);
      
      // Logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error && error.message !== 'Auth session missing!') {
        console.error('Erro no logout:', error.message);
        toast({
          title: "Erro no logout",
          description: "Houve um problema, mas você foi desconectado localmente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
      toast({
        title: "Erro no logout", 
        description: "Você foi desconectado localmente.",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    signInWithGoogle,
    signInWithGoogleForRegistration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
