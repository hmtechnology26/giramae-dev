
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConfigMercadoPago {
  usarAmbienteTeste: boolean;
}

export const useConfigMercadoPago = () => {
  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ['config-mercadopago'],
    queryFn: async (): Promise<ConfigMercadoPago> => {
      const { data, error } = await supabase
        .from('config_sistema')
        .select('valor')
        .eq('chave', 'mercadopago_ambiente_teste')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Se não existe configuração, assume teste como padrão
      const valorConfig = data?.valor as { ativo?: boolean } | null;
      const usarAmbienteTeste = valorConfig?.ativo ?? true;

      return {
        usarAmbienteTeste
      };
    },
    staleTime: 60000, // 1 minuto
    refetchInterval: 300000, // 5 minutos
  });

  return {
    config: config || { usarAmbienteTeste: true },
    isLoadingConfig: isLoading,
    refetchConfig: refetch,
  };
};
