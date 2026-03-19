
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Check, X } from 'lucide-react';
import { useLocationDetection } from '@/hooks/useLocationDetection';

interface LocationDetectionButtonProps {
  onLocationDetected: (location: { cidade: string; estado: string; bairro?: string }) => void;
  disabled?: boolean;
  className?: string;
}

export const LocationDetectionButton: React.FC<LocationDetectionButtonProps> = ({
  onLocationDetected,
  disabled = false,
  className = ''
}) => {
  const { location, loading, error, detectarLocalizacao, limparLocalizacao, estado } = useLocationDetection();

  const handleDetectClick = async () => {
    if (estado === 'success' && location) {
      // Se já detectou, limpar para permitir nova detecção
      limparLocalizacao();
    } else {
      // Detectar localização
      await detectarLocalizacao();
      
      // Se sucesso, notificar componente pai
      if (location) {
        onLocationDetected(location);
      }
    }
  };

  const getButtonContent = () => {
    switch (estado) {
      case 'detecting':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Detectando localização...
          </>
        );
      
      case 'success':
        return (
          <>
            <Check className="w-4 h-4 mr-2 text-green-600" />
            {location?.cidade}, {location?.estado} - Alterar
          </>
        );
      
      case 'error':
        return (
          <>
            <X className="w-4 h-4 mr-2 text-red-500" />
            Erro ao detectar - Tentar novamente
          </>
        );
      
      default:
        return (
          <>
            <MapPin className="w-4 h-4 mr-2" />
            Usar Minha Localização Atual
          </>
        );
    }
  };

  const getButtonVariant = () => {
    switch (estado) {
      case 'success':
        return 'outline' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Button
      variant={getButtonVariant()}
      size="sm"
      onClick={handleDetectClick}
      disabled={disabled || loading}
      className={`w-full justify-start ${className}`}
    >
      {getButtonContent()}
    </Button>
  );
};
