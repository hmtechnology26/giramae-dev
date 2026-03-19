import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  nome: string;
  email?: string;
  avatar_url?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  created_at: string;
  total_vendas?: number;
  total_compras?: number;
  reputacao?: number;
}

export const useUserProfiles = () => {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (profiles[userId]) {
      return profiles[userId];
    }

    try {
      setLoading(true);
      
      // Buscar perfil básico
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, nome, email, avatar_url, cidade, estado, telefone, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!profile) return null;

      // Buscar estatísticas de vendas e compras
      const { data: vendasData } = await supabase
        .from('reservas')
        .select('id')
        .eq('usuario_item', userId)
        .eq('status', 'confirmada');

      const { data: comprasData } = await supabase
        .from('reservas')
        .select('id')
        .eq('usuario_reservou', userId)
        .eq('status', 'confirmada');

      // Buscar média de avaliações (simulado)
      const reputacao = 4.0 + (Math.random() * 1.0);

      const userProfile: UserProfile = {
        ...profile,
        total_vendas: vendasData?.length || 0,
        total_compras: comprasData?.length || 0,
        reputacao: Math.round(reputacao * 10) / 10
      };

      setProfiles(prev => ({ ...prev, [userId]: userProfile }));
      return userProfile;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchMultipleProfiles = async (userIds: string[]) => {
    const uniqueIds = [...new Set(userIds)].filter(id => !profiles[id]);
    
    if (uniqueIds.length === 0) return;

    try {
      setLoading(true);
      
      for (const userId of uniqueIds) {
        await fetchUserProfile(userId);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    profiles,
    loading,
    fetchUserProfile,
    fetchMultipleProfiles
  };
};