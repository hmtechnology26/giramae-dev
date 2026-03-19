import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Mail, Calculator, AlertTriangle, Loader2 } from 'lucide-react';
import { useTransferenciaP2P } from '../hooks/useTransferenciaP2P';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TransferenciaP2P: React.FC = () => {
  const {
    // ✅ MUDOU: Dados do formulário
    quantidade,
    setQuantidade,
    emailDestinatario,      // ✅ NOVO
    setEmailDestinatario,   // ✅ NOVO
    
    // Cálculos
    valorQuantidade,
    taxa,
    valorLiquido,
    taxaPercentual,
    
    // Validações  
    podeTransferir,
    temSaldoSuficiente,
    saldoAtual,
    
    // Estados
    isTransferindo,
    isLoadingConfig,
    
    // Ações
    executarTransferencia,
    limparFormulario
  } = useTransferenciaP2P();

  const handleTransferir = () => {
    executarTransferencia();
  };

  if (isLoadingConfig) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando configurações...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Transferir Girinhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerta de segurança */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            🔒 Transferências são processadas de forma segura pelo sistema. 
            Verifique sempre o email da destinatária antes de confirmar.
          </AlertDescription>
        </Alert>

        {/* ✅ NOVO: Input de Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email da Destinatária
          </Label>
          <Input
            id="email"
            type="email"
            value={emailDestinatario}
            onChange={(e) => setEmailDestinatario(e.target.value)}
            placeholder="exemplo@email.com"
            disabled={isTransferindo}
            className="lowercase"
          />
          <p className="text-xs text-gray-500">
            💡 Digite o email da mãe que vai receber as Girinhas
          </p>
        </div>

        {/* Quantidade */}
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade de Girinhas</Label>
          <Input
            id="quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="0.00"
            min="0.01"
            max="10000"
            step="0.01"
            disabled={isTransferindo}
            className={!temSaldoSuficiente && valorQuantidade > 0 ? 'border-red-300' : ''}
          />
          <p className="text-sm text-gray-500">
            Seu saldo: {saldoAtual.toFixed(2)} Girinhas
          </p>
        </div>

        {/* Cálculo da taxa */}
        {quantidade && valorQuantidade > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">Resumo da transferência</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor a transferir:</span>
                <span className="font-medium">{valorQuantidade.toFixed(2)} Girinhas</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Taxa ({taxaPercentual}%):</span>
                <span className="font-medium">-{taxa.toFixed(2)} Girinhas</span>
              </div>
              <div className="h-px bg-purple-200 my-2"></div>
              <div className="flex justify-between font-bold text-purple-800">
                <span>Destinatária recebe:</span>
                <span>{valorLiquido.toFixed(2)} Girinhas</span>
              </div>
            </div>
          </div>
        )}

        {/* Validações de erro */}
        {!temSaldoSuficiente && valorQuantidade > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Saldo insuficiente. Você tem apenas {saldoAtual.toFixed(2)} Girinhas.
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleTransferir}
            disabled={!podeTransferir || isTransferindo}
            className="flex-1"
            size="lg"
          >
            {isTransferindo ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Transferir {valorQuantidade.toFixed(2)} Girinhas
              </>
            )}
          </Button>

          {(emailDestinatario || quantidade) && (
            <Button
              variant="outline"
              onClick={limparFormulario}
              disabled={isTransferindo}
            >
              Limpar
            </Button>
          )}
        </div>

        {/* Informações de segurança */}
        <div className="text-xs text-gray-500 text-center space-y-1 pt-2 border-t">
          <p>• Taxa de {taxaPercentual}% aplicada automaticamente</p>
          <p>• A taxa é queimada do sistema para controlar a inflação</p>
          <p>• Transferências são instantâneas e irreversíveis</p>
          <p>• Bônus de curta duração não podem ser transferidos</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferenciaP2P;
