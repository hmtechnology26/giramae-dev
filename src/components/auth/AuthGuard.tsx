import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (authLoading) {
        return;
      }

      // Se não está logado, redirecionar para auth
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      // ✅ CORREÇÃO: Não verificar cadastro_status aqui
      // O CadastroCompletoGuard cuida disso via modal
      // AuthGuard só verifica se está logado
      
      setChecking(false);
    };

    checkUserStatus();
  }, [user, authLoading, navigate, location.pathname]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
