
import { useState } from 'react';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const useViaCep = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarCep = async (cep: string): Promise<ViaCepResponse | null> => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }

      return data;
    } catch (err) {
      setError('Erro ao buscar CEP');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    buscarCep
  };
};
