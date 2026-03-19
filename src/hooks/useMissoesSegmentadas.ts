
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface MissaoSegmentada {
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
  criterios_segmentacao: any;
  configuracao_temporal: any;
  acoes_eventos: any[];
  data_inicio?: string;
  data_fim?: string;
  usuarios_elegíveis_cache?: number;
  progresso_atual?: number;
  progresso_necessario?: number;
  status?: 'em_progresso' | 'completa' | 'coletada' | 'expirada';
  data_completada?: string;
  elegivel?: boolean;
}

export interface EventoAcao {
  id: string;
  tipo_evento: string;
  parametros: {
    url?: string;
    titulo?: string;
    mensagem?: string;
    conteudo?: string;
  };
}

export interface ResultadoColeta {
  sucesso: boolean;
  girinhas_recebidas: number;
}

export const useMissoesSegmentadas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar missões segmentadas elegíveis para o usuário
  const { data: missoes = [], isLoading } = useQuery({
    queryKey: ['missoes-segmentadas', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Primeiro, verificar progresso das missões
      await supabase.rpc('verificar_progresso_missoes_segmentadas', {
        p_user_id: user.id
      });

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
        .not('criterios_segmentacao', 'eq', '{}')
        .order('tipo_missao')
        .order('recompensa_girinhas', { ascending: false });

      if (error) {
        console.error('Erro ao buscar missões segmentadas:', error);
        throw error;
      }

      // Verificar elegibilidade de cada missão
      const missoesElegiveis = [];
      
      for (const missao of data) {
        const { data: elegivel } = await supabase.rpc('usuario_elegivel_missao', {
          p_user_id: user.id,
          p_missao_id: missao.id
        });

        if (elegivel) {
          missoesElegiveis.push({
            ...missao,
            condicoes: missao.condicoes as { tipo: string; quantidade: number },
            progresso_atual: missao.missoes_usuarios?.[0]?.progresso_atual || 0,
            progresso_necessario: missao.missoes_usuarios?.[0]?.progresso_necessario || (missao.condicoes as any).quantidade,
            status: missao.missoes_usuarios?.[0]?.status || 'em_progresso',
            data_completada: missao.missoes_usuarios?.[0]?.data_completada,
            elegivel: true
          });
        }
      }

      return missoesElegiveis as MissaoSegmentada[];
    },
    enabled: !!user?.id
  });

  // Executar ação de missão
  const executarAcao = useMutation({
    mutationFn: async ({ missaoId, eventoId }: { missaoId: string; eventoId: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Registrar analytics
      await supabase.rpc('registrar_analytics_missao', {
        p_missao_id: missaoId,
        p_user_id: user.id,
        p_evento: 'acao_clicada',
        p_detalhes: { evento_id: eventoId }
      });

      // Buscar configuração do evento
      const { data: missao } = await supabase
        .from('missoes')
        .select('acoes_eventos')
        .eq('id', missaoId)
        .single();

      if (!missao?.acoes_eventos || !Array.isArray(missao.acoes_eventos)) return null;

      // Converter Json para EventoAcao[] com verificação de tipo
      const eventos = (missao.acoes_eventos as unknown[]).filter(
        (e): e is EventoAcao => 
          typeof e === 'object' && 
          e !== null && 
          'id' in e && 
          'tipo_evento' in e
      );

      const evento = eventos.find((e) => e.id === eventoId);
      return evento || null;
    },
    onSuccess: (evento) => {
      if (!evento) return;

      // Executar ação baseada no tipo
      switch (evento.tipo_evento) {
        case 'navigate_to_page':
          if (evento.parametros.url) {
            window.location.href = evento.parametros.url;
          }
          break;
          
        case 'external_link':
          if (evento.parametros.url) {
            window.open(evento.parametros.url, '_blank');
          }
          break;
          
        case 'trigger_notification':
          toast({
            title: evento.parametros.titulo || 'Notificação',
            description: evento.parametros.mensagem,
          });
          break;
          
        case 'open_modal':
          // Implementar modal personalizado conforme necessário
          toast({
            title: evento.parametros.titulo || 'Modal',
            description: evento.parametros.conteudo,
          });
          break;
      }
    }
  });

  // Coletar recompensa com analytics
  const coletarRecompensaSegmentada = useMutation({
    mutationFn: async (missaoId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Registrar analytics antes da coleta
      await supabase.rpc('registrar_analytics_missao', {
        p_missao_id: missaoId,
        p_user_id: user.id,
        p_evento: 'tentativa_coleta'
      });

      const { data, error } = await supabase.rpc('coletar_recompensa_missao', {
        p_user_id: user.id,
        p_missao_id: missaoId
      });

      if (error) throw error;
      
      // Converter Json para ResultadoColeta com verificação de tipo mais robusta
      if (
        data && 
        typeof data === 'object' && 
        data !== null && 
        'sucesso' in data && 
        'girinhas_recebidas' in data &&
        typeof (data as any).sucesso === 'boolean' &&
        typeof (data as any).girinhas_recebidas === 'number'
      ) {
        return data as unknown as ResultadoColeta;
      }
      
      throw new Error('Resposta inválida do servidor');
    },
    onSuccess: (data, missaoId) => {
      if (data.sucesso) {
        // Registrar analytics de sucesso
        supabase.rpc('registrar_analytics_missao', {
          p_missao_id: missaoId,
          p_user_id: user!.id,
          p_evento: 'recompensa_coletada',
          p_detalhes: { girinhas_recebidas: data.girinhas_recebidas }
        });

        toast({
          title: "🎉 Recompensa coletada!",
          description: `Você recebeu ${data.girinhas_recebidas} Girinhas`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['missoes-segmentadas'] });
        queryClient.invalidateQueries({ queryKey: ['carteira'] });
      }
    }
  });

  // Estatísticas
  const missoesCompletas = missoes.filter(m => m.status === 'completa').length;
  const missoesColetadas = missoes.filter(m => m.status === 'coletada').length;
  const totalGirinhasDisponiveis = missoes
    .filter(m => m.status === 'completa')
    .reduce((total, m) => total + m.recompensa_girinhas, 0);

  return {
    missoes,
    isLoading,
    executarAcao,
    coletarRecompensaSegmentada,
    missoesCompletas,
    missoesColetadas,
    totalGirinhasDisponiveis
  };
};
