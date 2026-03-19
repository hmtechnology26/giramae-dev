
-- Primeiro, vamos criar as configurações necessárias se não existirem
INSERT INTO config_sistema (chave, valor) VALUES 
  ('cotacao_min_max', '{"min": 0.80, "max": 1.30}'),
  ('multiplicador_cotacao', '{"valor": 0.001}')
ON CONFLICT (chave) DO NOTHING;

-- Criar a função calcular_cotacao_dinamica que está sendo chamada pelo trigger
CREATE OR REPLACE FUNCTION public.calcular_cotacao_dinamica()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_volume_24h INTEGER;
  v_queima_24h DECIMAL(10,2);
  v_cotacao_atual DECIMAL(10,4);
  v_nova_cotacao DECIMAL(10,4);
  v_config_cotacao JSONB;
  v_config_multiplicador JSONB;
  v_multiplicador DECIMAL;
BEGIN
  -- Obter configurações
  SELECT valor INTO v_config_cotacao FROM config_sistema WHERE chave = 'cotacao_min_max';
  SELECT valor INTO v_config_multiplicador FROM config_sistema WHERE chave = 'multiplicador_cotacao';
  
  v_multiplicador := COALESCE((v_config_multiplicador->>'valor')::DECIMAL, 0.001);
  
  -- Calcular volume das últimas 24h
  SELECT COALESCE(SUM(quantidade_girinhas), 0) INTO v_volume_24h
  FROM transacoes 
  WHERE tipo = 'compra' AND created_at > now() - interval '24 hours';
  
  -- Calcular queimas das últimas 24h
  SELECT COALESCE(SUM(quantidade), 0) INTO v_queima_24h
  FROM queimas_girinhas 
  WHERE created_at > now() - interval '24 hours';
  
  -- Obter cotação atual
  SELECT cotacao_atual INTO v_cotacao_atual FROM cotacao_girinhas ORDER BY updated_at DESC LIMIT 1;
  
  -- Se não há cotação atual, usar 1.0000 como base
  IF v_cotacao_atual IS NULL THEN
    v_cotacao_atual := 1.0000;
  END IF;
  
  -- Calcular nova cotação: base + (volume - queima) * multiplicador
  v_nova_cotacao := 1.0000 + ((v_volume_24h - v_queima_24h) * v_multiplicador);
  
  -- Aplicar limites se configuração existe
  IF v_config_cotacao IS NOT NULL THEN
    v_nova_cotacao := GREATEST(v_nova_cotacao, (v_config_cotacao->>'min')::DECIMAL);
    v_nova_cotacao := LEAST(v_nova_cotacao, (v_config_cotacao->>'max')::DECIMAL);
  END IF;
  
  -- Atualizar cotação (inserir se não existe)
  INSERT INTO cotacao_girinhas (cotacao_atual, volume_24h, updated_at) 
  VALUES (v_nova_cotacao, v_volume_24h, now())
  ON CONFLICT (id) DO UPDATE SET 
    cotacao_atual = v_nova_cotacao,
    volume_24h = v_volume_24h,
    updated_at = now();
  
  -- Se não existe nenhum registro, inserir o primeiro
  IF NOT EXISTS (SELECT 1 FROM cotacao_girinhas) THEN
    INSERT INTO cotacao_girinhas (cotacao_atual, volume_24h) 
    VALUES (v_nova_cotacao, v_volume_24h);
  END IF;
  
  -- Registrar no histórico
  INSERT INTO historico_cotacao (cotacao, volume_periodo, evento)
  VALUES (v_nova_cotacao, v_volume_24h, 'calculo_automatico');
  
  RETURN v_nova_cotacao;
END;
$$;
