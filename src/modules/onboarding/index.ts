// ═══════════════════════════════════════════════════════════
// BARREL EXPORT - Único arquivo que o resto da app importa
// ═══════════════════════════════════════════════════════════

// Provider (usado no App.tsx)
export { GiraTourProvider } from './core/GiraTourProvider';

// Hook principal (usado em qualquer componente)
export { useGiraTour } from './core/useGiraTour';

// Widgets (usados onde necessário)
export { OnboardingChecklist } from './widgets/OnboardingChecklist';
export { GiraHelperButton } from './widgets/GiraHelperButton';
export { TourReplayButton } from './widgets/TourReplayButton';

// Hook de trigger (usado nas páginas)
export { useTourTrigger } from './hooks/useTourTrigger';

// Types (para quem precisar tipar)
export type { 
  TourConfig, 
  TourStepConfig, 
  GiraEmotion 
} from './types';