
// Configuração de logs
const DEBUG_MODE = import.meta.env.DEV; // Só em desenvolvimento
const log = (...args: any[]) => DEBUG_MODE && console.log(...args);
const warn = (...args: any[]) => DEBUG_MODE && console.warn(...args);
const error = (...args: any[]) => console.error(...args); // Erros sempre aparecem

// Inicialização robusta do OneSignal com persistência de Player ID
let initializationPromise: Promise<boolean> | null = null;
let isInitialized = false; // Flag para evitar múltiplas inicializações

export const initializeOneSignal = async (userId?: string): Promise<boolean> => {
  if (typeof window === 'undefined') {
    log('[OneSignal] Ambiente não é de navegador. Abortando.');
    return false;
  }
  
  // Verificar se já está inicializado
  if (isInitialized && window.OneSignal?.initialized) {
    log('[OneSignal] SDK já inicializado anteriormente.');
    if (userId) {
      await setExternalUserId(userId);
    }
    return true;
  }
  
  // Retornar a promise existente se já estiver inicializando
  if (initializationPromise) {
    log('[OneSignal] Inicialização em andamento, aguardando...');
    return initializationPromise;
  }
  
  log('[OneSignal] Iniciando inicialização...');
  initializationPromise = new Promise(async (resolve) => {
    try {
      // Carregar script do OneSignal
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = async () => {
        try {
          // Inicializar OneSignalDeferred se não existir
          if (!window.OneSignalDeferred) {
            window.OneSignalDeferred = [];
          }
          
          window.OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "26d188ec-fdd6-41b3-86fe-b571cce6b3a5",
              allowLocalhostAsSecureOrigin: true,
              autoRegister: false,
              autoResubscribe: true,
              notifyButton: { enable: false },
              serviceWorkerPath: "/OneSignalSDKWorker.js",
              serviceWorkerParam: { scope: "/" },
              persistNotification: false,
              notificationClickHandlerMatch: "origin",
              notificationClickHandlerAction: "focus",
            });
            
            isInitialized = true;
            log('[OneSignal] ✅ Inicializado com sucesso');
            
            // Configurar external_user_id se fornecido
            if (userId) {
              await setExternalUserIdInternal(userId);
            }
            
            resolve(true);
          });
        } catch (error) {
          error('[OneSignal] Erro na configuração:', error);
          resolve(false);
        }
      };
      
      script.onerror = () => {
        error('[OneSignal] Erro ao carregar script');
        resolve(false);
      };
    } catch (error) {
      error('[OneSignal] Erro geral:', error);
      resolve(false);
    }
  });
  
  return initializationPromise;
};

// Cache para evitar múltiplas chamadas
let externalUserIdCache: string | null = null;

// Função interna para configurar external_user_id
const setExternalUserIdInternal = async (userId: string): Promise<void> => {
  if (!window.OneSignal || externalUserIdCache === userId) {
    return; // Já configurado para este usuário
  }
  
  try {
    await window.OneSignal.User.addAlias('external_id', userId);
    externalUserIdCache = userId;
    log('[OneSignal] External User ID configurado:', userId);
    
    // Fallback para API legada se disponível
    if (window.OneSignal.setExternalUserId) {
      await window.OneSignal.setExternalUserId(userId);
    }
  } catch (error) {
    error('[OneSignal] Erro ao configurar External User ID:', error);
  }
};

// Configurar external_user_id (função pública)
export const setExternalUserId = async (userId: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return false;
  }
  
  try {
    await setExternalUserIdInternal(userId);
    return true;
  } catch (error) {
    error('[OneSignal] Erro na função pública setExternalUserId:', error);
    return false;
  }
};

// Cache para Player ID
let playerIdCache: string | null = null;

// Obter Player ID do OneSignal
export const getOneSignalPlayerId = (): string | null => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return null;
  }
  
  try {
    const playerId = window.OneSignal.User?.PushSubscription?.id || null;
    
    // Só logar se mudou
    if (playerId !== playerIdCache) {
      playerIdCache = playerId;
      log('[OneSignal] Player ID:', playerId);
    }
    
    return playerId;
  } catch (error) {
    error('[OneSignal] Erro ao obter Player ID:', error);
    return null;
  }
};

// Verificar se o usuário está inscrito
export const isUserOptedIn = (): boolean => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return false;
  }
  
  try {
    return window.OneSignal.User?.PushSubscription?.optedIn || false;
  } catch (error) {
    error('[OneSignal] Erro ao verificar opt-in:', error);
    return false;
  }
};

// Solicitar permissão para notificações
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return false;
  }
  
  try {
    await window.OneSignal.User.PushSubscription.optIn();
    const info = getOneSignalInfo();
    
    if (info.optedIn && info.playerId) {
      log('[OneSignal] ✅ Permissão concedida com sucesso!');
    } else {
      warn('[OneSignal] ⚠️ Permissão não concedida completamente');
    }
    
    return true;
  } catch (error) {
    error('[OneSignal] Erro ao solicitar permissão:', error);
    return false;
  }
};

// Aguardar OneSignal estar pronto (com timeout e sem logs excessivos)
export const waitForOneSignalReady = async (maxWaitTime: number = 5000): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    if (window.OneSignal && window.OneSignal.initialized) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  warn('[OneSignal] Timeout aguardando OneSignal ficar pronto');
  return false;
};

// Obter informações completas do OneSignal (sem logs excessivos)
export const getOneSignalInfo = () => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return {
      initialized: false,
      playerId: null,
      optedIn: false,
      permission: 'default' as NotificationPermission
    };
  }
  
  try {
    const info = {
      initialized: window.OneSignal.initialized || false,
      playerId: window.OneSignal.User?.PushSubscription?.id || null,
      optedIn: window.OneSignal.User?.PushSubscription?.optedIn || false,
      permission: Notification.permission
    };
    
    return info;
  } catch (error) {
    error('[OneSignal] Erro ao obter informações:', error);
    return {
      initialized: false,
      playerId: null,
      optedIn: false,
      permission: 'denied' as NotificationPermission
    };
  }
};

// Resetar inicialização (para casos de erro)
export const resetOneSignalInitialization = () => {
  log('[OneSignal] Resetando inicialização');
  initializationPromise = null;
  isInitialized = false;
  externalUserIdCache = null;
  playerIdCache = null;
};
