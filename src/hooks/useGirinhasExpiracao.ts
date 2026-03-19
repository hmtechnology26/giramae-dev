
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GirinhasExpiracao {
  total_expirando_7_dias: number;
  total_expirando_30_dias: number;
  proxima_expiracao: string | null;
  detalhes_expiracao: Array<{
    valor: number;
    data_compra: string;
    data_expiracao: string;
    dias_restantes: number;
    tipo: string;
    descricao: string;
  }>;
}

export const useGirinhasExpiracao = () => {
  const { user } = useAuth();

  const {
    data: expiracao,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['girinhas-expiracao', user?.id],
    queryFn: async (): Promise<GirinhasExpiracao> => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 [useGirinhasExpiracao] Buscando dados de expiração para usuário:', user.id);

      // Temporariamente desabilitado - requer migração ledger
      const data = { total_valido: 0, total_expirando: 0, total_expirado: 0 };
      const error = null;

      if (error) {
        console.error('❌ Erro ao buscar expiração:', error);
        throw error;
      }

      const resultado = data?.[0] || {
        total_expirando_7_dias: 0,
        total_expirando_30_dias: 0,
        proxima_expiracao: null,
        detalhes_expiracao: []
      };

      console.log('✅ [useGirinhasExpiracao] Dados carregados:', resultado);

      // Processar detalhes_expiracao adequadamente
      let detalhesExpiracao: Array<{
        valor: number;
        data_compra: string;
        data_expiracao: string;
        dias_restantes: number;
        tipo: string;
        descricao: string;
      }> = [];

      if (resultado.detalhes_expiracao) {
        try {
          // Se é uma string JSON, fazer parse
          if (typeof resultado.detalhes_expiracao === 'string') {
            const parsed = JSON.parse(resultado.detalhes_expiracao);
            detalhesExpiracao = Array.isArray(parsed) ? parsed : [];
          } 
          // Se é um array (Json[]), converter cada item
          else if (Array.isArray(resultado.detalhes_expiracao)) {
            detalhesExpiracao = resultado.detalhes_expiracao.map((item: any) => ({
              valor: Number(item.valor || 0),
              data_compra: String(item.data_compra || ''),
              data_expiracao: String(item.data_expiracao || ''),
              dias_restantes: Number(item.dias_restantes || 0),
              tipo: String(item.tipo || ''),
              descricao: String(item.descricao || '')
            }));
          }
        } catch (parseError) {
          console.error('Erro ao processar detalhes_expiracao:', parseError);
          detalhesExpiracao = [];
        }
      }

      return {
        total_expirando_7_dias: Number(resultado.total_expirando_7_dias || 0),
        total_expirando_30_dias: Number(resultado.total_expirando_30_dias || 0),
        proxima_expiracao: resultado.proxima_expiracao,
        detalhes_expiracao: detalhesExpiracao
      };
    },
    enabled: !!user,
    // Cache muito menos agressivo para permitir atualizações
    staleTime: 0, // Sem cache stale
    gcTime: 1000 * 60 * 2, // 2 minutos apenas
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1
  });

  return {
    expiracao: expiracao || {
      total_expirando_7_dias: 0,
      total_expirando_30_dias: 0,
      proxima_expiracao: null,
      detalhes_expiracao: []
    },
    loading,
    error: error?.message || null,
    refetch
  };
};
