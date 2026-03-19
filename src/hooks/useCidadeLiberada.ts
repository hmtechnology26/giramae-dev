import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CidadeLiberadaData {
  liberada: boolean;
  loading: boolean;
  error: boolean;
  cidade: string | null;
  estado: string | null;
}

export const useCidadeLiberada = (): CidadeLiberadaData => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['cidade-liberada', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Buscar dados do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cidade, estado')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.cidade || !profile.estado) {
        return {
          cidade: profile.cidade,
          estado: profile.estado,
          liberada: false
        };
      }

      // Buscar configuração da cidade
      const { data: cidadeConfig, error: configError } = await supabase
        .from('cidades_config')
        .select('liberada')
        .eq('cidade', profile.cidade)
        .eq('estado', profile.estado)
        .maybeSingle();

      if (configError) throw configError;

      return {
        cidade: profile.cidade,
        estado: profile.estado,
        liberada: cidadeConfig?.liberada || false
      };
    },
    enabled: !!user?.id,
    staleTime: 0, // Dados críticos sempre atuais
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true
  });

  // Função para invalidar cache quando cidade for liberada
  const invalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: ['cidade-liberada'] });
    queryClient.invalidateQueries({ queryKey: ['regiao'] });
  };

  return {
    liberada: data?.liberada || false,
    loading: isLoading,
    error: !!error,
    cidade: data?.cidade || null,
    estado: data?.estado || null
  };
};