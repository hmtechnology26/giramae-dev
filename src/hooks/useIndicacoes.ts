
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Indicacao = Tables<'indicacoes'> & {
  profiles?: {
    id: string;
    nome: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string | null;
  };
};

type IndicadoInfo = Tables<'indicacoes'> & {
  profiles?: {
    id: string;
    nome: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string | null;
  };
};

export const useIndicacoes = () => {
  const { user } = useAuth();
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [indicados, setIndicados] = useState<IndicadoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarMinhasIndicacoes = async () => {
    if (!user) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('indicacoes')
        .select(`
          *,
          profiles!indicacoes_indicado_id_fkey (
            id,
            nome,
            email,
            avatar_url,
            created_at
          )
        `)
        .eq('indicador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIndicacoes(data || []);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar indicações:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar indicações');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const buscarQuemMeIndicou = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('indicacoes')
        .select(`
          *,
          profiles!indicacoes_indicador_id_fkey (
            id,
            nome,
            email,
            avatar_url,
            created_at
          )
        `)
        .eq('indicado_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIndicados(data || []);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar quem me indicou:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar indicações');
      return [];
    }
  };

  const compartilharIndicacao = async () => {
    if (!user) return;

    try {
      const linkIndicacao = `${window.location.origin}/?indicador=${user.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Venha para o GiraMãe!',
          text: 'Olá! Te convido para participar do GiraMãe, uma plataforma incrível onde mães trocam itens infantis. Use meu link e ganhe bônus!',
          url: linkIndicacao,
        });
      } else {
        // Fallback para navegadores que não suportam Web Share API
        await navigator.clipboard.writeText(linkIndicacao);
        console.log('Link copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      setError('Erro ao compartilhar indicação');
    }
  };

  const obterEstatisticas = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('indicacoes')
        .select(`
          *,
          profiles!indicacoes_indicado_id_fkey (
            id,
            nome,
            created_at
          )
        `)
        .eq('indicador_id', user.id);

      if (error) throw error;

      const items = data || [];
      
      return {
        totalIndicacoes: items.length,
        bonusCadastro: items.filter(item => 
          item.profiles && item.bonus_cadastro_pago
        ).length,
        bonusPrimeiroItem: items.filter(item => 
          item.profiles && item.bonus_primeiro_item_pago
        ).length,
        bonusPrimeiraCompra: items.filter(item => 
          item.profiles && item.bonus_primeira_compra_pago
        ).length,
        totalBonusRecebido: items.reduce((total, item) => {
          let bonus = 0;
          if (item.bonus_cadastro_pago) bonus += 5;
          if (item.bonus_primeiro_item_pago) bonus += 5;
          if (item.bonus_primeira_compra_pago) bonus += 5;
          return total + bonus;
        }, 0)
      };
    } catch (err) {
      console.error('Erro ao obter estatísticas:', err);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      buscarMinhasIndicacoes();
      buscarQuemMeIndicou();
    }
  }, [user]);

  return {
    indicacoes,
    indicados,
    loading,
    error,
    buscarMinhasIndicacoes,
    buscarQuemMeIndicou,
    compartilharIndicacao,
    obterEstatisticas
  };
};
