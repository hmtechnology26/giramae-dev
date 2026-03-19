
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Genero {
  codigo: string;
  nome: string;
  icone?: string;
  ordem: number;
  ativo: boolean;
}

export const useGeneros = () => {
  return useQuery({
    queryKey: ['generos'],
    queryFn: async () => {
      console.log('🔍 Buscando gêneros disponíveis...');

      const { data, error } = await supabase
        .from('generos')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) {
        console.error('❌ Erro ao buscar gêneros:', error);
        throw error;
      }

      console.log('✅ Gêneros encontrados:', data?.length || 0);
      return data as Genero[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
};
