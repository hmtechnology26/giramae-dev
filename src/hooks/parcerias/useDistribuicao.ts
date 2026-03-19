import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDistribuicao(programaId: string) {
  // Query: Histórico de Distribuição por Mês
  const { data: historicoMensal = [], isLoading: loadingHistorico } = useQuery({
    queryKey: ['parcerias-historico-mensal', programaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parcerias_historico_creditos')
        .select('*')
        .eq('programa_id', programaId)
        .order('mes_referencia', { ascending: false });

      if (error) throw error;

      // Agrupar por mês
      const agrupado = data.reduce((acc: any, item: any) => {
        const mes = item.mes_referencia;
        if (!acc[mes]) {
          acc[mes] = {
            mes_referencia: mes,
            total_beneficiarios: 0,
            total_girinhas: 0,
            data_processamento: item.data_creditacao,
            status: 'processado'
          };
        }
        acc[mes].total_beneficiarios += 1;
        acc[mes].total_girinhas += item.valor_creditado;
        return acc;
      }, {});

      return Object.values(agrupado);
    },
    enabled: !!programaId
  });

  // Query: Logs de Processamento
  const { data: logsProcessamento = [] } = useQuery({
    queryKey: ['parcerias-logs-processamento', programaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parcerias_logs_processamento')
        .select('*')
        .eq('programa_id', programaId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!programaId
  });

  // Query: Detalhes de um Mês Específico
  const getDetalhesMes = async (mesReferencia: string) => {
    const { data, error } = await supabase
      .from('parcerias_historico_creditos')
      .select(`
        *,
        profiles!parcerias_historico_creditos_user_id_fkey (
          nome,
          email
        )
      `)
      .eq('programa_id', programaId)
      .eq('mes_referencia', mesReferencia)
      .order('data_creditacao', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Dados para o gráfico (últimos 12 meses)
  const dadosGrafico = historicoMensal.slice(0, 12).reverse().map((item: any) => ({
    mes: new Date(item.mes_referencia).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    girinhas: item.total_girinhas
  }));

  return {
    historicoMensal,
    logsProcessamento,
    dadosGrafico,
    loading: loadingHistorico,
    getDetalhesMes
  };
}
