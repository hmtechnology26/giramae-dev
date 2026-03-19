
-- Verificar quais campos já existem e adicionar apenas os faltantes na tabela itens
ALTER TABLE itens 
ADD COLUMN IF NOT EXISTS endereco_cep VARCHAR(9),
ADD COLUMN IF NOT EXISTS endereco_rua TEXT,
ADD COLUMN IF NOT EXISTS endereco_bairro TEXT,
ADD COLUMN IF NOT EXISTS endereco_cidade TEXT,
ADD COLUMN IF NOT EXISTS endereco_estado VARCHAR(2),
ADD COLUMN IF NOT EXISTS endereco_complemento TEXT,
ADD COLUMN IF NOT EXISTS ponto_referencia TEXT,
ADD COLUMN IF NOT EXISTS escola_id BIGINT REFERENCES escolas_inep(codigo_inep),
ADD COLUMN IF NOT EXISTS aceita_entrega BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS raio_entrega_km INTEGER,
ADD COLUMN IF NOT EXISTS instrucoes_retirada TEXT;

-- Adicionar campos de endereço principal na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cep VARCHAR(9),
ADD COLUMN IF NOT EXISTS estado VARCHAR(2),
ADD COLUMN IF NOT EXISTS complemento TEXT,
ADD COLUMN IF NOT EXISTS ponto_referencia TEXT;

-- Criar índices para performance (IF NOT EXISTS não funciona com índices, então usar DROP IF EXISTS primeiro)
DROP INDEX IF EXISTS idx_itens_endereco_cidade;
DROP INDEX IF EXISTS idx_itens_escola_id;
DROP INDEX IF EXISTS idx_profiles_cep;

CREATE INDEX idx_itens_endereco_cidade ON itens(endereco_cidade);
CREATE INDEX idx_itens_escola_id ON itens(escola_id);
CREATE INDEX idx_profiles_cep ON profiles(cep);
