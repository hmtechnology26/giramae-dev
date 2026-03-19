

import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOneSignalPlayerId } from './onesignal';

// Configuração de logs - só em desenvolvimento
const DEBUG_MODE = import.meta.env.DEV;
const log = (...args: any[]) => DEBUG_MODE && console.log(...args);

// Cache global para evitar sincronizações desnecessárias
let syncCache = {
  lastUserId: null as string | null,
  lastPlayerId: null as string | null,
  lastSyncTime: 0,
  isRunning: false
};

interface PushSubscription {
  player_id?: string;
  external_user_id?: string;
  last_sync?: string;
  registered_at?: string;
}

export const syncPlayerIdWithDatabase = async (userId: string): Promise<boolean> => {
  // Evitar execução se já está rodando
  if (syncCache.isRunning) {
    log('[Sync Player ID] Sincronização já em andamento, pulando...');
    return true;
  }

  // Evitar execução muito frequente (máximo 1x por minuto)
  const now = Date.now();
  const timeSinceLastSync = now - syncCache.lastSyncTime;
  const oneMinute = 60 * 1000;

  if (timeSinceLastSync < oneMinute && syncCache.lastUserId === userId) {
    log('[Sync Player ID] Sincronização recente encontrada, pulando...');
    return true;
  }

  syncCache.isRunning = true;

  try {
    log('[Sync Player ID] Iniciando sincronização para usuário:', userId);
    
    // Obter Player ID atual do OneSignal
    const currentPlayerId = getOneSignalPlayerId();
    
    if (!currentPlayerId) {
      log('[Sync Player ID] Nenhum Player ID encontrado no OneSignal');
      return false;
    }

    // Verificar se já está no cache e não mudou
    if (syncCache.lastUserId === userId && syncCache.lastPlayerId === currentPlayerId) {
      log('[Sync Player ID] Player ID já está sincronizado (cache)');
      syncCache.lastSyncTime = now;
      return true;
    }
    
    log('[Sync Player ID] Player ID atual do OneSignal:', currentPlayerId);
    
    // Buscar preferências atuais do usuário
    const { data: preferences, error: fetchError } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error('[Sync Player ID] Erro ao buscar preferências:', fetchError);
      return false;
    }
    
    // Verificar se precisa atualizar - safe type checking
    let currentStoredPlayerId: string | undefined;
    
    if (preferences?.push_subscription) {
      // Safely handle the Json type
      const pushSub = preferences.push_subscription as PushSubscription;
      currentStoredPlayerId = pushSub.player_id;
    }
    
    if (currentStoredPlayerId === currentPlayerId) {
      log('[Sync Player ID] Player ID já está sincronizado');
      
      // Atualizar cache
      syncCache.lastUserId = userId;
      syncCache.lastPlayerId = currentPlayerId;
      syncCache.lastSyncTime = now;
      
      return true;
    }
    
    log('[Sync Player ID] Atualizando Player ID:', {
      antigo: currentStoredPlayerId,
      novo: currentPlayerId
    });
    
    // Atualizar push_subscription com novo Player ID
    const currentPushSub = (preferences.push_subscription as PushSubscription) || {};
    const updatedPushSubscription = {
      player_id: currentPlayerId,
      last_sync: new Date().toISOString(),
      external_user_id: userId,
      ...currentPushSub
    };
    
    const { error: updateError } = await supabase
      .from('user_notification_preferences')
      .update({
        push_subscription: updatedPushSubscription,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('[Sync Player ID] Erro ao atualizar banco:', updateError);
      return false;
    }
    
    log('[Sync Player ID] ✅ Player ID sincronizado com sucesso!');
    
    // Atualizar cache
    syncCache.lastUserId = userId;
    syncCache.lastPlayerId = currentPlayerId;
    syncCache.lastSyncTime = now;
    
    // Chamar função de registro no backend (sem logs excessivos)
    try {
      const { data: registerResult } = await supabase.functions.invoke('register-onesignal-user', {
        body: {
          user_id: userId,
          player_id: currentPlayerId
        }
      });
      
      log('[Sync Player ID] Resultado do registro no OneSignal:', registerResult);
    } catch (registerError) {
      // Não logar erro, é não crítico
      log('[Sync Player ID] Erro no registro OneSignal (não crítico):', registerError);
    }
    
    return true;
    
  } catch (error) {
    console.error('[Sync Player ID] Erro geral na sincronização:', error);
    return false;
  } finally {
    syncCache.isRunning = false;
  }
};

// Hook otimizado para sincronização automática
export const useSyncPlayerIdOnLoad = (userId?: string) => {
  const hasRun = React.useRef(false);

  React.useEffect(() => {
    // Só executar uma vez por sessão
    if (!userId || hasRun.current) {
      return;
    }

    // Verificar se já foi executado recentemente para este usuário
    if (syncCache.lastUserId === userId && 
        (Date.now() - syncCache.lastSyncTime) < 5 * 60 * 1000) { // 5 minutos
      return;
    }

    hasRun.current = true;

    const syncWithDelay = async () => {
      // Aguardar OneSignal estar totalmente carregado
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const synced = await syncPlayerIdWithDatabase(userId);
      if (synced) {
        log('[Auto Sync] Player ID sincronizado automaticamente');
      }
    };
    
    syncWithDelay();
  }, [userId]);
};

