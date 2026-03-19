
-- Atualizar configurações do sistema para incluir todos os controles necessários
INSERT INTO config_sistema (chave, valor) VALUES 
  ('taxa_transacao', '{"percentual": 5.0}'),
  ('markup_emissao', '{"percentual": 0.0}'),
  ('validade_girinhas', '{"meses": 12}'),
  ('cotacao_min_max', '{"min": 0.80, "max": 1.30}')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- Atualizar taxa_transferencia se não existir
INSERT INTO config_sistema (chave, valor) VALUES 
  ('taxa_transferencia', '{"percentual": 1.0}')
ON CONFLICT (chave) DO NOTHING;

-- Remover configuração antiga de queima_por_transacao (agora será calculada como %)
DELETE FROM config_sistema WHERE chave = 'queima_por_transacao';

-- Adicionar coluna para rastrear data de expiração das Girinhas
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS data_expiracao DATE;

-- Atualizar transações existentes com data de expiração baseada na configuração atual
UPDATE transacoes 
SET data_expiracao = created_at::date + INTERVAL '12 months'
WHERE tipo = 'compra' AND data_expiracao IS NULL;

-- Criar índice para consultas de expiração
CREATE INDEX IF NOT EXISTS idx_transacoes_expiracao ON transacoes(data_expiracao) WHERE tipo = 'compra';
