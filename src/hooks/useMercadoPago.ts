
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCarteira } from '@/hooks/useCarteira';
import { useConfigMercadoPago } from '@/hooks/useConfigMercadoPago';
import { supabase } from '@/integrations/supabase/client';
import { analytics } from '@/lib/analytics';

interface MercadoPagoPreference {
  preference_id: string;
  init_point: string;
  external_reference: string;
  sandbox_init_point?: string;
  checkout_url: string;
  ambiente: 'teste' | 'producao';
}

export const useMercadoPago = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch } = useCarteira();
  const { config } = useConfigMercadoPago();
  const [isProcessing, setIsProcessing] = useState(false);

  const criarPreferencia = async (quantidade: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para comprar Girinhas.",
        variant: "destructive",
      });
      return false;
    }

    // 🔒 SEGURANÇA: Validações client-side
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 999000) {
      toast({
        title: "Quantidade Inválida",
        description: "A quantidade deve ser entre 1 e 999.000 Girinhas.",
        variant: "destructive",
      });
      return false;
    }

    setIsProcessing(true);

    try {
      console.log('🚀 [useMercadoPago] Criando preferência para:', {
        quantidade,
        ambiente: config.usarAmbienteTeste ? 'TESTE' : 'PRODUÇÃO'
      });

      const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
        body: { quantidade }
      });

      if (error) {
        console.error('❌ [useMercadoPago] Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro ao criar preferência de pagamento');
      }

      if (!data.preference_id) {
        throw new Error('Preferência inválida retornada');
      }

      const preference = data as MercadoPagoPreference;
      
      console.log('✅ [useMercadoPago] Preferência criada:', {
        preferenceId: preference.preference_id,
        ambiente: preference.ambiente,
        checkoutUrl: preference.checkout_url
      });

      // 🆕 INTELIGENTE: Usar URL já selecionada pelo backend baseada na config
      const checkoutUrl = preference.checkout_url;
      
      if (checkoutUrl) {
        // 🎯 FEEDBACK: Mostrar o ambiente sendo usado
        toast({
          title: `🔄 Redirecionando para ${preference.ambiente === 'teste' ? 'Ambiente de Teste' : 'Produção'}`,
          description: preference.ambiente === 'teste' 
            ? "Você será direcionado para o sandbox do Mercado Pago" 
            : "Processamento de pagamento real",
        });

        window.location.href = checkoutUrl;
        return true;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error: any) {
      console.error('❌ [useMercadoPago] Erro ao criar preferência:', error);
      
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Não foi possível iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
      
      setIsProcessing(false);
      return false;
    }
  };

  // Verificar status do pagamento baseado nos parâmetros da URL
  const verificarStatusPagamento = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const externalRef = urlParams.get('ref');
    const girinhasAmount = urlParams.get('girinhas');

    if (paymentStatus && externalRef) {
      const isTestEnvironment = config.usarAmbienteTeste;
      const girinhas = girinhasAmount ? parseInt(girinhasAmount) : 0;
      const valorReais = girinhas * 1.00;
      
      switch (paymentStatus) {
        case 'success':
          // ✅ ANALYTICS: Compra de Girinhas concluída (CRÍTICO PARA ROAS)
          if (girinhas > 0) {
            analytics.girinhas.purchaseComplete(
              girinhas,
              valorReais,
              externalRef
            );
          }
          
          toast({
            title: `🎉 Pagamento Aprovado! ${isTestEnvironment ? '(Teste)' : ''}`,
            description: isTestEnvironment 
              ? "Teste realizado com sucesso! Suas Girinhas de teste foram creditadas." 
              : "Suas Girinhas foram creditadas automaticamente. O saldo será atualizado em alguns instantes.",
          });
          // Limpar URL e recarregar dados
          window.history.replaceState({}, '', '/carteira');
          refetch();
          break;
        
        case 'failure':
          // ✅ ANALYTICS: Compra falhou
          analytics.girinhas.purchaseFailed('payment_declined');
          
          toast({
            title: `❌ Pagamento Recusado ${isTestEnvironment ? '(Teste)' : ''}`,
            description: isTestEnvironment
              ? "Teste de pagamento recusado. Tente novamente com outros dados de teste."
              : "Seu pagamento foi recusado. Tente novamente com outro método de pagamento.",
            variant: "destructive",
          });
          window.history.replaceState({}, '', '/carteira');
          break;
        
        case 'pending':
          toast({
            title: `⏳ Pagamento Pendente ${isTestEnvironment ? '(Teste)' : ''}`,
            description: isTestEnvironment
              ? "Teste de pagamento pendente simulado."
              : "Seu pagamento está sendo processado. Suas Girinhas serão creditadas assim que aprovado.",
          });
          window.history.replaceState({}, '', '/carteira');
          break;
      }
    }
  };

  return {
    criarPreferencia,
    verificarStatusPagamento,
    isProcessing,
    ambiente: config.usarAmbienteTeste ? 'teste' : 'producao'
  };
};
