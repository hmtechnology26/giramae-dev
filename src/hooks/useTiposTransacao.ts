
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TipoTransacaoConfig, TipoTransacaoEnum } from '@/types/transacao.types';

export const useTiposTransacao = () => {
  const { data: configCompleta, isLoading: loadingConfig } = useQuery({
    queryKey: ['transacao-config'],
    queryFn: async (): Promise<TipoTransacaoConfig[]> => {
      const { data, error } = await supabase
        .from('transacao_config')
        .select('*')
        .eq('ativo', true)
        .order('categoria')
        .order('ordem_exibicao');
      
      if (error) throw error;
      return (data || []).map(item => ({
        tipo: item.tipo as TipoTransacaoEnum,
        sinal: item.sinal as -1 | 1,
        validade_dias: item.validade_dias,
        valor_padrao: item.valor_padrao,
        descricao_pt: item.descricao_pt,
        categoria: item.categoria,
        ativo: item.ativo,
        ordem_exibicao: item.ordem_exibicao,
        icone: item.icone,
        cor_hex: item.cor_hex,
        config: typeof item.config === 'object' && item.config !== null ? item.config as Record<string, any> : {},
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const obterConfigTipo = (tipo: string): TipoTransacaoConfig | undefined => {
    return configCompleta?.find(config => config.tipo === tipo);
  };

  const ehCredito = (tipo: string): boolean => {
    const config = obterConfigTipo(tipo);
    return config?.sinal === 1;
  };

  const ehDebito = (tipo: string): boolean => {
    const config = obterConfigTipo(tipo);
    return config?.sinal === -1;
  };

  return {
    configCompleta: configCompleta || [],
    obterConfigTipo,
    ehCredito,
    ehDebito,
    isLoading: loadingConfig
  };
};
