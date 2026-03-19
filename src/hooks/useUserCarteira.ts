import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CarteiraData {
  saldo_atual: number;
  total_recebido: number;
  total_gasto: number;
}

export const useUserCarteira = (userId: string | null) => {
  return useQuery({
    queryKey: ['carteira', userId],
    queryFn: async (): Promise<CarteiraData | null> => {
      if (!userId) return null;

      // Usar view ledger_carteiras
      const { data, error } = await (supabase as any)
        .from('ledger_carteiras')
        .select('saldo_atual, total_recebido, total_gasto')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar carteira do usuário:', error);
        return null;
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};