
// Hook que usa o sistema unificado, mantendo compatibilidade
import { useNotificationSystem } from './useNotificationSystem';

export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    preferences,
    loading,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    sendNotification,
    refetch
  } = useNotificationSystem();

  // Navegação baseada em tipo (mantendo funcionalidade existente)
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    switch(notification.type) {
      case 'nova_mensagem':
        if (notification.data.conversa_id) {
          window.location.href = `/mensagens?conversa=${notification.data.conversa_id}`;
        }
        break;
      case 'item_reservado':
      case 'reserva_confirmada':
        window.location.href = '/minhas-reservas';
        break;
      case 'girinhas_expirando':
      case 'girinhas_recebidas':
        window.location.href = '/carteira';
        break;
      case 'missao_completada':
        window.location.href = '/missoes';
        break;
      case 'sistema':
        if (notification.data.action_url) {
          window.location.href = notification.data.action_url;
        }
        break;
    }
  };

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    refetch,
    sendNotification
  };
};
