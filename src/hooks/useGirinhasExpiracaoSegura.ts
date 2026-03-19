
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GirinhasExpiracaoSegura {
  total_expirando_7_dias: number;
  total_expirando_30_dias: number;
  proxima_expiracao: string | null;
  detalhes_expiracao: Array<{
    transacao_id: string;
    valor: number;
    data_compra: string;
    data_expiracao: string;
    dias_restantes: number;
    tipo: string;
    descricao: string;
    ja_estendida: boolean;
    pode_estender: boolean;
  }>;
}

export const useGirinhasExpiracaoSegura = () => {
  const { user } = useAuth();

  const {
    data: expiracao,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['girinhas-expiracao-segura', user?.id],
    queryFn: async (): Promise<GirinhasExpiracaoSegura> => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 [useGirinhasExpiracaoSegura] Buscando dados seguros de expiração para usuário:', user.id);

      const { data, error } = await supabase.rpc('obter_girinhas_expiracao_seguro', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Erro ao buscar expiração segura:', error);
        throw error;
      }

      const resultado = data?.[0] || {
        total_expirando_7_dias: 0,
        total_expirando_30_dias: 0,
        proxima_expiracao: null,
        detalhes_expiracao: []
      };

      console.log('✅ [useGirinhasExpiracaoSegura] Dados seguros carregados:', resultado);

      // Processar detalhes_expiracao com dados de extensão
      let detalhesExpiracao: Array<{
        transacao_id: string;
        valor: number;
        data_compra: string;
        data_expiracao: string;
        dias_restantes: number;
        tipo: string;
        descricao: string;
        ja_estendida: boolean;
        pode_estender: boolean;
      }> = [];

      if (resultado.detalhes_expiracao) {
        try {
          if (typeof resultado.detalhes_expiracao === 'string') {
            const parsed = JSON.parse(resultado.detalhes_expiracao);
            detalhesExpiracao = Array.isArray(parsed) ? parsed : [];
          } 
          else if (Array.isArray(resultado.detalhes_expiracao)) {
            detalhesExpiracao = resultado.detalhes_expiracao.map((item: any) => ({
              transacao_id: String(item.transacao_id || ''),
              valor: Number(item.valor || 0),
              data_compra: String(item.data_compra || ''),
              data_expiracao: String(item.data_expiracao || ''),
              dias_restantes: Number(item.dias_restantes || 0),
              tipo: String(item.tipo || ''),
              descricao: String(item.descricao || ''),
              ja_estendida: Boolean(item.ja_estendida || false),
              pode_estender: Boolean(item.pode_estender || false)
            }));
          }
        } catch (parseError) {
          console.error('Erro ao processar detalhes_expiracao seguros:', parseError);
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
    staleTime: 0, // Sem cache stale para dados sempre atualizados
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
