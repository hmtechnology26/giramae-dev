// ================================================================
// MissaoGuard.tsx - DESATIVADO (missão obrigatória removida)
// ================================================================
// NOTA: Este guard foi simplificado para apenas redirecionar
// usuários que já completaram onboarding para o feed
// ================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';

interface MissaoGuardProps {
  children: React.ReactNode;
}

/**
 * Guard simplificado - apenas redireciona para feed
 * Mantido para compatibilidade com rotas existentes
 */
const MissaoGuard: React.FC<MissaoGuardProps> = ({ children }) => {
  // Redirecionar qualquer tentativa de acessar rotas de missão para o feed
  return <Navigate to="/feed" replace />;
};

export default MissaoGuard;
