
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SchoolStats {
  [codigo_inep: number]: number;
}

export const useSchoolStats = () => {
  const [schoolStats, setSchoolStats] = useState<SchoolStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticasEscolas();
  }, []);

  const carregarEstatisticasEscolas = async () => {
    try {
      // Buscar quantidade de mães por escola
      const { data, error } = await supabase
        .from('filhos')
        .select('escola_id, mae_id')
        .not('escola_id', 'is', null);

      if (error) throw error;

      // Contar mães únicas por escola usando Map para Sets temporários
      const tempStats: { [key: number]: Set<string> } = {};
      data?.forEach(filho => {
        if (filho.escola_id) {
          if (!tempStats[filho.escola_id]) {
            tempStats[filho.escola_id] = new Set();
          }
          tempStats[filho.escola_id].add(filho.mae_id);
        }
      });

      // Converter Sets para contadores
      const finalStats: SchoolStats = {};
      Object.keys(tempStats).forEach(escolaId => {
        const escolaIdNum = parseInt(escolaId);
        finalStats[escolaIdNum] = tempStats[escolaIdNum].size;
      });

      setSchoolStats(finalStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas das escolas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaesNaEscola = (codigoInep: number): number => {
    return schoolStats[codigoInep] || 0;
  };

  return {
    schoolStats,
    loading,
    getMaesNaEscola,
    refetch: carregarEstatisticasEscolas
  };
};
