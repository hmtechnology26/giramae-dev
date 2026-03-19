-- ============================================
-- 🚨 MIGRATION CRÍTICA: Migrar Usuários Existentes
-- ============================================
-- EXECUTAR IMEDIATAMENTE NO SUPABASE DASHBOARD
-- Copie e cole este arquivo completo no SQL Editor
-- ============================================

-- 1. Migrar usuários com status antigos para 'completo'
DO $$
DECLARE
  v_usuarios_migrados INTEGER;
  v_usuarios_bloqueados INTEGER;
BEGIN
  -- Contar quantos serão afetados ANTES da migração
  SELECT COUNT(*) INTO v_usuarios_bloqueados
  FROM public.profiles 
  WHERE cadastro_status IN ('aguardando', 'liberado')
    AND cadastro_status != 'banido';
  
  RAISE NOTICE '🔄 Iniciando migração de % usuários...', v_usuarios_bloqueados;
  
  -- Executar migração
  UPDATE public.profiles
  SET 
    cadastro_status = 'completo',
    ritual_completo = TRUE,
    updated_at = NOW()
  WHERE cadastro_status IN ('aguardando', 'liberado')
    AND cadastro_status != 'banido'
    AND politica_aceita = true
    AND endereco IS NOT NULL
    AND cidade IS NOT NULL
    AND estado IS NOT NULL;
  
  GET DIAGNOSTICS v_usuarios_migrados = ROW_COUNT;
  
  RAISE NOTICE '✅ Migrados: % usuários de aguardando/liberado → completo', v_usuarios_migrados;
  
  -- Verificar se há usuários que não foram migrados (dados incompletos)
  SELECT COUNT(*) INTO v_usuarios_bloqueados
  FROM public.profiles 
  WHERE cadastro_status IN ('aguardando', 'liberado');
  
  IF v_usuarios_bloqueados > 0 THEN
    RAISE WARNING '⚠️ Atenção: % usuários permaneceram com status antigo (dados incompletos)', v_usuarios_bloqueados;
  END IF;
END $$;

-- 2. Ativar itens de usuários migrados
DO $$
DECLARE
  v_itens_ativados INTEGER;
BEGIN
  UPDATE public.itens
  SET 
    status = 'disponivel',
    updated_at = NOW()
  WHERE publicado_por IN (
    SELECT id FROM public.profiles 
    WHERE cadastro_status = 'completo' 
    AND ritual_completo = TRUE
  )
  AND status = 'inativo';
  
  GET DIAGNOSTICS v_itens_ativados = ROW_COUNT;
  
  RAISE NOTICE '✅ Itens ativados: %', v_itens_ativados;
END $$;

-- 3. Corrigir função ativar_itens() - REMOVER 'liberado'
CREATE OR REPLACE FUNCTION public.ativar_itens()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.cadastro_status = 'banido' AND (OLD.cadastro_status IS NULL OR OLD.cadastro_status != 'banido') THEN
        UPDATE public.itens 
        SET status = 'inativo' 
        WHERE publicado_por = NEW.id AND status NOT IN ('inativo', 'excluido');
        
        RAISE LOG 'Itens desativados para usuário banido %', NEW.id;
        RETURN NEW;
    END IF;

    -- ✅ CORRIGIDO: Removido 'liberado'
    IF (
        OLD.cadastro_status IS DISTINCT FROM NEW.cadastro_status AND
        NEW.cadastro_status = 'completo' AND
        OLD.cadastro_status != 'banido'
    ) THEN
        UPDATE public.itens 
        SET status = 'disponivel' 
        WHERE publicado_por = NEW.id AND status = 'inativo';
        
        RAISE LOG 'Itens ativados para usuário %', NEW.id;

    ELSIF (
        OLD.cadastro_status IS DISTINCT FROM NEW.cadastro_status AND
        NEW.cadastro_status NOT IN ('completo', 'banido')
    ) THEN
        UPDATE public.itens 
        SET status = 'inativo' 
        WHERE publicado_por = NEW.id AND status = 'disponivel';
        
        RAISE LOG 'Itens desativados para usuário %', NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

-- 4. Corrigir função atualizar_contadores_cidade()
CREATE OR REPLACE FUNCTION public.atualizar_contadores_cidade(p_cidade TEXT, p_estado TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_completos INTEGER;
  v_incompletos INTEGER;
  v_itens INTEGER;
BEGIN
  -- ✅ CORRIGIDO: Contar apenas 'completo' e 'incompleto'
  SELECT COUNT(*) INTO v_completos
  FROM public.profiles 
  WHERE cidade = p_cidade 
    AND estado = p_estado 
    AND cadastro_status = 'completo';
  
  SELECT COUNT(*) INTO v_incompletos
  FROM public.profiles 
  WHERE cidade = p_cidade 
    AND estado = p_estado 
    AND cadastro_status = 'incompleto';
  
  SELECT COUNT(*) INTO v_itens
  FROM public.itens i
  JOIN public.profiles p ON i.publicado_por = p.id
  WHERE p.cidade = p_cidade 
    AND p.estado = p_estado;
  
  INSERT INTO public.cidades_config (
    cidade, 
    estado, 
    usuarios_liberados,
    usuarios_aguardando,
    itens_publicados
  )
  VALUES (p_cidade, p_estado, v_completos, v_incompletos, v_itens)
  ON CONFLICT (cidade, estado) 
  DO UPDATE SET 
    usuarios_liberados = v_completos,
    usuarios_aguardando = v_incompletos,
    itens_publicados = v_itens,
    updated_at = now();
    
  RAISE LOG 'Contadores atualizados para %/%', p_cidade, p_estado;
END;
$$;

-- 5. Atualizar contadores de todas as cidades
DO $$
DECLARE
  v_cidade_record RECORD;
  v_cidades_atualizadas INTEGER := 0;
BEGIN
  FOR v_cidade_record IN 
    SELECT DISTINCT cidade, estado 
    FROM public.profiles 
    WHERE cidade IS NOT NULL AND estado IS NOT NULL
  LOOP
    PERFORM atualizar_contadores_cidade(v_cidade_record.cidade, v_cidade_record.estado);
    v_cidades_atualizadas := v_cidades_atualizadas + 1;
  END LOOP;
  
  RAISE NOTICE '✅ Contadores atualizados para % cidades', v_cidades_atualizadas;
END $$;

-- 6. Log de auditoria
INSERT INTO public.audit_log (action, details)
VALUES (
  'MIGRACAO_USUARIOS_EXISTENTES',
  jsonb_build_object(
    'timestamp', NOW(),
    'usuarios_migrados', (
      SELECT COUNT(*) FROM public.profiles 
      WHERE cadastro_status = 'completo' AND ritual_completo = TRUE
    ),
    'versao', '2.0'
  )
);

-- 7. Validações finais
DO $$
DECLARE
  v_status_antigos INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_status_antigos
  FROM public.profiles 
  WHERE cadastro_status IN ('aguardando', 'liberado');
  
  IF v_status_antigos > 0 THEN
    RAISE WARNING '⚠️ ATENÇÃO: Ainda existem % usuários com status antigo!', v_status_antigos;
  END IF;
  
  RAISE NOTICE '✅ Validações finais: OK';
END $$;

-- 8. Relatório final
SELECT 
  cadastro_status,
  COUNT(*) as total
FROM public.profiles 
GROUP BY cadastro_status
ORDER BY total DESC;

-- 9. Mensagem final
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA!';
  RAISE NOTICE '═══════════════════════════════════════════';
END $$;
