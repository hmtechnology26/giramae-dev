
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, MessageCircle, Coins, Megaphone, ShoppingBag } from 'lucide-react';

export const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences, loading } = useNotifications();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Preferências de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <div>
              <Label htmlFor="mensagens" className="text-sm font-medium">Mensagens</Label>
              <p className="text-xs text-gray-500">Novas mensagens de outros usuários</p>
            </div>
          </div>
          <Switch
            id="mensagens"
            checked={preferences.mensagens}
            onCheckedChange={(checked) => 
              updatePreferences({ mensagens: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-green-500" />
            <div>
              <Label htmlFor="reservas" className="text-sm font-medium">Reservas</Label>
              <p className="text-xs text-gray-500">Atualizações sobre suas reservas e itens</p>
            </div>
          </div>
          <Switch
            id="reservas"
            checked={preferences.reservas}
            onCheckedChange={(checked) => 
              updatePreferences({ reservas: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 text-yellow-500" />
            <div>
              <Label htmlFor="girinhas" className="text-sm font-medium">Girinhas</Label>
              <p className="text-xs text-gray-500">Recebimentos, expirações e transações</p>
            </div>
          </div>
          <Switch
            id="girinhas"
            checked={preferences.girinhas}
            onCheckedChange={(checked) => 
              updatePreferences({ girinhas: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-purple-500" />
            <div>
              <Label htmlFor="sistema" className="text-sm font-medium">Avisos do Sistema</Label>
              <p className="text-xs text-gray-500">Comunicados importantes da plataforma</p>
            </div>
          </div>
          <Switch
            id="sistema"
            checked={preferences.sistema}
            onCheckedChange={(checked) => 
              updatePreferences({ sistema: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};
