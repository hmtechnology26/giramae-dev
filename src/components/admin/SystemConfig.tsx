
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  DollarSign, 
  Percent, 
  Calendar,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { usePrecoManual } from '@/hooks/usePrecoManual';
import { useConfigSistema } from '@/hooks/useConfigSistema';

const SystemConfig = () => {
  const { precoManual, atualizarPreco, isAtualizando } = usePrecoManual();
  const { config, taxaTransferencia, taxaTransacao, isLoadingConfig } = useConfigSistema();
  
  const [precoTemp, setPrecoTemp] = useState(precoManual.toString());

  const handleSalvarPreco = () => {
    const novoPreco = parseFloat(precoTemp);
    if (novoPreco > 0 && novoPreco <= 10) {
      atualizarPreco(novoPreco);
    }
  };

  if (isLoadingConfig) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Configure parâmetros operacionais da plataforma</p>
        </div>
      </div>

      {/* Preço Manual das Girinhas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle>Preço Manual das Girinhas</CardTitle>
            </div>
            <Badge variant="secondary">Sistema Simplificado</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Sistema Manual:</strong> O preço é fixo e controlado manualmente. 
              Use o Painel de Saúde para orientar ajustes baseados nas métricas da economia.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="preco-manual">Preço por Girinha (R$)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="preco-manual"
                    type="number"
                    step="0.01"
                    min="0.10"
                    max="10.00"
                    value={precoTemp}
                    onChange={(e) => setPrecoTemp(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSalvarPreco}
                    disabled={isAtualizando}
                    className="gap-2"
                  >
                    {isAtualizando ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Valor entre R$ 0,10 e R$ 10,00
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Preço Atual Ativo</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {precoManual.toFixed(2)}
                </div>
                <p className="text-xs text-gray-600">
                  Este é o preço que as usuárias pagam por Girinha
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">💡 Orientações para Ajustes</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-green-600">↗️ Subir preço quando:</span>
                  <span>Cotação implícita {'>'} R$ 1,10 ou alta demanda</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-orange-600">↘️ Baixar preço quando:</span>
                  <span>Cotação implícita {'<'} R$ 0,90 ou baixa demanda</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">📊 Use sempre:</span>
                  <span>O Painel de Saúde para orientar decisões</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxas do Sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-orange-600" />
            <CardTitle>Taxas do Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Taxa de Transferência P2P</Label>
              <div className="text-2xl font-bold text-orange-600">
                {taxaTransferencia}%
              </div>
              <p className="text-xs text-gray-500">
                Cobrada em transferências entre usuárias
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Taxa de Transação</Label>
              <div className="text-2xl font-bold text-orange-600">
                {taxaTransacao}%
              </div>
              <p className="text-xs text-gray-500">
                Cobrada em compras no marketplace
              </p>
            </div>
          </div>

          <Alert className="mt-4 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Nota:</strong> As taxas são configuradas diretamente no banco de dados. 
              Para alterações, consulte a equipe técnica.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Validade das Girinhas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <CardTitle>Validade das Girinhas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Período de Validade</Label>
                <p className="text-xs text-gray-500">
                  Tempo até expiração das Girinhas compradas
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {config?.validade_girinhas?.meses || 12} meses
                </div>
              </div>
            </div>

            <Alert className="border-purple-200 bg-purple-50">
              <Calendar className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                As Girinhas têm validade de <strong>{config?.validade_girinhas?.meses || 12} meses</strong> após a compra. 
                O sistema de extensão de validade permite que usuárias paguem para estender por mais 30 dias.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemConfig;
