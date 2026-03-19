
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MetricasSaude {
  cotacao_implicita: number;
  burn_rate: number;
  velocity: number;
  burn_por_mae_ativa: number;
  itens_no_teto: number;
  concentracao_saldo: number;
  dados_brutos: {
    reais_entrados_30d: number;
    girinhas_vivas: number;
    girinhas_queimadas_30d: number;
    girinhas_emitidas_30d: number;
    girinhas_trocadas_30d: number;
    maes_ativas_30d: number;
  };
}

export const useMetricasSaude = () => {
  const { 
    data: metricas, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['metricas-saude'],
    queryFn: async (): Promise<MetricasSaude> => {
      const { data, error } = await supabase.rpc('calcular_metricas_saude');
      if (error) throw error;
      return data as unknown as MetricasSaude;
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // 1 minuto
  });

  // Função para determinar status de saúde
  const getStatusSaude = (metrica: string, valor: number) => {
    switch (metrica) {
      case 'cotacao_implicita':
        if (valor >= 0.90 && valor <= 1.10) return 'saudavel';
        if (valor >= 0.85 && valor <= 1.15) return 'alerta';
        return 'critico';
      
      case 'burn_rate':
        if (valor >= 4 && valor <= 7) return 'saudavel';
        if (valor >= 3 && valor <= 10) return 'alerta';
        return 'critico';
      
      case 'velocity':
        if (valor >= 0.30 && valor <= 0.60) return 'saudavel';
        if (valor >= 0.20 && valor <= 0.80) return 'alerta';
        return 'critico';
      
      case 'burnPorMaeAtiva':
        return 'saudavel'; // Para MVP, sempre considerar saudável
      
      case 'itens_no_teto':
        if (valor <= 40) return 'saudavel';
        if (valor <= 50) return 'alerta';
        return 'critico';
      
      case 'concentracao_saldo':
        if (valor <= 25) return 'saudavel';
        if (valor <= 30) return 'alerta';
        return 'critico';
      
      default:
        return 'saudavel';
    }
  };

  return {
    metricas,
    isLoading,
    error,
    refetch,
    getStatusSaude,
  };
};
