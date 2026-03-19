
-- Remover a constraint atual que está limitando os tipos
ALTER TABLE transacoes DROP CONSTRAINT IF EXISTS transacoes_tipo_check;

-- Criar nova constraint com todos os tipos necessários
ALTER TABLE transacoes ADD CONSTRAINT transacoes_tipo_check 
CHECK (tipo IN (
  'recebido', 
  'gasto', 
  'bonus', 
  'compra', 
  'queima', 
  'transferencia_p2p_saida', 
  'transferencia_p2p_entrada', 
  'taxa'
));
