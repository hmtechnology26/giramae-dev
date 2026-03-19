-- 🏛️ SISTEMA DE PARCERIAS SOCIAIS - MULTI-ORGANIZACIONAL
-- Criação das tabelas para sistema genérico e escalável

-- TABELA 1: Organizações Parceiras
CREATE TABLE parcerias_organizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- "prefeitura", "secretaria", "ong", "centro_comunitario"
  cidade VARCHAR(100),
  estado VARCHAR(2) DEFAULT 'RS',
  contato_email VARCHAR(255),
  contato_telefone VARCHAR(20),
  logo_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABELA 2: Programas das Organizações
CREATE TABLE parcerias_programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacao_id UUID REFERENCES parcerias_organizacoes(id) ON DELETE CASCADE,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  valor_mensal INTEGER NOT NULL DEFAULT 50,
  dia_creditacao INTEGER DEFAULT 1,
  validade_meses INTEGER DEFAULT 12,
  documentos_aceitos TEXT[],
  campos_obrigatorios TEXT[],
  regex_validacao JSONB DEFAULT '{}',
  instrucoes_usuario TEXT,
  cor_tema VARCHAR(7) DEFAULT '#2563eb',
  icone VARCHAR(50) DEFAULT 'FileText',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organizacao_id, codigo)
);

-- TABELA 3: Validações de Usuários
CREATE TABLE parcerias_usuarios_validacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  programa_id UUID REFERENCES parcerias_programas(id) ON DELETE CASCADE,
  dados_usuario JSONB NOT NULL,
  documentos JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pendente',
  data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_validacao TIMESTAMP WITH TIME ZONE,
  validado_por UUID REFERENCES profiles(id),
  motivo_rejeicao TEXT,
  ultima_creditacao DATE,
  total_creditos_recebidos INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, programa_id)
);

-- TABELA 4: Histórico de Créditos
CREATE TABLE parcerias_historico_creditos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  programa_id UUID REFERENCES parcerias_programas(id) ON DELETE CASCADE,
  validacao_id UUID REFERENCES parcerias_usuarios_validacao(id) ON DELETE CASCADE,
  valor_creditado INTEGER NOT NULL,
  mes_referencia DATE NOT NULL,
  data_creditacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_expiracao DATE,
  expirado BOOLEAN DEFAULT false,
  processamento_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABELA 5: Logs de Processamento
CREATE TABLE parcerias_logs_processamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID REFERENCES parcerias_programas(id),
  funcao_executada VARCHAR(100) NOT NULL,
  mes_referencia DATE NOT NULL,
  usuarios_processados INTEGER DEFAULT 0,
  usuarios_com_erro INTEGER DEFAULT 0,
  tempo_execucao_ms INTEGER,
  resultado JSONB DEFAULT '{}',
  executado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE parcerias_organizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcerias_programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcerias_usuarios_validacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcerias_historico_creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcerias_logs_processamento ENABLE ROW LEVEL SECURITY;

-- RLS Policies para Organizações
CREATE POLICY "Organizações são públicas para leitura" ON parcerias_organizacoes
  FOR SELECT USING (ativo = true);

CREATE POLICY "Apenas admins podem gerenciar organizações" ON parcerias_organizacoes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- RLS Policies para Programas
CREATE POLICY "Programas ativos são públicos" ON parcerias_programas
  FOR SELECT USING (ativo = true);

CREATE POLICY "Apenas admins podem gerenciar programas" ON parcerias_programas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- RLS Policies para Validações
CREATE POLICY "Usuários veem suas próprias validações" ON parcerias_usuarios_validacao
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas validações" ON parcerias_usuarios_validacao
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas validações pendentes" ON parcerias_usuarios_validacao
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pendente');

CREATE POLICY "Admins podem gerenciar validações" ON parcerias_usuarios_validacao
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- RLS Policies para Histórico
CREATE POLICY "Usuários veem seu próprio histórico" ON parcerias_historico_creditos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir créditos" ON parcerias_historico_creditos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins podem ver histórico" ON parcerias_historico_creditos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- RLS Policies para Logs
CREATE POLICY "Apenas admins podem ver logs" ON parcerias_logs_processamento
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Índices para performance
CREATE INDEX idx_parcerias_programas_organizacao ON parcerias_programas(organizacao_id);
CREATE INDEX idx_parcerias_validacao_user_programa ON parcerias_usuarios_validacao(user_id, programa_id);
CREATE INDEX idx_parcerias_validacao_status ON parcerias_usuarios_validacao(status) WHERE ativo = true;
CREATE INDEX idx_parcerias_historico_user ON parcerias_historico_creditos(user_id);
CREATE INDEX idx_parcerias_historico_mes ON parcerias_historico_creditos(mes_referencia);

-- Dados iniciais de exemplo
INSERT INTO parcerias_organizacoes (codigo, nome, tipo, cidade, estado, ativo) VALUES 
('canoas_prefeitura', 'Prefeitura de Canoas', 'prefeitura', 'Canoas', 'RS', true),
('poa_educacao', 'Secretaria de Educação - POA', 'secretaria', 'Porto Alegre', 'RS', true),
('centro_vila_nova', 'Centro Comunitário Vila Nova', 'centro_comunitario', 'Canoas', 'RS', true);

INSERT INTO parcerias_programas (organizacao_id, codigo, nome, descricao, valor_mensal, campos_obrigatorios, documentos_aceitos, instrucoes_usuario, cor_tema, icone) VALUES 
(
  (SELECT id FROM parcerias_organizacoes WHERE codigo = 'canoas_prefeitura'),
  'cadunico',
  'Cadastro Único',
  'Benefício para famílias inscritas no CadÚnico de Canoas',
  50,
  ARRAY['nis', 'cpf', 'nome_completo'],
  ARRAY['nis', 'folha_resumo', 'cartao_bolsa'],
  'Envie seu número do NIS e documentos comprobatórios do CadÚnico',
  '#16a34a',
  'Users'
),
(
  (SELECT id FROM parcerias_organizacoes WHERE codigo = 'poa_educacao'),
  'auxilio_educacao',
  'Auxílio Educação',
  'Programa de apoio educacional para estudantes de Porto Alegre',
  30,
  ARRAY['cpf', 'nome_completo', 'escola'],
  ARRAY['declaracao_escolar', 'comprovante_renda'],
  'Comprove sua matrícula em escola pública de Porto Alegre',
  '#dc2626',
  'GraduationCap'
),
(
  (SELECT id FROM parcerias_organizacoes WHERE codigo = 'centro_vila_nova'),
  'apoio_materno',
  'Apoio Materno',
  'Programa de apoio para mães do bairro Vila Nova',
  25,
  ARRAY['cpf', 'nome_completo', 'endereco'],
  ARRAY['certidao_nascimento', 'comprovante_residencia'],
  'Programa destinado a mães residentes no bairro Vila Nova',
  '#7c3aed',
  'Heart'
);