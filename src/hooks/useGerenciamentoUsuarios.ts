import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UsuarioAdmin {
  user_id: string;
  nome: string;
  email: string;
  username?: string;
  avatar_url?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  cadastro_status?: string;
  data_cadastro: string;
  ultima_atividade?: string;
  total_itens_publicados?: number;
  total_reservas_feitas?: number;
  total_vendas_realizadas?: number;
  total_denuncias_feitas?: number;
  saldo_girinhas?: number;
  total_girinhas_recebidas?: number;
  total_girinhas_gastas?: number;
  penalidades_ativas: number;
  penalidade_mais_grave: number;
  total_penalidades_historico?: number;
  ultima_penalidade?: string;
  status: string;
  pontuacao_reputacao: number;
  total_violacoes: number;
}

export interface EstatisticasSistema {
  total_usuarios: number;
  usuarios_ativos: number;
  usuarios_ativos_mes: number;
  penalidades_ativas: number;
  usuarios_suspensos: number;
  usuarios_warned: number;
  itens_pendentes: number;
  denuncias_ativas: number;
  itens_publicados_hoje: number;
  reservas_hoje: number;
}

export const useGerenciamentoUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasSistema | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsuarios = async (
    searchTerm: string = '',
    statusFilter: string = 'todos',
    ordenacao: string = 'data_cadastro',
    limit: number = 50,
    offset: number = 0
  ) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('buscar_usuarios_admin', {
        search_term: searchTerm,
        status_filter: statusFilter,
        ordenacao: ordenacao,
        limite: limit,
        offset_val: offset
      });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      const { data, error } = await supabase
        .from('estatisticas_sistema')
        .select('*')
        .single();

      if (error) throw error;
      setEstatisticas(data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  const removerPenalidade = async (penalidadeId: string) => {
    try {
      setLoadingAction(penalidadeId);
      
      const { error } = await supabase
        .rpc('remover_penalidade', { p_penalidade_id: penalidadeId });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Penalidade removida com sucesso"
      });

      // Refresh dos dados
      await fetchUsuarios();
      await fetchEstatisticas();
    } catch (err) {
      console.error('Erro ao remover penalidade:', err);
      toast({
        title: "Erro",
        description: "Erro ao remover penalidade",
        variant: "destructive"
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const aplicarPenalidade = async (dados: {
    usuario_id: string;
    tipo: string;
    nivel: number;
    motivo: string;
    duracao_dias?: number;
  }) => {
    try {
      setLoadingAction(dados.usuario_id);
      
      const { error } = await supabase
        .rpc('aplicar_penalidade', {
          p_usuario_id: dados.usuario_id,
          p_tipo: dados.tipo,
          p_nivel: dados.nivel,
          p_motivo: dados.motivo,
          p_duracao_dias: dados.duracao_dias
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Penalidade aplicada com sucesso"
      });

      // Refresh dos dados
      await fetchUsuarios();
      await fetchEstatisticas();
    } catch (err) {
      console.error('Erro ao aplicar penalidade:', err);
      toast({
        title: "Erro",
        description: "Erro ao aplicar penalidade",
        variant: "destructive"
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const buscarPenalidadesUsuario = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('penalidades_usuarios_detalhada')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar penalidades do usuário:', err);
      return [];
    }
  };

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Ativo', className: 'bg-green-100 text-green-800 border-green-200' };
      case 'warned':
        return { text: 'Advertido', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'suspenso':
        return { text: 'Suspenso', className: 'bg-red-100 text-red-800 border-red-200' };
      case 'inactive':
        return { text: 'Inativo', className: 'bg-gray-100 text-gray-800 border-gray-200' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Auto-fetch inicial
  useEffect(() => {
    fetchUsuarios();
    fetchEstatisticas();
  }, []);

  return {
    usuarios,
    estatisticas,
    loading,
    loadingAction,
    fetchUsuarios,
    fetchEstatisticas,
    removerPenalidade,
    aplicarPenalidade,
    buscarPenalidadesUsuario,
    getStatusBadgeConfig,
    getReputationColor
  };
};