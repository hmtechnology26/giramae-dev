// src/hooks/useSeguidores.ts
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Seguidor = Tables<'seguidores'>;

export const useSeguidores = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seguirUsuario = useCallback(async (seguidoId: string) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('seguidores')
        .insert({
          seguidor_id: user.id,
          seguido_id: seguidoId
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao seguir usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao seguir usuário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deixarDeSeguir = useCallback(async (seguidoId: string) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('seguidores')
        .delete()
        .eq('seguidor_id', user.id)
        .eq('seguido_id', seguidoId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao deixar de seguir usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deixar de seguir usuário');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const verificarSeSigo = useCallback(async (seguidoId: string) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('seguidores')
        .select('id')
        .eq('seguidor_id', user.id)
        .eq('seguido_id', seguidoId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (err) {
      console.error('Erro ao verificar seguimento:', err);
      return false;
    }
  }, [user]);

  // ✅ CORREÇÃO: buscarSeguindo com useCallback
  const buscarSeguindo = useCallback(async () => {
    if (!user?.id) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('seguidores')
        .select(`
          *,
          profiles!seguido_id(*)
        `)
        .eq('seguidor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Dados de seguindo retornados:', data);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar quem sigo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar seguindo');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ✅ CORREÇÃO: buscarSeguidores com useCallback
  const buscarSeguidores = useCallback(async () => {
    if (!user?.id) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('seguidores')
        .select(`
          *,
          profiles!seguidor_id(*)
        `)
        .eq('seguido_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar seguidores:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar seguidores');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const buscarEstatisticas = useCallback(async (usuarioId?: string) => {
    const targetId = usuarioId || user?.id;
    if (!targetId) return { total_seguindo: 0, total_seguidores: 0 };
    
    try {
      const { data, error } = await supabase
        .rpc('obter_estatisticas_seguidor', { p_usuario_id: targetId });

      if (error) throw error;
      return data?.[0] || { total_seguindo: 0, total_seguidores: 0 };
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      return { total_seguindo: 0, total_seguidores: 0 };
    }
  }, [user?.id]);

  // ✅ CORREÇÃO: buscarItensDasMinhasSeguidas com useCallback
  const buscarItensDasMinhasSeguidas = useCallback(async () => {
    if (!user?.id) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro buscar os IDs das usuárias que sigo
      const { data: seguidas, error: seguidasError } = await supabase
        .from('seguidores')
        .select('seguido_id')
        .eq('seguidor_id', user.id);

      if (seguidasError) throw seguidasError;

      if (!seguidas || seguidas.length === 0) return [];

      const seguidas_ids = seguidas.map(s => s.seguido_id);

      // Buscar itens das usuárias seguidas
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles!publicado_por(*)
        `)
        .in('publicado_por', seguidas_ids)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar itens das seguidas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens das seguidas');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    seguirUsuario,
    deixarDeSeguir,
    verificarSeSigo,
    buscarSeguindo,
    buscarSeguidores,
    buscarEstatisticas,
    buscarItensDasMinhasSeguidas,
    loading,
    error
  };
};
