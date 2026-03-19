
-- Corrigir a função transferir_girinhas_p2p para usar a taxa configurada no sistema
CREATE OR REPLACE FUNCTION public.transferir_girinhas_p2p(p_remetente_id uuid, p_destinatario_id uuid, p_quantidade numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_taxa DECIMAL(10,2);
  v_valor_liquido DECIMAL(10,2);
  v_saldo_remetente DECIMAL(10,2);
  v_transferencia_id UUID;
  v_config JSONB;
  v_taxa_percentual DECIMAL(5,2);
BEGIN
  -- Obter configurações de taxa do sistema
  SELECT valor INTO v_config FROM config_sistema WHERE chave = 'taxa_transferencia';
  
  -- Se não encontrar configuração, usar padrão de 1%
  IF v_config IS NULL THEN
    v_taxa_percentual := 1.0;
  ELSE
    v_taxa_percentual := (v_config->>'percentual')::DECIMAL;
  END IF;
  
  -- Calcular taxa baseada na configuração
  v_taxa := p_quantidade * (v_taxa_percentual / 100);
  v_valor_liquido := p_quantidade - v_taxa;
  
  -- Verificar saldo do remetente
  SELECT saldo_atual INTO v_saldo_remetente FROM carteiras WHERE user_id = p_remetente_id;
  
  IF v_saldo_remetente < p_quantidade THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  -- Debitar do remetente
  UPDATE carteiras 
  SET saldo_atual = saldo_atual - p_quantidade,
      total_gasto = total_gasto + p_quantidade
  WHERE user_id = p_remetente_id;
  
  -- Creditar ao destinatário
  UPDATE carteiras 
  SET saldo_atual = saldo_atual + v_valor_liquido,
      total_recebido = total_recebido + v_valor_liquido
  WHERE user_id = p_destinatario_id;
  
  -- Registrar transferência
  INSERT INTO transferencias_girinhas (remetente_id, destinatario_id, quantidade, taxa_cobrada)
  VALUES (p_remetente_id, p_destinatario_id, p_quantidade, v_taxa)
  RETURNING id INTO v_transferencia_id;
  
  -- Registrar transações
  INSERT INTO transacoes (user_id, tipo, valor, descricao)
  VALUES 
    (p_remetente_id, 'transferencia_p2p_saida', p_quantidade, 'Transferência P2P enviada'),
    (p_destinatario_id, 'transferencia_p2p_entrada', v_valor_liquido, 'Transferência P2P recebida');
  
  -- Queimar taxa se for maior que zero
  IF v_taxa > 0 THEN
    INSERT INTO queimas_girinhas (user_id, quantidade, motivo)
    VALUES (p_remetente_id, v_taxa, 'taxa_transferencia');
    
    -- Registrar transação de taxa
    INSERT INTO transacoes (user_id, tipo, valor, descricao)
    VALUES (p_remetente_id, 'taxa', v_taxa, 'Taxa de transferência P2P (' || v_taxa_percentual || '%)');
  END IF;
  
  -- Recalcular cotação
  PERFORM calcular_cotacao_dinamica();
  
  RETURN v_transferencia_id;
END;
$function$;
