import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuth } from '@/hooks/useAuth';
import { Bell, BellOff, CheckCircle, Smartphone, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { initializeOneSignal, getOneSignalPlayerId, isUserOptedIn } from '@/lib/onesignal';

export const OneSignalSettings: React.FC = () => {
  const { 
    pushEnabled: isPermissionGranted,
    requestPushPermission,
    sendTestNotification,
    updatePreferences
  } = useNotificationSystem();
  const { user } = useAuth();
  
  const [oneSignalReady, setOneSignalReady] = useState(false);

  const isPushSupported = typeof window !== 'undefined' && 'Notification' in window;
  const browserPermission = isPushSupported ? Notification.permission : 'denied';

  // Inicializar OneSignal apenas uma vez
  useEffect(() => {
    const initOneSignal = async () => {
      const initialized = await initializeOneSignal();
      setOneSignalReady(initialized);
    };
    
    initOneSignal();
  }, []);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPushPermission();
      if (!granted) {
        toast.error('Permissão negada. Você pode ativá-la manualmente nas configurações do seu navegador.');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao solicitar a permissão.');
    }
  };

  const handleDisablePushNotifications = async () => {
    try {
      await updatePreferences({ push_enabled: false });
      toast.success('Notificações push desativadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao desativar notificações push');
    }
  };

  const handleTestNotification = async () => {
    if (!user) {
      toast.error('Usuário não encontrado');
      return;
    }

    if (browserPermission !== 'granted') {
      toast.error('Você precisa aceitar as permissões de notificação primeiro');
      return;
    }

    await sendTestNotification();
  };

  const handleRefreshPermission = () => {
    window.location.reload();
  };

  const getStatusColor = () => {
    if (browserPermission === 'granted' && isPermissionGranted) {
      return 'bg-green-50 text-green-800 border-green-200';
    }
    if (browserPermission === 'denied') {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    return 'bg-yellow-50 text-yellow-800 border-yellow-200';
  };

  const getStatusIcon = () => {
    if (browserPermission === 'granted' && isPermissionGranted) {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (browserPermission === 'denied') {
      return <BellOff className="w-5 h-5" />;
    }
    return <Bell className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (browserPermission === 'granted' && isPermissionGranted) {
      return 'Ativo';
    }
    if (browserPermission === 'denied') {
      return 'Bloqueado';
    }
    return 'Inativo';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Alertas no Dispositivo (Push)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          Receba alertas importantes, como novas mensagens e atualizações de reservas,
          mesmo quando o aplicativo não estiver aberto.
        </p>

        {/* Status das Notificações */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Status das Notificações</span>
          </div>
          <span className="font-semibold">
            {getStatusText()}
          </span>
        </div>

        {/* Ações do Usuário */}
        <div className="space-y-3 pt-4 border-t">
          {/* Quando permissão não foi concedida */}
          {browserPermission !== 'granted' && (
            <Button onClick={handleRequestPermission} className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Ativar Alertas no Dispositivo
            </Button>
          )}

          {/* Quando permissão foi negada */}
          {browserPermission === 'denied' && (
             <div className="space-y-2">
               <p className="text-xs text-center text-red-600 p-2 bg-red-50 rounded-md">
                  Você bloqueou as notificações. Para reativar, acesse as configurações de permissão do seu navegador para este site.
               </p>
               <Button onClick={handleRefreshPermission} variant="outline" className="w-full">
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Atualizar Status
               </Button>
             </div>
          )}

          {/* Quando permissão foi concedida */}
          {browserPermission === 'granted' && (
            <div className="space-y-2">
              {/* Botão para desativar push (só aparece se estiver ativo) */}
              {isPermissionGranted && (
                <Button 
                  onClick={handleDisablePushNotifications} 
                  variant="destructive"
                  className="w-full"
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  Desativar Alertas no Dispositivo
                </Button>
              )}

              {/* Botão para reativar push (só aparece se estiver inativo) */}
              {!isPermissionGranted && (
                <Button 
                  onClick={handleRequestPermission} 
                  className="w-full"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Reativar Alertas no Dispositivo
                </Button>
              )}

              {/* Botão de teste (sempre disponível quando permissão concedida) */}
              <Button onClick={handleTestNotification} variant="outline" className="w-full">
                Testar Notificação
              </Button>
            </div>
          )}
        </div>

        {/* Informações do Sistema */}
        {user && (
          <div className="space-y-2">
            {browserPermission === 'granted' && isPermissionGranted && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium">
                  ✅ Configurado para {user.email}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Você receberá notificações push normalmente.
                </p>
              </div>
            )}

            {browserPermission === 'granted' && !isPermissionGranted && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700 font-medium">
                  ⚠️ Notificações push desativadas
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Você não receberá alertas no dispositivo. Clique em "Reativar" para receber novamente.
                </p>
              </div>
            )}

            {!oneSignalReady && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-medium">
                  🔄 Carregando sistema de notificações...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
