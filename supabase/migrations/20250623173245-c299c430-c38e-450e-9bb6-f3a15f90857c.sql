
-- Migrar dados dos campos antigos para os novos
UPDATE itens 
SET 
  endereco_cidade = cidade_manual,
  endereco_estado = estado_manual
WHERE endereco_cidade IS NULL AND cidade_manual IS NOT NULL;

-- Preencher campos vazios com dados do perfil do usuário quando possível
UPDATE itens i
SET 
  endereco_cidade = p.cidade,
  endereco_estado = p.estado,
  endereco_bairro = p.bairro
FROM profiles p
WHERE i.publicado_por = p.id 
  AND i.endereco_cidade IS NULL 
  AND p.cidade IS NOT NULL;

-- Limpar dados inconsistentes
UPDATE itens 
SET cidade_manual = NULL, estado_manual = NULL
WHERE endereco_cidade IS NOT NULL;
