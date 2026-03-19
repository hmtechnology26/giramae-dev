
import { useState, useCallback } from 'react';

interface EnderecoDetectado {
  cidade: string;
  estado: string;
  bairro?: string;
  cep?: string;
}

interface ReverseGeocodingResult {
  endereco: EnderecoDetectado | null;
  loading: boolean;
  error: string | null;
  buscarEndereco: (lat: number, lng: number) => Promise<void>;
  resetar: () => void;
}

const CACHE_KEY = 'giramae_geocoding_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export const useReverseGeocoding = (): ReverseGeocodingResult => {
  const [endereco, setEndereco] = useState<EnderecoDetectado | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarEndereco = useCallback(async (lat: number, lng: number): Promise<void> => {
    // Verificar cache primeiro
    const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
    const cached = localStorage.getItem(`${CACHE_KEY}_${cacheKey}`);
    
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
          setEndereco(parsedCache.endereco);
          return;
        }
      } catch (e) {
        localStorage.removeItem(`${CACHE_KEY}_${cacheKey}`);
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Usar Nominatim API (OpenStreetMap) - gratuita
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pt-BR,pt,en`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GiraMae-App/1.0'
        }
      });

      if (!response.ok) {
        throw new Error('Erro na API de geocoding');
      }

      const data = await response.json();
      
      if (!data.address) {
        throw new Error('Endereço não encontrado');
      }

      const enderecoBrasil: EnderecoDetectado = {
        cidade: data.address.city || data.address.town || data.address.village || 'Cidade não identificada',
        estado: data.address.state || 'Estado não identificado',
        bairro: data.address.suburb || data.address.neighbourhood,
        cep: data.address.postcode
      };

      setEndereco(enderecoBrasil);

      // Salvar no cache
      localStorage.setItem(`${CACHE_KEY}_${cacheKey}`, JSON.stringify({
        endereco: enderecoBrasil,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error('Erro no reverse geocoding:', err);
      setError('Não foi possível identificar o endereço');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetar = useCallback(() => {
    setEndereco(null);
    setError(null);
  }, []);

  return {
    endereco,
    loading,
    error,
    buscarEndereco,
    resetar
  };
};
