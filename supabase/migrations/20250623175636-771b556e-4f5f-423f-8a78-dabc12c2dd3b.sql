
-- ETAPA 1: Completar Migração de Dados (URGENTE!)

-- 1. Migrar dados dos campos antigos para os novos onde ainda não foi feito
UPDATE itens 
SET 
  endereco_cidade = cidade_manual,
  endereco_estado = estado_manual
WHERE endereco_cidade IS NULL AND cidade_manual IS NOT NULL;

-- 2. Preencher campos vazios com dados do perfil do usuário quando possível
UPDATE itens i
SET 
  endereco_cidade = p.cidade,
  endereco_estado = p.estado,
  endereco_bairro = p.bairro
FROM profiles p
WHERE i.publicado_por = p.id 
  AND i.endereco_cidade IS NULL 
  AND p.cidade IS NOT NULL;

-- 3. Verificar se existem registros ainda sem localização (para debug)
-- SELECT COUNT(*) as itens_sem_localizacao 
-- FROM itens 
-- WHERE endereco_cidade IS NULL AND status = 'disponivel';

-- 4. Limpar dados inconsistentes
UPDATE itens 
SET cidade_manual = NULL, estado_manual = NULL
WHERE endereco_cidade IS NOT NULL;
