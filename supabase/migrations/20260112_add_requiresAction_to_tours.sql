-- Migration: adicionar requiresAction e actionTarget aos tours
-- Atualiza steps para validar execução de ações

-- Tour: acao-favorito - Exigir que usuário clique em favoritar
UPDATE jornadas_definicoes 
SET steps = jsonb_set(
  steps,
  '{2}',  -- Índice do step "clicar-coracao" (0-based)
  steps->2 || '{
    "requiresAction": true,
    "actionTarget": "[data-tour=\"btn-favorito\"]"
  }'::jsonb
)
WHERE id = 'acao-favorito';

-- Tour: acao-publicar-item - Exigir que usuário clique em publicar
UPDATE jornadas_definicoes 
SET steps = jsonb_set(
  steps,
  '{1}',  -- Índice do step "btn-publicar" (0-based)
  steps->1 || '{
    "requiresAction": true,
    "actionTarget": "[data-tour=\"btn-publicar\"]"
  }'::jsonb
)
WHERE id = 'acao-publicar-item';

-- Tour: acao-seguir-mae - Exigir que usuário clique no item para ver perfil
UPDATE jornadas_definicoes 
SET steps = jsonb_set(
  steps,
  '{1}',  -- Índice do step "perfil-mae" (0-based)
  steps->1 || '{
    "requiresAction": true,
    "actionTarget": "[data-tour=\"item-card\"] a"
  }'::jsonb
)
WHERE id = 'acao-seguir-mae';

-- Tour: acao-seguir-mae - Exigir que usuário clique em seguir (quando btn-seguir existir)
UPDATE jornadas_definicoes 
SET steps = jsonb_set(
  steps,
  '{2}',  -- Índice do step "btn-seguir" (0-based)
  steps->2 || '{
    "requiresAction": true,
    "actionTarget": "[data-tour=\"btn-seguir\"]"
  }'::jsonb
)
WHERE id = 'acao-seguir-mae';

-- Tour: acao-bonus-diario - Exigir que usuário colete o bônus
UPDATE jornadas_definicoes 
SET steps = jsonb_set(
  steps,
  '{1}',  -- Índice do step "widget-bonus" (0-based)
  steps->1 || '{
    "requiresAction": true,
    "actionTarget": "[data-tour=\"bonus-diario\"] button"
  }'::jsonb
)
WHERE id = 'acao-bonus-diario';
