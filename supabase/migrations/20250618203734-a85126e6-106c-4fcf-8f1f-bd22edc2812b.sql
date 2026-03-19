
-- Adicionar configurações para compra de Girinhas
INSERT INTO config_sistema (chave, valor) VALUES 
  ('compra_girinhas_min', '{"quantidade": 10}'),
  ('compra_girinhas_max', '{"quantidade": 999000}')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- Inserir configuração inicial da cotação se não existir
INSERT INTO cotacao_girinhas (cotacao_atual, volume_24h) VALUES (1.0000, 0)
ON CONFLICT DO NOTHING;
