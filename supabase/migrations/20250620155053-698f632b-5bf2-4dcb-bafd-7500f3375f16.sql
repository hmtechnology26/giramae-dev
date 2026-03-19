
-- Atualizar função para incluir todos os tipos de transações com validade
CREATE OR REPLACE FUNCTION obter_girinhas_expiracao(p_user_id uuid)
RETURNS TABLE(total_expirando_7_dias numeric, total_expirando_30_dias numeric, proxima_expiracao date, detalhes_expiracao jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH expiracao_data AS (
    SELECT 
      t.data_expiracao,
      t.valor,
      t.created_at,
      t.tipo,
      t.descricao,
      (t.data_expiracao - CURRENT_DATE) AS dias_restantes
    FROM transacoes t
    WHERE t.user_id = p_user_id 
    AND t.tipo IN ('compra', 'bonus', 'missao', 'missao_recompensa')
    AND t.data_expiracao IS NOT NULL
    AND t.data_expiracao > CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM queimas_girinhas q 
      WHERE q.transacao_id = t.id 
      AND q.motivo = 'expiracao'
    )
  )
  SELECT 
    COALESCE(SUM(CASE WHEN dias_restantes <= 7 THEN valor ELSE 0 END), 0) as total_expirando_7_dias,
    COALESCE(SUM(CASE WHEN dias_restantes <= 30 THEN valor ELSE 0 END), 0) as total_expirando_30_dias,
    MIN(data_expiracao) as proxima_expiracao,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'valor', valor,
          'data_compra', created_at,
          'data_expiracao', data_expiracao,
          'dias_restantes', dias_restantes,
          'tipo', tipo,
          'descricao', descricao
        )
        ORDER BY data_expiracao
      ), 
      '[]'::jsonb
    ) as detalhes_expiracao
  FROM expiracao_data;
END;
$$;
