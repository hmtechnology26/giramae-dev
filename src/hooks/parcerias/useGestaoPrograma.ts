import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Programa, MetricasPrograma } from '@/types/parcerias';

export function useGestaoPrograma(programaId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query: Dados do Programa
  const { data: programa, isLoading } = useQuery({
    queryKey: ['programa-detalhes', programaId],
    queryFn: async (): Promise<Programa> => {
      const { data, error } = await supabase
        .from('parcerias_programas')
        .select(`
          *,
          parcerias_organizacoes (*)
        `)
        .eq('id', programaId)
        .single();
      
      if (error) throw error;
      return data as Programa;
    },
    enabled: !!programaId,
  });

  // Query: Métricas do Programa
  const { data: metricas } = useQuery({
    queryKey: ['programa-metricas', programaId],
    queryFn: async (): Promise<MetricasPrograma> => {
      // Total de beneficiários aprovados
      const { count: totalAprovados } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('*', { count: 'exact', head: true })
        .eq('programa_id', programaId)
        .eq('status', 'aprovado')
        .eq('ativo', true);

      // Validações pendentes
      const { count: validacoesPendentes } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('*', { count: 'exact', head: true })
        .eq('programa_id', programaId)
        .eq('status', 'pendente')
        .eq('ativo', true);

      // Créditos mês atual
      const mesAtual = new Date().toISOString().slice(0, 7);
      const { data: creditosMes } = await supabase
        .from('parcerias_historico_creditos')
        .select('valor_creditado')
        .eq('programa_id', programaId)
        .eq('mes_referencia', mesAtual);

      const creditosMesAtual = creditosMes?.reduce((sum, c) => sum + c.valor_creditado, 0) || 0;

      // Créditos total
      const { data: creditosTotal } = await supabase
        .from('parcerias_historico_creditos')
        .select('valor_creditado')
        .eq('programa_id', programaId);

      const creditosTotalValor = creditosTotal?.reduce((sum, c) => sum + c.valor_creditado, 0) || 0;

      // Taxa de aprovação
      const { count: totalValidacoes } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('*', { count: 'exact', head: true })
        .eq('programa_id', programaId)
        .eq('ativo', true);

      const taxaAprovacao = totalValidacoes ? ((totalAprovados || 0) / totalValidacoes) * 100 : 0;

      // Novos beneficiários do mês
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const { count: novosMes } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('*', { count: 'exact', head: true })
        .eq('programa_id', programaId)
        .eq('status', 'aprovado')
        .eq('ativo', true)
        .gte('data_validacao', inicioMes.toISOString());

      return {
        total_beneficiarios_aprovados: totalAprovados || 0,
        validacoes_pendentes: validacoesPendentes || 0,
        creditos_mes_atual: creditosMesAtual,
        creditos_total: creditosTotalValor,
        taxa_aprovacao: taxaAprovacao,
        novos_beneficiarios_mes: novosMes || 0,
      };
    },
    enabled: !!programaId,
  });

  // Mutation: Atualizar Programa
  const updateProgramaMutation = useMutation({
    mutationFn: async (config: Partial<Programa>) => {
      const { data, error } = await supabase
        .from('parcerias_programas')
        .update(config)
        .eq('id', programaId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programa-detalhes', programaId] });
      toast({
        title: "Programa atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar programa",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation: Atualizar Organização
  const updateOrganizacaoMutation = useMutation({
    mutationFn: async ({ organizacaoId, data }: { organizacaoId: string; data: any }) => {
      const { data: result, error } = await supabase
        .from('parcerias_organizacoes')
        .update(data)
        .eq('id', organizacaoId)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programa-detalhes', programaId] });
      toast({
        title: "Organização atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar organização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    programa,
    metricas,
    loading: isLoading,
    updatePrograma: updateProgramaMutation.mutate,
    updateOrganizacao: updateOrganizacaoMutation.mutate,
  };
}
