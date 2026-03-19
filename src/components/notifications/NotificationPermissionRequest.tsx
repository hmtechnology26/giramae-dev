
import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationPermissionRequest: React.FC = () => {
  const { preferences, updatePreferences } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  // Não mostrar se já foi dispensado, se push está ativo ou se não suporta
  if (dismissed || preferences.push_enabled || !('Notification' in window) || browserPermission === 'denied') {
    return null;
  }

  const handleRequestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      
      if (permission === 'granted') {
        // Ativar push notifications nas preferências
        await updatePreferences({ push_enabled: true });
      } else {
        setDismissed(true);
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setDismissed(true);
    }
  };

  return (
    <Card className="mx-4 mt-4 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">Ativar Notificações Push</h3>
              <p className="text-sm text-gray-600 mt-1">
                Receba alertas em tempo real sobre reservas, mensagens e novos itens
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleRequestPermission}
              className="text-xs"
            >
              Ativar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
