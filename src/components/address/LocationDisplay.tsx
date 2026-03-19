
import React from 'react';
import { MapPin, School, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LocationDisplayProps {
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  escola?: string;
  aceitaEntrega?: boolean;
  raioEntrega?: number;
  variant?: 'compact' | 'full';
  showSchoolBadge?: boolean;
  className?: string;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  endereco,
  bairro,
  cidade,
  estado,
  escola,
  aceitaEntrega,
  raioEntrega,
  variant = 'compact',
  showSchoolBadge = false,
  className
}) => {
  const formatLocation = () => {
    if (escola) {
      return escola;
    }

    if (variant === 'compact') {
      if (bairro && cidade && estado) {
        return `${bairro}, ${cidade}/${estado}`;
      }
      if (cidade && estado) {
        return `${cidade}/${estado}`;
      }
    } else {
      const parts = [];
      if (endereco) parts.push(endereco);
      if (bairro) parts.push(bairro);
      if (cidade && estado) parts.push(`${cidade}/${estado}`);
      return parts.join(', ');
    }

    return 'Localização não informada';
  };

  const getIcon = () => {
    if (escola) return <School className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      {getIcon()}
      <span className="truncate">{formatLocation()}</span>
      
      {showSchoolBadge && escola && (
        <Badge variant="secondary" className="text-xs">
          Mesma escola
        </Badge>
      )}
      
      {aceitaEntrega && (
        <div className="flex items-center gap-1">
          <Truck className="h-3 w-3" />
          <span className="text-xs">
            Entrega {raioEntrega ? `até ${raioEntrega}km` : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;
