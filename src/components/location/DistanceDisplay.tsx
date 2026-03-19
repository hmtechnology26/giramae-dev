
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useDistance } from '@/hooks/useDistance';

interface DistanceDisplayProps {
  userCep?: string;
  targetCep?: string;
  className?: string;
}

const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  userCep,
  targetCep,
  className = ''
}) => {
  const { calculateDistance } = useDistance();
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userCep && targetCep) {
      calcularDistancia();
    }
  }, [userCep, targetCep]);

  const calcularDistancia = async () => {
    if (!userCep || !targetCep) return;
    
    setLoading(true);
    try {
      const result = await calculateDistance(userCep, targetCep);
      if (result) {
        setDistance(result.formattedDistance);
      }
    } catch (error) {
      console.error('Erro ao calcular distância:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userCep || !targetCep) return null;

  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      <MapPin className="w-3 h-3" />
      {loading ? (
        <span>Calculando...</span>
      ) : distance ? (
        <span>~{distance}</span>
      ) : (
        <span>Próximo</span>
      )}
    </div>
  );
};

export default DistanceDisplay;
