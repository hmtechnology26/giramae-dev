-- Sistema de Liberação Manual de Cidades - Versão Corrigida
-- Esta migração implementa controle administrativo de cidades para a plataforma GiraMãe

-- 1. Tabela para controlar quais cidades estão liberadas
CREATE TABLE IF NOT EXISTS public.cidades_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  liberada BOOLEAN NOT NULL DEFAULT false,
  usuarios_aguardando INTEGER NOT NULL DEFAULT 0,
  usuarios_liberados INTEGER NOT NULL DEFAULT 0,
  itens_publicados INTEGER NOT NULL DEFAULT 0,
  liberada_em TIMESTAMP WITH TIME ZONE,
  liberada_por UUID REFERENCES public.profiles(id),
  notas_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Chave única por cidade/estado
  UNIQUE(cidade, estado)
);

-- Habilitar RLS
ALTER TABLE public.cidades_config ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes e recriar
DROP POLICY IF EXISTS "Cidades são visíveis para todos" ON public.cidades_config;
DROP POLICY IF EXISTS "Apenas admins podem modificar cidades" ON public.cidades_config;

-- Políticas RLS
CREATE POLICY "Cidades são visíveis para todos" 
  ON public.cidades_config FOR SELECT 
  USING (true);

CREATE POLICY "Apenas admins podem modificar cidades" 
  ON public.cidades_config FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  ));

-- 2. Função para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION public.atualizar_contadores_cidade(p_cidade TEXT, p_estado TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_aguardando INTEGER;
  v_liberados INTEGER;
  v_itens INTEGER;
BEGIN
  -- Contar usuários aguardando na cidade
  SELECT COUNT(*) INTO v_aguardando
  FROM public.profiles 
  WHERE cidade = p_cidade 
    AND estado = p_estado 
    AND cadastro_status = 'aguardando';
  
  -- Contar usuários liberados na cidade
  SELECT COUNT(*) INTO v_liberados
  FROM public.profiles 
  WHERE cidade = p_cidade 
    AND estado = p_estado 
    AND cadastro_status = 'liberado';
  
  -- Contar itens publicados na cidade
  SELECT COUNT(*) INTO v_itens
  FROM public.itens i
  JOIN public.profiles p ON i.publicado_por = p.id
  WHERE p.cidade = p_cidade 
    AND p.estado = p_estado;
  
  -- Inserir ou atualizar registro da cidade
  INSERT INTO public.cidades_config (cidade, estado, usuarios_aguardando, usuarios_liberados, itens_publicados)
  VALUES (p_cidade, p_estado, v_aguardando, v_liberados, v_itens)
  ON CONFLICT (cidade, estado) 
  DO UPDATE SET 
    usuarios_aguardando = v_aguardando,
    usuarios_liberados = v_liberados,
    itens_publicados = v_itens,
    updated_at = now();
END;
$$;

-- 3. Função para liberar cidade manualmente
CREATE OR REPLACE FUNCTION public.liberar_cidade_manual(
  p_cidade TEXT,
  p_estado TEXT,
  p_admin_id UUID,
  p_notas TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usuarios_liberados INTEGER := 0;
  v_resultado JSONB;
BEGIN
  -- Verificar se é admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_admin_id) THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Usuário não é administrador');
  END IF;
  
  -- Atualizar status da cidade
  INSERT INTO public.cidades_config (cidade, estado, liberada, liberada_em, liberada_por, notas_admin)
  VALUES (p_cidade, p_estado, true, now(), p_admin_id, p_notas)
  ON CONFLICT (cidade, estado) 
  DO UPDATE SET 
    liberada = true,
    liberada_em = now(),
    liberada_por = p_admin_id,
    notas_admin = p_notas,
    updated_at = now();
  
  -- Liberar todos os usuários da cidade
  UPDATE public.profiles 
  SET cadastro_status = 'liberado'
  WHERE cidade = p_cidade 
    AND estado = p_estado 
    AND cadastro_status = 'aguardando';
  
  GET DIAGNOSTICS v_usuarios_liberados = ROW_COUNT;
  
  -- Atualizar contadores
  PERFORM public.atualizar_contadores_cidade(p_cidade, p_estado);
  
  -- Registrar no log de auditoria
  INSERT INTO public.audit_log (user_id, action, details)
  VALUES (
    p_admin_id, 
    'LIBERACAO_CIDADE',
    jsonb_build_object(
      'cidade', p_cidade,
      'estado', p_estado,
      'usuarios_liberados', v_usuarios_liberados,
      'notas', p_notas
    )
  );
  
  RETURN jsonb_build_object(
    'sucesso', true,
    'usuarios_liberados', v_usuarios_liberados,
    'cidade', p_cidade,
    'estado', p_estado
  );
END;
$$;

-- 4. Trigger para atualizar contadores quando usuário muda status
CREATE OR REPLACE FUNCTION public.trigger_atualizar_contadores_cidade()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se mudou o cadastro_status e tem cidade/estado
  IF (OLD.cadastro_status IS DISTINCT FROM NEW.cadastro_status) 
     AND NEW.cidade IS NOT NULL 
     AND NEW.estado IS NOT NULL THEN
    
    PERFORM public.atualizar_contadores_cidade(NEW.cidade, NEW.estado);
    
    -- Se mudou cidade/estado, atualizar também a cidade antiga
    IF OLD.cidade IS DISTINCT FROM NEW.cidade 
       OR OLD.estado IS DISTINCT FROM NEW.estado THEN
      IF OLD.cidade IS NOT NULL AND OLD.estado IS NOT NULL THEN
        PERFORM public.atualizar_contadores_cidade(OLD.cidade, OLD.estado);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela profiles (remover antes se existir)
DROP TRIGGER IF EXISTS trigger_profiles_contadores_cidade ON public.profiles;
CREATE TRIGGER trigger_profiles_contadores_cidade
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_atualizar_contadores_cidade();

-- 5. Atualizar contadores para cidades existentes
DO $$
DECLARE
  cidade_record RECORD;
BEGIN
  -- Para cada combinação única de cidade/estado nos profiles
  FOR cidade_record IN 
    SELECT DISTINCT cidade, estado 
    FROM public.profiles 
    WHERE cidade IS NOT NULL AND estado IS NOT NULL
  LOOP
    PERFORM public.atualizar_contadores_cidade(cidade_record.cidade, cidade_record.estado);
  END LOOP;
END $$;

-- Comentários para documentação
COMMENT ON TABLE public.cidades_config IS 'Controla quais cidades estão liberadas para acesso à plataforma';
COMMENT ON FUNCTION public.liberar_cidade_manual IS 'Permite que admins liberem uma cidade manualmente';
COMMENT ON FUNCTION public.atualizar_contadores_cidade IS 'Atualiza contadores de usuários e itens por cidade';