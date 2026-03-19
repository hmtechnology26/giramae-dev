
import { useState, useCallback } from 'react';

interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GeolocationResult {
  coords: GeolocationCoords | null;
  loading: boolean;
  error: string | null;
  detectar: () => Promise<void>;
  resetar: () => void;
}

const STORAGE_KEY = 'giramae_last_location';

export const useGeolocation = (): GeolocationResult => {
  const [coords, setCoords] = useState<GeolocationCoords | null>(() => {
    // Tentar recuperar última localização do localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verificar se não está muito antiga (5 minutos)
        if (Date.now() - parsed.timestamp < 300000) {
          return parsed.coords;
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectar = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      return;
    }

    setLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutos
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const newCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      setCoords(newCoords);
      
      // Salvar no localStorage com timestamp
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        coords: newCoords,
        timestamp: Date.now()
      }));

    } catch (err) {
      let errorMessage = 'Erro ao detectar localização';
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case err.TIMEOUT:
            errorMessage = 'Tempo limite excedido';
            break;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetar = useCallback(() => {
    setCoords(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    coords,
    loading,
    error,
    detectar,
    resetar
  };
};
