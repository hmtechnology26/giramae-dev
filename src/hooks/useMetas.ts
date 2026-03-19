
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type MetaUsuario = Tables<'metas_usuarios'>;

export const useMetas = () => {
  const { user } = useAuth();
  const [metas, setMetas] = useState<MetaUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetas = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('metas_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .order('trocas_necessarias', { ascending: true });

      if (fetchError) throw fetchError;

      setMetas(data || []);
    } catch (err) {
      console.error('Erro ao buscar metas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getProgressoMeta = (meta: MetaUsuario, trocasRealizadas: number) => {
    return Math.min((trocasRealizadas / meta.trocas_necessarias) * 100, 100);
  };

  const getProximaMeta = (trocasRealizadas: number) => {
    return metas.find(meta => !meta.conquistado && trocasRealizadas < meta.trocas_necessarias);
  };

  const getMetasConquistadas = () => {
    return metas.filter(meta => meta.conquistado);
  };

  const getTotalBonusRecebido = () => {
    return metas
      .filter(meta => meta.conquistado)
      .reduce((total, meta) => total + meta.girinhas_bonus, 0);
  };

  useEffect(() => {
    fetchMetas();
  }, [user]);

  return {
    metas,
    loading,
    error,
    refetch: fetchMetas,
    getProgressoMeta,
    getProximaMeta,
    getMetasConquistadas,
    getTotalBonusRecebido
  };
};
