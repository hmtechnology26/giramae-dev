import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useResetForm = (shouldReset: boolean, resetCallback: () => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (shouldReset) {
      // Limpar estado do formulário
      resetCallback();
      
      // Invalidar queries relacionadas para garantir dados frescos
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['subcategorias'] });
      queryClient.invalidateQueries({ queryKey: ['tamanhos'] });
    }
  }, [shouldReset, resetCallback, queryClient]);
};