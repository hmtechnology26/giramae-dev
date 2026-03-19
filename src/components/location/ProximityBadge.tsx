
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, School, Home, Car } from 'lucide-react';

interface ProximityBadgeProps {
  type: 'escola' | 'bairro' | 'distancia' | 'entrega';
  value?: string | number;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const ProximityBadge: React.FC<ProximityBadgeProps> = ({ 
  type, 
  value, 
  variant = 'default' 
}) => {
  const getContent = () => {
    switch (type) {
      case 'escola':
        return (
          <>
            <School className="w-3 h-3 mr-1" />
            Mesma escola
          </>
        );
      case 'bairro':
        return (
          <>
            <Home className="w-3 h-3 mr-1" />
            Mesmo bairro
          </>
        );
      case 'distancia':
        return (
          <>
            <MapPin className="w-3 h-3 mr-1" />
            {value}
          </>
        );
      case 'entrega':
        return (
          <>
            <Car className="w-3 h-3 mr-1" />
            Aceita entrega
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Badge variant={variant} className="text-xs">
      {getContent()}
    </Badge>
  );
};

export default ProximityBadge;
