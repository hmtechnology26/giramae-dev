// ============================================
// INTERFACES DO SISTEMA DE PARCERIAS
// ============================================

export interface Organizacao {
  id: string;
  nome: string;
  tipo?: string;
  cnpj?: string;
  cidade: string;
  estado: string;
  endereco?: string;
  contato_responsavel?: string;
  contato_email?: string;
  contato_telefone?: string;
  logo_url?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Programa {
  id: string;
  organizacao_id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  valor_mensal?: number; // Antigo: valor_credito
  valor_credito?: number; // Manter compatibilidade
  dia_creditacao?: number;
  validade_meses?: number;
  campos_obrigatorios: string[];
  documentos_aceitos: string[];
  regex_validacao?: Record<string, any>;
  criterios_elegibilidade?: string;
  instrucoes_usuario?: string;
  cor_tema?: string;
  icone?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Relacionamento
  parcerias_organizacoes?: Organizacao;
}

export interface ValidacaoUsuario {
  id: string;
  user_id: string;
  programa_id: string;
  dados_usuario: Record<string, any>;
  documentos: Documento[];
  status: 'pendente' | 'aprovado' | 'rejeitado';
  data_solicitacao: string;
  data_validacao?: string;
  validado_por?: string;
  motivo_rejeicao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Relacionamento
  profiles?: {
    nome: string;
    email: string;
    telefone?: string;
    avatar_url?: string;
  };
}

export interface Documento {
  nome: string;
  tipo: string;
  path?: string;
  url?: string;
  size?: number;
  uploaded_at?: string;
}

export interface HistoricoCredito {
  id: string;
  programa_id: string;
  user_id: string;
  mes_referencia: string;
  valor_creditado: number;
  data_creditacao?: string;
  data_expiracao?: string;
  expirado?: boolean;
  processamento_id?: string;
  validacao_id?: string;
  created_at: string;
}

export interface LogProcessamento {
  id: string;
  programa_id: string;
  mes_referencia: string;
  total_usuarios: number;
  total_processados: number;
  total_erros: number;
  valor_total: number;
  status: string;
  erro_detalhes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// INTERFACES DE MÉTRICAS E DASHBOARDS
// ============================================

export interface KPIsGlobais {
  total_organizacoes: number;
  total_programas: number;
  total_beneficiarios: number;
  validacoes_pendentes: number;
  girinhas_mes_atual: number;
  girinhas_total: number;
}

export interface ProgramaListItem {
  id: string;
  nome: string;
  organizacao_nome: string;
  cidade: string;
  estado: string;
  total_beneficiarios: number;
  validacoes_pendentes: number;
  creditos_mes: number;
  status: 'ativo' | 'inativo';
}

export interface MetricasPrograma {
  total_beneficiarios_aprovados: number;
  validacoes_pendentes: number;
  creditos_mes_atual: number;
  creditos_total: number;
  taxa_aprovacao: number;
  novos_beneficiarios_mes: number;
}

export interface AlertaCritico {
  tipo: 'validacoes_pendentes' | 'baixa_aprovacao' | 'documentos_pendentes' | 'erro_processamento';
  titulo: string;
  descricao: string;
  programa_id?: string;
  programa_nome?: string;
  prioridade: 'alta' | 'media' | 'baixa';
  data: string;
}

export interface EvolucaoTemporal {
  mes: string;
  novos_beneficiarios: number;
  creditos_distribuidos: number;
}

export interface PerfilBeneficiario {
  id: string;
  user_id: string;
  programa_id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  data_cadastro: string;
  status: 'ativo' | 'suspenso';
  data_aprovacao: string;
  ultima_atividade?: string;
  dados_solicitacao: Record<string, any>;
  resumo_financeiro: {
    total_creditos_recebidos: number;
    creditos_mes_atual: number;
    media_mensal: number;
    saldo_atual: number;
    total_recebido: number;
    total_gasto: number;
    proxima_data_credito?: string;
  };
  historico_creditos: HistoricoCredito[];
  padrao_uso: {
    percentual_gasto_itens: number;
    percentual_transferido_p2p: number;
    saldo_atual: number;
    categorias_favoritas: string[];
    total_itens_publicados: number;
    total_compras: number;
    total_vendas: number;
    compras_confirmadas: number;
    vendas_confirmadas: number;
    ultimos_itens: any[];
  };
  expiracao_girinhas: {
    total_expirando_7_dias: number;
    total_expirando_30_dias: number;
    proxima_expiracao: string | null;
    detalhes: any[];
  };
  ultimas_transacoes: Array<{
    id: string;
    tipo: string;
    valor: number;
    descricao: string;
    data: string;
    metadata?: any;
  }>;
  documentos: Documento[];
  observacoes: ObservacaoInterna[];
}

export interface ObservacaoInterna {
  id: string;
  user_id: string;
  programa_id: string;
  admin_id: string;
  admin_nome: string;
  texto: string;
  created_at: string;
}

// ============================================
// INTERFACES DE FILTROS E PAGINAÇÃO
// ============================================

export interface FiltrosDashboard {
  cidade?: string;
  estado?: string;
  organizacao?: string;
  status?: string;
  periodo?: {
    inicio: string;
    fim: string;
  };
}

export interface PaginacaoParams {
  page: number;
  perPage: number;
  total?: number;
}

// ============================================
// INTERFACES DE FORMULÁRIOS
// ============================================

export interface FormNovaOrganizacao {
  nome: string;
  tipo: string;
  cnpj?: string;
  cidade: string;
  estado: string;
  endereco?: string;
  contato_responsavel?: string;
  contato_email?: string;
  contato_telefone?: string;
}

export interface FormNovoPrograma {
  organizacao_id: string;
  nome: string;
  descricao?: string;
  valor_mensal_credito: number;
  campos_obrigatorios: string[];
  documentos_aceitos: string[];
  instrucoes_usuario?: string;
  cor_tema?: string;
  icone?: string;
}

export interface FormAprovacaoValidacao {
  validacao_id: string;
  observacoes?: string;
}

export interface FormRejeicaoValidacao {
  validacao_id: string;
  motivo: string;
}
