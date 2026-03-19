-- Adicionar coluna codigo_unico na tabela itens
ALTER TABLE itens 
ADD COLUMN codigo_unico TEXT;

-- Criar função para gerar código único GRM-XXXXX
CREATE OR REPLACE FUNCTION gerar_codigo_item() 
RETURNS TEXT AS $$
DECLARE
  codigo TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    -- Gera código de 5 caracteres alfanuméricos (ex: GRM-8X4Z2)
    codigo := 'GRM-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 5));
    
    -- Verifica se já existe
    SELECT EXISTS(SELECT 1 FROM itens WHERE codigo_unico = codigo) INTO existe;
    
    EXIT WHEN NOT existe;
  END LOOP;
  
  RETURN codigo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger function para gerar código automaticamente
CREATE OR REPLACE FUNCTION gerar_codigo_item_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_unico IS NULL THEN
    NEW.codigo_unico := gerar_codigo_item();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar antes de inserir
CREATE TRIGGER trigger_gerar_codigo_item
BEFORE INSERT ON itens
FOR EACH ROW
EXECUTE FUNCTION gerar_codigo_item_trigger();

-- Popular itens existentes com códigos únicos
UPDATE itens 
SET codigo_unico = gerar_codigo_item()
WHERE codigo_unico IS NULL;

-- Adicionar constraint de unicidade e NOT NULL
ALTER TABLE itens 
ADD CONSTRAINT itens_codigo_unico_unique UNIQUE (codigo_unico);

ALTER TABLE itens 
ALTER COLUMN codigo_unico SET NOT NULL;