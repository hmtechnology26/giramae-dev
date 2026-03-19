import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ValidacaoUsuario, Documento } from '@/types/parcerias';

export function useValidacoes(programaId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query: Validações Pendentes
  const { data: validacoesPendentes = [], isLoading } = useQuery({
    queryKey: ['validacoes-pendentes', programaId],
    queryFn: async (): Promise<ValidacaoUsuario[]> => {
      const { data, error } = await supabase
        .from('parcerias_usuarios_validacao')
        .select(`
          id,
          user_id,
          programa_id,
          dados_usuario,
          documentos,
          status,
          data_solicitacao,
          data_validacao,
          validado_por,
          motivo_rejeicao,
          ativo,
          created_at,
          updated_at
        `)
        .eq('programa_id', programaId)
        .eq('status', 'pendente')
        .eq('ativo', true)
        .order('data_solicitacao', { ascending: true });
      
      if (error) throw error;
      
      // Buscar profiles separadamente para evitar erro de múltiplos relacionamentos
      const dataWithProfiles = await Promise.all(
        (data || []).map(async (validacao: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nome, email, telefone, avatar_url')
            .eq('id', validacao.user_id)
            .single();
          
          return {
            ...validacao,
            profiles: profile,
            documentos: Array.isArray(validacao.documentos) ? validacao.documentos : [],
          };
        })
      );
      
      return dataWithProfiles as ValidacaoUsuario[];
    },
    enabled: !!programaId,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  // Mutation: Aprovar Validação
  const aprovarMutation = useMutation({
    mutationFn: async (validacaoId: string) => {
      const { data, error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({
          status: 'aprovado',
          data_validacao: new Date().toISOString(),
          validado_por: user?.id,
        })
        .eq('id', validacaoId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validacoes-pendentes', programaId] });
      queryClient.invalidateQueries({ queryKey: ['programa-metricas', programaId] });
      toast({
        title: "Validação aprovada",
        description: "O beneficiário foi aprovado no programa.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aprovar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation: Rejeitar Validação
  const rejeitarMutation = useMutation({
    mutationFn: async ({ validacaoId, motivo }: { validacaoId: string; motivo: string }) => {
      const { data, error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({
          status: 'rejeitado',
          data_validacao: new Date().toISOString(),
          validado_por: user?.id,
          motivo_rejeicao: motivo,
        })
        .eq('id', validacaoId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validacoes-pendentes', programaId] });
      queryClient.invalidateQueries({ queryKey: ['programa-metricas', programaId] });
      toast({
        title: "Validação rejeitada",
        description: "O beneficiário foi notificado sobre a rejeição.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao rejeitar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function: Download Documento
  const downloadDocumento = async (validacao: ValidacaoUsuario, documento: Documento) => {
    try {
      // Usar o caminho exato salvo no documento
      const filePath = documento.url || documento.path;
      
      if (!filePath) {
        throw new Error('Caminho do documento não encontrado');
      }
      
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

      toast({
        title: "Download iniciado",
        description: `Baixando ${documento.nome}...`,
      });
    } catch (error: any) {
      toast({
        title: "Erro no download",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    validacoesPendentes,
    loading: isLoading,
    aprovar: aprovarMutation.mutate,
    rejeitar: (validacaoId: string, motivo: string) => 
      rejeitarMutation.mutate({ validacaoId, motivo }),
    downloadDocumento,
  };
}
