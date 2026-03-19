import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface InstagramVerification {
  id: string;
  user_id: string;
  instagram_username: string | null;
  instagram_user_id: string | null;
  verification_status: 'pending' | 'connected' | 'verified' | 'rejected';
  connection_proof_url: string | null;
  connected_at: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
}

export const useMissaoInstagram = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: verification, isLoading: isLoadingVerification } = useQuery({
    queryKey: ['instagram-verification', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_instagram_verifications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar verificação:', error);
        throw error;
      }

      return data as InstagramVerification | null;
    },
    enabled: !!user?.id,
    refetchInterval: (query) => {
      // Auto-refetch a cada 5 segundos se estiver pending
      const data = query.state.data as InstagramVerification | null;
      return data?.verification_status === 'pending' ? 5000 : false;
    }
  });

  const { data: missao, isLoading: isLoadingMissao } = useQuery({
    queryKey: ['missao-instagram', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('missoes')
        .select(`
          *,
          missoes_usuarios!inner(
            progresso_atual,
            progresso_necessario,
            status,
            data_completada
          )
        `)
        .eq('missoes_usuarios.user_id', user.id)
        .ilike('titulo', '%Instagram%')
        .eq('tipo_missao', 'social')
        .eq('ativo', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar missão:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id
  });

  const conectarInstagram = useMutation({
    mutationFn: async (instagramUsername: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const cleanUsername = instagramUsername.replace('@', '').trim();
      if (!cleanUsername) throw new Error('Username inválido');

      const { data: existing } = await supabase
        .from('user_instagram_verifications')
        .select('id, user_id')
        .eq('instagram_username', cleanUsername)
        .maybeSingle();

      if (existing && existing.user_id !== user.id) {
        throw new Error('Este username já está conectado a outra conta');
      }

      const { data, error } = await supabase
        .from('user_instagram_verifications')
        .upsert({
          user_id: user.id,
          instagram_username: cleanUsername,
          verification_status: 'pending',
          connected_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ instagram: cleanUsername })
        .eq('id', user.id);

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Instagram conectado!",
        description: "Agora siga @giramaeoficial e marque-nos em uma story para completar a missão.",
      });
      queryClient.invalidateQueries({ queryKey: ['instagram-verification'] });
      queryClient.invalidateQueries({ queryKey: ['missao-instagram'] });
      queryClient.invalidateQueries({ queryKey: ['missoes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao conectar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const verificarManualmente = useMutation({
    mutationFn: async (verificationId: string) => {
      const { error } = await supabase
        .from('user_instagram_verifications')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', verificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Verificação aprovada!",
        description: "A missão foi completada.",
      });
      queryClient.invalidateQueries({ queryKey: ['instagram-verification'] });
      queryClient.invalidateQueries({ queryKey: ['missao-instagram'] });
      queryClient.invalidateQueries({ queryKey: ['missoes'] });
    }
  });

  const isVerified = verification?.verification_status === 'verified';
  const isPending = verification?.verification_status === 'pending';
  const isConnected = !!verification?.instagram_username;

  return {
    verification,
    missao,
    isLoading: isLoadingVerification || isLoadingMissao,
    isVerified,
    isPending,
    isConnected,
    conectarInstagram,
    verificarManualmente
  };
};
