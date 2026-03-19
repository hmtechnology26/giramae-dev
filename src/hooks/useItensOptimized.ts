import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { uploadImage, generateImagePath } from '@/utils/supabaseStorage';
import { R2_BUCKETS } from '@/lib/cdn';

export interface Item {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  genero: string;
  tamanho_categoria: string;
  tamanho_valor: string;
  estado_conservacao: string;
  valor_girinhas: number;
  publicado_por: string;
  status: string;
  fotos: string[];
  created_at: string;
  updated_at: string;
  filho_id?: string;
  estado_manual?: string;
  cidade_manual?: string;
  publicado_por_profile?: {
    nome: string;
    avatar_url?: string;
    cidade?: string;
    reputacao?: number;
  };
  mesma_escola?: boolean;
}

// Hook otimizado para buscar todos os itens
export const useItensDisponiveis = () => {
  return useQuery({
    queryKey: ['itens', 'disponiveis'],
    queryFn: async (): Promise<Item[]> => {
      console.log('🔍 Buscando itens disponíveis...');
      
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles(nome, avatar_url, cidade, reputacao)
        `)
        .in('status', ['disponivel', 'reservado'])
        .order('created_at', { ascending: false })
        .limit(50); // Limitar para melhor performance

      if (error) {
        console.error('Erro ao buscar itens:', error);
        throw error;
      }
      
      const itensFormatados = data?.map(item => ({
        ...item,
        publicado_por_profile: item.publicado_por_profile || undefined,
        mesma_escola: false
      })) || [];
      
      console.log(`✅ ${itensFormatados.length} itens carregados`);
      return itensFormatados;
    },
    staleTime: 60000, // 1 minuto
    gcTime: 300000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
};

// Hook para buscar meus itens
export const useMeusItens = (userId: string) => {
  return useQuery({
    queryKey: ['itens', 'meus', userId],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(item => ({
        ...item,
        mesma_escola: false
      })) || [];
    },
    enabled: !!userId,
    staleTime: 120000, // 2 minutos
    gcTime: 300000,
    refetchOnWindowFocus: false // ✅ CORRIGIDO: Evita recarregar ao trocar de aba
  });
};

// Hook para buscar itens de um usuário específico
export const useItensUsuario = (userId: string) => {
  return useQuery({
    queryKey: ['itens', 'usuario', userId],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles(nome, avatar_url, cidade, reputacao)
        `)
        .eq('publicado_por', userId)
        .in('status', ['disponivel', 'reservado'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(item => ({
        ...item,
        publicado_por_profile: item.publicado_por_profile || undefined,
        mesma_escola: false
      })) || [];
    },
    enabled: !!userId,
    staleTime: 120000,
    gcTime: 300000,
    refetchOnWindowFocus: false // ✅ CORRIGIDO: Evita recarregar ao trocar de aba
  });
};

// Hook para buscar um item específico
export const useItem = (itemId: string) => {
  return useQuery({
    queryKey: ['item', itemId],
    queryFn: async (): Promise<Item | null> => {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles(nome, avatar_url, cidade, reputacao)
        `)
        .eq('id', itemId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      
      return {
        ...data,
        publicado_por_profile: data.publicado_por_profile || undefined,
        mesma_escola: false
      };
    },
    enabled: !!itemId,
    staleTime: 180000, // 3 minutos
    gcTime: 300000,
    refetchOnWindowFocus: false // ✅ CORRIGIDO: Evita recarregar ao trocar de aba
  });
};

// Mutation para publicar item
export const usePublicarItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemData, fotos }: { itemData: any, fotos: File[] }) => {
      console.log('📤 Iniciando publicação de item com', fotos.length, 'fotos...');
      
      if (!itemData.publicado_por) {
        throw new Error('Usuário não identificado');
      }

      // Upload das fotos
      const fotosUrls: string[] = [];
      
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        console.log(`⬆️ Fazendo upload da foto ${i + 1}/${fotos.length}:`, foto.name);
        
        try {
          const fileName = generateImagePath(itemData.publicado_por, foto.name);
          
          // Upload retorna publicUrl diretamente (R2)
          const uploadResult = await uploadImage({
            bucket: R2_BUCKETS.itens,
            path: fileName,
            file: foto
          });
          
          // Salvar apenas o path no banco (não URL completa)
          fotosUrls.push(uploadResult.path);
          console.log(`✅ Foto ${i + 1} uploaded, path:`, uploadResult.path);
        } catch (uploadError: any) {
          console.error(`❌ Erro no upload da foto ${i + 1}:`, uploadError);
          throw new Error(`Erro no upload da imagem ${i + 1}: ${uploadError.message}`);
        }
      }

      console.log('📝 Inserindo item no banco com', fotosUrls.length, 'fotos...');

      // Inserir item no banco
      const { data, error: insertError } = await supabase
        .from('itens')
        .insert({
          ...itemData,
          fotos: fotosUrls
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir item:', insertError);
        throw new Error(`Erro ao salvar item: ${insertError.message}`);
      }

      console.log('✅ Item publicado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidar apenas queries específicas
      queryClient.invalidateQueries({ queryKey: ['itens', 'disponiveis'] });
      queryClient.invalidateQueries({ queryKey: ['itens', 'meus'] });
      
      toast({
        title: "Sucesso!",
        description: "Item publicado com sucesso"
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao publicar item:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao publicar item",
        variant: "destructive"
      });
    }
  });
};

// Mutation para atualizar item
export const useAtualizarItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, dadosAtualizados }: { itemId: string, dadosAtualizados: any }) => {
      const { error } = await supabase
        .from('itens')
        .update(dadosAtualizados)
        .eq('id', itemId);

      if (error) throw error;
      return true;
    },
    onSuccess: (_, { itemId }) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['itens', 'disponiveis'] });
      queryClient.invalidateQueries({ queryKey: ['itens', 'meus'] });
      
      toast({
        title: "Sucesso!",
        description: "Item atualizado com sucesso"
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive"
      });
    }
  });
};
