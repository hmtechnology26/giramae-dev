-- T1_SCHEMA_MIGRATIONS_UP - SQL idempotente para MVP1 Reservas

-- FILE: supabase/migrations/20250117000001_mvp1_reservas_schema.sql

-- 1. Adicionar coluna motivo_cancelamento na tabela reservas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservas' 
    AND column_name = 'motivo_cancelamento'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.reservas 
    ADD COLUMN motivo_cancelamento text;
    
    -- Adicionar constraint para valores válidos
    ALTER TABLE public.reservas 
    ADD CONSTRAINT check_motivo_cancelamento 
    CHECK (motivo_cancelamento IS NULL OR motivo_cancelamento IN (
      'vendedor_cancelou',
      'comprador_cancelou', 
      'expirou',
      'item_inadequado',
      'desistencia'
    ));
  END IF;
END $$;

-- 2. Criar índice para otimizar queries de expiração
CREATE INDEX IF NOT EXISTS idx_reservas_status_expira
  ON public.reservas (status, prazo_expiracao)
  WHERE status = 'pendente';

-- 3. Inserir configurações iniciais no config_sistema
INSERT INTO public.config_sistema (chave, valor) VALUES
  ('reserva_prazo_horas', '{"valor": 48}'::jsonb),
  ('notificacao_horas', '{"valores": [24, 6, 1]}'::jsonb),
  ('penalidade_vendedor', '{"ativo": true, "pontos": 5}'::jsonb),
  ('penalidade_comprador', '{"ativo": false, "pontos": 2}'::jsonb),
  ('penalidade_expirou', '{"ativo": true, "pontos": 1}'::jsonb)
ON CONFLICT (chave) DO UPDATE SET
  valor = EXCLUDED.valor;

-- 4. Criar tabela opcional para métricas de cancelamento
CREATE TABLE IF NOT EXISTS public.reservation_cancel_metrics (
  dt date NOT NULL,
  motivo text NOT NULL,
  total integer NOT NULL DEFAULT 0,
  PRIMARY KEY (dt, motivo)
);

-- Comentário importante
-- TODO: HUMANO CONFIRMAR - Verificar se as políticas RLS existentes cobrem as novas colunas