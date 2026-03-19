-- ETAPA 4: INTEGRAR COM DENÚNCIAS

-- 4.1 Trigger para priorizar itens denunciados
CREATE OR REPLACE FUNCTION priorizar_item_denunciado()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar registro de moderação existente
  UPDATE moderacao_itens SET 
    denuncia_id = NEW.id,
    status = CASE 
      WHEN status = 'aprovado' THEN 'em_analise'  -- Reabrir para análise
      ELSE status
    END,
    created_at = NOW()  -- Para aparecer no topo da lista
  WHERE item_id = NEW.item_id;
  
  -- Se não existe, criar
  INSERT INTO moderacao_itens (item_id, status, denuncia_id)
  VALUES (NEW.item_id, 'em_analise', NEW.id)
  ON CONFLICT (item_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_priorizar_denunciado
  AFTER INSERT ON denuncias
  FOR EACH ROW
  EXECUTE FUNCTION priorizar_item_denunciado();

-- 4.2 Função para aceitar denúncia (rejeitar item)
CREATE OR REPLACE FUNCTION aceitar_denuncia(
  p_denuncia_id UUID,
  p_moderador_id UUID,
  p_comentario TEXT DEFAULT 'denuncia_procedente',
  p_observacoes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_item_id UUID;
  v_resultado JSONB;
BEGIN
  -- Buscar item_id da denúncia
  SELECT item_id INTO v_item_id FROM denuncias WHERE id = p_denuncia_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Denúncia não encontrada');
  END IF;
  
  -- Atualizar moderação (rejeitar item)
  UPDATE moderacao_itens SET 
    status = 'rejeitado',
    denuncia_aceita = true,
    comentario_predefinido = p_comentario,
    observacoes = p_observacoes,
    moderador_id = p_moderador_id,
    moderado_em = NOW()
  WHERE item_id = v_item_id;
  
  -- Atualizar denúncia
  UPDATE denuncias SET 
    status = 'aceita',
    analisada_por = p_moderador_id,
    data_analise = NOW()
  WHERE id = p_denuncia_id;
  
  -- Atualizar status do item para 'removido'
  UPDATE itens SET status = 'removido' WHERE id = v_item_id;
  
  RETURN jsonb_build_object(
    'sucesso', true,
    'item_id', v_item_id,
    'acao', 'denuncia_aceita_item_rejeitado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.3 Função para rejeitar denúncia (aprovar item)
CREATE OR REPLACE FUNCTION rejeitar_denuncia(
  p_denuncia_id UUID,
  p_moderador_id UUID,
  p_observacoes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_item_id UUID;
  v_resultado JSONB;
BEGIN
  -- Buscar item_id da denúncia
  SELECT item_id INTO v_item_id FROM denuncias WHERE id = p_denuncia_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('sucesso', false, 'erro', 'Denúncia não encontrada');
  END IF;
  
  -- Atualizar moderação (aprovar item)
  UPDATE moderacao_itens SET 
    status = 'aprovado',
    denuncia_aceita = false,
    observacoes = p_observacoes,
    moderador_id = p_moderador_id,
    moderado_em = NOW()
  WHERE item_id = v_item_id;
  
  -- Atualizar denúncia
  UPDATE denuncias SET 
    status = 'rejeitada',
    analisada_por = p_moderador_id,
    data_analise = NOW(),
    observacoes_admin = p_observacoes
  WHERE id = p_denuncia_id;
  
  RETURN jsonb_build_object(
    'sucesso', true,
    'item_id', v_item_id,
    'acao', 'denuncia_rejeitada_item_aprovado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.4 Atualizar view para priorizar itens denunciados
CREATE OR REPLACE VIEW itens_moderacao_completa AS
SELECT 
  m.id as moderacao_id,
  m.status as moderacao_status,
  m.created_at as data_moderacao,
  m.denuncia_id,
  m.denuncia_aceita,
  i.id as item_id,
  i.titulo,
  i.categoria,
  i.valor_girinhas,
  i.fotos[1] as primeira_foto,
  i.created_at as data_publicacao,
  p.nome as usuario_nome,
  -- Dados da denúncia
  d.motivo as motivo_denuncia,
  d.descricao as descricao_denuncia,
  d.created_at as data_denuncia,
  -- Indicadores
  CASE WHEN d.id IS NOT NULL THEN true ELSE false END as tem_denuncia,
  (SELECT COUNT(*) FROM denuncias WHERE item_id = i.id AND status = 'pendente') as total_denuncias
FROM moderacao_itens m
JOIN itens i ON m.item_id = i.id
JOIN profiles p ON i.publicado_por = p.id
LEFT JOIN denuncias d ON m.denuncia_id = d.id
WHERE m.status IN ('pendente', 'em_analise')
ORDER BY 
  -- Priorizar itens com denúncia
  CASE WHEN d.id IS NOT NULL THEN 0 ELSE 1 END,
  -- Depois por data de moderação
  m.created_at DESC;