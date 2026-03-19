import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useRelatorios(programaId: string) {
  const { toast } = useToast();

  const generateBeneficiariosCSV = async () => {
    try {
      const { data, error } = await supabase
        .from('parcerias_usuarios_validacao')
        .select(`
          user_id,
          data_validacao,
          ativo,
          profiles!parcerias_usuarios_validacao_user_id_fkey (
            nome,
            email,
            telefone
          )
        `)
        .eq('programa_id', programaId)
        .eq('status', 'aprovado');

      if (error) throw error;

      const csvContent = [
        ['Nome', 'Email', 'Telefone', 'Data Aprovação', 'Status'],
        ...data.map(b => [
          b.profiles?.nome || '',
          b.profiles?.email || '',
          b.profiles?.telefone || '',
          b.data_validacao ? new Date(b.data_validacao).toLocaleDateString('pt-BR') : '',
          b.ativo ? 'Ativo' : 'Suspenso'
        ])
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `beneficiarios_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório gerado',
        description: 'Download iniciado com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const generateCreditosCSV = async () => {
    try {
      const { data, error } = await supabase
        .from('parcerias_historico_creditos')
        .select(`
          *,
          profiles!parcerias_historico_creditos_user_id_fkey (
            nome,
            email
          )
        `)
        .eq('programa_id', programaId)
        .order('mes_referencia', { ascending: false });

      if (error) throw error;

      const csvContent = [
        ['Beneficiário', 'Email', 'Mês Referência', 'Valor', 'Data Creditação'],
        ...data.map(c => [
          c.profiles?.nome || '',
          c.profiles?.email || '',
          c.mes_referencia,
          c.valor_creditado.toString(),
          c.data_creditacao ? new Date(c.data_creditacao).toLocaleDateString('pt-BR') : ''
        ])
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creditos_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório gerado',
        description: 'Download iniciado com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const generateValidacoesCSV = async () => {
    try {
      const { data, error } = await supabase
        .from('parcerias_usuarios_validacao')
        .select(`
          *,
          profiles!parcerias_usuarios_validacao_user_id_fkey (
            nome,
            email
          )
        `)
        .eq('programa_id', programaId)
        .order('data_solicitacao', { ascending: false });

      if (error) throw error;

      const csvContent = [
        ['Nome', 'Email', 'Status', 'Data Solicitação', 'Data Validação', 'Motivo Rejeição'],
        ...data.map(v => [
          v.profiles?.nome || '',
          v.profiles?.email || '',
          v.status,
          new Date(v.data_solicitacao).toLocaleDateString('pt-BR'),
          v.data_validacao ? new Date(v.data_validacao).toLocaleDateString('pt-BR') : '',
          v.motivo_rejeicao || ''
        ])
      ]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `validacoes_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório gerado',
        description: 'Download iniciado com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return {
    generateBeneficiariosCSV,
    generateCreditosCSV,
    generateValidacoesCSV
  };
}
