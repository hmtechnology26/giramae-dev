
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useCommonSchool = (itemOwnerUserId: string) => {
  const { user } = useAuth();

  const { data: hasCommonSchool = false } = useQuery({
    queryKey: ['common-school', user?.id, itemOwnerUserId],
    queryFn: async () => {
      if (!user?.id || user.id === itemOwnerUserId) {
        return false;
      }

      // Buscar escolas dos filhos do usuário atual
      const { data: minhasEscolas } = await supabase
        .from('filhos')
        .select('escola_id')
        .eq('mae_id', user.id)
        .not('escola_id', 'is', null);

      // Buscar escolas dos filhos do dono do item
      const { data: escolasDoItem } = await supabase
        .from('filhos')
        .select('escola_id')
        .eq('mae_id', itemOwnerUserId)
        .not('escola_id', 'is', null);

      if (!minhasEscolas?.length || !escolasDoItem?.length) {
        return false;
      }

      const minhasEscolasIds = minhasEscolas.map(f => f.escola_id);
      const escolasDoItemIds = escolasDoItem.map(f => f.escola_id);

      // Verificar se há interseção
      return minhasEscolasIds.some(id => escolasDoItemIds.includes(id));
    },
    enabled: !!user?.id && !!itemOwnerUserId && user.id !== itemOwnerUserId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return { hasCommonSchool };
};
