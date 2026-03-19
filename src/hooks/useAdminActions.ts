
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminActions = () => {
  const { toast } = useToast();

  const logAdminAction = async (action: string, details: any = {}) => {
    try {
      await supabase
        .from('admin_actions')
        .insert({
          action,
          details,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });
    } catch (error) {
      console.error('Erro ao registrar ação admin:', error);
    }
  };

  const executeAdminAction = async (
    action: string,
    operation: () => Promise<any>,
    successMessage?: string,
    details: any = {}
  ) => {
    try {
      const result = await operation();
      
      // Log da ação
      await logAdminAction(action, details);
      
      if (successMessage) {
        toast({
          title: "Sucesso",
          description: successMessage,
        });
      }
      
      return result;
    } catch (error) {
      console.error(`Erro na ação admin ${action}:`, error);
      
      toast({
        title: "Erro",
        description: "Falha ao executar ação administrativa",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return {
    logAdminAction,
    executeAdminAction
  };
};
