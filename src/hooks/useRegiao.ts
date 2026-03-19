import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface RegiaoData {
  cidade: string | null;
  estado: string | null;
  liberada: boolean;
  usuariosAguardando: number;
  usuariosLiberados: number;
  itensPublicados: number;
  loading: boolean;
  error: boolean;
}

export const useRegiao = (): RegiaoData => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['regiao', user?.id],
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
          liberada: false,
          usuariosAguardando: 0,
          usuariosLiberados: 0,
          itensPublicados: 0
        };
      }

      // Buscar configuração da cidade
      const { data: cidadeConfig, error: configError } = await supabase
        .from('cidades_config')
        .select('*')
        .eq('cidade', profile.cidade)
        .eq('estado', profile.estado)
        .maybeSingle();

      if (configError) throw configError;

      return {
        cidade: profile.cidade,
        estado: profile.estado,
        liberada: cidadeConfig?.liberada || false,
        usuariosAguardando: cidadeConfig?.usuarios_aguardando || 0,
        usuariosLiberados: cidadeConfig?.usuarios_liberados || 0,
        itensPublicados: cidadeConfig?.itens_publicados || 0
      };
    },
    enabled: !!user?.id,
    staleTime: 0, // Dados críticos sempre atuais
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    cidade: data?.cidade || null,
    estado: data?.estado || null,
    liberada: data?.liberada || false,
    usuariosAguardando: data?.usuariosAguardando || 0,
    usuariosLiberados: data?.usuariosLiberados || 0,
    itensPublicados: data?.itensPublicados || 0,
    loading: isLoading,
    error: !!error
  };
};