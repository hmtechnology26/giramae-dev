import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  KPIsGlobais, 
  ProgramaListItem, 
  EvolucaoTemporal, 
  AlertaCritico,
  FiltrosDashboard 
} from '@/types/parcerias';

export function useDashboardGlobal() {
  const [filtros, setFiltros] = useState<FiltrosDashboard>({
    cidade: undefined,
    estado: undefined,
    organizacao: undefined,
  });

  // Query: KPIs Consolidados
  const { data: kpis, isLoading: loadingKPIs } = useQuery({
    queryKey: ['parcerias-kpis-global', filtros],
    queryFn: async (): Promise<KPIsGlobais> => {
      // Buscar organizações ativas
      const { count: totalOrganizacoes } = await supabase
        .from('parcerias_organizacoes')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Buscar programas ativos
      const { count: totalProgramas } = await supabase
        .from('parcerias_programas')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);

      // Buscar beneficiários aprovados
      const { count: totalBeneficiarios } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aprovado')
        .eq('ativo', true);

      // Buscar validações pendentes
      const { count: validacoesPendentes } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente')
        .eq('ativo', true);

      // Buscar créditos do mês atual
      const mesAtual = new Date().toISOString().slice(0, 7);
      const { data: creditosMes } = await supabase
        .from('parcerias_historico_creditos')
        .select('valor_creditado')
        .eq('mes_referencia', mesAtual);

      const girinhasMesAtual = creditosMes?.reduce((sum, c) => sum + c.valor_creditado, 0) || 0;

      // Buscar total de créditos histórico
      const { data: creditosTotal } = await supabase
        .from('parcerias_historico_creditos')
        .select('valor_creditado');

      const girinhasTotal = creditosTotal?.reduce((sum, c) => sum + c.valor_creditado, 0) || 0;

      return {
        total_organizacoes: totalOrganizacoes || 0,
        total_programas: totalProgramas || 0,
        total_beneficiarios: totalBeneficiarios || 0,
        validacoes_pendentes: validacoesPendentes || 0,
        girinhas_mes_atual: girinhasMesAtual,
        girinhas_total: girinhasTotal,
      };
    },
    staleTime: 30000, // 30 segundos
  });

  // Query: Lista de Programas
  const { data: programas, isLoading: loadingProgramas } = useQuery({
    queryKey: ['parcerias-programas-lista', filtros],
    queryFn: async (): Promise<ProgramaListItem[]> => {
      let query = supabase
        .from('parcerias_programas')
        .select(`
          id,
          nome,
          ativo,
          parcerias_organizacoes (
            nome,
            cidade,
            estado
          )
        `)
        .eq('ativo', true);

      const { data: programasData, error } = await query;

      if (error) throw error;
      if (!programasData) return [];

      // Para cada programa, buscar métricas
      const programasComMetricas = await Promise.all(
        programasData.map(async (programa) => {
          // Contar beneficiários
          const { count: totalBeneficiarios } = await supabase
            .from('parcerias_usuarios_validacao')
            .select('*', { count: 'exact', head: true })
            .eq('programa_id', programa.id)
            .eq('status', 'aprovado')
            .eq('ativo', true);

          // Contar validações pendentes
          const { count: validacoesPendentes } = await supabase
            .from('parcerias_usuarios_validacao')
            .select('*', { count: 'exact', head: true })
            .eq('programa_id', programa.id)
            .eq('status', 'pendente')
            .eq('ativo', true);

          // Buscar créditos do mês
          const mesAtual = new Date().toISOString().slice(0, 7);
          const { data: creditosMes } = await supabase
            .from('parcerias_historico_creditos')
            .select('valor_creditado')
            .eq('programa_id', programa.id)
            .eq('mes_referencia', mesAtual);

          const creditosMesTotal = creditosMes?.reduce((sum, c) => sum + c.valor_creditado, 0) || 0;

          return {
            id: programa.id,
            nome: programa.nome,
            organizacao_nome: programa.parcerias_organizacoes?.nome || '',
            cidade: programa.parcerias_organizacoes?.cidade || '',
            estado: programa.parcerias_organizacoes?.estado || '',
            total_beneficiarios: totalBeneficiarios || 0,
            validacoes_pendentes: validacoesPendentes || 0,
            creditos_mes: creditosMesTotal,
            status: programa.ativo ? 'ativo' as const : 'inativo' as const,
          };
        })
      );

      return programasComMetricas;
    },
  });

  // Query: Evolução Temporal
  const { data: evolucao } = useQuery({
    queryKey: ['parcerias-evolucao-temporal'],
    queryFn: async (): Promise<EvolucaoTemporal[]> => {
      const { data, error } = await supabase
        .from('parcerias_historico_creditos')
        .select('mes_referencia, valor_creditado')
        .order('mes_referencia', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      // Agrupar por mês
      const porMes = data.reduce((acc, item) => {
        if (!acc[item.mes_referencia]) {
          acc[item.mes_referencia] = {
            mes: item.mes_referencia,
            novos_beneficiarios: 0,
            creditos_distribuidos: 0,
          };
        }
        acc[item.mes_referencia].creditos_distribuidos += item.valor_creditado;
        acc[item.mes_referencia].novos_beneficiarios += 1;
        return acc;
      }, {} as Record<string, EvolucaoTemporal>);

      return Object.values(porMes);
    },
  });

  // Query: Alertas Críticos
  const { data: alertas } = useQuery({
    queryKey: ['parcerias-alertas-criticos'],
    queryFn: async (): Promise<AlertaCritico[]> => {
      const alertasArray: AlertaCritico[] = [];

      // Alerta: Validações pendentes há mais de 7 dias
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      const { data: validacoesAntigas } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('programa_id, parcerias_programas(nome)')
        .eq('status', 'pendente')
        .eq('ativo', true)
        .lt('data_solicitacao', seteDiasAtras.toISOString());

      validacoesAntigas?.forEach((v: any) => {
        alertasArray.push({
          tipo: 'validacoes_pendentes',
          titulo: 'Validações pendentes há mais de 7 dias',
          descricao: `Programa: ${v.parcerias_programas?.nome}`,
          programa_id: v.programa_id,
          programa_nome: v.parcerias_programas?.nome,
          prioridade: 'alta',
          data: new Date().toISOString(),
        });
      });

      return alertasArray;
    },
    refetchInterval: 60000, // Refetch a cada 1 minuto
  });

  return {
    kpis,
    programas: programas || [],
    evolucao: evolucao || [],
    alertas: alertas || [],
    loading: loadingKPIs || loadingProgramas,
    filtros,
    setFiltros,
  };
}
