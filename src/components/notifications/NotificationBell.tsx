import React, { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    loading,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'nova_mensagem':
        return '💬';
      case 'item_reservado':
        return '🛍️';
      case 'reserva_confirmada':
        return '✅';
      case 'girinhas_recebidas':
        return '🪙';
      case 'girinhas_expirando':
        return '⏰';
      case 'missao_completada':
        return '🏆';
      case 'sistema':
        return '📢';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="relative p-2 text-primary" disabled>
        <Bell className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2 text-primary">
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 p-0 flex items-center justify-center text-[10px] md:text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] p-0 overflow-hidden rounded-2xl sm:w-80 sm:max-w-sm md:w-96"
        align="end"
        sideOffset={10}
        avoidCollisions={true}
        collisionPadding={8}
      >
        <div className="flex items-center justify-between border-b px-3 py-3 sm:px-4">
          <h3 className="font-semibold text-sm sm:text-base">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-[11px] sm:text-xs h-auto p-1"
            >
              <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[calc(100vh-14rem)] sm:max-h-96">
          {notifications.length === 0 ? (
            <div className="p-5 sm:p-6 text-center text-gray-500">
              <Bell className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-3 py-3 sm:px-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  handleNotificationClick(notification);
                  setOpen(false);
                }}
              >
                <div className="flex gap-2.5 sm:gap-3">
                  <div className="text-base sm:text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium text-[13px] sm:text-sm truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 h-auto"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] sm:text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>

                    <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t bg-background/90">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs sm:text-sm h-auto py-2"
              onClick={() => {
                window.location.href = '/configuracoes#notificacoes';
                setOpen(false);
              }}
            >
              Configurar notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
