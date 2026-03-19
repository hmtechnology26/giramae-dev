import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { PerfilBeneficiario, HistoricoCredito } from '@/types/parcerias';

export function usePerfilBeneficiario(userId: string, programaId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query: Perfil Completo do Beneficiário
  const { data: perfil, isLoading } = useQuery({
    queryKey: ['perfil-beneficiario', userId, programaId],
    queryFn: async (): Promise<PerfilBeneficiario | null> => {
      // Buscar validação do usuário (dados da solicitação)
      const { data: validacao, error: validacaoError } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('*')
        .eq('user_id', userId)
        .eq('programa_id', programaId)
        .eq('status', 'aprovado')
        .single();

      if (validacaoError || !validacao) return null;

      // Buscar profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, email, telefone, avatar_url, created_at')
        .eq('id', userId)
        .single();

      // Buscar carteira com ledger
      const { data: carteiraLedger } = await (supabase as any)
        .from('ledger_carteiras')
        .select('saldo_atual, total_recebido, total_gasto')
        .eq('user_id', userId)
        .maybeSingle();

      // Buscar expiração de girinhas
      const { data: expiracaoData } = await supabase
        .rpc('obter_girinhas_expiracao_seguro', { p_user_id: userId });
      
      const expiracao = expiracaoData?.[0] || {
        total_expirando_7_dias: 0,
        total_expirando_30_dias: 0,
        proxima_expiracao: null,
        detalhes_expiracao: []
      };

      // Buscar últimas transações
      const { data: transacoes } = await (supabase as any)
        .from('ledger_transacoes')
        .select('*')
        .eq('user_id', userId)
        .order('data_criacao', { ascending: false })
        .limit(10);

      // Buscar histórico de créditos do programa
      const { data: historico } = await supabase
        .from('parcerias_historico_creditos')
        .select('*')
        .eq('user_id', userId)
        .eq('programa_id', programaId)
        .order('mes_referencia', { ascending: false });

      const historicoCreditos: HistoricoCredito[] = (historico || []) as HistoricoCredito[];

      // Buscar itens publicados
      const { data: itensPublicados, count: totalItens } = await supabase
        .from('itens')
        .select('id, titulo, status, valor_girinhas, created_at', { count: 'exact' })
        .eq('publicado_por', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar reservas como comprador
      const { data: reservasComprador, count: totalReservasComprador } = await supabase
        .from('reservas')
        .select('*', { count: 'exact' })
        .eq('usuario_reservou', userId);

      // Buscar reservas como vendedor
      const { data: reservasVendedor, count: totalReservasVendedor } = await supabase
        .from('reservas')
        .select('*', { count: 'exact' })
        .eq('usuario_item', userId);

      // Calcular estatísticas
      const totalCreditos = historicoCreditos.reduce((sum, h) => sum + h.valor_creditado, 0);
      const mesAtual = new Date().toISOString().slice(0, 7);
      const creditosMesAtual = historicoCreditos
        .filter(h => h.mes_referencia === mesAtual)
        .reduce((sum, h) => sum + h.valor_creditado, 0);
      const mesesComCredito = historicoCreditos.length;
      const mediaMensal = mesesComCredito > 0 ? totalCreditos / mesesComCredito : 0;

      const comprasConfirmadas = (reservasComprador || []).filter(r => r.status === 'confirmada').length;
      const vendasConfirmadas = (reservasVendedor || []).filter(r => r.status === 'confirmada').length;

      return {
        id: validacao.id,
        user_id: userId,
        programa_id: programaId,
        nome: profile?.nome || '',
        email: profile?.email || '',
        telefone: profile?.telefone,
        avatar_url: profile?.avatar_url,
        data_cadastro: profile?.created_at || '',
        status: validacao.ativo ? 'ativo' : 'suspenso',
        data_aprovacao: validacao.data_validacao || '',
        dados_solicitacao: (validacao.dados_usuario as Record<string, any>) || {},
        resumo_financeiro: {
          total_creditos_recebidos: totalCreditos,
          creditos_mes_atual: creditosMesAtual,
          media_mensal: mediaMensal,
          saldo_atual: carteiraLedger?.saldo_atual || 0,
          total_recebido: carteiraLedger?.total_recebido || 0,
          total_gasto: carteiraLedger?.total_gasto || 0,
        },
        historico_creditos: historicoCreditos,
        padrao_uso: {
          percentual_gasto_itens: 0,
          percentual_transferido_p2p: 0,
          saldo_atual: carteiraLedger?.saldo_atual || 0,
          categorias_favoritas: [],
          total_itens_publicados: totalItens || 0,
          total_compras: totalReservasComprador || 0,
          total_vendas: totalReservasVendedor || 0,
          compras_confirmadas: comprasConfirmadas,
          vendas_confirmadas: vendasConfirmadas,
          ultimos_itens: itensPublicados || [],
        },
        expiracao_girinhas: {
          total_expirando_7_dias: expiracao.total_expirando_7_dias || 0,
          total_expirando_30_dias: expiracao.total_expirando_30_dias || 0,
          proxima_expiracao: expiracao.proxima_expiracao,
          detalhes: Array.isArray(expiracao.detalhes_expiracao) ? expiracao.detalhes_expiracao : [],
        },
        ultimas_transacoes: (transacoes || []).map((t: any) => ({
          id: t.transacao_id,
          tipo: t.tipo,
          valor: t.valor,
          descricao: t.descricao,
          data: t.data_criacao,
          metadata: t.metadata,
        })),
        documentos: Array.isArray(validacao.documentos) ? validacao.documentos as any[] : [],
        observacoes: [],
      };
    },
    enabled: !!userId && !!programaId,
  });

  // Mutation: Suspender Beneficiário
  const suspenderMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({ ativo: false })
        .eq('user_id', userId)
        .eq('programa_id', programaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil-beneficiario', userId, programaId] });
      toast({
        title: "Beneficiário suspenso",
        description: "O beneficiário foi suspenso temporariamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao suspender",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation: Reativar Beneficiário
  const reativarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({ ativo: true })
        .eq('user_id', userId)
        .eq('programa_id', programaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil-beneficiario', userId, programaId] });
      toast({
        title: "Beneficiário reativado",
        description: "O beneficiário foi reativado no programa.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reativar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    perfil,
    loading: isLoading,
    suspender: suspenderMutation.mutate,
    reativar: reativarMutation.mutate,
  };
}
