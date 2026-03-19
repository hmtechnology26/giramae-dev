import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { TourStepConfig } from '@/modules/onboarding/types';

export type TipoJornada = 'tour' | 'acao' | 'sequencia';

export interface JornadaDefinicao {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  tipo: TipoJornada;
  categoria: string;
  recompensa_girinhas: number;
  ordem: number;
  rota_destino: string | null;
  tour_id: string | null;
  ativo: boolean;
  steps: TourStepConfig[] | null;
}

export interface JornadaProgresso {
  id: string;
  user_id: string;
  jornada_id: string;
  concluida: boolean;
  data_conclusao: string | null;
  recompensa_coletada: boolean;
}

export interface JornadaComProgresso extends JornadaDefinicao {
  concluida: boolean;
  recompensa_coletada: boolean;
}

interface ConcluirJornadaResult {
  sucesso: boolean;
  erro?: string;
  recompensa?: number;
  titulo?: string;
  icone?: string;
  transacao_id?: string;
}

export const useJornadas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { mostrarRecompensa } = useRecompensas();
  const navigate = useNavigate();

  // Buscar definições de jornadas (incluindo steps)
  const { data: definicoes, isLoading: loadingDefinicoes } = useQuery({
    queryKey: ['jornadas-definicoes'],
    queryFn: async (): Promise<JornadaDefinicao[]> => {
      const { data, error } = await supabase
        .from('jornadas_definicoes')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        steps: item.steps as unknown as TourStepConfig[] | null,
      })) as JornadaDefinicao[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Buscar progresso do usuário
  const { data: progresso, isLoading: loadingProgresso } = useQuery({
    queryKey: ['jornadas-progresso', user?.id],
    queryFn: async (): Promise<JornadaProgresso[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('jornadas_progresso')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []) as JornadaProgresso[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
  });

  // Buscar configuração de jornada ativa no perfil
  const { data: jornadaAtiva } = useQuery({
    queryKey: ['jornada-ativa', user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return true;

      const { data, error } = await supabase
        .from('profiles')
        .select('jornada_ativa')
        .eq('id', user.id)
        .single();

      if (error) return true;
      return data?.jornada_ativa ?? true;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Combinar definições com progresso
  const jornadas: JornadaComProgresso[] = (definicoes || []).map(def => {
    const prog = progresso?.find(p => p.jornada_id === def.id);
    return {
      ...def,
      concluida: prog?.concluida ?? false,
      recompensa_coletada: prog?.recompensa_coletada ?? false,
    };
  });

  // Agrupar por categoria
  const jornadasPorCategoria = jornadas.reduce((acc, jornada) => {
    const categoria = jornada.categoria || 'geral';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(jornada);
    return acc;
  }, {} as Record<string, JornadaComProgresso[]>);

  // Calcular progresso geral
  const totalJornadas = jornadas.length;
  const jornadasConcluidas = jornadas.filter(j => j.concluida).length;
  const progressoPercentual = totalJornadas > 0 
    ? Math.round((jornadasConcluidas / totalJornadas) * 100) 
    : 0;

  // Mutation para concluir jornada
  const concluirJornadaMutation = useMutation({
    mutationFn: async (jornadaId: string): Promise<ConcluirJornadaResult> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('concluir_jornada', {
        p_user_id: user.id,
        p_jornada_id: jornadaId,
      });

      if (error) throw error;
      return data as unknown as ConcluirJornadaResult;
    },
    onSuccess: (result) => {
      if (result.sucesso) {
        // Invalidar queries
        queryClient.invalidateQueries({ queryKey: ['jornadas-progresso'] });
        queryClient.invalidateQueries({ queryKey: ['carteira'] });

        // Mostrar celebração
        mostrarRecompensa({
          tipo: 'jornada',
          valor: result.recompensa || 1,
          descricao: result.titulo || 'Jornada concluída!',
          meta: result.icone,
        });
      } else {
        toast.error(result.erro || 'Erro ao concluir jornada');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao concluir jornada');
    },
  });

  // Marcar progresso sem recompensa (para tracking)
  const marcarProgresso = async (jornadaId: string) => {
    if (!user?.id) return;

    await supabase.rpc('marcar_progresso_jornada', {
      p_user_id: user.id,
      p_jornada_id: jornadaId,
    });

    queryClient.invalidateQueries({ queryKey: ['jornadas-progresso'] });
  };

  // Toggle jornada ativa no perfil
  const toggleJornadaAtiva = async (ativo: boolean) => {
    if (!user?.id) return;

    await supabase
      .from('profiles')
      .update({ jornada_ativa: ativo })
      .eq('id', user.id);

    queryClient.invalidateQueries({ queryKey: ['jornada-ativa'] });
  };

  // Iniciar uma jornada (navegar ou iniciar tour)
  const iniciarJornada = (jornada: JornadaComProgresso) => {
    if (jornada.rota_destino) {
      navigate(jornada.rota_destino);
    }
  };

  // Verificar se jornada pode ser concluída (não foi coletada ainda)
  const podeColetarRecompensa = (jornadaId: string): boolean => {
    const jornada = jornadas.find(j => j.id === jornadaId);
    return jornada?.concluida === true && jornada?.recompensa_coletada === false;
  };

  // Buscar steps de uma jornada específica
  const getJornadaSteps = (jornadaId: string): TourStepConfig[] | null => {
    const jornada = jornadas.find(j => j.id === jornadaId);
    return jornada?.steps || null;
  };

  return {
    jornadas,
    jornadasPorCategoria,
    totalJornadas,
    jornadasConcluidas,
    progressoPercentual,
    jornadaAtiva: jornadaAtiva ?? true,
    isLoading: loadingDefinicoes || loadingProgresso,
    concluirJornada: concluirJornadaMutation.mutate,
    marcarProgresso,
    toggleJornadaAtiva,
    iniciarJornada,
    podeColetarRecompensa,
    getJornadaSteps,
    isPending: concluirJornadaMutation.isPending,
  };
};
