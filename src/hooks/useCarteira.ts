import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { TipoTransacaoEnum } from '@/types/transacao.types';

// Interfaces para compatibilidade com sistema ledger
interface CarteiraLedger {
  id: string;
  user_id: string;
  saldo_atual: number;
  total_recebido: number;
  total_gasto: number;
  created_at: string;
  updated_at: string;
}

interface TransacaoLedger {
  transacao_id: string; // Campo correto da view
  user_id: string;
  tipo: string;
  valor: number;
  descricao: string;
  data_criacao: string; // Campo correto da view
  data_expiracao?: string;
  metadata?: any; // Campo correto da view
  conta_origem?: string;
  conta_destino?: string;
  config?: any;
}

interface CarteiraData {
  carteira: CarteiraLedger | null;
  transacoes: TransacaoLedger[];
}

export const useCarteira = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query usando sistema ledger
  const {
    data: carteiraData,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['carteira', user?.id],
    queryFn: async (): Promise<CarteiraData> => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 [useCarteira] Buscando dados ledger para usuário:', user.id);

      // Buscar dados da carteira via view ledger
      const { data: carteiraData, error: carteiraError } = await (supabase as any)
        .from('ledger_carteiras')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (carteiraError) {
        console.error('❌ Erro ao buscar carteira ledger:', carteiraError);
        throw carteiraError;
      }

      // Se não existe carteira, tentar criar usando função do sistema
      let carteira = carteiraData;
      if (!carteira) {
        console.log('💡 Carteira não encontrada, tentando criar...');
        try {
          // Tentar usar função de bônus para criar conta
          await (supabase as any).rpc('ledger_bonus_cadastro', { p_user_id: user.id });
          
          // Buscar novamente
          const { data: novaCarteira } = await (supabase as any)
            .from('ledger_carteiras')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          carteira = novaCarteira;
        } catch (createError) {
          console.error('⚠️ Erro ao criar carteira:', createError);
          // Fallback: criar carteira vazia
          carteira = {
            id: user.id,
            user_id: user.id,
            saldo_atual: 0,
            total_recebido: 0,
            total_gasto: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      }

      // Buscar transações via view ledger
      const { data: transacoesData, error: transacoesError } = await (supabase as any)
        .from('ledger_transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('data_criacao', { ascending: false }) // Campo correto
        .limit(50);

      if (transacoesError) {
        console.error('❌ Erro ao buscar transações ledger:', transacoesError);
        // Não falhar se transações não carregarem
      }

      // Buscar configurações de tipos
      const { data: configData } = await supabase
        .from('transacao_config')
        .select('tipo, sinal, descricao_pt, cor_hex, icone')
        .eq('ativo', true);

      // Combinar dados das transações com configurações
      const transacoes = (transacoesData || []).map((t: any) => ({
        ...t,
        // Mapear campos para compatibilidade
        id: t.transacao_id,
        created_at: t.data_criacao,
        config: configData?.find((c: any) => c.tipo === t.tipo)
      }));

      console.log('✅ [useCarteira] Dados ledger carregados:', {
        carteira: carteira,
        totalTransacoes: transacoes.length,
        saldoAtual: carteira?.saldo_atual
      });

      return {
        carteira,
        transacoes
      };
    },
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true, 
    refetchOnMount: true, 
    refetchInterval: false, 
    retry: 1,
    retryDelay: 1000
  });

  // Tratamento de erros
  useEffect(() => {
    if (error) {
      console.error('❌ [useCarteira] Erro ao carregar carteira:', error);
      
      const errorMessage = error?.message || '';
      
      if (errorMessage.includes('não autenticado')) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para acessar sua carteira.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('network')) {
        toast({
          title: "Erro de Conexão",
          description: "Verifique sua conexão com a internet e tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao Carregar Carteira",
          description: "Ocorreu um erro inesperado. Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      }
    }
  }, [error?.message]);

  // Mutation para transações
  const adicionarTransacaoMutation = useMutation({
    mutationFn: async ({
      tipo,
      valor,
      descricao,
      itemId,
      usuarioOrigem,
      metadados
    }: {
      tipo: TipoTransacaoEnum;
      valor: number;
      descricao: string;
      itemId?: string;
      usuarioOrigem?: string;
      metadados?: Record<string, any>;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('💳 [useCarteira] Adicionando transação ledger:', { tipo, valor, descricao });

      // Usar função validada do banco (se disponível)
      const { data, error } = await (supabase as any).rpc('criar_transacao_validada', {
        p_user_id: user.id,
        p_tipo: tipo,
        p_valor: valor,
        p_descricao: descricao,
        p_metadados: {
          item_id: itemId,
          usuario_origem: usuarioOrigem,
          ...metadados
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['carteira', user?.id], 
        exact: true 
      });
      
      await refetch();
      
      toast({
        title: "💳 Transação Realizada",
        description: "Sua transação foi processada com sucesso! Saldo atualizado.",
      });
    },
    onError: (error: any) => {
      console.error('❌ [useCarteira] Erro ao adicionar transação:', error);
      
      if (error.message?.includes('insufficient_funds') || error.message?.includes('Saldo insuficiente')) {
        toast({
          title: "Saldo Insuficiente",
          description: "Você não tem Girinhas suficientes para esta transação.",
          variant: "destructive",
        });
      } else if (error.message?.includes('inválido ou inativo')) {
        toast({
          title: "Tipo de Transação Inválido",
          description: "Este tipo de transação não é permitido.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro na Transação",
          description: "Não foi possível processar a transação. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  });

  const adicionarTransacao = async (
    tipo: TipoTransacaoEnum,
    valor: number,
    descricao: string,
    itemId?: string,
    usuarioOrigem?: string,
    metadados?: Record<string, any>
  ) => {
    try {
      await adicionarTransacaoMutation.mutateAsync({
        tipo,
        valor,
        descricao,
        itemId,
        usuarioOrigem,
        metadados
      });
      return true;
    } catch {
      return false;
    }
  };

  const verificarSaldo = (valor: number): boolean => {
    return carteiraData?.carteira ? Number(carteiraData.carteira.saldo_atual) >= valor : false;
  };

  return {
    carteira: carteiraData?.carteira || null,
    transacoes: carteiraData?.transacoes || [],
    loading,
    error: error?.message || null,
    refetch,
    adicionarTransacao,
    verificarSaldo,
    saldo: carteiraData?.carteira ? Number(carteiraData.carteira.saldo_atual) : 0,
    totalRecebido: carteiraData?.carteira ? Number(carteiraData.carteira.total_recebido) : 0,
    totalGasto: carteiraData?.carteira ? Number(carteiraData.carteira.total_gasto) : 0,
    isAddingTransaction: adicionarTransacaoMutation.isPending,
    
    // Métodos compatíveis
    transferirGirinhas: (valor: number, para: string, itemId: number, descricao: string): boolean => {
      if (!verificarSaldo(valor)) {
        return false;
      }
      adicionarTransacao('bloqueio_reserva', valor, `${descricao} - para ${para}`, String(itemId));
      return true;
    },
    receberGirinhas: (valor: number, de: string, itemId: number, descricao: string) => {
      adicionarTransacao('recebido_item', valor, `${descricao} - de ${de}`, String(itemId));
    },
    recarregarSaldo: () => refetch()
  };
};
