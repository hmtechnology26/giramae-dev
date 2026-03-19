
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TamanhoItem {
  id: string;
  categoria: string;
  subcategoria?: string;
  tipo_tamanho: string;
  valor: string;
  label_display: string;
  idade_minima_meses?: number;
  idade_maxima_meses?: number;
  ordem: number;
  ativo: boolean;
}

export const useTiposTamanho = (categoria?: string) => {
  const queryResult = useQuery({
    queryKey: ['tipos-tamanho', categoria],
    queryFn: async () => {
      console.log('🔍 Buscando tamanhos para categoria:', categoria);

      let query = supabase
        .from('categorias_tamanhos')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar tamanhos:', error);
        throw error;
      }

      console.log('✅ Tamanhos encontrados:', data?.length || 0);

      // Agrupar por tipo_tamanho
      const tiposTamanho: Record<string, TamanhoItem[]> = {};
      
      data?.forEach(item => {
        if (!tiposTamanho[item.tipo_tamanho]) {
          tiposTamanho[item.tipo_tamanho] = [];
        }
        tiposTamanho[item.tipo_tamanho].push(item);
      });

      return tiposTamanho;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });

  return {
    ...queryResult,
    tiposTamanho: queryResult.data || {}
  };
};
