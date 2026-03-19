
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import ExtensaoValidade from './ExtensaoValidade';

interface AlertaExpiracaoComExtensaoProps {
  totalExpirando7Dias: number;
  totalExpirando30Dias: number;
  proximaExpiracao: string | null;
}

const AlertaExpiracaoComExtensao: React.FC<AlertaExpiracaoComExtensaoProps> = ({
  totalExpirando7Dias,
  totalExpirando30Dias,
  proximaExpiracao
}) => {
  // Calcular dias restantes para a próxima expiração
  const calcularDiasRestantes = (): number => {
    if (!proximaExpiracao) return 0;
    const hoje = new Date();
    const dataExpiracao = new Date(proximaExpiracao);
    const diffTime = dataExpiracao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const diasRestantes = calcularDiasRestantes();

  return (
    <div className="space-y-4">
      {/* Alerta crítico - 7 dias */}
      {totalExpirando7Dias > 0 && (
        <div className="space-y-3">
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ <strong>Urgente!</strong> {totalExpirando7Dias.toFixed(0)} Girinhas expiram nos próximos 7 dias! 
              Use antes de perder ou estenda a validade.
            </AlertDescription>
          </Alert>
          
          {/* Widget de extensão para Girinhas críticas */}
          <ExtensaoValidade 
            girinhasExpirando={totalExpirando7Dias}
            diasRestantes={diasRestantes <= 7 ? diasRestantes : 7}
          />
        </div>
      )}

      {/* Alerta informativo - 30 dias (apenas se não há críticas) */}
      {totalExpirando30Dias > 0 && totalExpirando7Dias === 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            📅 {totalExpirando30Dias.toFixed(0)} Girinhas expiram nos próximos 30 dias. 
            Fique atenta às validades.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AlertaExpiracaoComExtensao;
