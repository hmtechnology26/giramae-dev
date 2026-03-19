// ================================================================
// 6. AdminGuard.tsx - GUARD INDEPENDENTE (apenas admin)
// ================================================================

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [telefoneVerificado, setTelefoneVerificado] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Verificar se é admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        const adminStatus = !adminError && adminData;

        // Verificar se telefone foi verificado
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('telefone_verificado')
          .eq('id', user.id)
          .single();

        const telefoneStatus = !profileError && profileData?.telefone_verificado;

        setIsAdmin(!!adminStatus);
        setTelefoneVerificado(!!telefoneStatus);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando permissões administrativas...</p>
        </div>
      </div>
    );
  }

  // Verificar se não é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-semibold text-red-800">Acesso Negado</h2>
          <p className="text-red-600">Você não tem permissões administrativas.</p>
          <button
            onClick={() => window.location.href = '/feed'}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar ao Feed
          </button>
        </div>
      </div>
    );
  }

  // Verificar se telefone foi verificado
  if (!telefoneVerificado) {
    return <Navigate to="/onboarding/whatsapp" replace />;
  }

  // Admin com telefone verificado tem acesso
  return <>{children}</>;
};

export default AdminGuard;
