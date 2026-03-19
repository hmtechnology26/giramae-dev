// AuthCallback.tsx - CORREÇÃO
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { referralStorage } from '@/utils/referralStorage';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback: React.FC = () => {
  const { user, loading } = useAuth(); // ✅ ADICIONAR LOADING
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ AGUARDAR LOADING TERMINAR
    if (loading) {
      return; // Não fazer nada enquanto carrega
    }

    const processarCallback = async () => {
      if (user) {
        console.log('✅ User found after OAuth:', user);
        
        // Processar indicação pendente se existir
        const referralData = referralStorage.get();
        if (referralData && !referralData.processed) {
          try {
            const { error } = await supabase.rpc('registrar_indicacao', {
              p_indicador_id: referralData.indicadorId,
              p_indicado_id: user.id
            });
            
            if (!error) {
              referralStorage.markAsProcessed();
            }
          } catch (error) {
            console.warn('Erro ao processar indicação no callback:', error);
          }
        }
        
        navigate('/feed', { replace: true });
      } else {
        console.log('❌ No user found after OAuth');
        navigate('/auth', { replace: true });
      }
    };

    processarCallback();
  }, [user, loading, navigate]); // ✅ ADICIONAR LOADING NAS DEPENDÊNCIAS

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">
          {loading ? 'Verificando autenticação...' : 'Finalizando login...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
