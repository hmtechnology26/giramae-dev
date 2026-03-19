
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConfigCategoria {
  codigo: string;
  nome: string;
  icone: string;
  valor_minimo: number;
  valor_maximo: number;
  descricao: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

interface AtualizarConfigCategoria {
  codigo: string;
  valor_minimo: number;
  valor_maximo: number;
  descricao?: string;
  ativo?: boolean;
}

export const useConfigCategorias = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todas as configurações
  const { data: configuracoes, isLoading, refetch } = useQuery({
    queryKey: ['config-categorias'],
    queryFn: async (): Promise<ConfigCategoria[]> => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('ordem');

      if (error) throw error;
      return data || [];
    },
    staleTime: 300000, // 5 minutos
  });

  // Query para buscar configuração de uma categoria específica
  const getConfigCategoria = (codigo: string) => {
    return configuracoes?.find(config => config.codigo === codigo);
  };

  // Mutation para atualizar configuração
  const atualizarConfigMutation = useMutation({
    mutationFn: async (dados: AtualizarConfigCategoria) => {
      const { data, error } = await supabase
        .from('categorias')
        .update({
          valor_minimo: dados.valor_minimo,
          valor_maximo: dados.valor_maximo,
          descricao: dados.descricao,
          ativo: dados.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('codigo', dados.codigo)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-categorias'] });
      toast({
        title: "✅ Configuração atualizada",
        description: "Os valores da categoria foram atualizados com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao atualizar",
        description: error.message || "Erro ao atualizar configuração da categoria.",
        variant: "destructive",
      });
    },
  });

  // Função para validar se um valor está dentro da faixa permitida
  const validarValorCategoria = (codigo: string, valor: number): { valido: boolean; mensagem?: string } => {
    const config = getConfigCategoria(codigo);
    
    if (!config || !config.ativo) {
      return { valido: true };
    }

    if (valor < config.valor_minimo) {
      return {
        valido: false,
        mensagem: `Valor mínimo para ${config.nome}: ${config.valor_minimo} Girinhas`
      };
    }

    if (valor > config.valor_maximo) {
      return {
        valido: false,
        mensagem: `Valor máximo para ${config.nome}: ${config.valor_maximo} Girinhas`
      };
    }

    return { valido: true };
  };

  // Função para obter faixa de valores de uma categoria
  const getFaixaValores = (codigo: string) => {
    const config = getConfigCategoria(codigo);
    return config ? {
      minimo: config.valor_minimo,
      maximo: config.valor_maximo,
      descricao: config.descricao
    } : null;
  };

  return {
    configuracoes,
    isLoading,
    refetch,
    atualizarConfig: atualizarConfigMutation.mutate,
    isAtualizando: atualizarConfigMutation.isPending,
    getConfigCategoria,
    validarValorCategoria,
    getFaixaValores,
  };
};
