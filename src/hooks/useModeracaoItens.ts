import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ItemModeracaoData {
  moderacao_id: string;
  moderacao_status: string;
  status: string;
  data_moderacao: string;
  item_id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  valor_girinhas: number;
  estado_conservacao: string;
  fotos?: string[];
  genero?: string;
  tamanho_valor?: string;
  tamanho_categoria?: string;
  primeira_foto: string | null;
  usuario_nome: string;
  usuario_id: string;
  usuario_email?: string;
  usuario_telefone?: string;
  usuario_cidade?: string;
  usuario_estado?: string;
  usuario_avatar?: string;
  data_publicacao: string;
  tem_denuncia: boolean;
  motivo_denuncia: string | null;
  total_denuncias: number;
  denuncia_id?: string;
  descricao_denuncia?: string;
  data_denuncia?: string;
  denuncia_aceita?: boolean;
}

export const useModeracaoItens = () => {
  const [itens, setItens] = useState<ItemModeracaoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItensPendentes = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando itens para moderação...');
      
      // Buscar itens que precisam de moderação através da view atual
      const { data, error: directError } = await supabase
        .from('itens_pendentes_moderacao')
        .select('*')
        .order('data_moderacao', { ascending: false });

      if (directError) {
        console.error('❌ Erro na consulta:', directError);
        throw directError;
      }

      console.log('📊 Dados brutos da consulta:', data);

      // Buscar dados adicionais dos itens para obter fotos e outras informações
      const itemIds = data?.map(item => item.item_id) || [];
      let itensCompletos = [];

      if (itemIds.length > 0) {
        const { data: itensData, error: itensError } = await supabase
          .from('itens')
          .select('id, fotos, genero, tamanho_valor, tamanho_categoria, subcategoria, descricao, publicado_por')
          .in('id', itemIds);

        if (itensError) {
          console.error('❌ Erro ao buscar dados dos itens:', itensError);
        } else {
          console.log('🖼️ Dados completos dos itens:', itensData);
          itensCompletos = itensData || [];
        }
      }

      // Buscar dados dos usuários usando publicado_por dos itens
      const userIds = data?.map(item => {
        const itemCompleto = itensCompletos.find(i => i.id === item.item_id);
        return itemCompleto?.publicado_por;
      }).filter(Boolean) || [];
      let usersData = [];

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, email, telefone, cidade, estado, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('❌ Erro ao buscar perfis:', profilesError);
        } else {
          console.log('👥 Dados dos usuários:', profiles);
          usersData = profiles || [];
        }
      }

      const itensFormatados: ItemModeracaoData[] = data?.map((item: any) => {
        const itemCompleto = itensCompletos.find(i => i.id === item.item_id);
        
        console.log(`📋 Processando item ${item.item_id}:`, {
          original: item,
          itemCompleto
        });

        // O usuario_id correto vem do publicado_por do item
        const calculatedUserId = itemCompleto?.publicado_por;
        const foundUserData = usersData.find(u => u.id === calculatedUserId);
        
        const resultado = {
          moderacao_id: item.moderacao_id,
          moderacao_status: item.moderacao_status || 'pendente',
          status: item.moderacao_status || 'pendente',
          data_moderacao: item.data_moderacao,
          item_id: item.item_id,
          titulo: item.titulo || 'Título não informado',
          descricao: itemCompleto?.descricao || item.descricao || '',
          categoria: item.categoria || 'Sem categoria',
          subcategoria: itemCompleto?.subcategoria || item.subcategoria,
          valor_girinhas: item.valor_girinhas || 0,
          estado_conservacao: item.estado_conservacao || 'usado',
          fotos: itemCompleto?.fotos || [],
          genero: itemCompleto?.genero,
          tamanho_valor: itemCompleto?.tamanho_valor,
          tamanho_categoria: itemCompleto?.tamanho_categoria,
          primeira_foto: item.primeira_foto,
          usuario_nome: foundUserData?.nome || item.usuario_nome || 'Usuário não encontrado',
          usuario_id: calculatedUserId || '',
          usuario_email: foundUserData?.email,
          usuario_telefone: foundUserData?.telefone,
          usuario_cidade: foundUserData?.cidade,
          usuario_estado: foundUserData?.estado,
          usuario_avatar: foundUserData?.avatar_url,
          data_publicacao: item.data_publicacao,
          tem_denuncia: Boolean(item.tem_denuncia),
          motivo_denuncia: item.motivo_denuncia,
          total_denuncias: item.total_denuncias || 0,
          denuncia_id: item.denuncia_id,
          descricao_denuncia: item.descricao_denuncia,
          data_denuncia: item.data_denuncia,
          denuncia_aceita: item.denuncia_aceita
        };
        
        console.log(`✅ Item formatado ${item.item_id}:`, {
          moderacao_status: resultado.moderacao_status,
          usuario_id: resultado.usuario_id,
          usuario_nome: resultado.usuario_nome
        });
        
        return resultado;
      }) || [];

      console.log('✅ Itens formatados:', itensFormatados);
      setItens(itensFormatados);
      setError(null);
    } catch (err: any) {
      console.error('💥 Erro geral:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const aprovarItem = async (moderacaoId: string) => {
    try {
      console.log('🟢 Aprovando item com moderacao_id:', moderacaoId);
      
      const { error } = await supabase
        .from('moderacao_itens')
        .update({
          status: 'aprovado',
          moderador_id: (await supabase.auth.getUser()).data.user?.id,
          moderado_em: new Date().toISOString(),
          observacoes: 'Item aprovado'
        })
        .eq('id', moderacaoId);

      if (error) {
        console.error('❌ Erro ao aprovar item:', error);
        throw error;
      }

      console.log('✅ Item aprovado com sucesso');

      toast({
        title: "Item aprovado",
        description: "O item foi aprovado e está disponível no feed.",
      });

      // Atualizar lista
      await fetchItensPendentes();
    } catch (err: any) {
      console.error('💥 Erro geral ao aprovar:', err);
      toast({
        title: "Erro",
        description: "Falha ao aprovar item: " + err.message,
        variant: "destructive",
      });
    }
  };

  const rejeitarItem = async (moderacaoId: string, comentario: string, observacoes?: string) => {
    try {
      console.log('🔴 Rejeitando item com moderacao_id:', moderacaoId);
      
      // Primeiro, atualizar o status na tabela de moderação
      const { error: moderacaoError } = await supabase
        .from('moderacao_itens')
        .update({
          status: 'rejeitado',
          moderador_id: (await supabase.auth.getUser()).data.user?.id,
          moderado_em: new Date().toISOString(),
          observacoes: observacoes || comentario
        })
        .eq('id', moderacaoId);

      if (moderacaoError) {
        console.error('❌ Erro ao atualizar moderação:', moderacaoError);
        throw moderacaoError;
      }

      // Encontrar o item para inativar
      const item = itens.find(item => item.moderacao_id === moderacaoId);
      if (!item) {
        throw new Error('Item não encontrado');
      }

      // Inativar o item usando RPC
      const { error: rpcError } = await supabase.rpc('inativar_item_com_feedback', {
        p_item_id: item.item_id,
        p_moderador_id: (await supabase.auth.getUser()).data.user?.id,
        p_motivo: comentario,
        p_observacoes: observacoes
      });

      if (rpcError) {
        console.error('❌ Erro no RPC:', rpcError);
        throw rpcError;
      }

      console.log('✅ Item rejeitado com sucesso');

      toast({
        title: "Item rejeitado",
        description: "O item foi rejeitado e o usuário foi notificado para correção.",
      });

      await fetchItensPendentes();
    } catch (err: any) {
      console.error('💥 Erro geral ao rejeitar:', err);
      toast({
        title: "Erro",
        description: "Falha ao rejeitar item: " + err.message,
        variant: "destructive",
      });
    }
  };

  const aceitarDenuncia = async (denunciaId: string, comentario: string = 'denuncia_procedente', observacoes?: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('aceitar_denuncia', {
        p_denuncia_id: denunciaId,
        p_moderador_id: user.id,
        p_comentario: comentario,
        p_observacoes: observacoes
      });

      if (error) throw error;

      toast({
        title: "Denúncia aceita",
        description: "O item foi removido da plataforma.",
      });
      
      await fetchItensPendentes();
      return data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Falha ao aceitar denúncia: " + err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const rejeitarDenuncia = async (denunciaId: string, observacoes?: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('rejeitar_denuncia', {
        p_denuncia_id: denunciaId,
        p_moderador_id: user.id,
        p_observacoes: observacoes
      });

      if (error) throw error;

      toast({
        title: "Denúncia rejeitada",
        description: "O item foi mantido na plataforma.",
      });
      
      await fetchItensPendentes();
      return data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Falha ao rejeitar denúncia: " + err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchItensPendentes();
  }, []);

  return {
    itens,
    loading,
    error,
    aprovarItem,
    rejeitarItem,
    aceitarDenuncia,
    rejeitarDenuncia,
    refetch: fetchItensPendentes
  };
};