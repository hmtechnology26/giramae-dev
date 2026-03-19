
import { useState, useCallback } from 'react';
import { useGeolocation } from './useGeolocation';
import { useReverseGeocoding } from './useReverseGeocoding';

interface LocationDetected {
  cidade: string;
  estado: string;
  bairro?: string;
}

type DetectionState = 'idle' | 'detecting' | 'success' | 'error';

interface LocationDetectionResult {
  location: LocationDetected | null;
  loading: boolean;
  error: string | null;
  detectarLocalizacao: () => Promise<void>;
  limparLocalizacao: () => void;
  estado: DetectionState;
}

export const useLocationDetection = (): LocationDetectionResult => {
  const [estado, setEstado] = useState<DetectionState>('idle');
  const { coords, loading: geoLoading, error: geoError, detectar: detectarGeo, resetar: resetarGeo } = useGeolocation();
  const { endereco, loading: geocodingLoading, error: geocodingError, buscarEndereco, resetar: resetarGeocoding } = useReverseGeocoding();

  const loading = geoLoading || geocodingLoading;
  const error = geoError || geocodingError;

  const detectarLocalizacao = useCallback(async (): Promise<void> => {
    setEstado('detecting');
    
    try {
      // Primeiro detectar coordenadas
      await detectarGeo();
      
      // Se geolocalização foi bem-sucedida, buscar endereço
      if (coords) {
        await buscarEndereco(coords.latitude, coords.longitude);
        setEstado('success');
      }
    } catch (err) {
      console.error('Erro na detecção de localização:', err);
      setEstado('error');
    }
  }, [detectarGeo, buscarEndereco, coords]);

  const limparLocalizacao = useCallback(() => {
    resetarGeo();
    resetarGeocoding();
    setEstado('idle');
  }, [resetarGeo, resetarGeocoding]);

  // Converter endereco para formato de location
  const location: LocationDetected | null = endereco ? {
    cidade: endereco.cidade,
    estado: endereco.estado,
    bairro: endereco.bairro
  } : null;

  return {
    location,
    loading,
    error,
    detectarLocalizacao,
    limparLocalizacao,
    estado
  };
};
