
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePrecoManual = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ CORRIGIDO: Query para obter preço manual atual usando função correta
  const { data: precoManual, isLoading } = useQuery({
    queryKey: ['preco-manual'],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('obter_preco_manual');
      if (error) throw error;
      return Number(data);
    },
    staleTime: 60000, // 1 minuto
  });

  // ✅ CORRIGIDO: Mutation para atualizar preço manual usando config_sistema
  const atualizarPrecoMutation = useMutation({
    mutationFn: async (novoPreco: number) => {
      if (novoPreco <= 0 || novoPreco > 10) {
        throw new Error('Preço deve estar entre R$ 0,01 e R$ 10,00');
      }
      
      const { error } = await supabase
        .from('config_sistema')
        .upsert({
          chave: 'preco_manual_girinhas',
          valor: { valor: novoPreco }
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preco-manual'] });
      toast({
        title: "Preço atualizado!",
        description: "O novo preço foi salvo com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar preço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    precoManual: precoManual || 1.00,
    isLoading,
    atualizarPreco: atualizarPrecoMutation.mutate,
    isAtualizando: atualizarPrecoMutation.isPending,
  };
};
