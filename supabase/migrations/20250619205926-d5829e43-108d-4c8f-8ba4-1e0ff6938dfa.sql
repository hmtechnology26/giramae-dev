
-- Expandir a coluna tipo na tabela transacoes para acomodar tipos de transação mais longos
ALTER TABLE transacoes ALTER COLUMN tipo TYPE VARCHAR(50);
