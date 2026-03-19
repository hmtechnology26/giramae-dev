
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ConfigExtensao {
  ativo: boolean;
  percentual: number;
  dias: number;
}

export const useExtensaoValidade = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configurações de extensão
  const { data: config } = useQuery({
    queryKey: ['extensao-validade-config'],
    queryFn: async (): Promise<ConfigExtensao> => {
      const { data, error } = await supabase
        .from('config_sistema')
        .select('chave, valor')
        .in('chave', ['extensao_validade_ativa', 'extensao_validade_percentual', 'extensao_validade_dias']);

      if (error) throw error;

      const configObj = data.reduce((acc, item) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {} as any);

      return {
        ativo: configObj.extensao_validade_ativa?.ativo ?? true,
        percentual: configObj.extensao_validade_percentual?.percentual ?? 20,
        dias: configObj.extensao_validade_dias?.dias ?? 30
      };
    },
    staleTime: 60000, // 1 minuto
  });

  // Função para calcular custo de extensão
  const calcularCustoExtensao = (valorExpirando: number): number => {
    const percentual = config?.percentual ?? 20;
    return Math.max(Math.round(valorExpirando * (percentual / 100)), 1);
  };

  // Mutation para estender validade
  const estenderValidadeMutation = useMutation({
    mutationFn: async (valorExpirando: number) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      if (!config?.ativo) throw new Error('Extensão de validade está desativada');

      const diasExtensao = config.dias;
      const novaDataExpiracao = new Date();
      novaDataExpiracao.setDate(novaDataExpiracao.getDate() + diasExtensao);

      // Temporariamente desabilitado - requer migração ledger
      return { success: false, message: 'Recurso em manutenção' };
    },
    onSuccess: (_, valorExpirando) => {
      const custoExtensao = calcularCustoExtensao(valorExpirando);
      const girinhasSalvas = valorExpirando - custoExtensao;
      const diasExtensao = config?.dias ?? 30;
      
      toast({
        title: "✨ Validade Estendida!",
        description: `${girinhasSalvas} Girinhas foram salvas por +${diasExtensao} dias! Custou ${custoExtensao} Girinha${custoExtensao !== 1 ? 's' : ''}.`,
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['girinhas-expiracao'] });
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Extensão",
        description: error.message || "Não foi possível estender a validade. Verifique seu saldo.",
        variant: "destructive",
      });
    }
  });

  return {
    config,
    calcularCustoExtensao,
    estenderValidade: estenderValidadeMutation.mutate,
    isExtendendo: estenderValidadeMutation.isPending,
    podeEstender: config?.ativo ?? false
  };
};
