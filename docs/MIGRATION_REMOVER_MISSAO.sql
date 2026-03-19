-- ============================================
-- MIGRAÇÃO: REMOVER MISSÃO OBRIGATÓRIA
-- Data: 2025-12-01
-- Objetivo: Liberar usuários direto após aceitar termos + endereço
-- ============================================
-- ATENÇÃO: Execute esta migration via Supabase Dashboard
-- ============================================

-- 1. Modificar função update_cadastro_status
CREATE OR REPLACE FUNCTION public.update_cadastro_status() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    current_status VARCHAR(20);
    current_step VARCHAR(20);
    cidade_liberada_flag BOOLEAN := false;
BEGIN
    -- ⚠️ CRÍTICO: NÃO RECALCULAR SE USUÁRIO ESTIVER BANIDO
    IF NEW.cadastro_status = 'banido' THEN
        RAISE LOG 'Usuário % está banido - mantendo status sem recálculo', NEW.id;
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;
    
    -- ⚠️ CRÍTICO: SE JÁ ESTAVA BANIDO, NÃO PERMITIR MUDANÇA AUTOMÁTICA
    IF OLD.cadastro_status = 'banido' AND NEW.cadastro_status != 'banido' THEN
        RAISE LOG 'Tentativa de alterar usuário banido % - bloqueando mudança automática', NEW.id;
        NEW.cadastro_status := 'banido';
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;
    
    -- ✨ SE RITUAL JÁ FOI COMPLETO, NUNCA MAIS RECALCULA
    IF NEW.ritual_completo = TRUE THEN
        RAISE LOG 'Usuário % já completou o ritual - mantendo status atual', NEW.id;
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;

    -- ==============================================================
    -- 🎯 NOVA LÓGICA: LIBERAR DIRETO APÓS ACEITAR TERMOS + ENDEREÇO
    -- ==============================================================
    
    -- Verificar se tem todos os dados básicos preenchidos
    IF NEW.politica_aceita = true 
       AND NEW.endereco IS NOT NULL 
       AND NEW.numero IS NOT NULL
       AND NEW.cidade IS NOT NULL 
       AND NEW.estado IS NOT NULL THEN
        
        -- ✅ MARCAR CADASTRO COMO COMPLETO (sem exigir itens)
        NEW.cadastro_status := 'completo';
        NEW.ritual_completo := TRUE;
        
        RAISE LOG 'Usuário % liberado após aceitar termos e preencher endereço (sem exigir itens)', NEW.id;
    
    -- Se ainda não completou dados básicos
    ELSIF NEW.politica_aceita = false OR NEW.endereco IS NULL THEN
        NEW.cadastro_status := 'incompleto';
        RAISE LOG 'Usuário % ainda com cadastro incompleto', NEW.id;
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_cadastro_status() IS 
'Versão 2.0 - SEM MISSÃO OBRIGATÓRIA
 - Libera usuários após aceitar termos + endereço
 - Mantém proteções: banido, ritual_completo
 - Autor: Sistema
 - Data: 2025-12-01';

-- 2. Atualizar função ativar_itens (remover referência a ''liberado'')
CREATE OR REPLACE FUNCTION public.ativar_itens()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Desativar itens se usuário for banido
    IF NEW.cadastro_status = 'banido' AND (OLD.cadastro_status IS NULL OR OLD.cadastro_status != 'banido') THEN
        UPDATE public.itens 
        SET status = 'inativo' 
        WHERE publicado_por = NEW.id AND status NOT IN ('inativo', 'excluido');
        
        RAISE LOG 'Itens desativados para usuário banido %', NEW.id;
        RETURN NEW;
    END IF;

    -- Ativar itens se o usuário mudar para status ''completo''
    IF (
        OLD.cadastro_status IS DISTINCT FROM NEW.cadastro_status AND
        NEW.cadastro_status = 'completo' AND
        OLD.cadastro_status != 'banido'
    ) THEN
        UPDATE public.itens 
        SET status = 'disponivel' 
        WHERE publicado_por = NEW.id AND status = 'inativo';
        
        RAISE LOG 'Itens ativados para usuário % (status: % → %)',
          NEW.id, OLD.cadastro_status, NEW.cadastro_status;

    -- Desativar itens se o usuário não estiver completo
    ELSIF (
        OLD.cadastro_status IS DISTINCT FROM NEW.cadastro_status AND
        NEW.cadastro_status NOT IN ('completo', 'banido')
    ) THEN
        UPDATE public.itens 
        SET status = 'inativo' 
        WHERE publicado_por = NEW.id AND status = 'disponivel';
        
        RAISE LOG 'Itens desativados para usuário % (status: % → %)',
          NEW.id, OLD.cadastro_status, NEW.cadastro_status;
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION ativar_itens() IS
'Versão 2.0 - Adaptado para remover status ''liberado''
 - Ativa/desativa itens baseado apenas em ''completo''
 - Mantém proteção de usuários banidos';

-- 3. Atualizar função de contadores de cidade (simplificar)
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
  -- Contar usuários com cadastro completo
  SELECT COUNT(*) INTO v_completos
  FROM public.profiles 
  WHERE cidade = p_cidade 
    AND estado = p_estado 
    AND cadastro_status = 'completo';
  
  -- Contar usuários com cadastro incompleto
  SELECT COUNT(*) INTO v_incompletos
  FROM public.profiles 
  WHERE cidade = p_cidade 
    AND estado = p_estado 
    AND cadastro_status = 'incompleto';
  
  -- Contar itens publicados na cidade
  SELECT COUNT(*) INTO v_itens
  FROM public.itens i
  JOIN public.profiles p ON i.publicado_por = p.id
  WHERE p.cidade = p_cidade 
    AND p.estado = p_estado;
  
  -- Atualizar registro da cidade
  INSERT INTO public.cidades_config (
    cidade, 
    estado, 
    usuarios_liberados,  -- reutilizar campo para ''completos''
    usuarios_aguardando, -- reutilizar campo para ''incompletos''
    itens_publicados
  )
  VALUES (p_cidade, p_estado, v_completos, v_incompletos, v_itens)
  ON CONFLICT (cidade, estado) 
  DO UPDATE SET 
    usuarios_liberados = v_completos,
    usuarios_aguardando = v_incompletos,
    itens_publicados = v_itens,
    updated_at = now();
    
  RAISE LOG 'Contadores atualizados para %/% - Completos: %, Incompletos: %, Itens: %',
    p_cidade, p_estado, v_completos, v_incompletos, v_itens;
END;
$$;

COMMENT ON FUNCTION atualizar_contadores_cidade(TEXT, TEXT) IS
'Versão 2.0 - Campos reutilizados
 - usuarios_liberados = usuários com cadastro completo
 - usuarios_aguardando = usuários com cadastro incompleto';

-- 4. Migrar usuários existentes que estão ''aguardando'' ou ''liberado'' para ''completo''
DO $$
DECLARE
  v_usuarios_migrados INTEGER;
  v_itens_ativados INTEGER;
BEGIN
  -- Atualizar usuários
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
  
  -- Ativar itens de usuários que foram migrados
  UPDATE public.itens
  SET status = 'disponivel', updated_at = NOW()
  WHERE publicado_por IN (
    SELECT id FROM public.profiles 
    WHERE cadastro_status = 'completo' 
    AND ritual_completo = TRUE
  )
  AND status = 'inativo';
  
  GET DIAGNOSTICS v_itens_ativados = ROW_COUNT;
  
  -- Log de auditoria
  INSERT INTO public.audit_log (action, details)
  VALUES (
    'REMOCAO_MISSAO_OBRIGATORIA',
    jsonb_build_object(
      'timestamp', NOW(),
      'usuarios_migrados', v_usuarios_migrados,
      'itens_ativados', v_itens_ativados,
      'versao', '2.0'
    )
  );
  
  RAISE NOTICE 'Migração concluída: % usuários migrados, % itens ativados', 
    v_usuarios_migrados, v_itens_ativados;
END $$;

-- 5. Validações pós-migração
DO $$
BEGIN
    -- Verificar se nenhum banido foi alterado
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE cadastro_status != 'banido' 
        AND id IN (
          SELECT id FROM audit_log 
          WHERE action = 'APLICAR_PENALIDADE' 
          AND details->>'tipo_penalidade' = 'banimento'
        )
    ) THEN
        RAISE EXCEPTION 'ERRO CRÍTICO: Usuários banidos foram alterados!';
    END IF;
    
    -- Log de sucesso
    RAISE NOTICE 'Validações pós-migração: OK';
END $$;

-- ============================================
-- VERIFICAÇÕES FINAIS (executar e conferir)
-- ============================================

-- Ver quantos usuários de cada status
SELECT cadastro_status, count(*) as total
FROM profiles 
GROUP BY cadastro_status
ORDER BY total DESC;

-- Ver log da migração
SELECT * FROM audit_log 
WHERE action = 'REMOCAO_MISSAO_OBRIGATORIA'
ORDER BY created_at DESC 
LIMIT 1;
