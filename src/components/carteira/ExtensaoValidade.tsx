
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { useExtensaoValidade } from '@/hooks/useExtensaoValidade';
import { useCarteira } from '@/hooks/useCarteira';

interface ExtensaoValidadeProps {
  girinhasExpirando: number;
  diasRestantes: number;
}

const ExtensaoValidade: React.FC<ExtensaoValidadeProps> = ({ 
  girinhasExpirando, 
  diasRestantes 
}) => {
  const { 
    config, 
    calcularCustoExtensao, 
    estenderValidade, 
    isExtendendo, 
    podeEstender 
  } = useExtensaoValidade();
  const { saldo } = useCarteira();
  
  // Só mostrar se expira em 7 dias ou menos e se a feature está ativa
  if (diasRestantes > 7 || girinhasExpirando <= 0 || !podeEstender) {
    return null;
  }
  
  const custoExtensao = calcularCustoExtensao(girinhasExpirando);
  const girinhasSalvas = girinhasExpirando - custoExtensao;
  const temSaldoSuficiente = saldo >= custoExtensao;
  const diasExtensao = config?.dias ?? 30;
  
  const handleEstender = () => {
    estenderValidade(girinhasExpirando);
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
                  ⏰ {girinhasExpirando} Girinha{girinhasExpirando !== 1 ? 's' : ''} expirando
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                💡 <strong>Extensão disponível:</strong> Pague {custoExtensao} Girinha{custoExtensao !== 1 ? 's' : ''} 
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
              
              <div className="text-xs text-gray-500 text-center">
                📊 Custo: {config?.percentual ?? 20}% das Girinhas expirando (mín. 1)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtensaoValidade;
