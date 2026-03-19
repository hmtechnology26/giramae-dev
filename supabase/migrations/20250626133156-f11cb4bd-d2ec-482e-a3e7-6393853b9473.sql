
-- =====================================================
-- MIGRAÇÃO COMPLETA: TELA PUBLICAR ITEM (VERSÃO CORRIGIDA)
-- =====================================================

-- ETAPA 1: CRIAR NOVAS TABELAS
-- ---------------------------------------------

-- Tabela de Subcategorias
CREATE TABLE IF NOT EXISTS subcategorias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_pai text NOT NULL,
  nome text NOT NULL,
  icone text,
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Tabela de Tamanhos por Categoria
CREATE TABLE IF NOT EXISTS categorias_tamanhos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria text NOT NULL,
  subcategoria text,
  tipo_tamanho text NOT NULL,
  valor text NOT NULL,
  label_display text NOT NULL,
  idade_minima_meses integer,
  idade_maxima_meses integer,
  ordem integer NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- ETAPA 2: ADICIONAR NOVOS CAMPOS NA TABELA ITENS
-- ---------------------------------------------

ALTER TABLE itens ADD COLUMN IF NOT EXISTS subcategoria text;
ALTER TABLE itens ADD COLUMN IF NOT EXISTS genero text;
ALTER TABLE itens ADD COLUMN IF NOT EXISTS tamanho_categoria text;
ALTER TABLE itens ADD COLUMN IF NOT EXISTS tamanho_valor text;

-- Adicionar constraints apenas se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'itens_genero_check') THEN
        ALTER TABLE itens ADD CONSTRAINT itens_genero_check 
          CHECK (genero IN ('menino', 'menina', 'unissex'));
    END IF;
END $$;

-- ETAPA 3: MIGRAR DADOS EXISTENTES
-- ---------------------------------------------

-- Definir gênero padrão como 'unissex' para itens existentes
UPDATE itens SET genero = 'unissex' WHERE genero IS NULL;

-- Migrar tamanho antigo para novo sistema
UPDATE itens SET 
  tamanho_categoria = 'livre',
  tamanho_valor = tamanho
WHERE tamanho IS NOT NULL AND tamanho_categoria IS NULL;

-- ETAPA 4: POPULAR SUBCATEGORIAS
-- ---------------------------------------------

INSERT INTO subcategorias (categoria_pai, nome, icone, ordem) VALUES 
-- ROUPAS
('roupas', 'Vestidos', '👗', 1),
('roupas', 'Macacões', '🩱', 2),
('roupas', 'Conjuntos', '👕', 3),
('roupas', 'Casacos', '🧥', 4),
('roupas', 'Pijamas', '🩳', 5),
('roupas', 'Camisetas', '👕', 6),
('roupas', 'Calças', '👖', 7),
('roupas', 'Bodies', '👶', 8),
('roupas', 'Shorts', '🩳', 9),

-- CALÇADOS  
('calcados', 'Tênis', '👟', 1),
('calcados', 'Sandálias', '👡', 2),
('calcados', 'Sapatos', '👞', 3),
('calcados', 'Botas', '👢', 4),
('calcados', 'Pantufas', '🥿', 5),
('calcados', 'Chinelos', '🩴', 6),

-- BRINQUEDOS
('brinquedos', 'Educativos', '🧩', 1),
('brinquedos', 'Pelúcias', '🧸', 2),
('brinquedos', 'Jogos de Tabuleiro', '🎲', 3),
('brinquedos', 'Carrinhos', '🚗', 4),
('brinquedos', 'Bonecas', '🪆', 5),
('brinquedos', 'Lego/Blocos', '🧱', 6),
('brinquedos', 'Quebra-cabeças', '🧩', 7),

-- EQUIPAMENTOS
('equipamentos', 'Carrinhos de Bebê', '🚼', 1),
('equipamentos', 'Cadeirinhas', '🪑', 2),
('equipamentos', 'Berços', '🛏️', 3),
('equipamentos', 'Cadeirões', '🪑', 4),
('equipamentos', 'Banheiras', '🛁', 5),

-- ACESSÓRIOS
('acessorios', 'Bolsas', '👜', 1),
('acessorios', 'Mochilas', '🎒', 2),
('acessorios', 'Mamadeiras', '🍼', 3),
('acessorios', 'Chupetas', '🍼', 4),
('acessorios', 'Babadores', '👶', 5),

-- LIVROS
('livros', 'Infantis', '📚', 1),
('livros', 'Educativos', '📖', 2),
('livros', 'Histórias', '📘', 3),
('livros', 'Atividades', '📝', 4)
ON CONFLICT DO NOTHING;

-- ETAPA 5: POPULAR TAMANHOS POR CATEGORIA
-- ---------------------------------------------

-- ROUPAS BEBÊ (0-24 meses)
INSERT INTO categorias_tamanhos (categoria, tipo_tamanho, valor, label_display, idade_minima_meses, idade_maxima_meses, ordem) VALUES
('roupas', 'roupa_bebe', 'RN', 'Recém-nascido (RN)', 0, 1, 1),
('roupas', 'roupa_bebe', '0-3M', '0 a 3 meses', 0, 3, 2),
('roupas', 'roupa_bebe', '3-6M', '3 a 6 meses', 3, 6, 3),
('roupas', 'roupa_bebe', '6-9M', '6 a 9 meses', 6, 9, 4),
('roupas', 'roupa_bebe', '9-12M', '9 a 12 meses', 9, 12, 5),
('roupas', 'roupa_bebe', '12-18M', '12 a 18 meses', 12, 18, 6),
('roupas', 'roupa_bebe', '18-24M', '18 a 24 meses', 18, 24, 7),

-- ROUPAS CRIANÇA (2+ anos)
('roupas', 'roupa_crianca', '2', 'Tamanho 2 anos', 24, 36, 8),
('roupas', 'roupa_crianca', '3', 'Tamanho 3 anos', 36, 48, 9),
('roupas', 'roupa_crianca', '4', 'Tamanho 4 anos', 48, 60, 10),
('roupas', 'roupa_crianca', '5', 'Tamanho 5 anos', 60, 72, 11),
('roupas', 'roupa_crianca', '6', 'Tamanho 6 anos', 72, 84, 12),
('roupas', 'roupa_crianca', '8', 'Tamanho 8 anos', 96, 108, 13),
('roupas', 'roupa_crianca', '10', 'Tamanho 10 anos', 120, 132, 14),
('roupas', 'roupa_crianca', '12', 'Tamanho 12 anos', 144, 156, 15),
('roupas', 'roupa_crianca', '14', 'Tamanho 14 anos', 168, 180, 16),

-- CALÇADOS
('calcados', 'calcado', '15', 'Tamanho 15', NULL, NULL, 1),
('calcados', 'calcado', '16', 'Tamanho 16', NULL, NULL, 2),
('calcados', 'calcado', '17', 'Tamanho 17', NULL, NULL, 3),
('calcados', 'calcado', '18', 'Tamanho 18', NULL, NULL, 4),
('calcados', 'calcado', '19', 'Tamanho 19', NULL, NULL, 5),
('calcados', 'calcado', '20', 'Tamanho 20', NULL, NULL, 6),
('calcados', 'calcado', '21', 'Tamanho 21', NULL, NULL, 7),
('calcados', 'calcado', '22', 'Tamanho 22', NULL, NULL, 8),
('calcados', 'calcado', '23', 'Tamanho 23', NULL, NULL, 9),
('calcados', 'calcado', '24', 'Tamanho 24', NULL, NULL, 10),
('calcados', 'calcado', '25', 'Tamanho 25', NULL, NULL, 11),
('calcados', 'calcado', '26', 'Tamanho 26', NULL, NULL, 12),
('calcados', 'calcado', '27', 'Tamanho 27', NULL, NULL, 13),
('calcados', 'calcado', '28', 'Tamanho 28', NULL, NULL, 14),
('calcados', 'calcado', '29', 'Tamanho 29', NULL, NULL, 15),
('calcados', 'calcado', '30', 'Tamanho 30', NULL, NULL, 16),
('calcados', 'calcado', '31', 'Tamanho 31', NULL, NULL, 17),
('calcados', 'calcado', '32', 'Tamanho 32', NULL, NULL, 18),
('calcados', 'calcado', '33', 'Tamanho 33', NULL, NULL, 19),
('calcados', 'calcado', '34', 'Tamanho 34', NULL, NULL, 20),
('calcados', 'calcado', '35', 'Tamanho 35', NULL, NULL, 21),
('calcados', 'calcado', '36', 'Tamanho 36', NULL, NULL, 22),
('calcados', 'calcado', '37', 'Tamanho 37', NULL, NULL, 23),
('calcados', 'calcado', '38', 'Tamanho 38', NULL, NULL, 24),

-- BRINQUEDOS (por idade)
('brinquedos', 'idade', '0-6M', '0 a 6 meses', 0, 6, 1),
('brinquedos', 'idade', '6-12M', '6 a 12 meses', 6, 12, 2),
('brinquedos', 'idade', '1-2anos', '1 a 2 anos', 12, 24, 3),
('brinquedos', 'idade', '2-3anos', '2 a 3 anos', 24, 36, 4),
('brinquedos', 'idade', '3-5anos', '3 a 5 anos', 36, 60, 5),
('brinquedos', 'idade', '5-8anos', '5 a 8 anos', 60, 96, 6),
('brinquedos', 'idade', '8+anos', '8+ anos', 96, NULL, 7),
('brinquedos', 'idade', 'todas', 'Todas as idades', NULL, NULL, 8),

-- LIVROS (por idade)
('livros', 'idade', 'bebe', 'Bebê (0-1 ano)', 0, 12, 1),
('livros', 'idade', 'toddler', 'Toddler (1-3 anos)', 12, 36, 2),
('livros', 'idade', 'pre-escolar', 'Pré-escolar (3-5 anos)', 36, 60, 3),
('livros', 'idade', 'escolar', 'Escolar (5-8 anos)', 60, 96, 4),
('livros', 'idade', 'infanto-juvenil', 'Infanto-juvenil (8+ anos)', 96, NULL, 5),

-- EQUIPAMENTOS (por peso/idade)
('equipamentos', 'idade', '0-6M', '0 a 6 meses', 0, 6, 1),
('equipamentos', 'idade', '6-12M', '6 a 12 meses', 6, 12, 2),
('equipamentos', 'idade', '1-3anos', '1 a 3 anos', 12, 36, 3),
('equipamentos', 'idade', '3+anos', '3+ anos', 36, NULL, 4),

-- ACESSÓRIOS (geralmente sem tamanho específico)
('acessorios', 'universal', 'unico', 'Tamanho único', NULL, NULL, 1),
('acessorios', 'idade', '0-6M', '0 a 6 meses', 0, 6, 2),
('acessorios', 'idade', '6+M', '6+ meses', 6, NULL, 3)
ON CONFLICT DO NOTHING;

-- ETAPA 6: CRIAR ÍNDICES PARA PERFORMANCE
-- ---------------------------------------------

CREATE INDEX IF NOT EXISTS idx_itens_categoria_subcategoria ON itens(categoria, subcategoria);
CREATE INDEX IF NOT EXISTS idx_itens_genero ON itens(genero);
CREATE INDEX IF NOT EXISTS idx_itens_tamanho_categoria ON itens(tamanho_categoria);
CREATE INDEX IF NOT EXISTS idx_subcategorias_categoria_pai ON subcategorias(categoria_pai);
CREATE INDEX IF NOT EXISTS idx_categorias_tamanhos_categoria ON categorias_tamanhos(categoria);

-- ETAPA 7: POLÍTICAS RLS
-- ---------------------------------------------

-- Subcategorias (leitura pública)
ALTER TABLE subcategorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Subcategorias são públicas" ON subcategorias;
CREATE POLICY "Subcategorias são públicas" ON subcategorias FOR SELECT USING (true);

-- Categorias Tamanhos (leitura pública)  
ALTER TABLE categorias_tamanhos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tamanhos são públicos" ON categorias_tamanhos;
CREATE POLICY "Tamanhos são públicos" ON categorias_tamanhos FOR SELECT USING (true);
