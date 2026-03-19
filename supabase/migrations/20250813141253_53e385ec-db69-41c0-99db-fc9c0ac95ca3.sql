-- Adicionar função para buscar usuários com filtros funcionais
CREATE OR REPLACE FUNCTION buscar_usuarios_admin(
  search_term TEXT DEFAULT '',
  status_filter TEXT DEFAULT 'todos',
  ordenacao TEXT DEFAULT 'data_cadastro',
  limite INTEGER DEFAULT 50,
  offset_val INTEGER DEFAULT 0
) RETURNS TABLE (
  user_id UUID,
  nome TEXT,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  cadastro_status TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE,
  ultima_atividade TIMESTAMP WITH TIME ZONE,
  total_itens_publicados BIGINT,
  total_reservas_feitas BIGINT,
  total_vendas_realizadas BIGINT,
  total_denuncias_feitas BIGINT,
  saldo_girinhas NUMERIC,
  total_girinhas_recebidas NUMERIC,
  total_girinhas_gastas NUMERIC,
  penalidades_ativas BIGINT,
  penalidade_mais_grave INTEGER,
  total_penalidades_historico BIGINT,
  ultima_penalidade TIMESTAMP WITH TIME ZONE,
  status TEXT,
  pontuacao_reputacao INTEGER,
  total_violacoes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.user_id,
    u.nome,
    u.email,
    u.username,
    u.avatar_url,
    u.telefone,
    u.cidade,
    u.estado,
    u.cadastro_status,
    u.data_cadastro,
    u.ultima_atividade,
    u.total_itens_publicados,
    u.total_reservas_feitas,
    u.total_vendas_realizadas,
    u.total_denuncias_feitas,
    u.saldo_girinhas,
    u.total_girinhas_recebidas,
    u.total_girinhas_gastas,
    u.penalidades_ativas,
    u.penalidade_mais_grave,
    u.total_penalidades_historico,
    u.ultima_penalidade,
    u.status,
    u.pontuacao_reputacao,
    u.total_violacoes
  FROM usuarios_admin u
  WHERE 
    (search_term = '' OR 
     u.nome ILIKE '%' || search_term || '%' OR 
     u.email ILIKE '%' || search_term || '%' OR
     u.username ILIKE '%' || search_term || '%')
    AND 
    (status_filter = 'todos' OR u.status = status_filter)
  ORDER BY 
    CASE 
      WHEN ordenacao = 'data_cadastro' THEN u.data_cadastro
      WHEN ordenacao = 'ultima_atividade' THEN u.ultima_atividade
      WHEN ordenacao = 'penalidades' THEN u.ultima_penalidade
      ELSE u.data_cadastro
    END DESC NULLS LAST
  LIMIT limite
  OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aplicar suspensão manual
CREATE OR REPLACE FUNCTION aplicar_suspensao_manual(
  p_usuario_id UUID,
  p_duracao_dias INTEGER,
  p_motivo TEXT,
  p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_penalidade_id UUID;
BEGIN
  -- Inserir penalidade
  INSERT INTO penalidades_usuarios (
    usuario_id,
    tipo,
    nivel,
    motivo,
    duracao_dias,
    data_expiracao,
    aplicada_por,
    status
  ) VALUES (
    p_usuario_id,
    'suspensao',
    3, -- Nível 3 para suspensão
    p_motivo,
    p_duracao_dias,
    CURRENT_DATE + (p_duracao_dias || ' days')::INTERVAL,
    p_admin_id,
    'ativa'
  ) RETURNING id INTO v_penalidade_id;

  -- Atualizar status do usuário
  UPDATE profiles 
  SET status = 'suspenso'
  WHERE id = p_usuario_id;

  RETURN jsonb_build_object(
    'sucesso', true,
    'penalidade_id', v_penalidade_id,
    'message', 'Suspensão aplicada com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aplicar banimento permanente
CREATE OR REPLACE FUNCTION aplicar_banimento_permanente(
  p_usuario_id UUID,
  p_motivo TEXT,
  p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_penalidade_id UUID;
BEGIN
  -- Inserir penalidade de banimento
  INSERT INTO penalidades_usuarios (
    usuario_id,
    tipo,
    nivel,
    motivo,
    aplicada_por,
    status,
    data_expiracao
  ) VALUES (
    p_usuario_id,
    'banimento',
    5, -- Nível 5 para banimento permanente
    p_motivo,
    p_admin_id,
    'ativa',
    '2099-12-31'::DATE -- Data muito distante = permanente
  ) RETURNING id INTO v_penalidade_id;

  -- Atualizar status do usuário
  UPDATE profiles 
  SET status = 'banido'
  WHERE id = p_usuario_id;

  RETURN jsonb_build_object(
    'sucesso', true,
    'penalidade_id', v_penalidade_id,
    'message', 'Banimento aplicado com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para remover penalidade e restaurar usuário
CREATE OR REPLACE FUNCTION remover_penalidade_restaurar_usuario(
  p_penalidade_id UUID,
  p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_usuario_id UUID;
  v_tipo_penalidade TEXT;
BEGIN
  -- Buscar dados da penalidade
  SELECT usuario_id, tipo INTO v_usuario_id, v_tipo_penalidade
  FROM penalidades_usuarios 
  WHERE id = p_penalidade_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'error', 'Penalidade não encontrada'
    );
  END IF;

  -- Inativar a penalidade
  UPDATE penalidades_usuarios 
  SET status = 'removida', removida_por = p_admin_id, removida_em = NOW()
  WHERE id = p_penalidade_id;

  -- Verificar se o usuário ainda tem outras penalidades ativas
  IF NOT EXISTS (
    SELECT 1 FROM penalidades_usuarios 
    WHERE usuario_id = v_usuario_id 
    AND status = 'ativa' 
    AND data_expiracao > NOW()
  ) THEN
    -- Restaurar status do usuário para ativo
    UPDATE profiles 
    SET status = 'ativo'
    WHERE id = v_usuario_id;
  END IF;

  RETURN jsonb_build_object(
    'sucesso', true,
    'message', 'Penalidade removida e usuário restaurado'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'sucesso', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;