import React, { useState, useEffect, useRef } from 'react';
import { useJornadas, JornadaComProgresso } from '@/hooks/useJornadas';
import { useGiraTour } from '../core/useGiraTour';
import { GiraAvatar } from '../components/GiraAvatar';
import { ChevronDown, ChevronUp, Check, Gift, X, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

const CATEGORIA_LABELS: Record<string, { label: string; icon: string }> = {
  tours: { label: 'Tours Guiados', icon: '🗺️' },
  favoritos: { label: 'Favoritos', icon: '❤️' },
  social: { label: 'Social', icon: '👥' },
  girinhas: { label: 'Girinhas', icon: '💰' },
  publicacao: { label: 'Publicação', icon: '📸' },
  perfil: { label: 'Perfil', icon: '✨' },
  geral: { label: 'Geral', icon: '🎯' },
};

export const OnboardingChecklist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['tours']);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ref para armazenar tour pendente após navegação
  const pendingTourRef = useRef<string | null>(null);
  
  const { 
    jornadasPorCategoria, 
    progressoPercentual, 
    jornadasConcluidas,
    totalJornadas,
    jornadaAtiva,
    concluirJornada,
    isPending,
  } = useJornadas();
  
  const { startTour, state: tourState } = useGiraTour();

  // Efeito para iniciar tour pendente após navegação
  useEffect(() => {
    if (pendingTourRef.current) {
      const tourId = pendingTourRef.current;
      pendingTourRef.current = null;
      
      // Aguardar a página carregar completamente
      const timer = setTimeout(() => {
        console.log(`[OnboardingChecklist] Iniciando tour pendente: ${tourId}`);
        startTour(tourId, true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, startTour]);

  // Não mostrar se desabilitado, sem jornadas, ou 100% completo
  if (!jornadaAtiva || totalJornadas === 0) return null;
  
  // Esconder se todas as jornadas foram concluídas
  if (jornadasConcluidas >= totalJornadas) return null;

  const toggleCategoria = (categoria: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoria) 
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  const handleJornadaClick = (jornada: JornadaComProgresso) => {
    console.log('[OnboardingChecklist] Clique na jornada:', {
      id: jornada.id,
      hasSteps: !!(jornada.steps && jornada.steps.length > 0),
      rota_destino: jornada.rota_destino,
      concluida: jornada.concluida,
      recompensa_coletada: jornada.recompensa_coletada,
    });
    
    // Se já coletou recompensa, não faz nada
    if (jornada.recompensa_coletada) {
      console.log('[OnboardingChecklist] Jornada já coletada, ignorando');
      return;
    }
    
    // Se pode coletar recompensa (concluída mas não coletada)
    if (jornada.concluida && !jornada.recompensa_coletada) {
      console.log('[OnboardingChecklist] Coletando recompensa...');
      concluirJornada(jornada.id);
      return;
    }
    
    // Se tem steps (é um tour guiado)
    const hasSteps = jornada.steps && jornada.steps.length > 0;
    
    if (hasSteps) {
      console.log('[OnboardingChecklist] É um tour com steps:', jornada.id);
      
      // Verificar se já foi completado (usando jornada.id como tour_id)
      if (tourState.completedTours.includes(jornada.id)) {
        console.log('[OnboardingChecklist] Tour já completado, ignorando');
        return;
      }
      
      setIsOpen(false);
      
      // Verificar se já está na rota correta
      const rotaAtual = location.pathname;
      const rotaDestino = jornada.rota_destino;
      
      console.log('[OnboardingChecklist] Rotas:', { rotaAtual, rotaDestino });
      
      if (rotaDestino && rotaAtual !== rotaDestino) {
        // Precisa navegar primeiro - armazenar tour pendente
        console.log(`[OnboardingChecklist] Navegando para ${rotaDestino}, tour ${jornada.id} será iniciado após`);
        pendingTourRef.current = jornada.id;
        navigate(rotaDestino);
      } else {
        // Já está na rota correta - iniciar tour diretamente
        console.log(`[OnboardingChecklist] Já na rota correta, iniciando tour ${jornada.id}`);
        setTimeout(() => {
          startTour(jornada.id, true);
        }, 300);
      }
      return;
    }
    
    // Para ações sem tour, apenas navegar
    console.log('[OnboardingChecklist] É uma ação, navegando para:', jornada.rota_destino);
    if (jornada.rota_destino) {
      navigate(jornada.rota_destino);
      setIsOpen(false);
    }
  };

  const categorias = Object.keys(jornadasPorCategoria);

  return (
    <>
      {/* Overlay quando aberto - mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Widget flutuante */}
      <div 
        className={cn(
          "fixed z-50 transition-all duration-300",
          // Mobile: bottom com espaço para nav, ocupa largura total quando aberto
          isOpen 
            ? "bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto md:w-80"
            : "bottom-20 right-4 md:bottom-4"
        )}
      >
        {/* Botão FAB quando fechado */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{progressoPercentual}%</span>
              </div>
              {/* Indicador de notificação */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            </div>
          </button>
        )}

        {/* Panel expandido */}
        {isOpen && (
          <div className="bg-background rounded-t-2xl md:rounded-2xl shadow-xl border border-border overflow-hidden max-h-[80vh] md:max-h-[70vh] flex flex-col">
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-background rounded-full p-1.5 w-10 h-10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{progressoPercentual}%</span>
                </div>
                <div className="text-left">
                  <span className="text-primary-foreground font-semibold block">
                    Sua Jornada
                  </span>
                  <span className="text-primary-foreground/70 text-xs">
                    {jornadasConcluidas}/{totalJornadas} completas
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground/70 hover:text-primary-foreground p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner motivacional */}
            <div className="p-3 bg-primary/5 border-b border-border shrink-0">
              <div className="flex gap-3 items-center">
                <div className="transform scale-75 origin-left -ml-2">
                  <GiraAvatar emotion="celebrating" size="sm" />
                </div>
                <p className="text-sm text-muted-foreground flex-1">
                  Complete as missões para ganhar <span className="text-primary font-semibold">Girinhas</span>!
                </p>
              </div>
            </div>

            {/* Lista de categorias - scrollable */}
            <div className="flex-1 overflow-y-auto p-3">
              {categorias.map(categoria => {
                const jornadas = jornadasPorCategoria[categoria];
                const isExpanded = expandedCategories.includes(categoria);
                const concluidas = jornadas.filter(j => j.recompensa_coletada).length;
                const catInfo = CATEGORIA_LABELS[categoria] || CATEGORIA_LABELS.geral;

                return (
                  <div key={categoria} className="mb-2">
                    {/* Header da categoria */}
                    <button
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      onClick={() => toggleCategoria(categoria)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{catInfo.icon}</span>
                        <span className="text-sm font-medium text-foreground">
                          {catInfo.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({concluidas}/{jornadas.length})
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* Lista de jornadas */}
                    {isExpanded && (
                      <div className="ml-2 mt-1 space-y-1">
                        {jornadas.map(jornada => {
                          const hasSteps = jornada.steps && jornada.steps.length > 0;
                          return (
                            <JornadaItem 
                              key={jornada.id} 
                              jornada={jornada}
                              onClick={() => handleJornadaClick(jornada)}
                              isPending={isPending}
                              isSkipped={hasSteps ? tourState.skippedTours?.includes(jornada.id) : false}
                              isCompleted={hasSteps ? tourState.completedTours.includes(jornada.id) : false}
                              hasSteps={hasSteps}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Barra de progresso - footer fixo */}
            <div className="p-3 border-t border-border bg-muted/30 shrink-0">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-primary to-pink-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressoPercentual}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

interface JornadaItemProps {
  jornada: JornadaComProgresso;
  onClick: () => void;
  isPending: boolean;
  isSkipped: boolean;
  isCompleted: boolean;
  hasSteps: boolean;
}

const JornadaItem: React.FC<JornadaItemProps> = ({ 
  jornada, 
  onClick, 
  isPending, 
  isSkipped,
  isCompleted,
  hasSteps 
}) => {
  const canCollect = jornada.concluida && !jornada.recompensa_coletada;
  const isDone = jornada.recompensa_coletada;
  
  // Se tem steps (é tour) e foi pulado, mostrar botão de iniciar manualmente
  const showPlayButton = hasSteps && isSkipped && !isDone && !isCompleted;
  
  // Se tem steps (é tour) e não foi feito ainda (nem pulado)
  const showStartButton = hasSteps && !isDone && !isCompleted && !isSkipped;

  const handleClick = () => {
    console.log('[JornadaItem] Clique detectado:', jornada.id, { isDone, isPending });
    if (!isDone && !isPending) {
      onClick();
    }
  };
  
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
        isDone 
          ? "bg-primary/5 opacity-60 cursor-not-allowed" 
          : canCollect
            ? "bg-gradient-to-r from-primary/10 to-pink-500/10 animate-pulse cursor-pointer"
            : showPlayButton
              ? "bg-yellow-500/10 hover:bg-yellow-500/20 cursor-pointer"
              : showStartButton
                ? "bg-primary/5 hover:bg-primary/10 cursor-pointer"
                : "hover:bg-accent/50 cursor-pointer"
      )}
      onClick={handleClick}
      type="button"
    >
      {/* Status icon */}
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
        isDone 
          ? "bg-primary text-primary-foreground" 
          : canCollect
            ? "bg-primary/20 text-primary"
            : showPlayButton
              ? "bg-yellow-500/20 text-yellow-600"
              : showStartButton
                ? "bg-primary/20 text-primary"
                : "border-2 border-muted-foreground/30"
      )}>
        {isDone ? (
          <Check className="w-4 h-4" />
        ) : canCollect ? (
          <Gift className="w-4 h-4" />
        ) : showPlayButton || showStartButton ? (
          <Play className="w-4 h-4" />
        ) : (
          <span className="text-sm">{jornada.icone}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-sm block truncate font-medium",
          isDone 
            ? "text-muted-foreground line-through" 
            : "text-foreground"
        )}>
          {jornada.titulo}
        </span>
        {canCollect && (
          <span className="text-xs text-primary font-semibold">
            Toque para coletar +{jornada.recompensa_girinhas}G$
          </span>
        )}
        {showPlayButton && (
          <span className="text-xs text-yellow-600">
            Toque para retomar o tour
          </span>
        )}
        {showStartButton && (
          <span className="text-xs text-primary">
            Toque para iniciar o tour
          </span>
        )}
      </div>

      {/* Reward badge */}
      {!isDone && (
        <div className="flex items-center gap-1 text-xs shrink-0 bg-primary/10 px-2 py-1 rounded-full">
          <span className="font-semibold text-primary">+{jornada.recompensa_girinhas}</span>
          <span className="text-primary">G$</span>
        </div>
      )}
    </button>
  );
};
