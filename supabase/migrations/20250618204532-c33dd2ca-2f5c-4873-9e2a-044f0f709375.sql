
-- Permitir valores nulos na coluna pacote_id para compras livres
ALTER TABLE compras_girinhas 
ALTER COLUMN pacote_id DROP NOT NULL;
