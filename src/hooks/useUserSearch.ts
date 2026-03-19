
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserSearchResult {
  id: string;
  nome: string;
  username: string;
  avatar_url: string | null;
}

export const useUserSearch = () => {
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, username, avatar_url')
        .ilike('nome', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao buscar usuários",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  return { users, isSearching, searchUsers };
};
