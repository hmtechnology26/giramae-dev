// ================================================================
// 2. OnboardingGuard.tsx - STEPS 1-4 (dados básicos)
// ================================================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            telefone_verificado,
            termos_aceitos,
            politica_aceita,
            endereco,
            numero,
            cidade,
            estado,
            cadastro_status
          `)
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar onboarding:', error);
          setLoading(false);
          return;
        }

        setUserStatus(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro no OnboardingGuard:', error);
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando seu progresso...</p>
        </div>
      </div>
    );
  }

  if (!userStatus) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar se onboarding está completo
  const onboardingCompleto = userStatus.telefone_verificado && 
                            userStatus.termos_aceitos && 
                            userStatus.politica_aceita && 
                            userStatus.endereco && 
                            userStatus.numero &&
                            userStatus.cidade &&
                            userStatus.estado;

  // Se onboarding completo, bloquear acesso às telas de onboarding
  if (onboardingCompleto) {
    const onboardingRoutes = [
      '/onboarding/whatsapp',
      '/onboarding/codigo',
      '/onboarding/termos',
      '/onboarding/endereco'
    ];
    
    if (onboardingRoutes.includes(location.pathname)) {
      return <Navigate to="/conceito-comunidade" replace />;
    }
  }

  // Se onboarding incompleto, redirecionar para próximo passo
  if (!onboardingCompleto) {
    const allowedRoutes = [
      '/onboarding/whatsapp',
      '/onboarding/codigo',
      '/onboarding/termos',
      '/onboarding/endereco'
    ];
    
    if (!allowedRoutes.includes(location.pathname)) {
      // Determinar próximo passo
      if (!userStatus.telefone_verificado) {
        return <Navigate to="/onboarding/whatsapp" replace />;
      }
      if (!userStatus.termos_aceitos || !userStatus.politica_aceita) {
        return <Navigate to="/onboarding/termos" replace />;
      }
      if (!userStatus.endereco || !userStatus.numero || !userStatus.cidade || !userStatus.estado) {
        return <Navigate to="/onboarding/endereco" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default OnboardingGuard;
