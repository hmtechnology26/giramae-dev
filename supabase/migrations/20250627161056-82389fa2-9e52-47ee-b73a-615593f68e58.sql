
-- FASE 1: Atualizar o trigger handle_new_user para gerar username único
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_username text;
  v_base_username text;
  v_counter integer := 0;
  v_nome text;
BEGIN
  -- Extrair nome base do email para username
  v_base_username := LOWER(split_part(NEW.email, '@', 1));
  
  -- Limpar caracteres especiais do username
  v_base_username := regexp_replace(v_base_username, '[^a-z0-9]', '', 'g');
  
  -- Garantir que tenha pelo menos 3 caracteres
  IF length(v_base_username) < 3 THEN
    v_base_username := v_base_username || 'user';
  END IF;
  
  -- Começar com o username base
  v_username := v_base_username;
  
  -- Verificar se username já existe e gerar um único
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_counter := v_counter + 1;
    v_username := v_base_username || v_counter::text;
  END LOOP;
  
  -- Obter nome do usuário
  v_nome := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Inserir perfil com username único
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    avatar_url,
    username,
    saldo_girinhas,
    reputacao
  ) VALUES (
    NEW.id,
    NEW.email,
    v_nome,
    NEW.raw_user_meta_data->>'avatar_url',
    v_username,
    50.00,
    0
  );
  
  -- Criar carteira inicial
  INSERT INTO public.carteiras (
    user_id,
    saldo_atual,
    total_recebido,
    total_gasto
  ) VALUES (
    NEW.id,
    50.00,
    50.00,
    0.00
  );
  
  -- Inicializar metas do usuário
  PERFORM public.inicializar_metas_usuario(NEW.id);
  
  -- Criar transação de bônus de boas-vindas
  INSERT INTO public.transacoes (
    user_id,
    tipo,
    valor,
    descricao
  ) VALUES (
    NEW.id,
    'bonus',
    50.00,
    'Bônus de boas-vindas'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debug
    RAISE LOG 'Erro no handle_new_user para usuário %: %', NEW.id, SQLERRM;
    -- Re-raise o erro para que o Supabase possa tratá-lo
    RAISE;
END;
$$;
