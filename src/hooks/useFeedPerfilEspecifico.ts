// src/hooks/useFeedPerfilEspecifico.ts - Hook específico para perfil

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FiltrosPerfil {
  busca?: string;
  categoria?: string;
  subcategoria?: string;
  genero?: string;
  tamanho?: string;
  precoMin?: number;
  precoMax?: number;
  mostrarReservados?: boolean;
  targetUserId?: string;
}

interface PaginaPerfil {
  itens: any[];
  favoritos: string[];
  reservas_usuario: any[];
  filas_espera: Record<string, any>;
  configuracoes?: {
    categorias: any[];
    subcategorias: any[];
  };
  profile_essencial?: any;
  has_more: boolean;
  total_count: number;
}

export const useFeedPerfilEspecifico = (userId: string, filtros: FiltrosPerfil = {}) => {
  return useInfiniteQuery({
    queryKey: ['feed-perfil-especifico', userId, filtros],
    queryFn: async ({ pageParam = 0 }) => {
      if (!filtros.targetUserId) {
        throw new Error('targetUserId é obrigatório');
      }

      console.log('🔄 Carregando página do perfil:', pageParam, 'Filtros:', filtros);
      
      const { data, error } = await supabase.rpc(
        'carregar_itens_usuario_especifico' as any,
        {
          p_user_id: userId,
          p_target_user_id: filtros.targetUserId,
          p_page: pageParam,
          p_limit: 20,
          p_busca: filtros.busca || '',
          p_categoria: filtros.categoria || 'todas',
          p_subcategoria: filtros.subcategoria || 'todas',
          p_genero: filtros.genero || 'todos',
          p_tamanho: filtros.tamanho || 'todos',
          p_preco_min: filtros.precoMin || 0,
          p_preco_max: filtros.precoMax || 200,
          p_mostrar_reservados: filtros.mostrarReservados ?? true
        }
      );
      
      if (error) {
        console.error('❌ Erro ao carregar perfil:', error);
        throw error;
      }
      
      const result = data as unknown as PaginaPerfil;
      console.log('✅ Perfil carregado:', result.itens.length, 'itens, has_more:', result.has_more);
      
      return result;
    },
    initialPageParam: 0,
    enabled: !!userId && !!filtros.targetUserId,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.has_more ? allPages.length : undefined;
    },
    staleTime: 60000, // 1 minuto
    gcTime: 300000, // 5 minutos
  });
};
