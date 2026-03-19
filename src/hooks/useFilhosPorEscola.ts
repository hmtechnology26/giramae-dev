
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Filho = Tables<'filhos'>;
type Escola = Tables<'escolas_inep'>;

interface FilhoComEscola extends Filho {
  escola?: Escola | null;
}

export const useFilhosPorEscola = () => {
  const { user } = useAuth();
  const [filhos, setFilhos] = useState<FilhoComEscola[]>([]);
  const [escolasDosMeusFilhos, setEscolasDosMeusFilhos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      carregarFilhos();
    }
  }, [user]);

  const carregarFilhos = async () => {
    if (!user) return;

    try {
      const { data: filhosData, error } = await supabase
        .from('filhos')
        .select(`
          *,
          escolas_inep!filhos_escola_id_fkey (*)
        `)
        .eq('mae_id', user.id);

      if (error) throw error;

      const filhosComEscola = filhosData?.map(filho => ({
        ...filho,
        escola: filho.escolas_inep as Escola | null
      })) || [];

      setFilhos(filhosComEscola);

      // Extrair IDs das escolas dos filhos
      const escolasIds = filhosComEscola
        .filter(filho => filho.escola_id)
        .map(filho => filho.escola_id as number);

      setEscolasDosMeusFilhos([...new Set(escolasIds)]);
    } catch (error) {
      console.error('Erro ao carregar filhos:', error);
    } finally {
      setLoading(false);
    }
  };

  const temFilhoNaEscola = (escolaId: number) => {
    return escolasDosMeusFilhos.includes(escolaId);
  };

  const getEscolasDosMeusFilhos = () => {
    return filhos
      .filter(filho => filho.escola)
      .map(filho => filho.escola!)
      .filter((escola, index, array) => 
        array.findIndex(e => e.codigo_inep === escola.codigo_inep) === index
      );
  };

  return {
    filhos,
    escolasDosMeusFilhos,
    loading,
    temFilhoNaEscola,
    getEscolasDosMeusFilhos,
    refetch: carregarFilhos
  };
};
