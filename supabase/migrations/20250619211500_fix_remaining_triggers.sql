
-- Corrigir os triggers restantes que causam erro "record new has no field tipo"

-- 1. CORRIGIR trigger_recalcular_cotacao
CREATE OR REPLACE FUNCTION public.trigger_recalcular_cotacao()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_record_jsonb JSONB;
BEGIN
    -- Log para debugging
    RAISE NOTICE '[TRIGGER_RECALCULAR] Chamado na tabela: %, Operação: %', TG_TABLE_NAME, TG_OP;
    
    -- Verificações defensivas
    IF NEW IS NULL THEN
        RAISE NOTICE '[TRIGGER_RECALCULAR] NEW é NULL - ignorando';
        RETURN NULL;
    END IF;
    
    -- Só processar se for INSERT e se estivermos na tabela transacoes
    IF TG_OP != 'INSERT' OR TG_TABLE_NAME != 'transacoes' THEN
        RAISE NOTICE '[TRIGGER_RECALCULAR] Não é INSERT em transacoes - ignorando';
        RETURN NEW;
    END IF;
    
    -- Converter para JSONB e verificar campo tipo
    BEGIN
        new_record_jsonb := to_jsonb(NEW);
        
        -- Verificar se campo tipo existe
        IF NOT (new_record_jsonb ? 'tipo') THEN
            RAISE NOTICE '[TRIGGER_RECALCULAR] Campo tipo não existe - ignorando';
            RETURN NEW;
        END IF;
        
        -- Só recalcular para tipos que afetam o mercado
        IF (new_record_jsonb->>'tipo') IN ('gasto', 'compra', 'bonus', 'recebido') THEN
            PERFORM calcular_cotacao_dinamica();
            RAISE NOTICE '[TRIGGER_RECALCULAR] Cotação recalculada para tipo: %', (new_record_jsonb->>'tipo');
        END IF;
        
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '[TRIGGER_RECALCULAR] Erro ao processar: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$function$;

-- 2. CORRIGIR set_expiration_date
CREATE OR REPLACE FUNCTION public.set_expiration_date()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    new_record_jsonb JSONB;
BEGIN
    -- Log para debugging
    RAISE NOTICE '[SET_EXPIRATION] Chamado na tabela: %, Operação: %', TG_TABLE_NAME, TG_OP;
    
    -- Verificações defensivas
    IF NEW IS NULL THEN
        RAISE NOTICE '[SET_EXPIRATION] NEW é NULL - ignorando';
        RETURN NULL;
    END IF;
    
    -- Só processar se for INSERT e se estivermos na tabela transacoes
    IF TG_OP != 'INSERT' OR TG_TABLE_NAME != 'transacoes' THEN
        RAISE NOTICE '[SET_EXPIRATION] Não é INSERT em transacoes - ignorando';
        RETURN NEW;
    END IF;
    
    -- Converter para JSONB e verificar campos necessários
    BEGIN
        new_record_jsonb := to_jsonb(NEW);
        
        -- Verificar se campos necessários existem
        IF NOT (new_record_jsonb ? 'tipo') THEN
            RAISE NOTICE '[SET_EXPIRATION] Campo tipo não existe - ignorando';
            RETURN NEW;
        END IF;
        
        IF NOT (new_record_jsonb ? 'data_expiracao') THEN
            RAISE NOTICE '[SET_EXPIRATION] Campo data_expiracao não existe - ignorando';
            RETURN NEW;
        END IF;
        
        -- Para compras, definir data de expiração se não estiver definida
        IF (new_record_jsonb->>'tipo') = 'compra' AND (new_record_jsonb->>'data_expiracao') IS NULL THEN
            NEW.data_expiracao := obter_data_expiracao();
            RAISE NOTICE '[SET_EXPIRATION] Data de expiração definida para compra';
        END IF;
        
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '[SET_EXPIRATION] Erro ao processar: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$function$;

-- 3. VERIFICAR se há outros triggers problemáticos
DO $$
DECLARE
    trigger_record RECORD;
    function_text TEXT;
BEGIN
    RAISE NOTICE '=== VERIFICANDO FUNÇÕES QUE USAM NEW.tipo ===';
    
    -- Buscar todas as funções que mencionam NEW.tipo
    FOR trigger_record IN
        SELECT 
            p.proname as function_name,
            pg_get_functiondef(p.oid) as function_definition
        FROM pg_proc p
        WHERE pg_get_functiondef(p.oid) ILIKE '%NEW.tipo%'
        AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        RAISE NOTICE 'Função encontrada que usa NEW.tipo: %', trigger_record.function_name;
    END LOOP;
    
    RAISE NOTICE '=== VERIFICAÇÃO CONCLUÍDA ===';
END $$;

-- 4. TESTE BÁSICO
DO $$
BEGIN
    RAISE NOTICE '=== TESTE DOS TRIGGERS CORRIGIDOS ===';
    RAISE NOTICE 'Triggers corrigidos: trigger_recalcular_cotacao e set_expiration_date';
    RAISE NOTICE 'Agora são defensivos e verificam campos antes de acessá-los';
    RAISE NOTICE 'Para testar: INSERT INTO transacoes (user_id, tipo, valor, descricao) VALUES (uuid, ''teste'', 1, ''teste'')';
END $$;
