
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useExtensaoValidadeSegura } from '@/hooks/useExtensaoValidadeSegura';
import { useCarteira } from '@/hooks/useCarteira';

interface ExtensaoValidadeSeguraProps {
  transacaoId: string;
  valorGirinhas: number;
  diasRestantes: number;
  jaEstendida: boolean;
  podeEstender: boolean;
  tipo: string;
}

const ExtensaoValidadeSegura: React.FC<ExtensaoValidadeSeguraProps> = ({ 
  transacaoId,
  valorGirinhas, 
  diasRestantes,
  jaEstendida,
  podeEstender,
  tipo
}) => {
  const { 
    config, 
    calcularCustoExtensao, 
    estenderValidade, 
    isExtendendo, 
    podeEstender: sistemaAtivo 
  } = useExtensaoValidadeSegura();
  const { saldo } = useCarteira();
  
  // Não mostrar extensão para bônus diário
  if (tipo === 'bonus') {
    return null;
  }
  
  // Não mostrar se já foi estendida
  if (jaEstendida) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800">
                ✅ Validade já estendida
              </h4>
              <p className="text-sm text-green-600">
                Esta transação já teve sua validade estendida anteriormente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Não mostrar se sistema desativado ou não pode estender
  if (!sistemaAtivo || !podeEstender || diasRestantes > 7) {
    return null;
  }
  
  const custoExtensao = calcularCustoExtensao(valorGirinhas);
  const girinhasSalvas = valorGirinhas - custoExtensao;
  const temSaldoSuficiente = saldo >= custoExtensao;
  const diasExtensao = config?.dias ?? 30;
  
  const handleEstender = () => {
    console.log('🔒 [ExtensãoSegura] Iniciando extensão para transação:', transacaoId);
    estenderValidade(transacaoId);
  };

  const getCorUrgencia = () => {
    if (diasRestantes <= 1) return 'border-red-300 bg-red-50';
    if (diasRestantes <= 3) return 'border-orange-300 bg-orange-50';
    return 'border-yellow-300 bg-yellow-50';
  };

  const getIconeUrgencia = () => {
    if (diasRestantes <= 1) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (diasRestantes <= 3) return <Clock className="w-5 h-5 text-orange-600" />;
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <Card className={`border-2 ${getCorUrgencia()}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIconeUrgencia()}
          </div>
          
          <div className="flex-grow space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-800">
                  ⏰ {valorGirinhas} Girinha{valorGirinhas !== 1 ? 's' : ''} expirando
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                🔒 <strong>Extensão segura disponível:</strong> Pague {custoExtensao} Girinha{custoExtensao !== 1 ? 's' : ''} 
                para salvar {girinhasSalvas} por +{diasExtensao} dias
              </div>
            </div>
            
            <div className="space-y-2">
              {temSaldoSuficiente ? (
                <Button 
                  onClick={handleEstender}
                  disabled={isExtendendo}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isExtendendo ? 'Estendendo...' : `Estender por +${diasExtensao} dias (-${custoExtensao} Girinha${custoExtensao !== 1 ? 's' : ''})`}
                </Button>
              ) : (
                <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded text-center border">
                  💳 Saldo insuficiente (precisa {custoExtensao} Girinha{custoExtensao !== 1 ? 's' : ''}, tem {saldo.toFixed(0)})
                </div>
              )}
              
              <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3" />
                🔒 Sistema seguro - Apenas uma extensão por transação
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtensaoValidadeSegura;
