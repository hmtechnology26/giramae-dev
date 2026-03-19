
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { uploadImage, generateImagePath } from '@/utils/supabaseStorage';
import { R2_BUCKETS } from '@/lib/cdn';

type Escola = Tables<'escolas_inep'>;

export interface Item {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  estado_conservacao: string;
  tamanho?: string;
  tamanho_valor?: string;
  genero?: string;
  valor_girinhas: number;
  publicado_por: string;
  status: string;
  fotos?: string[];
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

export const useItens = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Usar tabela itens diretamente com join de profiles
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles!publicado_por(nome, avatar_url, cidade, reputacao)
        `)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const itensFormatados = data?.map(item => ({
        ...item,
        publicado_por_profile: item.profiles || undefined,
        mesma_escola: false
      })) || [];
      
      console.log('✅ Itens carregados (com moderação):', itensFormatados.length);
      setItens(itensFormatados);
      return itensFormatados;
    } catch (err) {
      console.error('Erro ao buscar itens:', err);
      setError('Erro ao carregar itens');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarItens = useCallback(async () => {
    return await refetch();
  }, [refetch]);

  const buscarMeusItens = useCallback(async (userId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const itensFormatados = data?.map(item => ({
        ...item,
        mesma_escola: false
      })) || [];
      
      setItens(itensFormatados);
      return itensFormatados;
    } catch (err) {
      console.error('Erro ao buscar meus itens:', err);
      setError('Erro ao carregar seus itens');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarItensDoUsuario = useCallback(async (userId: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Usar tabela itens diretamente com join de profiles
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles!publicado_por(nome, avatar_url, cidade, reputacao)
        `)
        .eq('publicado_por', userId)
        .in('status', ['disponivel', 'reservado'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const itensFormatados = data?.map(item => ({
        ...item,
        publicado_por_profile: item.profiles || undefined,
        mesma_escola: false
      })) || [];
      
      console.log('✅ Itens do usuário carregados (com moderação):', itensFormatados.length);
      setItens(itensFormatados);
      return itensFormatados;
    } catch (err) {
      console.error('Erro ao buscar itens do usuário:', err);
      setError('Erro ao carregar itens do usuário');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarItemPorId = useCallback(async (itemId: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Usar tabela itens diretamente com join de profiles
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles!publicado_por(nome, avatar_url, cidade, reputacao)
        `)
        .eq('id', itemId)
        .single();

      if (error) throw error;
      
      const itemFormatado = {
        ...data,
        publicado_por_profile: data.profiles || undefined,
        mesma_escola: false
      };
      
      console.log('✅ Item carregado (com moderação):', itemFormatado.titulo);
      return itemFormatado;
    } catch (err) {
      console.error('Erro ao buscar item:', err);
      setError('Erro ao carregar item');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const publicarItem = useCallback(async (itemData: any, fotos: File[]) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Iniciando upload de', fotos.length, 'fotos...');
      
      // Upload das fotos
      const fotosUrls: string[] = [];
      
      for (const foto of fotos) {
        try {
          const fileName = generateImagePath(itemData.publicado_por, foto.name);
          console.log('Fazendo upload da foto:', fileName);
          
          const uploadResult = await uploadImage({
            bucket: R2_BUCKETS.itens,
            path: fileName,
            file: foto
          });
          
          // Salvar apenas o path no banco (não URL completa)
          fotosUrls.push(uploadResult.path);
          console.log('Foto uploaded com sucesso, path:', uploadResult.path);
        } catch (uploadError) {
          console.error('Erro no upload da foto:', uploadError);
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }
      }

      console.log('Inserindo item no banco com dados:', { ...itemData, fotos: fotosUrls });

      // Inserir item no banco
      const { error: insertError } = await supabase
        .from('itens')
        .insert({
          ...itemData,
          fotos: fotosUrls
        });

      if (insertError) {
        console.error('Erro ao inserir item:', insertError);
        throw insertError;
      }

      toast({
        title: "Sucesso!",
        description: "Item publicado com sucesso"
      });

      await refetch();
      return true;
    } catch (err) {
      console.error('Erro completo ao publicar item:', err);
      setError('Erro ao publicar item');
      toast({
        title: "Erro",
        description: err.message || "Erro ao publicar item",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const atualizarItem = useCallback(async (itemId: string, dadosAtualizados: any) => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase
        .from('itens')
        .update(dadosAtualizados)
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Item atualizado com sucesso"
      });

      await refetch();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      setError('Erro ao atualizar item');
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  return {
    itens,
    loading,
    error,
    refetch,
    buscarItens,
    buscarMeusItens,
    buscarItensDoUsuario,
    buscarItemPorId,
    publicarItem,
    atualizarItem
  };
};
