import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TipoTransacaoEnum } from '@/types/transacao.types';

interface BonusDiarioConfig {
  ativo: boolean;
  valor_girinhas: number;
  validade_horas: number;
}

interface StatusBonusDiario {
  pode_coletar: boolean;
  ultimo_bonus: string | null;
  proxima_coleta: string | null;
  horas_restantes: number;
  ja_coletou_hoje: boolean;
}

interface ConfigValue {
  ativo?: boolean;
  girinhas?: number;
  horas?: number;
}

export const useBonusDiario = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configuração do bônus diário
  const { data: config } = useQuery({
    queryKey: ['bonus-diario-config'],
    queryFn: async (): Promise<BonusDiarioConfig> => {
      const { data, error } = await supabase
        .from('config_sistema')
        .select('chave, valor')
        .in('chave', ['bonus_diario_ativo', 'bonus_diario_valor', 'bonus_diario_validade']);

      if (error) throw error;

      const configObj = data.reduce((acc, item) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {} as any);

      const ativoConfig = configObj.bonus_diario_ativo as ConfigValue;
      const valorConfig = configObj.bonus_diario_valor as ConfigValue;
      const validadeConfig = configObj.bonus_diario_validade as ConfigValue;

      return {
        ativo: ativoConfig?.ativo ?? true,
        valor_girinhas: valorConfig?.girinhas ?? 5,
        validade_horas: validadeConfig?.horas ?? 24
      };
    },
    staleTime: 60000, // 1 minuto
  });

  // Verificar status do bônus diário do usuário
  const { data: status, isLoading } = useQuery({
    queryKey: ['bonus-diario-status', user?.id],
    queryFn: async (): Promise<StatusBonusDiario> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Usar view ledger_transacoes ao invés de transacoes
      const { data: ultimoBonus, error } = await (supabase as any)
        .from('ledger_transacoes')
        .select('data_criacao')
        .eq('user_id', user.id)
        .eq('tipo', 'bonus_diario')
        .order('data_criacao', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const agora = new Date();
      const ultimoBonusData = ultimoBonus?.data_criacao ? new Date(ultimoBonus.data_criacao) : null;
      
      let pode_coletar = true;
      let horas_restantes = 0;
      let proxima_coleta = null;
      let ja_coletou_hoje = false;

      if (ultimoBonusData) {
        // ✅ CORREÇÃO: Verificar por DATA ao invés de HORAS
        // Normalizar as datas para comparação (apenas dia/mês/ano, ignorando hora)
        const dataUltimoBonus = new Date(ultimoBonusData);
        dataUltimoBonus.setHours(0, 0, 0, 0);
        
        const dataHoje = new Date(agora);
        dataHoje.setHours(0, 0, 0, 0);
        
        // Se a data do último bônus é HOJE, já coletou
        if (dataUltimoBonus.getTime() === dataHoje.getTime()) {
          pode_coletar = false;
          ja_coletou_hoje = true;
          
          // Calcular tempo até meia-noite (próxima coleta)
          const proximaMeiaNoite = new Date(agora);
          proximaMeiaNoite.setDate(proximaMeiaNoite.getDate() + 1);
          proximaMeiaNoite.setHours(0, 0, 0, 0);
          
          const msAteMeiaNoite = proximaMeiaNoite.getTime() - agora.getTime();
          horas_restantes = Math.ceil(msAteMeiaNoite / (1000 * 60 * 60));
          proxima_coleta = proximaMeiaNoite.toISOString();
        }
        // Se a data do último bônus é ANTERIOR a hoje, pode coletar
        else if (dataUltimoBonus.getTime() < dataHoje.getTime()) {
          pode_coletar = true;
          ja_coletou_hoje = false;
        }
      }

      return {
        pode_coletar: pode_coletar && (config?.ativo ?? true),
        ultimo_bonus: ultimoBonusData?.toISOString() ?? null,
        proxima_coleta,
        horas_restantes,
        ja_coletou_hoje
      };
    },
    enabled: !!user?.id && !!config,
    refetchInterval: 60000, // Atualizar a cada minuto
  });

  // Mutation para coletar bônus diário
  const coletarBonusMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      if (!config?.ativo) throw new Error('Bônus diário está desativado');
      if (!status?.pode_coletar) throw new Error('Bônus diário não disponível');

      const valorGirinhas = config.valor_girinhas;
      const validadeHoras = config.validade_horas;
      
      // Usar sistema ledger para criar bônus
      const { data: result, error } = await (supabase as any).rpc('ledger_processar_bonus', {
        p_user_id: user.id,
        p_tipo: 'bonus_diario',
        p_valor: valorGirinhas,
        p_descricao: `Bônus diário - ${valorGirinhas} Girinhas`
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      const valorGirinhas = config?.valor_girinhas ?? 5;
      const validadeHoras = config?.validade_horas ?? 24;
      
      toast({
        title: "🎁 Bônus Diário Coletado!",
        description: `+${valorGirinhas} Girinhas adicionadas! Válidas até meia-noite.`,
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['bonus-diario-status'] });
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao coletar bônus",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  });

  return {
    config,
    status,
    isLoading,
    coletarBonus: coletarBonusMutation.mutate,
    isColetando: coletarBonusMutation.isPending,
    podeColetarBonus: status?.pode_coletar && config?.ativo,
    proximaColeta: status?.proxima_coleta,
    horasRestantes: status?.horas_restantes ?? 0,
    jaColetouHoje: status?.ja_coletou_hoje ?? false,
  };
};
