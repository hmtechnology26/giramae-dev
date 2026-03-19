
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MissaoAdmin {
  id?: string;
  titulo: string;
  descricao: string;
  tipo_missao: 'basic' | 'engagement' | 'social';
  categoria: string;
  icone: string;
  recompensa_girinhas: number;
  validade_recompensa_meses: number;
  limite_por_usuario: number;
  condicoes: {
    tipo: string;
    quantidade: number;
  };
  prazo_dias?: number;
  ativo: boolean;
  criterios_segmentacao?: any;
  configuracao_temporal?: any;
  acoes_eventos?: any[];
  data_inicio?: string;
  data_fim?: string;
  usuarios_elegíveis_cache?: number;
}

export const useMissoesAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todas as missões (admin)
  const { data: missoes = [], isLoading } = useQuery({
    queryKey: ['missoes-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missoes')
        .select('*')
        .order('tipo_missao')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(missao => ({
        ...missao,
        condicoes: missao.condicoes as { tipo: string; quantidade: number }
      })) as MissaoAdmin[];
    }
  });

  // Criar missão
  const criarMissao = useMutation({
    mutationFn: async (missao: Omit<MissaoAdmin, 'id'>) => {
      const { data, error } = await supabase
        .from('missoes')
        .insert([missao])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Missão criada com sucesso!",
        description: "A nova missão foi adicionada ao sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ['missoes-admin'] });
    }
  });

  // Atualizar missão
  const atualizarMissao = useMutation({
    mutationFn: async ({ id, ...missao }: MissaoAdmin) => {
      const { data, error } = await supabase
        .from('missoes')
        .update(missao)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Missão atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['missoes-admin'] });
    }
  });

  // Ativar/desativar missão
  const toggleMissao = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('missoes')
        .update({ ativo })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missoes-admin'] });
    }
  });

  // Estatísticas das missões
  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas-missoes'],
    queryFn: async () => {
      const { data: recompensas, error } = await supabase
        .from('recompensas_missoes')
        .select('girinhas_recebidas, data_coleta, missao_id');

      if (error) throw error;

      const totalGirinhasDistribuidas = recompensas.reduce((total, r) => total + r.girinhas_recebidas, 0);
      const totalUsuariosAtivos = new Set(recompensas.map(r => r.missao_id)).size;

      return {
        totalGirinhasDistribuidas,
        totalUsuariosAtivos,
        totalRecompensas: recompensas.length
      };
    }
  });

  return {
    missoes,
    isLoading,
    criarMissao,
    atualizarMissao,
    toggleMissao,
    estatisticas
  };
};
