
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface UseItensProximosParams {
  location?: { estado: string; cidade: string; bairro?: string } | null;
  filters?: {
    mesmaEscola?: boolean;
    mesmoBairro?: boolean;
    paraFilhos?: boolean;
    categoria?: string;
    ordem?: string;
  };
}

export const useItensProximos = ({ location, filters = {} }: UseItensProximosParams) => {
  const { user } = useAuth();
  const { profile } = useProfile();

  return useQuery({
    queryKey: ['itens-proximos', location, filters],
    queryFn: async () => {
      let query = supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!publicado_por(nome, bairro, cidade, avatar_url, reputacao)
        `)
        .eq('status', 'disponivel')
        .neq('publicado_por', user?.id || '');

      // FILTRO 1: Categoria
      if (filters.categoria && filters.categoria !== 'todas') {
        query = query.eq('categoria', filters.categoria);
      }

      // FILTRO 2: Mesmo bairro (quando selecionado)
      if (filters.mesmoBairro && profile?.bairro) {
        // Buscar primeiro os IDs dos usuários do mesmo bairro
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id')
          .eq('bairro', profile.bairro);

        const userIds = profilesData?.map(p => p.id) || [];
        
        if (userIds.length > 0) {
          query = query.in('publicado_por', userIds);
        } else {
          return [];
        }
      } else if (location?.cidade || profile?.cidade) {
        // FILTRO 3: Localização por cidade
        const cidadeAlvo = location?.cidade || profile?.cidade;
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id')
          .eq('cidade', cidadeAlvo);

        const userIds = profilesData?.map(p => p.id) || [];
        
        if (userIds.length > 0) {
          query = query.in('publicado_por', userIds);
        } else {
          return [];
        }
      }

      // FILTRO 4: Para os meus filhos (tamanhos compatíveis)
      if (filters.paraFilhos) {
        const { data: filhos } = await supabase
          .from('filhos')
          .select('tamanho_roupas, tamanho_calcados')
          .eq('mae_id', user?.id || '');

        const tamanhos = filhos?.flatMap(f => [
          f.tamanho_roupas,
          f.tamanho_calcados
        ]).filter(Boolean);

        if (tamanhos && tamanhos.length > 0) {
          query = query.in('tamanho_valor', tamanhos);
        }
      }

      // Ordenação
      switch (filters.ordem) {
        case 'menor-preco':
          query = query.order('valor_girinhas', { ascending: true });
          break;
        case 'maior-preco':
          query = query.order('valor_girinhas', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};
