-- T9_TEST_SQL_MANUAL - Scripts para validar MVP1 de Reservas

-- FILE: scripts/test_mvp1_reservas.sql

-- =========================================
-- SCRIPTS DE TESTE MANUAL PARA MVP1 RESERVAS
-- Execute estes comandos para validar a implementação
-- =========================================

-- 1. VERIFICAR MIGRAÇÕES APLICADAS
-- Verificar se coluna motivo_cancelamento foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reservas' 
AND column_name = 'motivo_cancelamento';

-- Verificar se constraint foi criada
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'check_motivo_cancelamento';

-- Verificar se índice foi criado
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'reservas' 
AND indexname = 'idx_reservas_status_expira';

-- Verificar configurações inseridas
SELECT chave, valor 
FROM config_sistema 
WHERE chave IN (
  'reserva_prazo_horas',
  'notificacao_horas',
  'penalidade_vendedor',
  'penalidade_comprador',
  'penalidade_expirou'
);

-- 2. TESTAR FUNÇÕES CRIADAS/MODIFICADAS
-- Verificar assinatura da função cancelar_reserva
\df public.cancelar_reserva

-- Verificar função de batch
\df public.processar_reservas_expiradas_batch

-- Verificar funções helper
\df public.get_prazo_reserva_horas
\df public.calcular_prazo_expiracao

-- Testar função de prazo
SELECT get_prazo_reserva_horas();
SELECT calcular_prazo_expiracao();

-- 3. SIMULAR CRIAÇÃO DE RESERVA PARA TESTE
-- (USAR COM CUIDADO - AJUSTAR IDs CONFORME SEU AMBIENTE)
/*
-- Criar uma reserva de teste com prazo no passado para simular expiração
INSERT INTO reservas (
  item_id, 
  usuario_reservou, 
  usuario_item, 
  valor_girinhas, 
  valor_taxa, 
  valor_total,
  prazo_expiracao,
  status,
  codigo_confirmacao
) VALUES (
  'SEU_ITEM_ID_AQUI',     -- substitua por ID real
  'SEU_USER_ID_AQUI',     -- substitua por ID real do comprador
  'SEU_VENDOR_ID_AQUI',   -- substitua por ID real do vendedor
  50.00,
  2.50,
  52.50,
  now() - interval '1 hour',  -- Expirada há 1 hora
  'pendente',
  'TEST01'
);
*/

-- 4. TESTAR PROCESSAMENTO DE EXPIRAÇÃO
-- Verificar reservas pendentes expiradas
SELECT id, usuario_reservou, prazo_expiracao, 
       EXTRACT(EPOCH FROM (now() - prazo_expiracao))/3600 as horas_vencidas
FROM reservas 
WHERE status = 'pendente' 
AND prazo_expiracao < now()
ORDER BY prazo_expiracao;

-- Executar processamento de expiração (modo teste - batch pequeno)
-- SELECT processar_reservas_expiradas_batch(5);

-- Verificar resultado após processamento
SELECT id, status, motivo_cancelamento, prazo_expiracao
FROM reservas 
WHERE motivo_cancelamento = 'expirou'
ORDER BY updated_at DESC;

-- 5. TESTAR CANCELAMENTO MANUAL COM MOTIVO
-- (AJUSTAR IDs CONFORME SEU AMBIENTE)
/*
-- Cancelar uma reserva com motivo específico
SELECT cancelar_reserva(
  'SUA_RESERVA_ID_AQUI',     -- ID da reserva
  'SEU_USER_ID_AQUI',        -- ID do usuário (dono ou reservador)
  'comprador_cancelou'       -- Motivo
);
*/

-- Verificar transações de reembolso criadas
SELECT user_id, tipo, valor, descricao, created_at
FROM transacoes 
WHERE tipo = 'reembolso'
ORDER BY created_at DESC
LIMIT 5;

-- 6. TESTAR MÉTRICAS DE CANCELAMENTO
-- Verificar dados na tabela de métricas
SELECT dt, motivo, total 
FROM reservation_cancel_metrics 
ORDER BY dt DESC, motivo;

-- 7. TESTAR NOTIFICAÇÕES
-- Verificar notificações de expiração criadas
SELECT user_id, type, title, message, created_at
FROM notifications 
WHERE type IN ('reserva_expirada', 'item_liberado', 'reserva_expirando')
ORDER BY created_at DESC
LIMIT 10;

-- 8. VALIDAR INTEGRIDADE DE DADOS
-- Verificar se não há inconsistências
-- Reservas com status expirada devem ter motivo 'expirou'
SELECT COUNT(*) as inconsistencias
FROM reservas 
WHERE status = 'expirada' 
AND (motivo_cancelamento != 'expirou' OR motivo_cancelamento IS NULL);

-- Reservas canceladas devem ter motivo (exceto antigas)
SELECT COUNT(*) as sem_motivo
FROM reservas 
WHERE status = 'cancelada' 
AND motivo_cancelamento IS NULL
AND created_at > now() - interval '1 day'; -- Criadas nas últimas 24h

-- 9. PERFORMANCE - VERIFICAR ÍNDICES SENDO USADOS
-- Explicar query de busca de expiradas
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, usuario_reservou 
FROM reservas 
WHERE status = 'pendente' 
AND prazo_expiracao < now()
ORDER BY prazo_expiracao 
LIMIT 10;

-- =========================================
-- RESULTADOS ESPERADOS:
-- 1. Coluna motivo_cancelamento existe e aceita valores válidos
-- 2. Configurações estão inseridas com valores corretos
-- 3. Funções existem e retornam valores esperados
-- 4. Processamento de expiração marca status='expirada' e motivo='expirou'
-- 5. Cancelamento manual grava motivo corretamente
-- 6. Reembolsos são criados automaticamente
-- 7. Notificações são inseridas nos eventos apropriados
-- 8. Não há inconsistências de dados
-- 9. Queries usam índices eficientemente
-- =========================================