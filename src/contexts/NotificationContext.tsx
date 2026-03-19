
import React, { createContext, useContext, ReactNode } from 'react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { Notification, NotificationPreferences } from '@/types/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  loading: boolean;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    sendPush?: boolean;
  }) => Promise<any>;
  handleNotificationClick: (notification: Notification) => void;
  // Métodos legados removidos - não mais necessários
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationHook = useNotificationSystem();

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida
    notificationHook.markAsRead(notification.id);
    
    // Navegar se tiver URL de ação
    if (notification.data?.action_url) {
      window.location.href = notification.data.action_url;
    }
  };

  const contextValue = {
    ...notificationHook,
    handleNotificationClick
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};
