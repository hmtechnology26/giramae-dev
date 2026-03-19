import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Gift, Star, X } from "lucide-react";
import { GiraAvatar } from "@/modules/onboarding/components/GiraAvatar";

interface Recompensa {
  tipo: 'troca' | 'meta' | 'avaliacao' | 'indicacao' | 'cadastro' | 'jornada';
  valor: number;
  descricao: string;
  meta?: string;
}

interface NotificacaoRecompensaProps {
  recompensa: Recompensa | null;
  onClose: () => void;
}

const NotificacaoRecompensa = ({ recompensa, onClose }: NotificacaoRecompensaProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recompensa) {
      // Encontrar elemento do saldo no header
      const walletElement = document.querySelector('[data-tour="wallet-button"]');
      
      if (walletElement) {
        const rect = walletElement.getBoundingClientRect();
        setTargetPosition({
          top: rect.bottom + 12,
          left: Math.max(16, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 336)),
        });
        
        // Adicionar highlight ao elemento do saldo
        walletElement.classList.add('gira-highlight-pulse');
      }
      
      setIsVisible(true);
      setShowConfetti(true);
      
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [recompensa]);

  const handleClose = () => {
    // Remover highlight do saldo
    const walletElement = document.querySelector('[data-tour="wallet-button"]');
    if (walletElement) {
      walletElement.classList.remove('gira-highlight-pulse');
    }
    
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!recompensa || !isVisible) return null;

  const getIcon = () => {
    switch (recompensa.tipo) {
      case 'troca':
        return <Gift className="h-8 w-8 text-green-500" />;
      case 'meta':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'avaliacao':
        return <Star className="h-8 w-8 text-blue-500" />;
      case 'indicacao':
        return <Sparkles className="h-8 w-8 text-purple-500" />;
      case 'cadastro':
        return <Gift className="h-8 w-8 text-pink-500" />;
      case 'jornada':
        return <Trophy className="h-8 w-8 text-pink-500" />;
      default:
        return <Sparkles className="h-8 w-8 text-primary" />;
    }
  };

  const getTitulo = () => {
    switch (recompensa.tipo) {
      case 'troca':
        return '🎉 Troca Fantástica!';
      case 'meta':
        return `🏆 ${recompensa.meta?.toUpperCase() || 'CONQUISTA'}!`;
      case 'avaliacao':
        return '⭐ Você é Incrível!';
      case 'indicacao':
        return '👥 Embaixadora!';
      case 'cadastro':
        return '🎁 Bem-vinda!';
      case 'jornada':
        return `${recompensa.meta || '🗺️'} Concluído!`;
      default:
        return '✨ Parabéns!';
    }
  };

  // Tooltip posicionado abaixo do saldo
  return (
    <>
      {/* Overlay escuro */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              {['✨', '🎉', '⭐', '💫', '🌟'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}
      
      {/* Tooltip apontando para o saldo */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-[320px] animate-scale-in"
        style={{
          top: targetPosition?.top ?? '50%',
          left: targetPosition?.left ?? '50%',
          transform: targetPosition ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        {/* Seta apontando para cima (para o saldo) */}
        {targetPosition && (
          <div 
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-pink-100 to-rose-50 rotate-45 border-l border-t border-pink-200"
          />
        )}
        
        <div className="bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-50 rounded-2xl shadow-2xl border-2 border-pink-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-200/50 to-rose-200/50">
            <div className="flex items-center gap-2">
              {getIcon()}
              <span className="font-bold text-gray-800">{getTitulo()}</span>
            </div>
            <button 
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-white/50 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Gira Avatar celebrando */}
            <div className="flex justify-center">
              <div className="w-24 h-24">
                <GiraAvatar emotion="celebrating" size="lg" />
              </div>
            </div>
            
            {/* Descrição */}
            <p className="text-center text-sm text-gray-700 font-medium">
              {recompensa.descricao}
            </p>
            
            {/* Badge de Girinhas */}
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 text-lg shadow-lg animate-pulse">
                +{recompensa.valor} Girinha{recompensa.valor > 1 ? 's' : ''}
              </Badge>
              <Sparkles className="h-5 w-5 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            
            {/* Mensagem sobre o saldo */}
            <p className="text-center text-xs text-gray-500">
              ☝️ Seu saldo foi atualizado acima!
            </p>
            
            {/* Botão */}
            <Button 
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-lg"
            >
              ✨ Continuar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificacaoRecompensa;
