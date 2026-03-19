import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Shield, Clock, AlertTriangle } from "lucide-react";
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { useConfigMercadoPago } from '@/hooks/useConfigMercadoPago';
import { useConfigSistema } from '@/hooks/useConfigSistema';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';

const CheckoutMercadoPago = () => {
  const [quantidade, setQuantidade] = useState<number>(50);
  const { criarPreferencia, isProcessing, ambiente } = useMercadoPago();
  const { config } = useConfigMercadoPago();
  const { quantidadeMin, quantidadeMax, isLoadingConfig } = useConfigSistema();
  const { user } = useAuth();
  const { toast } = useToast();

  const valorTotal = quantidade * 1.00; // R$ 1,00 por Girinha

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseInt(e.target.value) || 0;
    setQuantidade(valor); // CORREÇÃO: Remove o Math.max e Math.min que limitavam a digitação
  };

  // Verificar se está fora dos limites para mostrar erro
  const isQuantidadeInvalida = quantidade < quantidadeMin || quantidade > quantidadeMax;

  const handleComprar = async () => {
    if (!user) {
      toast({
        title: "Eita! Precisa estar logada 💕",
        description: "Faça login primeiro para comprar suas Girinhas!",
        variant: "destructive",
      });
      return;
    }

    if (quantidade < quantidadeMin || quantidade > quantidadeMax) {
      toast({
        title: "Opa! Vamos ajustar isso? 😊",
        description: `Entre ${quantidadeMin.toLocaleString()} e ${quantidadeMax.toLocaleString()} Girinhas é perfeito para uma compra!`,
        variant: "destructive",
      });
      return;
    }

    // ✅ ANALYTICS: Início da compra de Girinhas
    const valorEmReais = quantidade * 1.00;
    analytics.girinhas.purchaseStart(valorEmReais);

    await criarPreferencia(quantidade);
  };

  if (isLoadingConfig) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <DollarSign className="h-6 w-6 text-primary" />
              Comprar Girinhas
            </CardTitle>

          </div>
          <p className="text-muted-foreground">
            Compre suas Girinhas de forma super segura com Mercado Pago! 💳
          </p>
        </CardHeader>
      </Card>

      {/* Formulário de Compra */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quantidade Desejada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade de Girinhas</Label>
            <Input
              id="quantidade"
              type="number"
              min={quantidadeMin}
              max={quantidadeMax}
              value={quantidade}
              onChange={handleQuantidadeChange}
              placeholder={`Ex: ${quantidadeMin} (quantas você quiser!)`}
              className="text-lg"
            />
            
            {/* ADICIONADO: Mensagem de erro vermelha abaixo do campo */}
            {isQuantidadeInvalida && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {quantidade < quantidadeMin 
                    ? `Ops! O mínimo são ${quantidadeMin.toLocaleString()} Girinhas pra conseguir fazer a compra 😊`
                    : `Nossa! Máximo de ${quantidadeMax.toLocaleString()} Girinhas por compra. Que tal dividir em compras menores? 💝`
                  }
                </span>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Entre {quantidadeMin.toLocaleString()} e {quantidadeMax.toLocaleString()} Girinhas - escolha a quantidade ideal para você! ✨
            </p>
          </div>

          <Separator />

          {/* Resumo */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Quantidade:</span>
              <span className="font-bold text-lg">{quantidade.toLocaleString()} Girinhas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Preço unitário:</span>
              <span>R$ 1,00</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-primary">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>



          {/* Botão de Compra */}
          <Button
            onClick={handleComprar}
            disabled={isProcessing || isQuantidadeInvalida}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              "Redirecionando para pagamento..."
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pagar com Mercado Pago
              </>
            )}
          </Button>

          {/* Informações de Segurança */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Pagamento 100% seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Crédito imediato</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• Cartão, PIX, boleto - do jeito que for melhor pra você! 💳</p>
            <p>• Suas Girinhas chegam na hora após a aprovação ⚡</p>
            <p>• Válidas por 12 meses - tempo de sobra! 📅</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutMercadoPago;
