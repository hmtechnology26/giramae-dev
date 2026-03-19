import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Missao {
  id: string;
  titulo: string;
  descricao: string;
  tipo_missao: 'basic' | 'engagement' | 'social';
  categoria: string;
  icone: string;
  recompensa_girinhas: number;
  validade_recompensa_meses: number;
  condicoes: {
    tipo: string;
    quantidade: number;
  };
  prazo_dias?: number;
  progresso_atual?: number;
  progresso_necessario?: number;
  status?: 'em_progresso' | 'completa' | 'coletada' | 'expirada';
  data_completada?: string;
}

export interface LimiteMissoes {
  total_girinhas_coletadas: number;
  limite_maximo: number;
  proximo_reset: string;
}

interface ColetarRecompensaResponse {
  sucesso: boolean;
  girinhas_recebidas?: number;
  erro?: string;
}

export const useMissoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar missões do usuário
  const { data: missoes = [], isLoading } = useQuery({
    queryKey: ['missoes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('missoes')
        .select(`
          *,
          missoes_usuarios (
            progresso_atual,
            progresso_necessario,
            status,
            data_completada
          )
        `)
        .eq('ativo', true)
        .order('tipo_missao')
        .order('recompensa_girinhas', { ascending: false });

      if (error) {
        console.error('Erro ao buscar missões:', error);
        throw error;
      }

      return data.map(missao => ({
        ...missao,
        condicoes: missao.condicoes as { tipo: string; quantidade: number },
        progresso_atual: missao.missoes_usuarios?.[0]?.progresso_atual || 0,
        progresso_necessario: missao.missoes_usuarios?.[0]?.progresso_necessario || (missao.condicoes as any).quantidade,
        status: missao.missoes_usuarios?.[0]?.status || 'em_progresso',
        data_completada: missao.missoes_usuarios?.[0]?.data_completada
      })) as Missao[];
    },
    enabled: !!user?.id
  });

  // Buscar limites do usuário
  const { data: limite } = useQuery({
    queryKey: ['limite-missoes', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('limites_missoes_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as LimiteMissoes | null;
    },
    enabled: !!user?.id
  });

  // Coletar recompensa
  const coletarRecompensa = useMutation({
    mutationFn: async (missaoId: string) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se a missão existe e está completa
      const missao = missoes.find(m => m.id === missaoId);
      
      if (!missao) {
        throw new Error('Missão não encontrada');
      }

      if (missao.status !== 'completa') {
        throw new Error('Missão não está completa');
      }

      const { data, error } = await supabase.rpc('coletar_recompensa_missao', {
        p_user_id: user.id,
        p_missao_id: missaoId
      });

      if (error) {
        console.error('Erro na função do Supabase:', error);
        throw error;
      }
      
      return data as unknown as ColetarRecompensaResponse;
    },
    onSuccess: (data) => {
      if (data.sucesso) {
        toast({
          title: "🎉 Recompensa coletada!",
          description: `Você recebeu ${data.girinhas_recebidas} Girinhas`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['missoes'] });
        queryClient.invalidateQueries({ queryKey: ['limite-missoes'] });
        queryClient.invalidateQueries({ queryKey: ['carteira'] });
      } else {
        toast({
          title: "Erro ao coletar recompensa",
          description: data.erro || "Erro desconhecido",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Erro ao coletar recompensa:', error);
      
      toast({
        title: "Erro ao coletar recompensa",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  });

  // Verificar progresso
  const verificarProgresso = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase.rpc('verificar_progresso_missoes', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao verificar progresso:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missoes'] });
    }
  });

  // Estatísticas
  const missoesCompletas = missoes.filter(m => m.status === 'completa').length;
  const missoesColetadas = missoes.filter(m => m.status === 'coletada').length;
  const totalGirinhasDisponiveis = missoes
    .filter(m => m.status === 'completa')
    .reduce((total, m) => total + m.recompensa_girinhas, 0);

  const progressoTotal = limite ? {
    atual: limite.total_girinhas_coletadas,
    maximo: limite.limite_maximo,
    percentual: Math.round((limite.total_girinhas_coletadas / limite.limite_maximo) * 100)
  } : null;

  return {
    missoes,
    limite,
    isLoading,
    coletarRecompensa,
    verificarProgresso,
    missoesCompletas,
    missoesColetadas,
    totalGirinhasDisponiveis,
    progressoTotal
  };
};
