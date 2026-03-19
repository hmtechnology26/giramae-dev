
-- Correção definitiva do trigger update_wallet_balance
-- Primeiro, remover TODOS os triggers que podem estar causando conflito
DROP TRIGGER IF EXISTS on_transaction_created ON public.transacoes;
DROP TRIGGER IF EXISTS on_wallet_update ON public.carteiras;
DROP TRIGGER IF EXISTS update_wallet_balance_trigger ON public.transacoes;

-- Verificar e remover triggers antigos que podem estar em outras tabelas
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Buscar todos os triggers que chamam update_wallet_balance em outras tabelas
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

-- Recriar a função com verificações ultra-defensivas
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    new_record_jsonb JSONB;
BEGIN
    -- LOG para debug
    RAISE NOTICE 'update_wallet_balance chamado - Tabela: %, TG_OP: %', TG_TABLE_NAME, TG_OP;
    
    -- Verificações ultra-defensivas
    IF NEW IS NULL THEN
        RAISE NOTICE 'NEW é NULL, retornando';
        RETURN NULL;
    END IF;
    
    -- Verificar se estamos realmente na tabela transacoes
    IF TG_TABLE_NAME != 'transacoes' THEN
        RAISE NOTICE 'Trigger chamado na tabela %, mas esperava transacoes. Ignorando.', TG_TABLE_NAME;
        RETURN NEW;
    END IF;
    
    -- Converter NEW para JSONB para verificar campos
    BEGIN
        new_record_jsonb := to_jsonb(NEW);
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao converter NEW para JSONB: %', SQLERRM;
            RETURN NEW;
    END;
    
    -- Verificar se o campo 'tipo' existe antes de acessá-lo
    IF NOT (new_record_jsonb ? 'tipo') THEN
        RAISE NOTICE 'Campo tipo não encontrado no registro. Campos disponíveis: %', new_record_jsonb;
        RETURN NEW;
    END IF;
    
    -- Verificar se o campo 'user_id' existe
    IF NOT (new_record_jsonb ? 'user_id') THEN
        RAISE NOTICE 'Campo user_id não encontrado no registro';
        RETURN NEW;
    END IF;
    
    -- Verificar se o campo 'valor' existe
    IF NOT (new_record_jsonb ? 'valor') THEN
        RAISE NOTICE 'Campo valor não encontrado no registro';
        RETURN NEW;
    END IF;
    
    -- Processar apenas se todos os campos necessários existem
    BEGIN
        -- Tipos que aumentam o saldo (créditos)
        IF NEW.tipo IN ('recebido', 'bonus', 'compra', 'transferencia_p2p_entrada') THEN
            UPDATE public.carteiras 
            SET 
                saldo_atual = saldo_atual + NEW.valor,
                total_recebido = total_recebido + NEW.valor,
                updated_at = now()
            WHERE user_id = NEW.user_id;
            
            RAISE NOTICE 'Saldo atualizado - Crédito de % para usuário %', NEW.valor, NEW.user_id;
            
        -- Tipos que diminuem o saldo (débitos)
        ELSIF NEW.tipo IN ('gasto', 'queima', 'transferencia_p2p_saida', 'taxa') THEN
            UPDATE public.carteiras 
            SET 
                saldo_atual = saldo_atual - NEW.valor,
                total_gasto = total_gasto + NEW.valor,
                updated_at = now()
            WHERE user_id = NEW.user_id;
            
            RAISE NOTICE 'Saldo atualizado - Débito de % para usuário %', NEW.valor, NEW.user_id;
        END IF;
        
        -- Tentar recalcular cotação (com tratamento completo de erro)
        BEGIN
            IF NEW.tipo IN ('compra', 'gasto', 'recebido', 'queima') THEN
                PERFORM calcular_cotacao_dinamica();
                RAISE NOTICE 'Cotação recalculada para tipo %', NEW.tipo;
            END IF;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao calcular cotação (não crítico): %', SQLERRM;
        END;
        
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao processar transação (não crítico): %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$function$;

-- Criar APENAS um trigger específico para a tabela transacoes
CREATE TRIGGER on_transaction_created
    AFTER INSERT ON public.transacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wallet_balance();

-- Verificar se o trigger foi criado corretamente e log final
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_transaction_created' 
        AND event_object_table = 'transacoes'
    ) THEN
        RAISE NOTICE 'Trigger on_transaction_created criado com sucesso na tabela transacoes';
        RAISE NOTICE 'Correção definitiva do trigger update_wallet_balance concluída';
    ELSE
        RAISE EXCEPTION 'Falha ao criar trigger on_transaction_created';
    END IF;
END $$;
