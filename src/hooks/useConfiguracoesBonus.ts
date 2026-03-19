
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConfiguracaoBonus {
  tipo: string;
  valor_padrao: number | null;
  descricao_pt: string;
  ativo: boolean | null;
  categoria: string;
  icone: string | null;
  cor_hex: string | null;
}

export const useConfiguracoesBonus = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transacao_config')
        .select('*')
        .order('tipo');

      if (error) throw error;
      setConfiguracoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const obterValorBonus = (tipo: string): number => {
    const config = configuracoes.find(c => c.tipo === tipo && c.ativo);
    return config?.valor_padrao || 0;
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  return {
    configuracoes,
    loading,
    obterValorBonus,
    refetch: fetchConfiguracoes
  };
};
