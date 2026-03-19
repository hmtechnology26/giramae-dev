import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConfigSistema {
  taxa_transferencia: { percentual: number };
  taxa_transacao: { percentual: number };
  validade_girinhas: { meses: number };
  queima_por_transacao: { quantidade: number };
  preco_manual_girinhas: { valor: number };
  compra_girinhas_min: { quantidade: number };
  compra_girinhas_max: { quantidade: number };
}

export const useConfigSistema = () => {
  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ['config-sistema'],
    queryFn: async (): Promise<ConfigSistema> => {
      const { data, error } = await supabase
        .from('config_sistema')
        .select('chave, valor');

      if (error) throw error;

      // Converter array de configurações em objeto
      const configObj = data.reduce((acc, item) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {} as any);

      return {
        taxa_transferencia: configObj.taxa_transferencia || { percentual: 0.0 },
        taxa_transacao: configObj.taxa_transacao || { percentual: 0.0 },
        validade_girinhas: configObj.validade_girinhas || { meses: 12 },
        queima_por_transacao: configObj.queima_por_transacao || { quantidade: 0.0 },
        preco_manual_girinhas: configObj.preco_manual_girinhas || { valor: 1.00 },
        compra_girinhas_min: configObj.compra_girinhas_min || { quantidade: 1 },
        compra_girinhas_max: configObj.compra_girinhas_max || { quantidade: 999000 }
      };
    },
    staleTime: 60000, // 1 minuto
    refetchInterval: 300000, // 5 minutos
  });

  const taxaTransferencia = config?.taxa_transferencia?.percentual ?? 0.0;
  const taxaTransacao = config?.taxa_transacao?.percentual ?? 0.0;
  const precoManual = config?.preco_manual_girinhas?.valor || 1.00;
  const quantidadeMin = config?.compra_girinhas_min?.quantidade ?? 1;
  const quantidadeMax = config?.compra_girinhas_max?.quantidade ?? 999000;

  return {
    config,
    taxaTransferencia,
    taxaTransacao,
    precoManual,
    quantidadeMin,
    quantidadeMax,
    isLoadingConfig: isLoading,
    refetchConfig: refetch,
  };
};
