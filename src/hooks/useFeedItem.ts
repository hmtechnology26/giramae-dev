// src/hooks/useFeedItem.ts - ATUALIZADO

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PaginaFeed } from './useFeedInfinito';

/**
 * Hook específico para carregar um item individual usando a função otimizada.
 * Retorna todos os dados necessários para o ItemCard e tela de detalhes.
 * FONTE ÚNICA DE DADOS - não usar outros hooks na mesma tela.
 */
export const useFeedItem = (userId: string, itemId: string) => {
  return useQuery({
    queryKey: ['feed-item', userId, itemId],
    queryFn: async () => {
      console.log('🔄 Carregando item individual:', itemId);

      const { data, error } = await supabase.rpc(
        'carregar_dados_feed_paginado' as any,
        {
          p_user_id: userId,
          p_page: 0,
          p_limit: 1,
          p_busca: '',
          p_cidade: '',
          p_categoria: 'todas',
          p_subcategoria: 'todas', 
          p_genero: 'todos',
          p_tamanho: 'todos',
          p_preco_min: 0,
          p_preco_max: 200,
          p_mostrar_reservados: true,
          p_item_id: itemId, // Filtro específico por ID
          p_modalidade_logistica: 'todas' // ✅ NOVO parâmetro
        }
      );

      if (error) {
        console.error('❌ Erro ao carregar item:', error);
        throw error;
      }

      const result = data as unknown as PaginaFeed;
      console.log('✅ Item carregado com dados consolidados:', result);

      const item = result.itens[0] || null;

      return {
        item,
        // Dados consolidados do feed - FONTE ÚNICA
        favoritos: result.favoritos || [],
        reservas_usuario: result.reservas_usuario || [],
        filas_espera: result.filas_espera || {},
        configuracoes: result.configuracoes,
        profile_essencial: result.profile_essencial,
        // Saldo do usuário
        saldo_atual: result.profile_essencial?.saldo_atual || 0
      };
    },
    enabled: !!userId && !!itemId,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
  });
};
