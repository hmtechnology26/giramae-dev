-- ================================================
-- ONBOARDING SYSTEM 2.0 - IMPLEMENTAÇÃO CORRIGIDA
-- ================================================

-- Adicionar campo onboarding_step na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

-- Migrar dados existentes para o novo sistema (CORRIGIDO)
UPDATE profiles SET onboarding_step = CASE 
  -- Step 1: Telefone não verificado
  WHEN telefone_verificado = false OR telefone IS NULL THEN 1
  
  -- Step 2: Telefone verificado, mas termos/endereço incompletos
  WHEN telefone_verificado = true AND (
    termos_aceitos = false OR 
    politica_aceita = false OR
    endereco IS NULL OR numero IS NULL OR cidade IS NULL OR estado IS NULL
  ) THEN 2
  
  -- Step 4: Dados completos mas ritual incompleto (pulando step 3)
  WHEN telefone_verificado = true AND 
       termos_aceitos = true AND 
       politica_aceita = true AND
       endereco IS NOT NULL AND numero IS NOT NULL AND 
       cidade IS NOT NULL AND estado IS NOT NULL AND
       (SELECT COUNT(*) FROM itens WHERE publicado_por = profiles.id AND status != 'removido') < 2 THEN 4
  
  -- Step 5: Ritual completo
  ELSE 5
END;

-- ================================================
-- FUNCTIONS DE AVANÇO DE STEP
-- ================================================

-- Function para completar step do WhatsApp
CREATE OR REPLACE FUNCTION complete_whatsapp_step(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET onboarding_step = 2
  WHERE id = p_user_id AND onboarding_step = 1;
  
  RETURN FOUND;
END;
$$;

-- Function para completar step do código/endereço
CREATE OR REPLACE FUNCTION complete_endereco_step(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET onboarding_step = 4
  WHERE id = p_user_id AND onboarding_step = 2;
  
  RETURN FOUND;
END;
$$;

-- ================================================
-- VERIFICAÇÃO DE RITUAL COMPLETO
-- ================================================

-- Function para verificar se ritual está completo
CREATE OR REPLACE FUNCTION check_ritual_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_itens_count INTEGER;
BEGIN
  -- Contar itens do usuário
  SELECT COUNT(*) INTO v_itens_count 
  FROM itens 
  WHERE publicado_por = NEW.publicado_por 
    AND status != 'removido';
  
  -- Se chegou a 2 itens, avançar para step 5
  IF v_itens_count >= 2 THEN
    UPDATE profiles 
    SET onboarding_step = 5
    WHERE id = NEW.publicado_por 
      AND onboarding_step = 4;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para auto-advance no ritual
DROP TRIGGER IF EXISTS trigger_ritual_completion ON itens;
CREATE TRIGGER trigger_ritual_completion
  AFTER INSERT ON itens
  FOR EACH ROW
  EXECUTE FUNCTION check_ritual_completion();

-- ================================================
-- FUNCTION PRINCIPAL DE ROTEAMENTO (CORRIGIDA)
-- ================================================

CREATE OR REPLACE FUNCTION public.determinar_rota_usuario()
RETURNS TABLE(
  rota_destino text, 
  pode_acessar boolean, 
  motivo text, 
  dados_debug jsonb, 
  timestamp_decisao timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_cidade_liberada BOOLEAN := false;
  v_is_admin BOOLEAN;
  v_debug JSONB := '{}'::jsonb;
  v_timestamp TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- Obter ID do usuário logado
  v_user_id := auth.uid();
  
  -- Verificar se usuário está autenticado
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 
      '/auth'::TEXT,
      false::BOOLEAN,
      'nao_autenticado'::TEXT,
      jsonb_build_object('erro', 'Usuário não autenticado'),
      v_timestamp;
    RETURN;
  END IF;

  -- Buscar dados do perfil
  SELECT onboarding_step, cidade, estado
  INTO v_profile
  FROM public.profiles 
  WHERE id = v_user_id;

  -- Se não encontrou perfil
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      '/auth'::TEXT,
      false::BOOLEAN,
      'perfil_nao_encontrado'::TEXT,
      jsonb_build_object('erro', 'Perfil não encontrado'),
      v_timestamp;
    RETURN;
  END IF;

  -- Verificar se é admin
  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = v_user_id) 
  INTO v_is_admin;

  -- Verificar se cidade está liberada
  IF v_profile.cidade IS NOT NULL AND v_profile.estado IS NOT NULL THEN
    SELECT COALESCE(liberada, false) INTO v_cidade_liberada
    FROM public.cidades_config 
    WHERE cidade = v_profile.cidade AND estado = v_profile.estado;
  END IF;

  -- Montar debug
  v_debug := jsonb_build_object(
    'user_id', v_user_id,
    'onboarding_step', v_profile.onboarding_step,
    'cidade_liberada', v_cidade_liberada,
    'is_admin', v_is_admin
  );

  -- LÓGICA DE ROTEAMENTO BASEADA NO STEP
  CASE v_profile.onboarding_step
    WHEN 1 THEN
      RETURN QUERY SELECT 
        '/onboarding/whatsapp'::TEXT,
        false::BOOLEAN,
        'step_1_whatsapp'::TEXT,
        v_debug || jsonb_build_object('decisao', 'Step 1 - WhatsApp'),
        v_timestamp;
      RETURN;
    
    WHEN 2 THEN
      RETURN QUERY SELECT 
        '/onboarding/endereco'::TEXT,
        false::BOOLEAN,
        'step_2_endereco_termos'::TEXT,
        v_debug || jsonb_build_object('decisao', 'Step 2 - Endereço + Termos'),
        v_timestamp;
      RETURN;
    
    WHEN 4 THEN
      RETURN QUERY SELECT 
        '/conceito-comunidade'::TEXT,
        false::BOOLEAN,
        'step_4_ritual'::TEXT,
        v_debug || jsonb_build_object('decisao', 'Step 4 - Ritual'),
        v_timestamp;
      RETURN;
    
    WHEN 5 THEN
      -- Admin sempre pode acessar
      IF v_is_admin THEN
        RETURN QUERY SELECT 
          '/admin'::TEXT,
          true::BOOLEAN,
          'admin_acesso_liberado'::TEXT,
          v_debug || jsonb_build_object('decisao', 'Admin com acesso total'),
          v_timestamp;
        RETURN;
      END IF;
      
      -- Step 5: Baseado na cidade
      IF v_cidade_liberada = true THEN
        RETURN QUERY SELECT 
          '/feed'::TEXT,
          true::BOOLEAN,
          'cidade_liberada_acesso_total'::TEXT,
          v_debug || jsonb_build_object('decisao', 'Cidade liberada + ritual completo'),
          v_timestamp;
        RETURN;
      ELSE
        RETURN QUERY SELECT 
          '/aguardando-liberacao'::TEXT,
          false::BOOLEAN,
          'aguardando_liberacao_cidade'::TEXT,
          v_debug || jsonb_build_object('decisao', 'Ritual completo, aguardando cidade'),
          v_timestamp;
        RETURN;
      END IF;
    
    ELSE
      -- Fallback
      RETURN QUERY SELECT 
        '/onboarding/whatsapp'::TEXT,
        false::BOOLEAN,
        'fallback_step_invalido'::TEXT,
        v_debug || jsonb_build_object('decisao', 'Step inválido, resetando'),
        v_timestamp;
      RETURN;
  END CASE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro na função determinar_rota_usuario: % - %', SQLERRM, SQLSTATE;
END;
$$;