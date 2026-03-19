// T8_FRONTEND_COMPONENTS - Componentes React para MVP1

// FILE: src/components/reservas/TempoRestante.tsx

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TempoRestanteProps {
  prazoExpiracao: string;
  className?: string;
}

export const TempoRestante = ({ prazoExpiracao, className = '' }: TempoRestanteProps) => {
  const [tempoRestante, setTempoRestante] = useState<string>('');
  const [status, setStatus] = useState<'normal' | 'warning' | 'danger' | 'critical'>('normal');

  useEffect(() => {
    const atualizarTempo = () => {
      const agora = new Date().getTime();
      const expiracao = new Date(prazoExpiracao).getTime();
      const diferenca = expiracao - agora;

      if (diferenca <= 0) {
        setTempoRestante('Expirada');
        setStatus('critical');
        return;
      }

      const horas = Math.floor(diferenca / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));

      // Determinar status baseado no tempo restante
      if (horas >= 24) {
        setStatus('normal');
        const dias = Math.floor(horas / 24);
        const horasRestantes = horas % 24;
        setTempoRestante(
          dias > 0 
            ? `${dias}d ${horasRestantes}h` 
            : `${horas}h ${minutos}m`
        );
      } else if (horas >= 6) {
        setStatus('warning');
        setTempoRestante(`${horas}h ${minutos}m`);
      } else if (horas >= 1) {
        setStatus('danger');
        setTempoRestante(`${horas}h ${minutos}m`);
      } else {
        setStatus('critical');
        setTempoRestante(`${minutos}m`);
      }
    };

    // Atualizar imediatamente
    atualizarTempo();

    // Configurar intervalo
    const intervalo = setInterval(atualizarTempo, 60000); // Atualizar a cada minuto

    return () => clearInterval(intervalo);
  }, [prazoExpiracao]);

  const getVariant = () => {
    switch (status) {
      case 'warning': return 'secondary';
      case 'danger': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getClassName = () => {
    const baseClasses = 'text-xs font-medium flex items-center gap-1';
    const statusClasses = {
      normal: 'text-gray-600',
      warning: 'text-yellow-700',
      danger: 'text-orange-700',
      critical: 'text-red-700 animate-pulse'
    };
    
    return `${baseClasses} ${statusClasses[status]} ${className}`;
  };

  const dataExpiracao = new Date(prazoExpiracao).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getIcon = () => {
    if (status === 'critical' || status === 'danger') {
      return <AlertTriangle className="w-3 h-3" />;
    }
    return <Clock className="w-3 h-3" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant()} className={getClassName()}>
            {getIcon()}
            {tempoRestante}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Expira em: {dataExpiracao}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};