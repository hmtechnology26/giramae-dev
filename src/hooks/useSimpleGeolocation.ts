
import { useState } from 'react';

interface LocationData {
  cidade: string;
  estado: string;
  bairro?: string;
}

export const useSimpleGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectarLocalizacao = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      // Por enquanto vamos simular o geocoding reverso
      // Em um cenário real, usaríamos as coordenadas para buscar o endereço
      const mockLocation: LocationData = {
        cidade: 'Canoas',
        estado: 'RS',
        bairro: 'Harmonia'
      };
      
      setLocation(mockLocation);
    } catch (err) {
      setError('Não foi possível detectar sua localização');
    } finally {
      setLoading(false);
    }
  };

  const limparLocalizacao = () => {
    setLocation(null);
    setError(null);
  };

  return { 
    location, 
    loading, 
    error, 
    detectarLocalizacao,
    limparLocalizacao
  };
};
