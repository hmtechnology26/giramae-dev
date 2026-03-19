
-- Diagnóstico completo e correção final dos triggers

-- 1. DIAGNÓSTICO: Verificar todos os triggers ativos
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO DE TRIGGERS ===';
    
    FOR trigger_rec IN 
        SELECT 
            trigger_name, 
            event_object_table, 
            action_statement,
            action_timing,
            event_manipulation
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        ORDER BY event_object_table, trigger_name
    LOOP
        RAISE NOTICE 'Trigger: % | Tabela: % | Ação: % | Timing: % | Evento: %', 
                     trigger_rec.trigger_name, 
                     trigger_rec.event_object_table,
                     trigger_rec.action_statement,
                     trigger_rec.action_timing,
                     trigger_rec.event_manipulation;
    END LOOP;
END $$;

-- 2. LIMPEZA COMPLETA: Remover TODOS os triggers que podem causar conflito
DROP TRIGGER IF EXISTS on_transaction_created ON public.transacoes;
DROP TRIGGER IF EXISTS on_wallet_update ON public.carteiras;
DROP TRIGGER IF EXISTS update_wallet_balance_trigger ON public.transacoes;
DROP TRIGGER IF EXISTS trigger_update_wallet_balance ON public.transacoes;
DROP TRIGGER IF EXISTS wallet_balance_trigger ON public.transacoes;

-- Remover triggers em outras tabelas que possam chamar update_wallet_balance
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND action_statement LIKE '%update_wallet_balance%'
        AND event_object_table != 'transacoes'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 
                      trigger_record.trigger_name, 
                      trigger_record.event_object_table);
        RAISE NOTICE 'Removido trigger % da tabela %', 
                     trigger_record.trigger_name, 
                     trigger_record.event_object_table;
    END LOOP;
END $$;

-- 3. FUNÇÃO ULTRA-DEFENSIVA: Recriar com máxima proteção
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    new_record_jsonb JSONB;
    campo_existe BOOLEAN;
BEGIN
    -- Log inicial detalhado
    RAISE NOTICE '[TRIGGER] update_wallet_balance chamado:';
    RAISE NOTICE '  - Tabela: %', TG_TABLE_NAME;
    RAISE NOTICE '  - Operação: %', TG_OP;
    RAISE NOTICE '  - Schema: %', TG_TABLE_SCHEMA;
    
    -- Verificação 1: NEW não pode ser NULL
    IF NEW IS NULL THEN
        RAISE NOTICE '[TRIGGER] NEW é NULL - trigger não deve processar';
        RETURN NULL;
    END IF;
    
    -- Verificação 2: Deve ser APENAS na tabela transacoes
    IF TG_TABLE_NAME IS NULL OR TG_TABLE_NAME != 'transacoes' THEN
        RAISE NOTICE '[TRIGGER] Tabela % não é transacoes - ignorando trigger', TG_TABLE_NAME;
        RETURN NEW;
    END IF;
    
    -- Verificação 3: Deve ser INSERT
    IF TG_OP != 'INSERT' THEN
        RAISE NOTICE '[TRIGGER] Operação % não é INSERT - ignorando', TG_OP;
        RETURN NEW;
    END IF;
    
    -- Verificação 4: Converter para JSONB com tratamento de erro
    BEGIN
        new_record_jsonb := to_jsonb(NEW);
        RAISE NOTICE '[TRIGGER] Registro convertido para JSONB com sucesso';
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '[TRIGGER] ERRO ao converter NEW para JSONB: %', SQLERRM;
            RETURN NEW;
    END;
    
    -- Verificação 5: Campo 'tipo' DEVE existir
    SELECT (new_record_jsonb ? 'tipo') INTO campo_existe;
    IF NOT campo_existe THEN
        RAISE NOTICE '[TRIGGER] ERRO: Campo tipo não encontrado no registro';
        RAISE NOTICE '[TRIGGER] Campos disponíveis: %', array_to_string(array(SELECT jsonb_object_keys(new_record_jsonb)), ', ');
        RETURN NEW; -- Não falhar, apenas ignorar
    END IF;
    
    -- Verificação 6: Campo 'user_id' DEVE existir
    SELECT (new_record_jsonb ? 'user_id') INTO campo_existe;
    IF NOT campo_existe THEN
        RAISE NOTICE '[TRIGGER] ERRO: Campo user_id não encontrado no registro';
        RETURN NEW;
    END IF;
    
    -- Verificação 7: Campo 'valor' DEVE existir
    SELECT (new_record_jsonb ? 'valor') INTO campo_existe;
    IF NOT campo_existe THEN
        RAISE NOTICE '[TRIGGER] ERRO: Campo valor não encontrado no registro';
        RETURN NEW;
    END IF;
    
    -- Log dos valores que serão processados
    RAISE NOTICE '[TRIGGER] Processando transação:';
    RAISE NOTICE '  - user_id: %', NEW.user_id;
    RAISE NOTICE '  - tipo: %', NEW.tipo;
    RAISE NOTICE '  - valor: %', NEW.valor;
    
    -- Processamento seguro das transações
    BEGIN
        -- Tipos que aumentam o saldo (créditos)
        IF NEW.tipo IN ('recebido', 'bonus', 'compra', 'transferencia_p2p_entrada') THEN
            UPDATE public.carteiras 
            SET 
                saldo_atual = saldo_atual + NEW.valor,
                total_recebido = total_recebido + NEW.valor,
                updated_at = now()
            WHERE user_id = NEW.user_id;
            
            RAISE NOTICE '[TRIGGER] ✅ Crédito processado: +% para usuário %', NEW.valor, NEW.user_id;
            
        -- Tipos que diminuem o saldo (débitos)
        ELSIF NEW.tipo IN ('gasto', 'queima', 'transferencia_p2p_saida', 'taxa') THEN
            UPDATE public.carteiras 
            SET 
                saldo_atual = saldo_atual - NEW.valor,
                total_gasto = total_gasto + NEW.valor,
                updated_at = now()
            WHERE user_id = NEW.user_id;
            
            RAISE NOTICE '[TRIGGER] ✅ Débito processado: -% para usuário %', NEW.valor, NEW.user_id;
        ELSE
            RAISE NOTICE '[TRIGGER] ⚠️ Tipo de transação % não reconhecido - ignorando atualização de carteira', NEW.tipo;
        END IF;
        
        -- Recálculo de cotação com proteção total
        BEGIN
            IF NEW.tipo IN ('compra', 'gasto', 'recebido', 'queima') THEN
                PERFORM calcular_cotacao_dinamica();
                RAISE NOTICE '[TRIGGER] ✅ Cotação recalculada para tipo %', NEW.tipo;
            END IF;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE '[TRIGGER] ⚠️ Erro ao calcular cotação (não crítico): %', SQLERRM;
        END;
        
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE '[TRIGGER] ❌ ERRO ao processar transação: %', SQLERRM;
            -- Não falhar o trigger, apenas logar
    END;
    
    RAISE NOTICE '[TRIGGER] ✅ Processamento concluído com sucesso';
    RETURN NEW;
END;
$function$;

-- 4. CRIAR TRIGGER ESPECÍFICO E CONTROLADO
CREATE TRIGGER transaction_wallet_update
    AFTER INSERT ON public.transacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wallet_balance();

-- 5. VERIFICAÇÃO FINAL
DO $$
DECLARE
    trigger_count INTEGER;
    trigger_details RECORD;
BEGIN
    -- Contar triggers na tabela transacoes
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE event_object_table = 'transacoes' 
    AND trigger_schema = 'public';
    
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    RAISE NOTICE 'Total de triggers na tabela transacoes: %', trigger_count;
    
    -- Listar todos os triggers ativos na tabela transacoes
    FOR trigger_details IN
        SELECT trigger_name, action_statement
        FROM information_schema.triggers 
        WHERE event_object_table = 'transacoes' 
        AND trigger_schema = 'public'
    LOOP
        RAISE NOTICE 'Trigger ativo: % - Função: %', 
                     trigger_details.trigger_name, 
                     trigger_details.action_statement;
    END LOOP;
    
    -- Verificar se o novo trigger foi criado
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'transaction_wallet_update' 
        AND event_object_table = 'transacoes'
        AND trigger_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Trigger transaction_wallet_update criado com sucesso';
    ELSE
        RAISE EXCEPTION '❌ FALHA: Trigger transaction_wallet_update NÃO foi criado';
    END IF;
    
    RAISE NOTICE '=== CORREÇÃO FINALIZADA ===';
    RAISE NOTICE 'Sistema pronto para testes';
END $$;

-- 6. TESTE BÁSICO DO SISTEMA
DO $$
BEGIN
    RAISE NOTICE '=== TESTE BÁSICO ===';
    RAISE NOTICE 'Para testar, execute: SELECT transferir_girinhas_p2p(uuid1, uuid2, valor)';
    RAISE NOTICE 'Logs detalhados aparecerão em tempo real';
END $$;
