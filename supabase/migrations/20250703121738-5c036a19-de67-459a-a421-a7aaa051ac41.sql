
-- 1. Primeiro, garantir que todos os ENUMs necessários existem na transacao_config
INSERT INTO transacao_config (tipo, sinal, validade_dias, valor_padrao, descricao_pt, categoria, ativo, ordem_exibicao, icone, cor_hex, config)
VALUES 
  ('taxa_extensao_validade', -1, NULL, NULL, 'Taxa Extensão Validade', 'Taxa', true, 80, 'clock', '#f59e0b', '{}'),
  ('bonus_promocional', 1, 365, 5.0, 'Bônus Promocional', 'Bônus', true, 25, 'gift', '#10b981', '{}')
ON CONFLICT (tipo) DO UPDATE SET
  sinal = EXCLUDED.sinal,
  descricao_pt = EXCLUDED.descricao_pt,
  categoria = EXCLUDED.categoria;

-- 2. Corrigir handle_new_user: buscar valor da config e corrigir search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_username text;
  v_base_username text;
  v_counter integer := 0;
  v_nome text;
  v_step text := 'inicio';
  v_bonus_valor DECIMAL;
BEGIN
  -- Obter valor padrão do bônus de cadastro
  SELECT valor_padrao INTO v_bonus_valor
  FROM transacao_config 
  WHERE tipo = 'bonus_cadastro' AND ativo = true;
  
  v_bonus_valor := COALESCE(v_bonus_valor, 50.00);
  
  -- Log inicial
  PERFORM log_debug(NEW.id, 'handle_new_user', 'Iniciando função', 
    jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'bonus_valor', v_bonus_valor
    ));
  
  v_step := 'gerando_username';
  
  -- Extrair nome base do email para username
  BEGIN
    v_base_username := LOWER(split_part(NEW.email, '@', 1));
    v_base_username := regexp_replace(v_base_username, '[^a-z0-9]', '', 'g');
    
    IF length(v_base_username) < 3 THEN
      v_base_username := v_base_username || 'user';
    END IF;
    
    v_username := v_base_username;
    
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = v_username) LOOP
      v_counter := v_counter + 1;
      v_username := v_base_username || v_counter::text;
      
      IF v_counter > 9999 THEN
        v_username := 'user' || extract(epoch from now())::bigint;
        EXIT;
      END IF;
    END LOOP;
      
  EXCEPTION
    WHEN OTHERS THEN
      PERFORM log_debug(NEW.id, 'handle_new_user', 'ERRO ao gerar username', 
        jsonb_build_object('step', v_step, 'error', SQLERRM));
      RAISE;
  END;
  
  v_step := 'obtendo_nome';
  
  BEGIN
    v_nome := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    );
      
  EXCEPTION
    WHEN OTHERS THEN
      PERFORM log_debug(NEW.id, 'handle_new_user', 'ERRO ao obter nome', 
        jsonb_build_object('step', v_step, 'error', SQLERRM));
      RAISE;
  END;
  
  v_step := 'inserindo_perfil';
  
  BEGIN
    INSERT INTO profiles (
      id, email, nome, avatar_url, username, saldo_girinhas, reputacao, cadastro_status, cadastro_step
    ) VALUES (
      NEW.id, NEW.email, v_nome, NEW.raw_user_meta_data->>'avatar_url', v_username,
      v_bonus_valor, 0, 'incompleto', 'dados_pessoais'
    );
      
  EXCEPTION
    WHEN OTHERS THEN
      PERFORM log_debug(NEW.id, 'handle_new_user', 'ERRO ao inserir perfil', 
        jsonb_build_object('step', v_step, 'error', SQLERRM));
  END;
  
  v_step := 'inserindo_carteira';
  
  BEGIN
    INSERT INTO carteiras (user_id, saldo_atual, total_recebido, total_gasto)
    VALUES (NEW.id, v_bonus_valor, v_bonus_valor, 0.00);
    
  EXCEPTION
    WHEN OTHERS THEN
      PERFORM log_debug(NEW.id, 'handle_new_user', 'ERRO ao criar carteira', 
        jsonb_build_object('step', v_step, 'error', SQLERRM));
  END;
  
  v_step := 'inserindo_transacao';
  
  BEGIN
    INSERT INTO transacoes (user_id, tipo, valor, descricao)
    VALUES (NEW.id, 'bonus_cadastro', v_bonus_valor, 'Bônus de boas-vindas');
    
  EXCEPTION
    WHEN OTHERS THEN
      PERFORM log_debug(NEW.id, 'handle_new_user', 'ERRO ao criar transação', 
        jsonb_build_object('step', v_step, 'error', SQLERRM));
  END;
  
  v_step := 'inicializando_metas';
  
  BEGIN
    PERFORM inicializar_metas_usuario(NEW.id);
    
  EXCEPTION
    WHEN OTHERS THEN
      PERFORM log_debug(NEW.id, 'handle_new_user', 'ERRO ao inicializar metas', 
        jsonb_build_object('step', v_step, 'error', SQLERRM));
  END;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    PERFORM log_debug(NEW.id, 'handle_new_user', 'ERRO CRÍTICO na função', 
      jsonb_build_object('step', v_step, 'error', SQLERRM));
    RAISE EXCEPTION 'Erro no handle_new_user (step: %): %', v_step, SQLERRM;
END;
$function$;

-- 3. Corrigir create_user_profile: buscar valor da config e corrigir search_path
CREATE OR REPLACE FUNCTION public.create_user_profile(p_user_id uuid, p_email text, p_nome text, p_avatar_url text, p_username text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bonus_valor DECIMAL;
BEGIN
  -- Obter valor padrão do bônus de cadastro
  SELECT valor_padrao INTO v_bonus_valor
  FROM transacao_config 
  WHERE tipo = 'bonus_cadastro' AND ativo = true;
  
  v_bonus_valor := COALESCE(v_bonus_valor, 50.00);
  
  INSERT INTO profiles (
    id, email, nome, avatar_url, username, saldo_girinhas, reputacao, cadastro_status, cadastro_step
  ) VALUES (
    p_user_id, p_email, p_nome, p_avatar_url, p_username, v_bonus_valor, 0, 'incompleto', 'dados_pessoais'
  );
  
  INSERT INTO carteiras (user_id, saldo_atual, total_recebido, total_gasto)
  VALUES (p_user_id, v_bonus_valor, v_bonus_valor, 0.00);
  
  INSERT INTO transacoes (user_id, tipo, valor, descricao)
  VALUES (p_user_id, 'bonus_cadastro', v_bonus_valor, 'Bônus de boas-vindas');
  
  PERFORM inicializar_metas_usuario(p_user_id);
END;
$function$;

-- 4. Corrigir distribuir_girinhas_promocionais: usar bonus_promocional
CREATE OR REPLACE FUNCTION public.distribuir_girinhas_promocionais(p_valor numeric, p_descricao text, p_apenas_ativas boolean DEFAULT true)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_usuarios_afetados INTEGER := 0;
  v_user_record RECORD;
BEGIN
  FOR v_user_record IN
    SELECT DISTINCT p.id
    FROM profiles p
    WHERE (p_apenas_ativas = false OR 
           EXISTS (SELECT 1 FROM transacoes t 
                  WHERE t.user_id = p.id 
                  AND t.created_at > now() - interval '30 days'))
  LOOP
    INSERT INTO transacoes (user_id, tipo, valor, descricao)
    VALUES (v_user_record.id, 'bonus_promocional', p_valor, p_descricao || ' - promocional');

    UPDATE carteiras
    SET saldo_atual = saldo_atual + p_valor, total_recebido = total_recebido + p_valor
    WHERE user_id = v_user_record.id;

    v_usuarios_afetados := v_usuarios_afetados + 1;
  END LOOP;

  RETURN v_usuarios_afetados;
END;
$function$;

-- 5. NOVA: Criar/corrigir processar_bonus_diario
CREATE OR REPLACE FUNCTION public.processar_bonus_diario(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bonus_valor DECIMAL;
  v_ja_recebeu_hoje BOOLEAN;
  v_transacao_id UUID;
BEGIN
  -- Verificar se já recebeu bônus hoje
  SELECT EXISTS(
    SELECT 1 FROM transacoes 
    WHERE user_id = p_user_id 
    AND tipo = 'bonus_diario'
    AND DATE(created_at) = CURRENT_DATE
  ) INTO v_ja_recebeu_hoje;
  
  IF v_ja_recebeu_hoje THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Bônus diário já coletado hoje');
  END IF;
  
  -- Obter valor do bônus diário
  SELECT valor_padrao INTO v_bonus_valor
  FROM transacao_config 
  WHERE tipo = 'bonus_diario' AND ativo = true;
  
  v_bonus_valor := COALESCE(v_bonus_valor, 5.00);
  
  -- Criar transação
  INSERT INTO transacoes (user_id, tipo, valor, descricao, data_expiracao)
  VALUES (p_user_id, 'bonus_diario', v_bonus_valor, 'Bônus diário', CURRENT_DATE + INTERVAL '1 day')
  RETURNING id INTO v_transacao_id;
  
  -- Atualizar carteira
  UPDATE carteiras 
  SET saldo_atual = saldo_atual + v_bonus_valor, total_recebido = total_recebido + v_bonus_valor
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'sucesso', true,
    'transacao_id', v_transacao_id,
    'valor', v_bonus_valor
  );
END;
$function$;

-- 6. NOVA: Criar/corrigir verificar_metas_usuario
CREATE OR REPLACE FUNCTION public.verificar_metas_usuario(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_meta RECORD;
  v_trocas_realizadas INTEGER;
  v_bonus_valor DECIMAL;
BEGIN
  -- Contar trocas confirmadas do usuário
  SELECT COUNT(*) INTO v_trocas_realizadas
  FROM reservas 
  WHERE (usuario_reservou = p_user_id OR usuario_item = p_user_id)
  AND status = 'confirmada';
  
  -- Verificar cada meta não conquistada
  FOR v_meta IN
    SELECT * FROM metas_usuarios 
    WHERE user_id = p_user_id 
    AND conquistado = false
    AND trocas_necessarias <= v_trocas_realizadas
  LOOP
    -- Obter valor do bônus da meta
    SELECT valor_padrao INTO v_bonus_valor
    FROM transacao_config 
    WHERE tipo = ('bonus_meta_' || v_meta.tipo_meta)::text AND ativo = true;
    
    v_bonus_valor := COALESCE(v_bonus_valor, v_meta.girinhas_bonus);
    
    -- Marcar meta como conquistada
    UPDATE metas_usuarios 
    SET conquistado = true, 
        data_conquista = now(),
        trocas_realizadas = v_trocas_realizadas
    WHERE id = v_meta.id;
    
    -- Criar transação de bônus
    INSERT INTO transacoes (user_id, tipo, valor, descricao)
    VALUES (p_user_id, ('bonus_meta_' || v_meta.tipo_meta)::text, v_bonus_valor, 
            'Bônus Meta ' || UPPER(v_meta.tipo_meta) || ' conquistada');
    
    -- Atualizar carteira
    UPDATE carteiras 
    SET saldo_atual = saldo_atual + v_bonus_valor, total_recebido = total_recebido + v_bonus_valor
    WHERE user_id = p_user_id;
  END LOOP;
END;
$function$;

-- 7. NOVA: Criar/corrigir processar_bonus_indicado
CREATE OR REPLACE FUNCTION public.processar_bonus_indicado(p_indicado_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bonus_valor DECIMAL;
  v_indicacao_record RECORD;
BEGIN
  -- Buscar indicação
  SELECT * INTO v_indicacao_record
  FROM indicacoes WHERE indicado_id = p_indicado_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Obter valor do bônus
  SELECT valor_padrao INTO v_bonus_valor
  FROM transacao_config 
  WHERE tipo = 'bonus_cadastro' AND ativo = true;
  
  v_bonus_valor := COALESCE(v_bonus_valor, 5.00);
  
  -- Criar transação para o indicado
  INSERT INTO transacoes (user_id, tipo, valor, descricao)
  VALUES (p_indicado_id, 'bonus_cadastro', v_bonus_valor, 'Bônus de boas-vindas - Você foi indicado!');
  
  -- Atualizar carteira
  UPDATE carteiras
  SET saldo_atual = saldo_atual + v_bonus_valor, total_recebido = total_recebido + v_bonus_valor
  WHERE user_id = p_indicado_id;
  
  IF NOT FOUND THEN
    INSERT INTO carteiras (user_id, saldo_atual, total_recebido, total_gasto)
    VALUES (p_indicado_id, v_bonus_valor, v_bonus_valor, 0);
  END IF;
END;
$function$;

-- 8. NOVA: Criar/corrigir processar_expiracao_girinhas
CREATE OR REPLACE FUNCTION public.processar_expiracao_girinhas()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_transacao RECORD;
  v_total_processadas INTEGER := 0;
BEGIN
  -- Processar transações expiradas
  FOR v_transacao IN
    SELECT * FROM transacoes 
    WHERE data_expiracao < CURRENT_DATE
    AND tipo IN ('compra', 'bonus_cadastro', 'bonus_diario', 'missao')
    AND NOT EXISTS (
      SELECT 1 FROM queimas_girinhas q 
      WHERE q.transacao_id = transacoes.id 
      AND q.motivo = 'expiracao'
    )
  LOOP
    -- Registrar queima por expiração
    INSERT INTO transacoes (user_id, tipo, valor, descricao)
    VALUES (v_transacao.user_id, 'queima_expiracao', v_transacao.valor, 
            'Queima por expiração: ' || v_transacao.descricao);
    
    -- Debitar da carteira
    UPDATE carteiras 
    SET saldo_atual = GREATEST(saldo_atual - v_transacao.valor, 0),
        total_gasto = total_gasto + v_transacao.valor
    WHERE user_id = v_transacao.user_id;
    
    -- Registrar na tabela de queimas
    INSERT INTO queimas_girinhas (user_id, quantidade, motivo, transacao_id)
    VALUES (v_transacao.user_id, v_transacao.valor, 'expiracao', v_transacao.id);
    
    v_total_processadas := v_total_processadas + 1;
  END LOOP;
  
  RETURN v_total_processadas;
END;
$function$;
