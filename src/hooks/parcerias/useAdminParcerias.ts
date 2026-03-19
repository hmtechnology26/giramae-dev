import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EstatisticasParcerias {
  organizacoes_ativas: number;
  programas_ativos: number;
  usuarios_aprovados_total: number;
  pendentes_validacao_total: number;
  girinhas_creditadas_mes_atual: number;
  programas_detalhados: any[];
}

interface ValidacaoPendente {
  id: string;
  user_id: string;
  programa_id: string;
  dados_usuario: any;
  documentos: any;
  data_solicitacao: string;
  programa_nome: string;
  organizacao_nome: string;
  usuario_nome: string;
  usuario_email: string;
}

export function useAdminParcerias() {
  const [estatisticas, setEstatisticas] = useState<EstatisticasParcerias | null>(null);
  const [validacoesPendentes, setValidacoesPendentes] = useState<ValidacaoPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEstatisticas(),
        loadValidacoesPendentes()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      // Buscar estatísticas básicas
      const [orgResult, progResult, aprovadosResult, pendentesResult] = await Promise.all([
        supabase.from('parcerias_organizacoes').select('id', { count: 'exact' }).eq('ativo', true),
        supabase.from('parcerias_programas').select('id', { count: 'exact' }).eq('ativo', true),
        supabase.from('parcerias_usuarios_validacao').select('id', { count: 'exact' }).eq('status', 'aprovado').eq('ativo', true),
        supabase.from('parcerias_usuarios_validacao').select('id', { count: 'exact' }).eq('status', 'pendente').eq('ativo', true)
      ]);

      // Buscar créditos do mês atual
      const mesAtual = new Date().toISOString().slice(0, 7) + '-01';
      const { data: creditosData } = await supabase
        .from('parcerias_historico_creditos')
        .select('valor_creditado')
        .gte('mes_referencia', mesAtual);

      const totalCreditos = creditosData?.reduce((sum, c) => sum + c.valor_creditado, 0) || 0;

      setEstatisticas({
        organizacoes_ativas: orgResult.count || 0,
        programas_ativos: progResult.count || 0,
        usuarios_aprovados_total: aprovadosResult.count || 0,
        pendentes_validacao_total: pendentesResult.count || 0,
        girinhas_creditadas_mes_atual: totalCreditos,
        programas_detalhados: []
      });
    } catch (err: any) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const loadValidacoesPendentes = async () => {
    try {
      const { data, error } = await supabase
        .from('parcerias_usuarios_validacao')
        .select(`
          id,
          user_id,
          programa_id,
          dados_usuario,
          documentos,
          data_solicitacao,
          parcerias_programas (
            nome,
            parcerias_organizacoes (
              nome
            )
          ),
          profiles!parcerias_usuarios_validacao_user_id_fkey (
            nome,
            email
          )
        `)
        .eq('status', 'pendente')
        .eq('ativo', true)
        .order('data_solicitacao', { ascending: false });

      if (error) throw error;

      const validacoesFormatadas = (data || []).map(v => ({
        id: v.id,
        user_id: v.user_id,
        programa_id: v.programa_id,
        dados_usuario: v.dados_usuario,
        documentos: v.documentos,
        data_solicitacao: v.data_solicitacao,
        programa_nome: v.parcerias_programas?.nome || '',
        organizacao_nome: v.parcerias_programas?.parcerias_organizacoes?.nome || '',
        usuario_nome: v.profiles?.nome || '',
        usuario_email: v.profiles?.email || ''
      }));

      setValidacoesPendentes(validacoesFormatadas);
    } catch (err: any) {
      toast({
        title: "Erro ao carregar validações pendentes",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const aprovarValidacao = async (validacaoId: string) => {
    try {
      const { error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({
          status: 'aprovado',
          data_validacao: new Date().toISOString()
        })
        .eq('id', validacaoId);

      if (error) throw error;

      toast({
        title: "Validação aprovada!",
        description: "O usuário foi aprovado no programa."
      });

      await loadDados();
    } catch (err: any) {
      toast({
        title: "Erro ao aprovar validação",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const rejeitarValidacao = async (validacaoId: string, motivo: string) => {
    try {
      const { error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({
          status: 'rejeitado',
          data_validacao: new Date().toISOString(),
          motivo_rejeicao: motivo
        })
        .eq('id', validacaoId);

      if (error) throw error;

      toast({
        title: "Validação rejeitada",
        description: "O usuário foi notificado sobre a rejeição."
      });

      await loadDados();
    } catch (err: any) {
      toast({
        title: "Erro ao rejeitar validação",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const downloadDocumento = async (validacao: ValidacaoPendente, documento: any) => {
    try {
      // Usar o caminho exato salvo no documento
      const filePath = documento.url || documento.path;
      
      if (!filePath) {
        throw new Error('Caminho do documento não encontrado');
      }
      
      // Se for URL completa (dados antigos), baixar diretamente
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        const response = await fetch(filePath);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documento.nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Se for path, usar supabase.storage.download()
        const { data, error } = await supabase.storage
          .from('documentos-parcerias')
          .download(filePath);

        if (error) throw error;

        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = documento.nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Download iniciado",
        description: `Baixando ${documento.nome}...`,
      });
    } catch (err: any) {
      toast({
        title: "Erro no download",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return {
    estatisticas,
    validacoesPendentes,
    loading,
    aprovarValidacao,
    rejeitarValidacao,
    downloadDocumento,
    refetch: loadDados
  };
}