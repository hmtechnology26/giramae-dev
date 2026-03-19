
-- Adicionar o tipo 'missao_recompensa' à constraint de tipos da tabela transacoes
ALTER TABLE transacoes DROP CONSTRAINT IF EXISTS transacoes_tipo_check;

-- Recriar a constraint com o novo tipo
ALTER TABLE transacoes ADD CONSTRAINT transacoes_tipo_check 
CHECK (tipo IN (
  'recebido', 
  'gasto', 
  'bonus', 
  'compra', 
  'queima', 
  'transferencia_p2p_saida', 
  'transferencia_p2p_entrada', 
  'taxa',
  'missao_recompensa'
));
