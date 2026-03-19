import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type OnboardingStatus = 'whatsapp' | 'codigo' | 'termos' | 'endereco' | 'itens' | 'aguardando' | 'liberado' | 'completo';

interface OnboardingProfile {
  cadastro_status: OnboardingStatus;
  telefone_verificado: boolean;
  termos_aceitos: boolean;
  politica_aceita: boolean;
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Carregar perfil do usuário
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('cadastro_status, telefone_verificado, termos_aceitos, politica_aceita, nome, telefone, endereco, bairro, cidade, estado, cep')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(data as OnboardingProfile);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus dados. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  // Atualizar status do onboarding
  const updateStatus = async (newStatus: OnboardingStatus, additionalData?: Partial<OnboardingProfile>) => {
    if (!user) return false;

    setUpdating(true);
    try {
      const updateData = {
        cadastro_status: newStatus,
        ...additionalData,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu progresso. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Aceitar termos
  const acceptTerms = async (termos: boolean, politica: boolean) => {
    if (!user) return false;

    setUpdating(true);
    try {
      const updateData = {
        termos_aceitos: termos,
        politica_aceita: politica,
        termos_aceitos_em: termos ? new Date().toISOString() : null,
        politica_aceita_em: politica ? new Date().toISOString() : null,
        cadastro_status: 'endereco' as OnboardingStatus,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      
      return true;
    } catch (error) {
      console.error('Erro ao aceitar termos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o aceite dos termos. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Navegar para próxima etapa
  const navigateToNext = (status: OnboardingStatus) => {
    switch (status) {
      case 'codigo':
        navigate('/onboarding/codigo');
        break;
      case 'termos':
        navigate('/onboarding/termos');
        break;
      case 'endereco':
        navigate('/onboarding/endereco');
        break;
      case 'itens':
        navigate('/conceito-comunidade');
        break;
      case 'aguardando':
        navigate('/aguardando-liberacao');
        break;
      case 'liberado':
      case 'completo':
        navigate('/feed');
        break;
      default:
        navigate('/onboarding/whatsapp');
        break;
    }
  };

  // Navegar para etapa anterior
  const navigateBack = () => {
    if (!profile) return;

    switch (profile.cadastro_status) {
      case 'codigo':
        navigate('/onboarding/whatsapp');
        break;
      case 'termos':
        navigate('/onboarding/codigo');
        break;
      case 'endereco':
        navigate('/onboarding/termos');
        break;
      default:
        navigate('/onboarding/whatsapp');
        break;
    }
  };

  // Obter progresso atual (1-6)
  const getCurrentProgress = (): number => {
    if (!profile) return 1;

    switch (profile.cadastro_status) {
      case 'whatsapp':
        return 1;
      case 'codigo':
        return 2;
      case 'termos':
        return 3;
      case 'endereco':
        return 4;
      case 'itens':
        return 5;
      default:
        return 6;
    }
  };

  return {
    profile,
    loading,
    updating,
    updateStatus,
    acceptTerms,
    navigateToNext,
    navigateBack,
    getCurrentProgress,
  };
};