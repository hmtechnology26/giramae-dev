
-- FASE 1: LIMPEZA DO BANCO DE DADOS
-- Remover tabela cadastro_temp_data e todas as funções relacionadas

-- Remover funções de step data
DROP FUNCTION IF EXISTS save_step_data(text, jsonb);
DROP FUNCTION IF EXISTS get_step_data(text);
DROP FUNCTION IF EXISTS save_cadastro_temp_data(character varying, jsonb);
DROP FUNCTION IF EXISTS get_cadastro_temp_data(character varying);
DROP FUNCTION IF EXISTS clear_cadastro_temp_data();

-- Remover tabela de dados temporários
DROP TABLE IF EXISTS cadastro_temp_data CASCADE;

-- Criar trigger para ativação automática de itens quando cadastro completa
CREATE OR REPLACE FUNCTION ativar_itens_usuario_completo()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando usuário completa cadastro, ativar seus itens automaticamente
  IF OLD.cadastro_status != 'completo' AND NEW.cadastro_status = 'completo' THEN
    UPDATE public.itens 
    SET status = 'disponivel' 
    WHERE publicado_por = NEW.id AND status = 'inativo';
    
    RAISE LOG 'Itens ativados automaticamente para usuário %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela profiles
DROP TRIGGER IF EXISTS trigger_ativar_itens_completo ON profiles;
CREATE TRIGGER trigger_ativar_itens_completo
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ativar_itens_usuario_completo();

-- Comentário explicativo
COMMENT ON FUNCTION ativar_itens_usuario_completo() IS 'Ativa automaticamente os itens do usuário quando cadastro_status muda para completo';
