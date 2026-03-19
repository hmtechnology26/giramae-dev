// ================================================================
// 4. AguardandoCidadeGuard.tsx - STEP 7 (aguardando cidade)
// ================================================================

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface AguardandoCidadeGuardProps {
  children: React.ReactNode;
}

const AguardandoCidadeGuard: React.FC<AguardandoCidadeGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    const checkCidadeStatus = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Verificar dados do perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            telefone_verificado,
            termos_aceitos,
            politica_aceita,
            endereco,
            numero,
            cidade,
            estado
          `)
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao verificar perfil:', profileError);
          setLoading(false);
          return;
        }

        // Contar itens publicados
        const { count: itensCount, error: itensError } = await supabase
          .from('itens')
          .select('*', { count: 'exact', head: true })
          .eq('publicado_por', user.id)
          .neq('status', 'removido');

        if (itensError) {
          console.error('Erro ao contar itens:', itensError);
        }

        // Verificar se cidade está liberada
        let cidadeLiberada = false;
        if (profile.cidade && profile.estado) {
          const { data: cidadeConfig, error: cidadeError } = await supabase
            .from('cidades_config')
            .select('liberada')
            .eq('cidade', profile.cidade)
            .eq('estado', profile.estado)
            .single();

          if (!cidadeError && cidadeConfig) {
            cidadeLiberada = cidadeConfig.liberada;
          }
        }

        setUserStatus({
          ...profile,
          itens_publicados: itensCount || 0,
          cidade_liberada: cidadeLiberada
        });
        setLoading(false);
      } catch (error) {
        console.error('Erro no AguardandoCidadeGuard:', error);
        setLoading(false);
      }
    };

    checkCidadeStatus();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando status da cidade...</p>
        </div>
      </div>
    );
  }

  if (!userStatus) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar pré-requisitos
  const onboardingCompleto = userStatus.telefone_verificado && 
                            userStatus.termos_aceitos && 
                            userStatus.politica_aceita && 
                            userStatus.endereco && 
                            userStatus.numero &&
                            userStatus.cidade &&
                            userStatus.estado;

  const missaoCompleta = userStatus.itens_publicados >= 2;

  // Se pré-requisitos não atendidos, redirecionar
  if (!onboardingCompleto) {
    return <Navigate to="/onboarding/whatsapp" replace />;
  }

  if (!missaoCompleta) {
    return <Navigate to="/conceito-comunidade" replace />;
  }

  // Se cidade foi liberada, redirecionar para acesso total
  if (userStatus.cidade_liberada) {
    return <Navigate to="/feed" replace />;
  }

  // Usuário está no estado correto: ritual completo + cidade não liberada
  return <>{children}</>;
};

export default AguardandoCidadeGuard;
