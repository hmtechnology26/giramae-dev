import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  nome: string;
  username: string;
  email?: string;
  telefone?: string;
  avatar_url?: string;
  cidade?: string;
  estado?: string;
  created_at: string;
  ultima_atividade?: string;
}

interface UserStats {
  total_itens_publicados: number;
  total_vendas_realizadas: number;
  total_compras_girinhas: number;
  saldo_atual: number;
  cadastro_completo: boolean;
}

export const useUserProfileAdmin = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Buscar estatísticas do usuário usando views ledger
        const [
          { count: totalItens },
          { count: totalVendas },
          { data: carteira },
          { data: comprasGirinhas }
        ] = await Promise.all([
          // Total de itens publicados
          supabase
            .from('itens')
            .select('*', { count: 'exact', head: true })
            .eq('publicado_por', userId),
          
          // Total de vendas realizadas (reservas confirmadas onde o usuário é o vendedor)
          supabase
            .from('reservas')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_item', userId)
            .eq('status', 'confirmada'),
          
          // Saldo atual usando view ledger
          (supabase as any)
            .from('ledger_carteiras')
            .select('saldo_atual')
            .eq('user_id', userId)
            .single(),
          
          // Total gasto em compras usando view ledger
          (supabase as any)
            .from('ledger_transacoes')
            .select('valor_real')
            .eq('user_id', userId)
            .eq('tipo', 'purchase')
        ]);

        const totalComprasGirinhas = comprasGirinhas?.reduce((acc, compra) => acc + (compra.valor_real || 0), 0) || 0;

        setProfile(profileData);
        setStats({
          total_itens_publicados: totalItens || 0,
          total_vendas_realizadas: totalVendas || 0,
          total_compras_girinhas: totalComprasGirinhas,
          saldo_atual: carteira?.saldo_atual || 0,
          cadastro_completo: !!(profileData?.nome && profileData?.telefone && profileData?.cep)
        });

      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { profile, stats, loading, error };
};