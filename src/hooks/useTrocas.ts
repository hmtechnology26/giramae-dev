
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Troca = Tables<'reservas'> & {
  itens?: {
    titulo: string;
    fotos: string[] | null;
  } | null;
  profiles_reservador?: {
    nome: string;
    avatar_url: string | null;
  } | null;
  profiles_vendedor?: {
    nome: string;
    avatar_url: string | null;
  } | null;
  avaliacoes?: Array<{
    rating: number;
  }>;
};

export const useTrocas = () => {
  const { user } = useAuth();
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrocas = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reservas')
        .select(`
          *,
          itens (
            titulo,
            fotos
          ),
          profiles_reservador:profiles!reservas_usuario_reservou_fkey (
            nome,
            avatar_url
          ),
          profiles_vendedor:profiles!reservas_usuario_item_fkey (
            nome,
            avatar_url
          )
        `)
        .or(`usuario_reservou.eq.${user.id},usuario_item.eq.${user.id}`)
        .eq('status', 'confirmada')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Processar os dados para garantir que profiles são objetos únicos
      const processedData: Troca[] = (data || []).map((item: any) => ({
        ...item,
        profiles_reservador: Array.isArray(item.profiles_reservador) 
          ? item.profiles_reservador[0] || null 
          : item.profiles_reservador,
        profiles_vendedor: Array.isArray(item.profiles_vendedor) 
          ? item.profiles_vendedor[0] || null 
          : item.profiles_vendedor,
        avaliacoes: [] // Por enquanto vazio, pode ser implementado depois
      }));

      setTrocas(processedData);
    } catch (err) {
      console.error('Erro ao buscar trocas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoConfirmada = async (reservaId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('finalizar_troca_com_codigo', {
          p_reserva_id: reservaId,
          p_codigo_confirmacao: 'ADMIN_OVERRIDE'
        });

      if (error) throw error;

      // Recarregar dados
      await fetchTrocas();
      
      return data === true; // Retorna true se a troca foi finalizada
    } catch (err) {
      console.error('Erro ao confirmar entrega:', err);
      setError(err instanceof Error ? err.message : 'Erro ao confirmar entrega');
      return false;
    }
  };

  const cancelarTroca = async (reservaId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('cancelar_reserva_v2', {
          p_reserva_id: reservaId,
          p_usuario_id: user.id,
          p_motivo_codigo: 'cancelamento_usuario',
          p_observacoes: 'Cancelamento pelo usuário'
        });

      if (error) throw error;

      // Recarregar dados
      await fetchTrocas();
      
      const responseData = data as any;
      if (responseData && typeof responseData === 'object' && 'sucesso' in responseData) {
        return responseData.sucesso as boolean;
      }
      return data === true; // Fallback se retornar boolean direto
    } catch (err) {
      console.error('Erro ao cancelar troca:', err);
      setError(err instanceof Error ? err.message : 'Erro ao cancelar troca');
      return false;
    }
  };

  // Funções de estatísticas
  const getTotalTrocas = (): number => {
    return trocas.length;
  };

  const getTotalGirinhasRecebidas = (): number => {
    if (!user) return 0;
    return trocas
      .filter(troca => troca.usuario_item === user.id)
      .reduce((total, troca) => total + troca.valor_girinhas, 0);
  };

  const getTotalGirinhasGastas = (): number => {
    if (!user) return 0;
    return trocas
      .filter(troca => troca.usuario_reservou === user.id)
      .reduce((total, troca) => total + troca.valor_girinhas, 0);
  };

  const getMediaAvaliacoes = (): number => {
    const avaliacoes = trocas
      .filter(troca => troca.avaliacoes && troca.avaliacoes.length > 0)
      .flatMap(troca => troca.avaliacoes || []);
    
    if (avaliacoes.length === 0) return 0;
    
    const soma = avaliacoes.reduce((total, avaliacao) => total + avaliacao.rating, 0);
    return soma / avaliacoes.length;
  };

  useEffect(() => {
    fetchTrocas();
  }, [user]);

  return {
    trocas,
    loading,
    error,
    refetch: fetchTrocas,
    marcarComoConfirmada,
    cancelarTroca,
    getTotalTrocas,
    getTotalGirinhasRecebidas,
    getTotalGirinhasGastas,
    getMediaAvaliacoes
  };
};
