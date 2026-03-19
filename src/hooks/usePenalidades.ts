import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PenalidadeUsuario {
  id: string;
  usuario_id: string;
  tipo: string;
  nivel: number;
  motivo?: string;
  expira_em?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const usePenalidades = () => {
  const { user } = useAuth();
  const [penalidades, setPenalidades] = useState<PenalidadeUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPenalidades = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('penalidades_usuario')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPenalidades(data || []);
    } catch (err) {
      console.error('Erro ao buscar penalidades:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPenalidades();
    }
  }, [user?.id]);

  const getPenalidadesAtivas = () => {
    return penalidades.filter(p => 
      p.ativo && 
      (!p.expira_em || new Date(p.expira_em) > new Date())
    );
  };

  const getNivelTexto = (nivel: number) => {
    switch (nivel) {
      case 1: return 'Leve';
      case 2: return 'Médio';
      case 3: return 'Grave';
      default: return 'Desconhecido';
    }
  };

  const getCorNivel = (nivel: number) => {
    switch (nivel) {
      case 1: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2: return 'text-orange-600 bg-orange-50 border-orange-200';
      case 3: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return {
    penalidades,
    loading,
    error,
    refetch: fetchPenalidades,
    getPenalidadesAtivas,
    getNivelTexto,
    getCorNivel
  };
};