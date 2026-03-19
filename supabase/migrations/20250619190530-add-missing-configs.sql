
-- Adicionar configurações que podem estar faltando
INSERT INTO config_sistema (chave, valor) VALUES 
  ('compra_girinhas_min', '{"quantidade": 10}'),
  ('compra_girinhas_max', '{"quantidade": 999000}'),
  ('markup_emissao', '{"percentual": 0.0}'),
  ('validade_girinhas', '{"meses": 12}')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- Garantir que existe pelo menos um registro na tabela cotacao_girinhas
INSERT INTO cotacao_girinhas (cotacao_atual, volume_24h) 
VALUES (1.0000, 0)
ON CONFLICT DO NOTHING;

-- Se a tabela estiver vazia, inserir o primeiro registro
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cotacao_girinhas LIMIT 1) THEN
    INSERT INTO cotacao_girinhas (cotacao_atual, volume_24h) VALUES (1.0000, 0);
  END IF;
END $$;
