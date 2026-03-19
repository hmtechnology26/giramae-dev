-- ETAPA 5: Sistema de Notificações e Penalidades para Moderação

-- 1. Criar tabela de penalidades
CREATE TABLE IF NOT EXISTS penalidades_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'item_rejeitado', 'denuncia_falsa', etc
  nivel INTEGER DEFAULT 1,   -- 1=leve, 2=médio, 3=grave
  motivo TEXT,
  expira_em TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para penalidades
ALTER TABLE penalidades_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias penalidades"
ON penalidades_usuario FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "Admins podem gerenciar todas as penalidades"
ON penalidades_usuario FOR ALL
USING (EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = auth.uid()
));

-- 2. Função para aplicar penalidades progressivas
CREATE OR REPLACE FUNCTION aplicar_penalidade(
  p_usuario_id UUID,
  p_tipo VARCHAR(50),
  p_nivel INTEGER,
  p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
  v_penalidades_ativas INTEGER;
  v_nivel_final INTEGER;
  v_expira_em TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Contar penalidades ativas do mesmo tipo nos últimos 30 dias
  SELECT COUNT(*) INTO v_penalidades_ativas
  FROM penalidades_usuario 
  WHERE usuario_id = p_usuario_id 
    AND tipo = p_tipo 
    AND created_at > NOW() - INTERVAL '30 days'
    AND ativo = true;
  
  -- Calcular nível baseado em reincidência (máximo 3)
  v_nivel_final := LEAST(p_nivel + v_penalidades_ativas, 3);
  
  -- Calcular expiração baseada no nível
  v_expira_em := CASE v_nivel_final
    WHEN 1 THEN NOW() + INTERVAL '7 days'   -- Leve: 7 dias
    WHEN 2 THEN NOW() + INTERVAL '15 days'  -- Médio: 15 dias  
    WHEN 3 THEN NOW() + INTERVAL '30 days'  -- Grave: 30 dias
    ELSE NOW() + INTERVAL '7 days'
  END;
  
  -- Inserir penalidade
  INSERT INTO penalidades_usuario (
    usuario_id, tipo, nivel, motivo, expira_em
  ) VALUES (
    p_usuario_id, p_tipo, v_nivel_final, p_motivo, v_expira_em
  );
  
  -- Log da aplicação
  INSERT INTO audit_log (user_id, action, details)
  VALUES (
    p_usuario_id,
    'PENALIDADE_APLICADA',
    jsonb_build_object(
      'tipo', p_tipo,
      'nivel', v_nivel_final,
      'motivo', p_motivo,
      'expira_em', v_expira_em
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para notificações automáticas de moderação
CREATE OR REPLACE FUNCTION notificar_item_moderado()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
  v_item_titulo TEXT;
  v_comentario_final TEXT;
BEGIN
  -- Só processar mudanças de status relevantes
  IF NEW.status != OLD.status THEN
    
    -- Buscar dados do item e usuário
    SELECT i.publicado_por, i.titulo 
    INTO v_usuario_id, v_item_titulo
    FROM itens i WHERE i.id = NEW.item_id;
    
    -- Preparar comentário baseado no tipo
    v_comentario_final := COALESCE(NEW.comentario_predefinido, NEW.observacoes, 'Sem comentário');
    
    IF NEW.status = 'rejeitado' THEN
      -- Notificar rejeição
      PERFORM create_notification(
        v_usuario_id,
        'item_rejeitado',
        'Item não aprovado',
        format('Seu item "%s" não foi aprovado. Motivo: %s', 
               v_item_titulo, v_comentario_final),
        jsonb_build_object(
          'item_id', NEW.item_id, 
          'motivo', v_comentario_final,
          'action_url', '/perfil'
        )
      );
      
      -- Aplicar penalidade progressiva
      PERFORM aplicar_penalidade(v_usuario_id, 'item_rejeitado', 1, v_comentario_final);
      
    ELSIF NEW.status = 'aprovado' AND OLD.status IN ('pendente', 'em_analise') THEN
      -- Notificar aprovação apenas se estava pendente
      PERFORM create_notification(
        v_usuario_id,
        'item_aprovado',
        'Item aprovado!',
        format('Seu item "%s" foi aprovado e já está disponível no feed!', v_item_titulo),
        jsonb_build_object(
          'item_id', NEW.item_id,
          'action_url', format('/detalhes-item/%s', NEW.item_id)
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger na tabela moderacao_itens
DROP TRIGGER IF EXISTS trigger_notificar_item_moderado ON moderacao_itens;
CREATE TRIGGER trigger_notificar_item_moderado
  AFTER UPDATE ON moderacao_itens
  FOR EACH ROW
  EXECUTE FUNCTION notificar_item_moderado();

-- 4. Inserir templates de notificação para moderação
INSERT INTO notification_templates (tipo, titulo, corpo, variaveis, ativo) VALUES
('item_rejeitado', 'Item não aprovado', 'Seu item "{{item_titulo}}" não foi aprovado. Motivo: {{motivo}}', '{"item_titulo": "string", "motivo": "string"}', true),
('item_aprovado', 'Item aprovado!', 'Seu item "{{item_titulo}}" foi aprovado e já está disponível!', '{"item_titulo": "string"}', true)
ON CONFLICT (tipo) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  corpo = EXCLUDED.corpo,
  variaveis = EXCLUDED.variaveis,
  updated_at = NOW();

-- 5. Função para limpar penalidades expiradas
CREATE OR REPLACE FUNCTION limpar_penalidades_expiradas()
RETURNS INTEGER AS $$
DECLARE
  v_limpas INTEGER;
BEGIN
  UPDATE penalidades_usuario 
  SET ativo = false, updated_at = NOW()
  WHERE ativo = true 
    AND expira_em < NOW();
  
  GET DIAGNOSTICS v_limpas = ROW_COUNT;
  RETURN v_limpas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_penalidades_usuario_ativo ON penalidades_usuario(usuario_id, ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_penalidades_expiracao ON penalidades_usuario(expira_em) WHERE ativo = true;