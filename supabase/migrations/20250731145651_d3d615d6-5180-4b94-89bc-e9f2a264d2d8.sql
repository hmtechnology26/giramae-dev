-- Adicionar colunas necessárias para o sistema de cancelamento na tabela reservas

ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS observacoes_cancelamento TEXT,
ADD COLUMN IF NOT EXISTS cancelada_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelada_por UUID REFERENCES auth.users(id);