
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Address } from './useAddress';

export const useUserAddress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['user-address', user?.id],
    queryFn: async (): Promise<Address | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('cep, endereco, numero, bairro, cidade, estado, complemento, ponto_referencia')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar endereço:', error);
        return null;
      }

      if (!data) return null;

      // Verificar se o usuário tem endereço completo (campos obrigatórios)
      if (!data.cep || !data.endereco || !data.numero || !data.bairro || !data.cidade || !data.estado) {
        return null;
      }

      return {
        cep: data.cep,
        endereco: data.endereco,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        complemento: data.complemento || '',
        ponto_referencia: data.ponto_referencia || ''
      };
    },
    enabled: !!user?.id
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (address: Address) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({
          cep: address.cep,
          endereco: address.endereco,
          numero: address.numero,
          bairro: address.bairro,
          cidade: address.cidade,
          estado: address.estado,
          complemento: address.complemento || null,
          ponto_referencia: address.ponto_referencia || null
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-address', user?.id] });
      toast.success('Endereço atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar endereço:', error);
      toast.error('Erro ao atualizar endereço');
    }
  });

  return {
    userAddress: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateAddress: updateAddressMutation.mutate,
    isUpdating: updateAddressMutation.isPending
  };
};
