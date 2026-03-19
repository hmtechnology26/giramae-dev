
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  initializeOneSignal, 
  getOneSignalPlayerId, 
  isUserOptedIn,
  setExternalUserId,
  waitForOneSignalReady,
  getOneSignalInfo
} from '@/lib/onesignal';
import type { Notification, NotificationPreferences } from '@/types/notifications';

// Singleton para gerenciar channels
class ChannelManager {
  private static instance: ChannelManager;
  private channels: Map<string, any> = new Map();

  static getInstance(): ChannelManager {
    if (!ChannelManager.instance) {
      ChannelManager.instance = new ChannelManager();
    }
    return ChannelManager.instance;
  }

  getOrCreateChannel(key: string, factory: () => any): any {
    if (!this.channels.has(key)) {
      const channel = factory();
      this.channels.set(key, channel);
    }
    return this.channels.get(key);
  }

  removeChannel(key: string): void {
    const channel = this.channels.get(key);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        // Silencioso
      }
      this.channels.delete(key);
    }
  }

  removeAllChannels(): void {
    this.channels.forEach((channel, key) => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        // Silencioso
      }
    });
    this.channels.clear();
  }
}

interface PushSubscription {
  player_id?: string;
  external_user_id?: string;
  last_sync?: string;
  registered_at?: string;
}

export const useNotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mensagens: true,
    reservas: true,
    girinhas: true,
    sistema: true,
    push_enabled: false
  });
  const [loading, setLoading] = useState(true);

  // Refs para controle de estado
  const isLoadingRef = useRef(false);
  const channelManager = useRef(ChannelManager.getInstance());
  const registrationInProgress = useRef(false);
  const oneSignalInitialized = useRef(false);

  // ===============================
  // INICIALIZAÇÃO DO ONESIGNAL
  // ===============================

  const initializeOneSignalWithUser = useCallback(async () => {
    if (!user || oneSignalInitialized.current) return;

    try {
      // Inicializar OneSignal com user_id
      const initialized = await initializeOneSignal(user.id);
      
      if (initialized) {
        oneSignalInitialized.current = true;
        
        // Aguardar OneSignal estar pronto
        await waitForOneSignalReady();
        
        // Configurar external_user_id
        await setExternalUserId(user.id);
        
        // Verificar se precisa sincronizar Player ID
        await syncPlayerIdIfNeeded();
      }
    } catch (error) {
      // Silencioso - não atrapalhar o usuário
    }
  }, [user]);

  // ===============================
  // SINCRONIZAÇÃO DE PLAYER ID
  // ===============================

  const syncPlayerIdIfNeeded = useCallback(async () => {
    if (!user || registrationInProgress.current) return;

    try {
      // Aguardar OneSignal estar pronto
      const ready = await waitForOneSignalReady();
      if (!ready) return;

      // Obter Player ID atual
      const currentPlayerId = getOneSignalPlayerId();
      if (!currentPlayerId) return;

      // Buscar Player ID salvo no banco
      const { data: savedPrefs } = await supabase
        .from('user_notification_preferences')
        .select('push_subscription')
        .eq('user_id', user.id)
        .maybeSingle();

      // Safe type checking for push_subscription
      let savedPlayerId: string | undefined;
      if (savedPrefs?.push_subscription) {
        const pushSub = savedPrefs.push_subscription as PushSubscription;
        savedPlayerId = pushSub.player_id;
      }

      // Se Player ID mudou, sincronizar
      if (savedPlayerId !== currentPlayerId) {
        await registerUserInOneSignal(currentPlayerId);
      }
    } catch (error) {
      // Silencioso
    }
  }, [user]);

  // ===============================
  // CARREGAR DADOS
  // ===============================

  const loadNotifications = useCallback(async () => {
    if (!user || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) return;

      const convertedNotifications: Notification[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        type: item.type as any,
        title: item.title,
        message: item.message,
        data: (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) || {},
        read: item.read,
        created_at: item.created_at
      }));

      setNotifications(convertedNotifications);
      setUnreadCount(convertedNotifications.filter(n => !n.read).length);
    } catch (error) {
      // Silencioso
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [user]);

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') return;

      if (data) {
        setPreferences({
          mensagens: data.mensagens,
          reservas: data.reservas,
          girinhas: data.girinhas,
          sistema: data.sistema,
          push_enabled: data.push_enabled
        });
        setPushEnabled(data.push_enabled);
      } else {
        // Criar preferências padrão
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_notification_preferences')
          .insert({
            user_id: user.id,
            mensagens: true,
            reservas: true,
            girinhas: true,
            sistema: true,
            push_enabled: false
          })
          .select()
          .single();

        if (!insertError && newPrefs) {
          setPreferences({
            mensagens: newPrefs.mensagens,
            reservas: newPrefs.reservas,
            girinhas: newPrefs.girinhas,
            sistema: newPrefs.sistema,
            push_enabled: newPrefs.push_enabled
          });
          setPushEnabled(newPrefs.push_enabled);
        }
      }
    } catch (error) {
      // Silencioso
    }
  }, [user]);

  // ===============================
  // REGISTRO NO ONESIGNAL
  // ===============================

  const registerUserInOneSignal = useCallback(async (playerId?: string) => {
    if (!user || registrationInProgress.current) return false;
    
    registrationInProgress.current = true;
    
    try {
      // Usar Player ID atual se não fornecido
      const playerIdToUse = playerId || getOneSignalPlayerId();
      
      const { data, error } = await supabase.functions.invoke('register-onesignal-user', {
        body: {
          user_id: user.id,
          player_id: playerIdToUse
        }
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    } finally {
      registrationInProgress.current = false;
    }
  }, [user]);

  // ===============================
  // PERMISSÕES PUSH
  // ===============================

  const requestPushPermission = async () => {
    try {
      if (!('Notification' in window)) {
        toast.error('Seu navegador não suporta notificações.');
        return false;
      }

      // Garantir que OneSignal esteja inicializado
      if (!oneSignalInitialized.current) {
        await initializeOneSignalWithUser();
      }

      // Aguardar OneSignal estar pronto
      const ready = await waitForOneSignalReady();
      if (!ready) {
        toast.error('Sistema de notificações não está pronto.');
        return false;
      }

      // Solicitar permissão do navegador
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Aguardar OneSignal processar a permissão
        setTimeout(async () => {
          try {
            const info = getOneSignalInfo();
            
            if (info.playerId && info.optedIn) {
              // Registrar no backend
              const registered = await registerUserInOneSignal(info.playerId);
              
              if (registered) {
                // Atualizar preferências
                await updatePreferences({ push_enabled: true });
                toast.success('Notificações ativadas com sucesso!');
              } else {
                toast.info('Permissão concedida! Finalizando configuração...');
              }
            } else {
              toast.info('Permissão concedida! Aguardando configuração...');
            }
          } catch (error) {
            toast.error('Erro ao configurar notificações');
          }
        }, 3000);
        
        return true;
      } else {
        toast.error('Permissão negada. Você pode ativá-la manualmente nas configurações do seu navegador.');
        return false;
      }
    } catch (error) {
      toast.error('Erro ao solicitar permissão para notificações');
      return false;
    }
  };

  // ===============================
  // AÇÕES DE NOTIFICAÇÃO
  // ===============================

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) return;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // Silencioso
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) return;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      // Silencioso
    }
  }, [user]);

  // ===============================
  // ATUALIZAR PREFERÊNCIAS
  // ===============================

  const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const { data: existingPrefs, error: selectError } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      let result;
      if (existingPrefs) {
        result = await supabase
          .from('user_notification_preferences')
          .update({
            ...newPrefs,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('user_notification_preferences')
          .insert({
            user_id: user.id,
            mensagens: preferences.mensagens,
            reservas: preferences.reservas,
            girinhas: preferences.girinhas,
            sistema: preferences.sistema,
            push_enabled: preferences.push_enabled,
            ...newPrefs,
            updated_at: new Date().toISOString()
          });
      }

      if (result.error) {
        toast.error('Erro ao atualizar preferências');
        return;
      }

      setPreferences(prev => ({ ...prev, ...newPrefs }));
      if (newPrefs.push_enabled !== undefined) {
        setPushEnabled(newPrefs.push_enabled);
      }
      toast.success('Preferências atualizadas!');
    } catch (error) {
      toast.error('Erro ao atualizar preferências');
    }
  }, [user, preferences]);

  // ===============================
  // ENVIAR NOTIFICAÇÕES
  // ===============================

  const sendNotification = useCallback(async (params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    sendPush?: boolean;
  }) => {
    const { userId, type, title, message, data = {}, sendPush = true } = params;

    try {
      const { data: result, error } = await supabase.functions.invoke('send-notification', {
        body: {
          user_id: userId,
          type,
          title,
          message,
          data,
          send_push: sendPush
        }
      });

      if (error) {
        throw error;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não encontrado');
      return;
    }

    try {
      await sendNotification({
        userId: user.id,
        type: 'sistema',
        title: 'GiraMãe - Teste',
        message: 'Sistema de notificações funcionando perfeitamente!',
        data: { test: true }
      });
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      toast.error('Erro ao enviar notificação de teste');
    }
  }, [user, sendNotification]);

  // ===============================
  // EFFECTS
  // ===============================

  // Inicializar OneSignal quando usuário fizer login
  useEffect(() => {
    if (user) {
      initializeOneSignalWithUser();
      loadPreferences();
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      oneSignalInitialized.current = false;
    }
  }, [user, initializeOneSignalWithUser, loadPreferences, loadNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channelKey = `notifications-${user.id}`;
    
    const channel = channelManager.current.getOrCreateChannel(channelKey, () => {
      return supabase
        .channel(channelKey)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          const newNotification = payload.new as any;
          const convertedNotification: Notification = {
            id: newNotification.id,
            user_id: newNotification.user_id,
            type: newNotification.type,
            title: newNotification.title,
            message: newNotification.message,
            data: (typeof newNotification.data === 'string' ? JSON.parse(newNotification.data) : newNotification.data) || {},
            read: newNotification.read,
            created_at: newNotification.created_at
          };
          
          setNotifications(prev => [convertedNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast(convertedNotification.title, {
            description: convertedNotification.message,
          });
        })
        .subscribe();
    });

    return () => {
      channelManager.current.removeChannel(channelKey);
    };
  }, [user]);

  // Cleanup global no unmount
  useEffect(() => {
    return () => {
      channelManager.current.removeAllChannels();
    };
  }, []);

  return {
    // In-App Notifications
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    
    // Push Notifications
    pushEnabled,
    requestPushPermission,
    sendTestNotification,
    
    // Preferences
    preferences,
    updatePreferences,
    
    // Unified sending
    sendNotification,
    
    // Utility
    refetch: loadNotifications
  };
};
