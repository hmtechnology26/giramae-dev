
import { createContext, useContext, useState, ReactNode } from 'react';
import NotificacaoRecompensa from './NotificacaoRecompensa';

interface Recompensa {
  tipo: 'troca' | 'meta' | 'avaliacao' | 'indicacao' | 'cadastro' | 'jornada';
  valor: number;
  descricao: string;
  meta?: string;
}

interface RecompensasContextType {
  mostrarRecompensa: (recompensa: Recompensa) => void;
}

const RecompensasContext = createContext<RecompensasContextType | undefined>(undefined);

export const useRecompensas = () => {
  const context = useContext(RecompensasContext);
  if (!context) {
    throw new Error('useRecompensas must be used within RecompensasProvider');
  }
  return context;
};

interface RecompensasProviderProps {
  children: ReactNode;
}

export const RecompensasProvider = ({ children }: RecompensasProviderProps) => {
  const [recompensaAtual, setRecompensaAtual] = useState<Recompensa | null>(null);

  const mostrarRecompensa = (recompensa: Recompensa) => {
    setRecompensaAtual(recompensa);
  };

  const fecharRecompensa = () => {
    setRecompensaAtual(null);
  };

  return (
    <RecompensasContext.Provider value={{ mostrarRecompensa }}>
      {children}
      <NotificacaoRecompensa 
        recompensa={recompensaAtual} 
        onClose={fecharRecompensa} 
      />
    </RecompensasContext.Provider>
  );
};
