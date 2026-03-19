// Hook simplificado - funções obsoletas removidas
export const useRotaUsuario = () => {
  return {
    checkUserStatus: () => null,
    invalidateCache: () => {},
    isLoading: false,
    error: null
  };
};

export const useCanAccessRoute = (targetRoute: string) => {
  return {
    canAccess: true,
    correctRoute: null,
    reason: null,
    isLoading: false
  };
};

export const useHasFullAccess = () => true;

export const useRoutingReason = () => {
  return {
    isAdmin: () => false,
    isCityReleased: () => false,
    isPhoneVerified: () => false,
    hasMissionComplete: () => false,
    getCurrentStep: () => 1,
    getDebugData: () => ({}),
    getBlockingReason: () => null
  };
};