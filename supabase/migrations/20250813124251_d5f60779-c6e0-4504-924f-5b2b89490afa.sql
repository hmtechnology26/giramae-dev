-- Corrigir inconsistências no sistema de moderação

-- 1. Garantir que todos os itens aprovados/rejeitados tenham dados corretos
UPDATE moderacao_itens 
SET moderado_em = COALESCE(moderado_em, now())
WHERE status IN ('aprovado', 'rejeitado') AND moderado_em IS NULL;

-- 2. Log de debug para diagnóstico
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE LOG 'Iniciando diagnóstico do sistema de moderação...';
    
    -- Contar por status
    FOR rec IN 
        SELECT status, COUNT(*) as count
        FROM moderacao_itens 
        GROUP BY status
    LOOP
        RAISE LOG 'Status %: % itens', rec.status, rec.count;
    END LOOP;
    
    -- Verificar itens sem moderação
    SELECT COUNT(*) INTO rec.count 
    FROM itens i 
    LEFT JOIN moderacao_itens m ON i.id = m.item_id 
    WHERE m.id IS NULL AND i.status = 'disponivel';
    
    RAISE LOG 'Itens disponíveis sem moderação: %', rec.count;
    
    -- Criar registros de moderação para itens disponíveis sem moderação
    INSERT INTO moderacao_itens (item_id, status)
    SELECT i.id, 'pendente'
    FROM itens i 
    LEFT JOIN moderacao_itens m ON i.id = m.item_id 
    WHERE m.id IS NULL AND i.status = 'disponivel';
    
    GET DIAGNOSTICS rec.count = ROW_COUNT;
    RAISE LOG 'Criados % novos registros de moderação', rec.count;
END $$;