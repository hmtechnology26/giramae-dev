import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ItemCompletoModerado {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  valor_girinhas: number;
  status: string;
  fotos?: string[];
  created_at: string;
  publicado_por: string;
  // Campos de moderação
  moderacao_status?: string;
  aguardando_moderacao?: boolean;
  // Campos do vendedor
  vendedor_nome?: string;
  vendedor_avatar?: string;
  vendedor_cidade?: string;
  vendedor_estado?: string;
}

export const useItensOptimizedModerado = (categoria?: string, limite: number = 20) => {
  return useQuery({
    queryKey: ['itens-moderados', categoria, limite],
    queryFn: async (): Promise<ItemCompletoModerado[]> => {
      console.log('🔍 Buscando itens com moderação otimizada - categoria:', categoria, 'limite:', limite);
      
      try {
        // ✅ ETAPA 3: Usar função RPC que considera moderação
        const { data, error } = await supabase
          .rpc('buscar_itens_com_moderacao', {
            p_categoria: categoria || null,
            p_limite: limite,
            p_offset: 0,
            p_user_id: null
          });

        if (error) {
          console.error('❌ Erro ao buscar itens moderados:', error);
          throw error;
        }

        console.log('✅ Itens moderados encontrados:', data?.length || 0);
        
        // Mapeamento para garantir compatibilidade
        const itensFormatados = (data || []).map(item => ({
          id: item.id,
          titulo: item.titulo,
          descricao: item.descricao,
          categoria: item.categoria,
          subcategoria: item.subcategoria,
          valor_girinhas: item.valor_girinhas,
          status: item.status,
          fotos: item.fotos,
          created_at: item.created_at,
          publicado_por: item.publicado_por,
          moderacao_status: item.moderacao_status,
          aguardando_moderacao: item.aguardando_moderacao,
          vendedor_nome: item.vendedor_nome,
          vendedor_avatar: item.vendedor_avatar,
          vendedor_cidade: item.vendedor_cidade,
          vendedor_estado: item.vendedor_estado
        }));

        return itensFormatados;
      } catch (error) {
        console.error('❌ Erro na busca de itens moderados:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    enabled: true
  });
};

// Hook específico para feed principal (apenas itens disponíveis e aprovados)
export const useItensFeedModerado = (limite: number = 20) => {
  return useQuery({
    queryKey: ['feed-moderado', limite],
    queryFn: async (): Promise<ItemCompletoModerado[]> => {
      console.log('🔍 Carregando feed com moderação - limite:', limite);
      
      try {
        // Usar tabela itens diretamente
        const { data, error } = await supabase
          .from('itens')
          .select(`
            id,
            titulo,
            descricao,
            categoria,
            subcategoria,
            valor_girinhas,
            status,
            fotos,
            created_at,
            publicado_por
          `)
          .eq('status', 'disponivel')
          .order('created_at', { ascending: false })
          .limit(limite);

        if (error) {
          console.error('❌ Erro ao carregar feed moderado:', error);
          throw error;
        }

        console.log('✅ Feed moderado carregado:', data?.length || 0, 'itens');
        return data || [];
      } catch (error) {
        console.error('❌ Erro no feed moderado:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 3, // 3 minutos (feed precisa ser mais atualizado)
    refetchOnWindowFocus: true,
    enabled: true
  });
};

// Hook para admins verem todos os itens (incluindo rejeitados)
export const useItensAdminModerado = (limite: number = 50) => {
  return useQuery({
    queryKey: ['admin-itens-moderados', limite],
    queryFn: async () => {
      console.log('🔍 Admin carregando todos os itens - limite:', limite);
      
      try {
        const { data, error } = await supabase
          .rpc('admin_buscar_todos_itens', {
            p_limite: limite,
            p_offset: 0
          });

        if (error) {
          console.error('❌ Erro admin ao buscar itens:', error);
          throw error;
        }

        console.log('✅ Admin - todos os itens carregados:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('❌ Erro admin na busca de itens:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutos (admin precisa ver dados atualizados)
    refetchOnWindowFocus: true,
    enabled: true
  });
};