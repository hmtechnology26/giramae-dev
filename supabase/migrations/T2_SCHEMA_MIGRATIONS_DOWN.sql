-- T2_SCHEMA_MIGRATIONS_DOWN - SQL reverso seguro para MVP1 Reservas

-- FILE: supabase/migrations/T2_SCHEMA_MIGRATIONS_DOWN.sql

-- ATENÇÃO: Este script é destrutivo e deve ser usado apenas em desenvolvimento
-- TODO: HUMANO CONFIRMAR - Executar apenas se necessário rollback

-- 4. Remover tabela de métricas (se não houver dados importantes)
-- DROP TABLE IF EXISTS public.reservation_cancel_metrics;

-- 3. Remover configurações adicionadas (comentado para preservar dados)
-- DELETE FROM public.config_sistema WHERE chave IN (
--   'reserva_prazo_horas',
--   'notificacao_horas', 
--   'penalidade_vendedor',
--   'penalidade_comprador',
--   'penalidade_expirou'
-- );

-- 2. Remover índice
DROP INDEX IF EXISTS public.idx_reservas_status_expira;

-- 1. Remover coluna motivo_cancelamento
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservas' 
    AND column_name = 'motivo_cancelamento'
    AND table_schema = 'public'
  ) THEN
    -- Primeiro remover a constraint
    ALTER TABLE public.reservas 
    DROP CONSTRAINT IF EXISTS check_motivo_cancelamento;
    
    -- Depois remover a coluna
    ALTER TABLE public.reservas 
    DROP COLUMN motivo_cancelamento;
  END IF;
END $$;

-- NOTA: Configurações em config_sistema são mantidas por segurança
-- Para remover completamente, descomente as linhas acima