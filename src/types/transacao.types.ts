
export type TipoTransacaoEnum = 
  // Entrada: Compra
  | 'compra'
  
  // Entrada: Bônus Diário
  | 'bonus_diario'
  
  // Entrada: Bônus de Cadastro/Indicação
  | 'bonus_cadastro'
  | 'bonus_indicacao_cadastro'
  | 'bonus_indicacao_cadastro_indicado'  // ADICIONADO
  | 'bonus_indicacao_primeiro_item'
  | 'bonus_indicacao_primeira_compra'
  
  // Entrada: Bônus de Atividades
  | 'bonus_troca_concluida'
  | 'bonus_avaliacao'
  
  // Entrada: Bônus de Metas
  | 'bonus_meta_bronze'
  | 'bonus_meta_prata'
  | 'bonus_meta_ouro'
  | 'bonus_meta_diamante'
  
  // Entrada: Bônus Promocional (NOVO)
  | 'bonus_promocional'
  
  // Entrada: Missões e Vendas
  | 'missao'
  | 'recebido_item'
  
  // Entrada: Transferências
  | 'transferencia_p2p_entrada'
  | 'reembolso'
  
  // Saída: Reservas e Transferências
  | 'bloqueio_reserva'
  | 'transferencia_p2p_saida'
  
  // Saída: Taxas e Queimas
  | 'taxa_transferencia'
  | 'taxa_extensao_validade'
  | 'taxa_marketplace'
  | 'queima_expiracao'
  | 'queima_administrativa'
  
  // Bônus de Jornadas
  | 'bonus_jornada';

export interface TipoTransacaoConfig {
  tipo: TipoTransacaoEnum;
  sinal: -1 | 1;
  validade_dias: number | null;
  valor_padrao: number | null;
  descricao_pt: string;
  categoria: string;
  ativo: boolean;
  ordem_exibicao: number;
  icone: string;
  cor_hex: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TransacaoDetalhada {
  id: string;
  user_id: string;
  tipo: TipoTransacaoEnum;
  valor: number;
  descricao: string;
  created_at: string;
  data_expiracao: string | null;
  metadados: Record<string, any>;
  valor_real: number | null;
  quantidade_girinhas: number | null;
  cotacao_utilizada: number | null;
  item_id: string | null;
  reserva_id: string | null;
  transferencia_id: string | null;
}

