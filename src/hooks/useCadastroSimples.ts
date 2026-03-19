import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CadastroStatus {
  status: 'incompleto' | 'dados_completos' | 'completo';
  loading: boolean;
}

export const useCadastroSimples = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cadastroStatus, setCadastroStatus] = useState<CadastroStatus>({
    status: 'incompleto',
    loading: true
  });

  const checkCadastroStatus = useCallback(async () => {
    if (!user) {
      setCadastroStatus({ status: 'incompleto', loading: false });
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('cadastro_status')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao verificar status do cadastro:', error);
        setCadastroStatus({ status: 'incompleto', loading: false });
        return;
      }

      setCadastroStatus({
        status: profile.cadastro_status as 'incompleto' | 'dados_completos' | 'completo',
        loading: false
      });
    } catch (error) {
      console.error('Erro ao verificar cadastro:', error);
      setCadastroStatus({ status: 'incompleto', loading: false });
    }
  }, [user]);

  const updateCadastroStatus = useCallback(async (newStatus: 'incompleto' | 'dados_completos' | 'completo') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ cadastro_status: newStatus })
        .eq('id', user.id);

      if (error) throw error;

      setCadastroStatus(prev => ({ ...prev, status: newStatus }));
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar status do cadastro:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  return {
    cadastroStatus,
    checkCadastroStatus,
    updateCadastroStatus
  };
};