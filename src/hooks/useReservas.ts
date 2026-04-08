import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type ReservaComRelacionamentos = Tables<'reservas'> & {
  codigo_confirmacao?: string;
  itens?: {
    titulo: string;
    fotos: string[] | null;
    valor_girinhas: number;
    codigo_unico: string;
  } | null;
  profiles_reservador?: {
    nome: string;
    avatar_url: string | null;
    whatsapp?: string;
  } | null;
  profiles_vendedor?: {
    nome: string;
    avatar_url: string | null;
    whatsapp?: string;
  } | null;
  posicao_fila?: number;
  tempo_restante?: number;
};

type FilaEsperaComRelacionamentos = Tables<'fila_espera'> & {
  itens?: {
    titulo: string;
    fotos: string[] | null;
    valor_girinhas: number;
    publicado_por: string;
    codigo_unico: string;
  } | null;
  profiles_vendedor?: {
    nome: string;
    avatar_url: string | null;
    whatsapp?: string;
  } | null;
};

type ReservasQueryData = {
  reservas: ReservaComRelacionamentos[];
  filasEspera: FilaEsperaComRelacionamentos[];
};

export const useReservas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateItemQueries = async (itemId?: string) => {
    const queries = ['itens', 'meus-itens', 'itens-usuario'];

    if (itemId) {
      await queryClient.invalidateQueries({ queryKey: ['item', itemId] });
    }

    await Promise.all(
      queries.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [queryKey] }),
      ),
    );

    await queryClient.invalidateQueries({ queryKey: ['carteira'] });
  };

  const carregarReservas = async (): Promise<ReservasQueryData> => {
    if (!user) {
      return { reservas: [], filasEspera: [] };
    }

    const { data: reservasData, error: reservasError } = await supabase
      .from('reservas')
      .select(
        `*, codigo_confirmacao, itens (titulo, fotos, valor_girinhas, codigo_unico)`,
      )
      .or(`usuario_reservou.eq.${user.id},usuario_item.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (reservasError) throw reservasError;

    const { data: filasData, error: filasError } = await supabase
      .from('fila_espera')
      .select(
        `*, itens (titulo, fotos, valor_girinhas, publicado_por, codigo_unico)`,
      )
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (filasError) throw filasError;

    const userIds = new Set<string>();
    reservasData?.forEach((reserva) => {
      userIds.add(reserva.usuario_reservou);
      userIds.add(reserva.usuario_item);
    });
    filasData?.forEach((fila) => {
      if (fila.itens?.publicado_por) {
        userIds.add(fila.itens.publicado_por);
      }
    });

    let profilesData: any[] = [];
    if (userIds.size > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url, telefone')
        .in('id', Array.from(userIds));

      profilesData = data || [];
    }

    const profilesMap = new Map(
      profilesData.map((p) => [
        p.id,
        {
          id: p.id,
          nome: p.nome,
          avatar_url: p.avatar_url,
          whatsapp: p.telefone,
        },
      ]),
    );

    const reservasComPerfis = (reservasData || []).map((reserva) => {
      let tempo_restante;

      if (reserva.status === 'pendente') {
        tempo_restante = Math.max(
          0,
          new Date(reserva.prazo_expiracao).getTime() - new Date().getTime(),
        );
      }

      return {
        ...reserva,
        profiles_reservador: profilesMap.get(reserva.usuario_reservou) || null,
        profiles_vendedor: profilesMap.get(reserva.usuario_item) || null,
        tempo_restante,
      };
    });

    const filasComPerfis = (filasData || []).map((fila) => ({
      ...fila,
      profiles_vendedor: fila.itens?.publicado_por
        ? profilesMap.get(fila.itens.publicado_por) || null
        : null,
    }));

    return {
      reservas: reservasComPerfis,
      filasEspera: filasComPerfis,
    };
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reservas', user?.id],
    queryFn: carregarReservas,
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const entrarNaFila = async (itemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'entrar_fila_espera',
        {
          p_item_id: itemId,
          p_usuario_id: user.id,
        },
      );

      if (rpcError) {
        toast({
          title: 'Erro ao reservar',
          description: rpcError.message,
          variant: 'destructive',
        });
        return false;
      }

      const resultado = rpcData as {
        sucesso: boolean;
        erro?: string;
        reserva_id?: string;
      };

      if (!resultado.sucesso) {
        toast({
          title: 'Erro ao reservar',
          description: resultado.erro || 'Não foi possível reservar.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Item reservado! 🎉',
        description:
          'As Girinhas foram bloqueadas. Use o código de confirmação na entrega.',
      });

      await Promise.all([refetch(), invalidateItemQueries(itemId)]);
      return true;
    } catch (err) {
      console.error('Erro ao entrar na fila:', err);
      toast({
        title: 'Erro ao entrar na fila',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const sairDaFila = async (itemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: rpcError } = await supabase.rpc('sair_fila_espera', {
        p_item_id: itemId,
        p_usuario_id: user.id,
      });

      if (rpcError) throw rpcError;

      toast({
        title: 'Saiu da fila! 👋',
        description: 'Você foi removido da fila de espera.',
      });

      await Promise.all([refetch(), invalidateItemQueries(itemId)]);
      return true;
    } catch (err) {
      console.error('Erro ao sair da fila:', err);
      toast({
        title: 'Erro ao sair da fila',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const cancelarReserva = async (reservaId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'cancelar_reserva_v2',
        {
          p_reserva_id: reservaId,
          p_usuario_id: user.id,
          p_motivo_codigo: 'cancelamento_usuario',
          p_observacoes: 'Cancelamento pelo usuário',
        },
      );

      if (rpcError) throw rpcError;

      const responseData = rpcData as any;
      if (
        responseData &&
        typeof responseData === 'object' &&
        'sucesso' in responseData &&
        responseData.sucesso
      ) {
        toast({
          title: 'Reserva cancelada',
          description: 'As Girinhas foram reembolsadas.',
        });

        const reserva = data?.reservas.find((r) => r.id === reservaId);
        await Promise.all([refetch(), invalidateItemQueries(reserva?.item_id)]);
        return true;
      }

      const erro =
        responseData &&
        typeof responseData === 'object' &&
        'erro' in responseData
          ? String(responseData.erro)
          : 'Erro ao cancelar reserva';
      throw new Error(erro);
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
      toast({
        title: 'Erro ao cancelar reserva',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const confirmarEntrega = async (
    reservaId: string,
    codigo: string,
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'finalizar_troca_com_codigo',
        {
          p_reserva_id: reservaId,
          p_codigo_confirmacao: codigo,
        },
      );

      if (rpcError) {
        if (rpcError.message.includes('Código de confirmação inválido')) {
          toast({
            title: 'Código Inválido',
            description: 'O código informado não está correto.',
            variant: 'destructive',
          });
        } else if (rpcError.message.includes('troca já foi finalizada')) {
          toast({
            title: 'Troca já finalizada',
            description: 'Esta operação já foi concluída.',
          });
        } else {
          throw rpcError;
        }
        return false;
      }

      if (rpcData === true) {
        toast({
          title: 'Troca Finalizada! 🤝',
          description:
            'A troca foi concluída com sucesso e as Girinhas foram transferidas!',
        });

        const reserva = data?.reservas.find((r) => r.id === reservaId);
        await Promise.all([refetch(), invalidateItemQueries(reserva?.item_id)]);
        return true;
      }

      toast({
        title: 'Erro ao finalizar troca',
        description: 'Não foi possível finalizar a troca. Verifique o código.',
        variant: 'destructive',
      });
      return false;
    } catch (err) {
      console.error('Erro ao finalizar troca:', err);
      toast({
        title: 'Erro ao finalizar troca',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const isItemReservado = (itemId: string): boolean => {
    return (data?.reservas || []).some(
      (reserva) => reserva.item_id === itemId && reserva.status === 'pendente',
    );
  };

  const getFilaEspera = (itemId: string): number => {
    return (data?.filasEspera || []).filter((fila) => fila.item_id === itemId)
      .length;
  };

  useEffect(() => {
    if (error) {
      console.error('Erro ao buscar reservas:', error);
      toast({
        title: 'Erro ao carregar reservas',
        description:
          error instanceof Error
            ? error.message
            : 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  return {
    reservas: data?.reservas || [],
    filasEspera: data?.filasEspera || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    criarReserva: entrarNaFila,
    entrarNaFila,
    sairDaFila,
    removerDaReserva: cancelarReserva,
    confirmarEntrega,
    cancelarReserva,
    isItemReservado,
    getFilaEspera,
    refetch,
  };
};
