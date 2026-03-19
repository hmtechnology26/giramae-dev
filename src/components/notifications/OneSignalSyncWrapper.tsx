
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { initializeOneSignal } from '@/lib/onesignal';
import { useSyncPlayerIdOnLoad } from '@/lib/sync-player-id';

interface OneSignalSyncWrapperProps {
  children: React.ReactNode;
}

export const OneSignalSyncWrapper: React.FC<OneSignalSyncWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Inicializar OneSignal quando usuário está logado
  React.useEffect(() => {
    if (user?.id) {
      console.log('[OneSignal Sync] Inicializando OneSignal para usuário:', user.id);
      initializeOneSignal(user.id);
    }
  }, [user?.id]);
  
  // Hook de sincronização automática do Player ID
  useSyncPlayerIdOnLoad(user?.id);
  
  return <>{children}</>;
};
