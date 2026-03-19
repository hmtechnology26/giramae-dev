
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FilaInfo {
  total_fila: number;
  posicao_usuario: number;
}

export const useFilaEspera = () => {
  const [filasPorItem, setFilasPorItem] = useState<Record<string, FilaInfo>>({});
  const [loading, setLoading] = useState(false);

  const obterFilaItem = async (itemId: string): Promise<FilaInfo> => {
    try {
      const { data, error } = await supabase
        .rpc('obter_fila_espera', { p_item_id: itemId });

      if (error) throw error;

      const filaInfo = data?.[0] || { total_fila: 0, posicao_usuario: 0 };
      
      // Atualizar cache
      setFilasPorItem(prev => ({
        ...prev,
        [itemId]: filaInfo
      }));

      return filaInfo;
    } catch (error) {
      console.error('Erro ao buscar fila de espera:', error);
      return { total_fila: 0, posicao_usuario: 0 };
    }
  };

  const obterFilasMultiplos = async (itemIds: string[]): Promise<void> => {
    if (itemIds.length === 0) return;

    setLoading(true);
    try {
      const promises = itemIds.map(itemId => obterFilaItem(itemId));
      await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao buscar filas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilaInfo = (itemId: string): FilaInfo => {
    return filasPorItem[itemId] || { total_fila: 0, posicao_usuario: 0 };
  };

  return {
    obterFilaItem,
    obterFilasMultiplos,
    getFilaInfo,
    loading
  };
};
