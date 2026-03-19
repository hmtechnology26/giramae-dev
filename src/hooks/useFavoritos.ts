
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Favorito = Tables<'favoritos'>;

export const useFavoritos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarFavoritos = useCallback(async () => {
    if (!user?.id) {
      setFavoritos([]);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao buscar favoritos:', error);
        throw error;
      }
      
      setFavoritos(data || []);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos.",
        variant: "destructive",
      });
      setFavoritos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const verificarSeFavorito = useCallback((itemId: string): boolean => {
    return favoritos.some(fav => fav.item_id === itemId);
  }, [favoritos]);

  const adicionarFavorito = useCallback(async (itemId: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar favoritos.",
        variant: "destructive",
      });
      return false;
    }

    if (verificarSeFavorito(itemId)) {
      return true;
    }

    try {
      const { error } = await supabase
        .from('favoritos')
        .insert({
          user_id: user.id,
          item_id: itemId
        });

      if (error) {
        console.error('Erro ao adicionar favorito:', error);
        throw error;
      }

      toast({
        title: "Adicionado aos favoritos! ❤️",
        description: "Item adicionado à sua lista de desejos.",
      });

      // Atualizar lista local imediatamente
      setFavoritos(prev => [...prev, { 
        id: crypto.randomUUID(), 
        user_id: user.id, 
        item_id: itemId, 
        created_at: new Date().toISOString() 
      }]);

      return true;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar aos favoritos.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast, verificarSeFavorito]);

  const removerFavorito = useCallback(async (itemId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

      if (error) {
        console.error('Erro ao remover favorito:', error);
        throw error;
      }

      toast({
        title: "Removido dos favoritos",
        description: "Item removido da sua lista de desejos.",
      });

      // Atualizar lista local imediatamente
      setFavoritos(prev => prev.filter(fav => fav.item_id !== itemId));

      return true;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast]);

  const toggleFavorito = useCallback(async (itemId: string): Promise<boolean> => {
    const ehFavorito = verificarSeFavorito(itemId);
    
    if (ehFavorito) {
      return await removerFavorito(itemId);
    } else {
      return await adicionarFavorito(itemId);
    }
  }, [verificarSeFavorito, removerFavorito, adicionarFavorito]);

  // ✅ CORREÇÃO: useEffect mais estável
  useEffect(() => {
    // Só busca favoritos se tem usuário logado
    if (user?.id) {
      buscarFavoritos();
    } else {
      // Se não tem usuário, limpa os favoritos imediatamente
      setFavoritos([]);
    }
  }, [user?.id, buscarFavoritos]);

  return {
    favoritos,
    loading,
    verificarSeFavorito,
    adicionarFavorito,
    removerFavorito,
    toggleFavorito,
    refetch: buscarFavoritos
  };
};
