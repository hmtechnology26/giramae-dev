// FILE: src/components/notifications/NotificacoesBadge.tsx

import { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notificacao {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export const NotificacoesBadge = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);

  // Buscar notificações
  const buscarNotificacoes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotificacoes(data || []);
      setNaoLidas((data || []).filter(n => !n.read).length);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  // Marcar como lida
  const marcarComoLida = async (notificacaoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificacaoId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(n => 
          n.id === notificacaoId 
            ? { ...n, read: true }
            : n
        )
      );
      setNaoLidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    if (!user || naoLidas === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotificacoes(prev => prev.map(n => ({ ...n, read: true })));
      setNaoLidas(0);
      
      toast({
        title: 'Notificações marcadas como lidas',
        description: 'Todas as notificações foram marcadas como lidas.',
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar as notificações como lidas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diferenca = agora.getTime() - data.getTime();
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const minutos = Math.floor(diferenca / (1000 * 60));

    if (minutos < 60) {
      return `${minutos}m atrás`;
    } else if (horas < 24) {
      return `${horas}h atrás`;
    } else {
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Obter ícone baseado no tipo
  const obterIconeNotificacao = (tipo: string) => {
    switch (tipo) {
      case 'reserva_expirando':
        return '⏰';
      case 'reserva_expirada':
        return '❌';
      case 'item_reservado':
        return '🎯';
      case 'reserva_confirmada':
        return '✅';
      case 'item_liberado':
        return '🔓';
      case 'fila_chamada':
        return '📢';
      default:
        return '🔔';
    }
  };

  useEffect(() => {
    if (user) {
      buscarNotificacoes();
      
      // Configurar realtime para novas notificações
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const novaNotificacao = payload.new as Notificacao;
            setNotificacoes(prev => [novaNotificacao, ...prev.slice(0, 19)]);
            setNaoLidas(prev => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {naoLidas > 0 ? (
            <BellRing className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {naoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs p-0"
            >
              {naoLidas > 99 ? '99+' : naoLidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>Notificações</DropdownMenuLabel>
          {naoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasComoLidas}
              disabled={loading}
              className="text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="max-h-80">
          {notificacoes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Nenhuma notificação ainda
            </div>
          ) : (
            notificacoes.map((notificacao) => (
              <DropdownMenuItem
                key={notificacao.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notificacao.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (!notificacao.read) {
                    marcarComoLida(notificacao.id);
                  }
                }}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-lg flex-shrink-0">
                    {obterIconeNotificacao(notificacao.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {notificacao.title}
                      </p>
                      {!notificacao.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {notificacao.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatarData(notificacao.created_at)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        
        {notificacoes.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-gray-500">
              Ver todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};