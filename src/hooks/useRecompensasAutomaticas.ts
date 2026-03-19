
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBonificacoes } from '@/hooks/useBonificacoes';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Singleton instance tracking
let globalInstanceCount = 0;
const activeChannels = new Map<string, any>();

export const useRecompensasAutomaticas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mostrarRecompensa } = useRecompensas();
  const { 
    processarBonusTrocaConcluida, 
    processarBonusAvaliacao,
    processarBonusCadastro,
    verificarEProcessarMetas
  } = useBonificacoes();
  
  const instanceRef = useRef<number>(0);
  const channelsRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!user || isInitializedRef.current) return;

    // Incrementar contador global e definir instância
    globalInstanceCount++;
    instanceRef.current = globalInstanceCount;
    isInitializedRef.current = true;
    
    console.log(`RecompensasAutomaticas instance ${instanceRef.current} iniciada para user:`, user.id);

    // Limpar channels existentes primeiro
    channelsRef.current.forEach(channel => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    });
    channelsRef.current = [];

    const initializeRecompensas = async () => {
      // Processar bônus de cadastro se for novo usuário
      const userCreatedAt = new Date(user.created_at);
      const agora = new Date();
      const diferencaMinutos = (agora.getTime() - userCreatedAt.getTime()) / (1000 * 60);
      
      if (diferencaMinutos < 10) {
        await processarBonusCadastro();
      }

      // Channel ID único para evitar conflitos
      const channelId = `${user.id}-${instanceRef.current}`;

      // Configurar listener para mudanças em reservas (trocas concluídas)
      const reservasChannelReservador = supabase
        .channel(`reservas-changes-reservador-${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'reservas',
            filter: `usuario_reservou=eq.${user.id}`
          },
          async (payload) => {
            const novaReserva = payload.new as any;
            if (novaReserva.confirmado_por_reservador && 
                novaReserva.confirmado_por_vendedor && 
                novaReserva.status === 'confirmada') {
              console.log('Processando bônus de troca concluída (reservador)');
              await processarBonusTrocaConcluida();
              await verificarEProcessarMetas();
            }
          }
        )
        .subscribe();

      const reservasChannelVendedor = supabase
        .channel(`reservas-changes-vendedor-${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'reservas',
            filter: `usuario_item=eq.${user.id}`
          },
          async (payload) => {
            const novaReserva = payload.new as any;
            if (novaReserva.confirmado_por_reservador && 
                novaReserva.confirmado_por_vendedor && 
                novaReserva.status === 'confirmada') {
              console.log('Processando bônus de troca concluída (vendedor)');
              await processarBonusTrocaConcluida();
              await verificarEProcessarMetas();
            }
          }
        )
        .subscribe();

      // Configurar listener para avaliações
      const avaliacoesChannel = supabase
        .channel(`avaliacoes-changes-${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'avaliacoes',
            filter: `avaliador_id=eq.${user.id}`
          },
          async () => {
            console.log('Processando bônus de avaliação');
            setTimeout(async () => {
              await processarBonusAvaliacao();
            }, 1000);
          }
        )
        .subscribe();

      // Monitorar mudanças nas metas (integrado aqui)
      const metasChannel = supabase
        .channel(`metas-changes-${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'metas_usuarios',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const metaAtualizada = payload.new as any;
            
            if (metaAtualizada.conquistado && !payload.old.conquistado) {
              setTimeout(() => {
                mostrarRecompensa({
                  tipo: 'meta',
                  valor: metaAtualizada.girinhas_bonus,
                  descricao: `Incrível! Você conquistou o distintivo ${metaAtualizada.tipo_meta.toUpperCase()}!`,
                  meta: metaAtualizada.tipo_meta
                });

                toast({
                  title: `🎯 Meta ${metaAtualizada.tipo_meta.toUpperCase()} alcançada!`,
                  description: `Fantástico! +${metaAtualizada.girinhas_bonus} Girinhas de bônus!`,
                });
              }, 1000);
            }
          }
        )
        .subscribe();

      // Monitorar novas transações de bônus (integrado aqui)
      const transacoesChannel = supabase
        .channel(`transacoes-bonus-${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transacoes',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const transacao = payload.new as any;
            
            if (transacao.tipo === 'bonus' && transacao.descricao?.includes('promocional')) {
              setTimeout(() => {
                mostrarRecompensa({
                  tipo: 'cadastro',
                  valor: transacao.valor,
                  descricao: 'Surpresa! Você recebeu Girinhas promocionais!'
                });
              }, 500);
            }
          }
        )
        .subscribe();

      // Armazenar referências dos canais para cleanup
      channelsRef.current = [
        reservasChannelReservador,
        reservasChannelVendedor,
        avaliacoesChannel,
        metasChannel,
        transacoesChannel
      ];

      // Registrar no map global
      activeChannels.set(channelId, channelsRef.current);
    };

    initializeRecompensas();

    // Cleanup function
    return () => {
      console.log(`Cleanup RecompensasAutomaticas instance ${instanceRef.current}`);
      
      const channelId = `${user.id}-${instanceRef.current}`;
      
      // Limpar todos os canais
      channelsRef.current.forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
      channelsRef.current = [];

      // Remover do map global
      activeChannels.delete(channelId);
      isInitializedRef.current = false;
    };
  }, [user?.id]);

  return {
    instanceId: instanceRef.current,
    isActive: isInitializedRef.current
  };
};
