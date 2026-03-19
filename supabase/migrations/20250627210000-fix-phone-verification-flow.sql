
-- Corrigir função para salvar telefone com validações
CREATE OR REPLACE FUNCTION save_user_phone_with_code(p_telefone text)
RETURNS jsonb AS $$
DECLARE
  current_step TEXT;
  phone_verified BOOLEAN;
  user_id UUID;
BEGIN
  -- Verificar se usuário está autenticado
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;
  
  -- Buscar dados atuais
  SELECT cadastro_step, telefone_verificado 
  INTO current_step, phone_verified
  FROM public.profiles
  WHERE id = user_id;
  
  -- Se telefone já foi verificado, não permitir alteração
  IF phone_verified = true THEN
    RETURN jsonb_build_object('success', false, 'error', 'Telefone já foi verificado e não pode ser alterado');
  END IF;
  
  -- Só permitir salvar telefone se estiver no step correto ou se for primeiro acesso
  IF current_step NOT IN ('phone', 'google') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Step incorreto para alterar telefone');
  END IF;
  
  -- Gerar código de 4 dígitos
  DECLARE
    verification_code TEXT := LPAD(FLOOR(random() * 9000 + 1000)::TEXT, 4, '0');
  BEGIN
    -- Atualizar telefone, código e step
    UPDATE public.profiles
    SET 
      telefone = p_telefone,
      verification_code = verification_code,
      verification_code_expires = now() + INTERVAL '10 minutes',
      cadastro_step = 'code',
      updated_at = now()
    WHERE id = user_id;
    
    RETURN jsonb_build_object(
      'success', true, 
      'verification_code', verification_code,
      'expires_at', now() + INTERVAL '10 minutes'
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar função verify_phone_code para ser mais robusta
CREATE OR REPLACE FUNCTION verify_phone_code(p_code text)
RETURNS jsonb AS $$
DECLARE
    stored_code text;
    code_expires timestamp with time zone;
    current_user_id uuid;
    phone_verified boolean;
    current_phone text;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
    END IF;
    
    -- Get stored verification code and current status
    SELECT verification_code, verification_code_expires, telefone_verificado, telefone
    INTO stored_code, code_expires, phone_verified, current_phone
    FROM profiles
    WHERE id = current_user_id;
    
    -- Se telefone já foi verificado, não permitir nova verificação
    IF phone_verified = true THEN
        RETURN jsonb_build_object('success', false, 'error', 'Telefone já foi verificado anteriormente');
    END IF;
    
    -- Check if code exists and hasn't expired
    IF stored_code IS NULL OR code_expires IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Código não encontrado');
    END IF;
    
    -- Check if code has expired
    IF code_expires < now() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Código expirado');
    END IF;
    
    -- Check if code matches
    IF stored_code = p_code THEN
        -- Mark phone as verified and clear verification code
        UPDATE profiles
        SET 
            telefone_verificado = true,
            verification_code = NULL,
            verification_code_expires = NULL,
            cadastro_step = 'personal',
            updated_at = now()
        WHERE id = current_user_id;
        
        RETURN jsonb_build_object('success', true, 'message', 'Telefone verificado com sucesso');
    END IF;
    
    RETURN jsonb_build_object('success', false, 'error', 'Código incorreto');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para reenviar código (só se não foi verificado)
CREATE OR REPLACE FUNCTION resend_verification_code()
RETURNS jsonb AS $$
DECLARE
    current_user_id uuid;
    phone_verified boolean;
    current_phone text;
    new_code text;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
    END IF;
    
    -- Verificar status atual
    SELECT telefone_verificado, telefone
    INTO phone_verified, current_phone
    FROM profiles
    WHERE id = current_user_id;
    
    -- Se telefone já foi verificado, não reenviar
    IF phone_verified = true THEN
        RETURN jsonb_build_object('success', false, 'error', 'Telefone já foi verificado');
    END IF;
    
    -- Se não há telefone, erro
    IF current_phone IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Nenhum telefone cadastrado');
    END IF;
    
    -- Gerar novo código
    new_code := LPAD(FLOOR(random() * 9000 + 1000)::TEXT, 4, '0');
    
    -- Atualizar código
    UPDATE profiles
    SET 
        verification_code = new_code,
        verification_code_expires = now() + INTERVAL '10 minutes',
        updated_at = now()
    WHERE id = current_user_id;
    
    RETURN jsonb_build_object(
        'success', true, 
        'verification_code', new_code,
        'expires_at', now() + INTERVAL '10 minutes'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
