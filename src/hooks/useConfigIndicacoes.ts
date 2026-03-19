
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

export const useConfigIndicacoes = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transacao_config')
        .select('*')
        .in('tipo', [
          'bonus_indicacao_cadastro',
          'bonus_indicacao_primeiro_item', 
          'bonus_indicacao_primeira_compra',
          'bonus_cadastro'
        ])
        .order('tipo');

      if (error) throw error;
      setConfiguracoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de indicação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const atualizarConfiguracao = async (tipo: string, valor: number, ativo: boolean) => {
    try {
      // Validar valor
      if (valor < 0 || valor > 100) {
        toast({
          title: "Erro de Validação",
          description: "O valor deve estar entre 0 e 100 Girinhas.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('transacao_config')
        .update({ 
          valor_padrao: valor,
          ativo: ativo,
          updated_at: new Date().toISOString()
        })
        .eq('tipo', tipo as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso!",
      });

      // Recarregar dados
      await fetchConfiguracoes();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  return {
    configuracoes,
    loading,
    atualizarConfiguracao,
    refetch: fetchConfiguracoes
  };
};
