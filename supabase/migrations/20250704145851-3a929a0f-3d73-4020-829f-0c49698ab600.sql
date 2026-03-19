
-- Corrigir a view saldo_detalhado_v2 com os tipos corretos do enum
DROP VIEW IF EXISTS saldo_detalhado_v2;
CREATE VIEW saldo_detalhado_v2 AS
WITH transacoes_validas AS (
  SELECT 
    t.user_id,
    t.tipo,
    t.valor,
    t.data_expiracao,
    t.created_at,
    t.descricao,
    CASE 
      WHEN t.data_expiracao IS NOT NULL AND t.data_expiracao <= CURRENT_DATE THEN 'expirado'
      WHEN t.data_expiracao IS NOT NULL AND t.data_expiracao <= CURRENT_DATE + INTERVAL '7 days' THEN 'expirando'
      ELSE 'valido'
    END as status_validade
  FROM transacoes t
  WHERE NOT EXISTS (
    SELECT 1 FROM queimas_girinhas q 
    WHERE q.transacao_id = t.id AND q.motivo = 'expiracao'
  )
)
SELECT 
  tv.user_id,
  tv.tipo,
  tv.valor as valor_liquido,
  tv.data_expiracao,
  tv.status_validade,
  CASE 
    WHEN tv.tipo IN ('compra', 'bonus_cadastro', 'bonus_diario', 'bonus_promocional', 'bonus_indicacao_cadastro', 'bonus_indicacao_cadastro_indicado', 'bonus_meta_bronze', 'bonus_meta_prata', 'bonus_meta_ouro', 'recebido_item', 'transferencia_p2p_entrada', 'missao') THEN 'entrada'
    WHEN tv.tipo IN ('bloqueio_reserva', 'transferencia_p2p_saida', 'taxa_transferencia', 'taxa_extensao_validade', 'taxa_marketplace', 'queima_expiracao', 'queima_administrativa') THEN 'saida'
    ELSE 'neutro'
  END as categoria,
  CASE 
    WHEN tv.tipo = 'compra' THEN 'Compra de Girinhas'
    WHEN tv.tipo = 'bonus_cadastro' THEN 'Bônus de Cadastro'
    WHEN tv.tipo = 'bonus_diario' THEN 'Bônus Diário'
    WHEN tv.tipo = 'bonus_promocional' THEN 'Bônus Promocional'
    WHEN tv.tipo = 'recebido_item' THEN 'Venda de Item'
    WHEN tv.tipo = 'bloqueio_reserva' THEN 'Reserva de Item'
    WHEN tv.tipo = 'taxa_marketplace' THEN 'Taxa de Serviço'
    WHEN tv.tipo = 'transferencia_p2p_entrada' THEN 'Transferência Recebida'
    WHEN tv.tipo = 'transferencia_p2p_saida' THEN 'Transferência Enviada'
    WHEN tv.tipo = 'missao' THEN 'Recompensa de Missão'
    ELSE tv.descricao
  END as descricao_pt,
  CASE 
    WHEN tv.tipo IN ('compra', 'recebido_item') THEN '#10B981'
    WHEN tv.tipo IN ('bonus_cadastro', 'bonus_diario', 'bonus_promocional', 'missao') THEN '#F59E0B'
    WHEN tv.tipo IN ('bloqueio_reserva', 'transferencia_p2p_saida') THEN '#EF4444'
    WHEN tv.tipo LIKE 'taxa_%' THEN '#6B7280'
    ELSE '#9CA3AF'
  END as cor_hex,
  CASE 
    WHEN tv.tipo IN ('compra', 'recebido_item') THEN 'trending-up'
    WHEN tv.tipo IN ('bonus_cadastro', 'bonus_diario', 'bonus_promocional', 'missao') THEN 'gift'
    WHEN tv.tipo IN ('bloqueio_reserva', 'transferencia_p2p_saida') THEN 'shopping-cart'
    WHEN tv.tipo LIKE 'taxa_%' THEN 'percent'
    ELSE 'circle'
  END as icone
FROM transacoes_validas tv;
