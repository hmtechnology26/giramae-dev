import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Organizacao {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  cidade: string;
  estado: string;
  logo_url?: string;
  programas: Programa[];
}

export interface Programa {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  valor_mensal: number;
  dia_creditacao?: number;
  validade_meses?: number;
  criterios_elegibilidade?: string;
  instrucoes_usuario: string;
  cor_tema: string;
  icone: string;
  campos_obrigatorios: string[];
  documentos_aceitos: string[];
  status_usuario?: 'nao_solicitado' | 'pendente' | 'aprovado' | 'rejeitado';
}

export function useParceriasSociais() {
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizacoes();
  }, [user]);

  const loadOrganizacoes = async () => {
    try {
      setLoading(true);
      
      // Buscar organizações e programas
      const { data: orgData, error: orgError } = await supabase
        .from('parcerias_organizacoes')
        .select(`
          id,
          codigo,
          nome,
          tipo,
          cidade,
          estado,
          logo_url,
          parcerias_programas (
            id,
            codigo,
            nome,
            descricao,
            valor_mensal,
            dia_creditacao,
            validade_meses,
            instrucoes_usuario,
            cor_tema,
            icone,
            campos_obrigatorios,
            documentos_aceitos
          )
        `)
        .eq('ativo', true)
        .order('nome');

      if (orgError) throw orgError;

      // Se usuário logado, buscar status das validações
      let validacoes: any[] = [];
      if (user) {
        const { data: validData, error: validError } = await supabase
          .from('parcerias_usuarios_validacao')
          .select('programa_id, status')
          .eq('user_id', user.id)
          .eq('ativo', true);

        if (validError) throw validError;
        validacoes = validData || [];
      }

      // Mapear dados
      const organizacoesFormatadas: Organizacao[] = (orgData || []).map(org => ({
        id: org.id,
        codigo: org.codigo,
        nome: org.nome,
        tipo: org.tipo,
        cidade: org.cidade,
        estado: org.estado,
        logo_url: org.logo_url,
        programas: (org.parcerias_programas || []).map(prog => {
          const validacao = validacoes.find(v => v.programa_id === prog.id);
          return {
            id: prog.id,
            codigo: prog.codigo,
            nome: prog.nome,
            descricao: prog.descricao,
            valor_mensal: prog.valor_mensal,
            dia_creditacao: prog.dia_creditacao,
            validade_meses: prog.validade_meses,
            instrucoes_usuario: prog.instrucoes_usuario,
            cor_tema: prog.cor_tema,
            icone: prog.icone,
            campos_obrigatorios: prog.campos_obrigatorios || [],
            documentos_aceitos: prog.documentos_aceitos || [],
            status_usuario: validacao?.status || 'nao_solicitado'
          };
        })
      }));

      setOrganizacoes(organizacoesFormatadas);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro ao carregar parcerias",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    organizacoes,
    loading,
    error,
    refetch: loadOrganizacoes
  };
}