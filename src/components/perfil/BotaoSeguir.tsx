
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useSeguidores } from '@/hooks/useSeguidores';
import { useAuth } from '@/hooks/useAuth';

interface BotaoSeguirProps {
  usuarioId: string;
  className?: string;
}

const BotaoSeguir = ({ usuarioId, className }: BotaoSeguirProps) => {
  const { user } = useAuth();
  const { seguirUsuario, deixarDeSeguir, verificarSeSigo, loading } = useSeguidores();
  const [seguindo, setSeguindo] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const verificarStatus = async () => {
      if (user && usuarioId && user.id !== usuarioId) {
        const sigo = await verificarSeSigo(usuarioId);
        setSeguindo(sigo);
      }
      setLoadingStatus(false);
    };

    verificarStatus();
  }, [user, usuarioId, verificarSeSigo]);

  const handleToggleSeguir = async () => {
    if (seguindo) {
      const sucesso = await deixarDeSeguir(usuarioId);
      if (sucesso) {
        setSeguindo(false);
      }
    } else {
      const sucesso = await seguirUsuario(usuarioId);
      if (sucesso) {
        setSeguindo(true);
      }
    }
  };

  // Não mostrar botão para o próprio usuário
  if (!user || user.id === usuarioId || loadingStatus) {
    return null;
  }

  return (
    <Button
      onClick={handleToggleSeguir}
      disabled={loading}
      variant={seguindo ? "outline" : "default"}
      className={className}
    >
      {seguindo ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Deixar de seguir
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Seguir
        </>
      )}
    </Button>
  );
};

export default BotaoSeguir;
