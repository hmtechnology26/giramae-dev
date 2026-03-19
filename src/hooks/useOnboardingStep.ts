// Hook simplificado - funções obsoletas removidas
export const useOnboardingStep = () => {
  return {
    checkUserStatus: () => null,
    invalidateCache: () => {},
    showSuccessToast: (message: string) => {},
    showErrorToast: (message: string) => {}
  };
};