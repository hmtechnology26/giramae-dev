
-- Criar tabela de configurações por categoria (se não existir)
CREATE TABLE IF NOT EXISTS public.config_categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL UNIQUE,
  valor_minimo DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  valor_maximo DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão para todas as categorias
INSERT INTO public.config_categorias (categoria, valor_minimo, valor_maximo, descricao) VALUES 
  ('roupa', 5.00, 50.00, 'Roupas infantis em geral'),
  ('calcado', 10.00, 80.00, 'Calçados infantis'),
  ('brinquedo', 3.00, 100.00, 'Brinquedos e jogos'),
  ('livro', 2.00, 30.00, 'Livros infantis e educativos'),
  ('acessorio', 1.00, 40.00, 'Acessórios diversos'),
  ('utensilio', 5.00, 60.00, 'Utensílios para bebês e crianças'),
  ('outro', 1.00, 200.00, 'Outros itens')
ON CONFLICT (categoria) DO NOTHING;

-- Adicionar constraint apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_valor_minimo_menor_maximo' 
    AND table_name = 'config_categorias'
  ) THEN
    ALTER TABLE public.config_categorias 
    ADD CONSTRAINT check_valor_minimo_menor_maximo 
    CHECK (valor_minimo < valor_maximo);
  END IF;
END $$;

-- Criar função para validar valores de itens
CREATE OR REPLACE FUNCTION public.validar_valor_item_categoria(p_categoria TEXT, p_valor DECIMAL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
BEGIN
  -- Buscar configuração da categoria
  SELECT valor_minimo, valor_maximo, ativo 
  INTO v_config
  FROM public.config_categorias 
  WHERE categoria = p_categoria AND ativo = true;
  
  -- Se não encontrar configuração, permitir (fallback)
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- Validar se valor está dentro da faixa
  RETURN p_valor >= v_config.valor_minimo AND p_valor <= v_config.valor_maximo;
END;
$$;

-- Criar trigger para validar antes de inserir/atualizar itens
CREATE OR REPLACE FUNCTION public.trigger_validar_valor_item()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar valor do item
  IF NOT public.validar_valor_item_categoria(NEW.categoria, NEW.valor_girinhas) THEN
    RAISE EXCEPTION 'Valor % Girinhas está fora da faixa permitida para categoria %', 
      NEW.valor_girinhas, NEW.categoria;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela itens
DROP TRIGGER IF EXISTS validate_item_value ON public.itens;
CREATE TRIGGER validate_item_value
  BEFORE INSERT OR UPDATE ON public.itens
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_validar_valor_item();

-- Enable RLS na nova tabela (se ainda não estiver ativo)
ALTER TABLE public.config_categorias ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para recriar
DROP POLICY IF EXISTS "Todos podem ver configurações de categorias" ON public.config_categorias;
DROP POLICY IF EXISTS "Apenas admins podem modificar configurações" ON public.config_categorias;

-- Política para leitura (todos podem ler as configurações)
CREATE POLICY "Todos podem ver configurações de categorias" 
  ON public.config_categorias 
  FOR SELECT 
  USING (true);

-- Política para admin (apenas admins podem modificar - implementar depois conforme necessário)
CREATE POLICY "Apenas admins podem modificar configurações" 
  ON public.config_categorias 
  FOR ALL 
  USING (false) 
  WITH CHECK (false);
