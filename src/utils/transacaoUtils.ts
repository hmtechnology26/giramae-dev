import { TipoTransacaoEnum } from '@/types/transacao.types';

// Formatação limpa dos tipos de transação
export const formatarTipoTransacao = (tipo: string): string => {
  const mapeamento: Record<string, string> = {
    // Créditos
    'compra': 'Compra',
    'bonus_cadastro': 'Bônus de Cadastro',
    'bonus_diario': 'Bônus Diário',
    'bonus_troca_concluida': 'Troca Concluída',
    // ✅ ADICIONAR BÔNUS DE INDICAÇÃO:
    'bonus_indicacao_cadastro': 'Indicação - Cadastro',
    'bonus_indicacao_primeiro_item': 'Indicação - Primeiro Item',
    'bonus_indicacao_primeira_compra': 'Indicação - Primeira Compra',
    'bonus_indicacao_cadastro_indicado': 'Bônus de Boas-vindas',
    // ✅ ADICIONAR OUTROS BÔNUS FALTANDO:
    'bonus_avaliacao': 'Bônus Avaliação',
    'bonus_promocional': 'Bônus Promocional',
    'bonus_meta_bronze': 'Meta Bronze',
    'bonus_meta_prata': 'Meta Prata',
    'bonus_meta_ouro': 'Meta Ouro',
    'bonus_meta_diamante': 'Meta Diamante',
    'missao': 'Missão',
    'recebido_item': 'Recebido',
    'transferencia_p2p_entrada': 'Transferência Recebida',
    'reembolso': 'Reembolso',
    
    // Débitos
    'bloqueio_reserva': 'Bloqueio Reserva',
    'transferencia_p2p_saida': 'Transferência Enviada',
    'taxa_transferencia': 'Taxa Transferência',
    'taxa_extensao_validade': 'Taxa Extensão',
    'taxa_marketplace': 'Taxa Marketplace',
    'queima_expiracao': 'Expiração',
    'queima_administrativa': 'Queima Admin'
  };
  return mapeamento[tipo] || tipo;
};

// ✅ CORREÇÃO: Tipos que ADICIONAM saldo (incluindo os 6 tipos faltando)
export const isTransacaoPositiva = (tipo: string): boolean => {
  const tiposPositivos: string[] = [
    'compra',
    'bonus_cadastro',
    'bonus_diario',
    'bonus_troca_concluida',
    // ✅ ADICIONAR TODOS OS BÔNUS DE INDICAÇÃO:
    'bonus_indicacao_cadastro',
    'bonus_indicacao_primeiro_item',        // ✅ ADICIONADO
    'bonus_indicacao_primeira_compra',      // ✅ ADICIONADO
    'bonus_indicacao_cadastro_indicado',    // ✅ ADICIONADO
    // ✅ OUTROS BÔNUS FALTANDO:
    'bonus_avaliacao',                      // ✅ ADICIONADO
    'bonus_promocional',                    // ✅ ADICIONADO
    'bonus_meta_bronze',
    'bonus_meta_prata',
    'bonus_meta_ouro',
    'bonus_meta_diamante',
    'missao',
    'recebido_item',
    'transferencia_p2p_entrada',
    'reembolso'
  ];
  
  return tiposPositivos.includes(tipo);
};

// Cores baseadas em ADIÇÃO/DEDUÇÃO
export const getCorTipo = (tipo: string): string => {
  if (isTransacaoPositiva(tipo)) {
    return 'text-green-600 bg-green-50 border-green-200';
  } else {
    return 'text-red-600 bg-red-50 border-red-200';
  }
};

// Função para criar transação com tipo validado
export const criarTransacaoValidada = async (
  userId: string,
  tipo: TipoTransacaoEnum,
  valor: number,
  descricao: string,
  metadados: Record<string, any> = {}
): Promise<string> => {
  // Temporariamente desabilitado - requer migração ledger
  throw new Error('criar_transacao_validada temporariamente desabilitado');
};
