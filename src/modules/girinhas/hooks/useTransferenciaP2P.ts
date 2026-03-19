// src/modules/girinhas/hooks/useTransferenciaP2P.ts
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useConfigSistema } from '@/hooks/useConfigSistema';
import { useCarteira } from '@/hooks/useCarteira';

interface DadosTransferencia {
  email_destinatario: string;  // ✅ MUDOU: era destinatario_id
  quantidade: number;
}

interface ResultadoTransferencia {
  success: boolean;
  transferencia_id?: string;
  mensagem?: string;
  erro?: string;
  destinatario_nome?: string;
  destinatario_email?: string;
}

export const useTransferenciaP2P = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { taxaTransferencia, isLoadingConfig } = useConfigSistema();
  const { saldo } = useCarteira();

  // ✅ MUDOU: Estados locais do formulário
  const [quantidade, setQuantidade] = useState('');
  const [emailDestinatario, setEmailDestinatario] = useState('');  // ✅ NOVO

  // Cálculos derivados
  const valorQuantidade = parseFloat(quantidade) || 0;
  const taxa = (valorQuantidade * taxaTransferencia) / 100;
  const valorLiquido = valorQuantidade - taxa;

  // ✅ MUDOU: Validações
  const podeTransferir = 
    emailDestinatario.trim().length > 0 &&  // ✅ NOVO: valida email
    valorQuantidade > 0 && 
    valorQuantidade <= saldo &&
    !isLoadingConfig;

  const temSaldoSuficiente = valorQuantidade <= saldo;

  // Mutation para transferência
  const transferirMutation = useMutation({
    mutationFn: async (dados: DadosTransferencia): Promise<ResultadoTransferencia> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // ✅ MUDOU: Validações finais
      if (!dados.email_destinatario || !dados.quantidade) {
        throw new Error('Email e quantidade são obrigatórios');
      }

      if (dados.quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      if (dados.quantidade > 10000) {
        throw new Error('Quantidade máxima: 10.000 Girinhas');
      }

      if (dados.quantidade > saldo) {
        throw new Error('Saldo insuficiente');
      }

      console.log('🔄 Iniciando transferência P2P:', dados);

      // Usar Edge Function atualizada
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // ✅ MUDOU: Envia email ao invés de UUID
      const functionUrl = 'https://sjyvqtfpvqavtffexoky.supabase.co/functions/v1/transferir-p2p';
      const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.session.access_token}`,
          },
          body: JSON.stringify({
            email_destinatario: dados.email_destinatario,  // ✅ MUDOU
            quantidade: dados.quantidade
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro na transferência');
      }

      return result;
    },
    onSuccess: (resultado) => {
      // Limpar formulário
      setQuantidade('');
      setEmailDestinatario('');  // ✅ MUDOU

      // Invalidar caches
      queryClient.invalidateQueries({ queryKey: ['carteira', user?.id] });

      // Toast de sucesso
      toast({
        title: "✅ Transferência realizada!",
        description: resultado.mensagem || `Transferência para ${resultado.destinatario_nome} concluída com sucesso.`,
      });

      console.log('✅ Transferência concluída:', resultado);
    },
    onError: (error: any) => {
      console.error('❌ Erro na transferência:', error);
      
      // Mapeamento de erros
      let mensagemErro = "Erro na transferência. Tente novamente.";
      
      if (error.message?.includes('Saldo insuficiente')) {
        mensagemErro = "Saldo insuficiente para esta transferência.";
      } else if (error.message?.includes('não encontrado') || error.message?.includes('Destinatário não encontrado')) {
        mensagemErro = "Não encontramos nenhuma mãe cadastrada com este email.";
      } else if (error.message?.includes('Muitas transferências')) {
        mensagemErro = "Muitas transferências recentes. Aguarde um momento.";
      } else if (error.message?.includes('Sessão expirada')) {
        mensagemErro = "Sua sessão expirou. Faça login novamente.";
      } else if (error.message?.includes('Email inválido')) {
        mensagemErro = "Por favor, informe um email válido.";
      } else if (error.message?.includes('bloqueadas')) {
        mensagemErro = error.message; // Mensagem completa sobre bônus bloqueados
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      toast({
        title: "❌ Erro na transferência",
        description: mensagemErro,
        variant: "destructive",
      });
    },
  });

  // ✅ MUDOU: Função para executar transferência
  const executarTransferencia = () => {
    if (!emailDestinatario || !quantidade) {
      toast({
        title: "Dados incompletos",
        description: "Informe o email da destinatária e a quantidade.",
        variant: "destructive",
      });
      return;
    }

    transferirMutation.mutate({
      email_destinatario: emailDestinatario,  // ✅ MUDOU
      quantidade: valorQuantidade,
    });
  };

  // ✅ MUDOU: Função para limpar formulário
  const limparFormulario = () => {
    setQuantidade('');
    setEmailDestinatario('');  // ✅ MUDOU
  };

  return {
    // ✅ MUDOU: DADOS DO FORMULÁRIO
    quantidade,
    setQuantidade,
    emailDestinatario,      // ✅ NOVO
    setEmailDestinatario,   // ✅ NOVO

    // === CÁLCULOS ===
    valorQuantidade,
    taxa,
    valorLiquido,
    taxaPercentual: taxaTransferencia,

    // === VALIDAÇÕES ===
    podeTransferir,
    temSaldoSuficiente,
    saldoAtual: saldo,

    // === ESTADOS ===
    isTransferindo: transferirMutation.isPending,
    isLoadingConfig,

    // === AÇÕES ===
    executarTransferencia,
    limparFormulario,
  };
};
