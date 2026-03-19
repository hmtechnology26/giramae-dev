
-- Adicionar colunas para controle de progresso do cadastro
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cadastro_status VARCHAR(20) DEFAULT 'incompleto',
ADD COLUMN IF NOT EXISTS cadastro_step VARCHAR(20) DEFAULT 'google';

-- Criar função para inicializar status do cadastro
CREATE OR REPLACE FUNCTION public.inicializar_cadastro_usuario()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o perfil criado com status inicial
  UPDATE profiles 
  SET 
    cadastro_status = 'incompleto',
    cadastro_step = 'google'
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para inicializar quando perfil é criado
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION inicializar_cadastro_usuario();

-- Atualizar perfis existentes que não têm status
UPDATE profiles 
SET 
  cadastro_status = 'incompleto',
  cadastro_step = 'google'
WHERE cadastro_status IS NULL OR cadastro_step IS NULL;
