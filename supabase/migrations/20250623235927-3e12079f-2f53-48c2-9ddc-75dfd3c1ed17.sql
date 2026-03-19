
-- 1. Criar tabela principal de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT notifications_type_check CHECK (
    type IN (
      'nova_mensagem', 'item_reservado', 'reserva_expirando',
      'reserva_confirmada', 'reserva_cancelada', 'girinhas_expirando',
      'girinhas_recebidas', 'missao_completada', 'sistema',
      'boas_vindas', 'item_disponivel'
    )
  )
);

-- 2. Simplificar tabela de preferências (manter apenas o essencial)
DROP TABLE IF EXISTS user_location_notifications;

-- Criar tabela simplificada de preferências
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mensagens BOOLEAN DEFAULT true,
  reservas BOOLEAN DEFAULT true,
  girinhas BOOLEAN DEFAULT true,
  sistema BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  push_subscription JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Criar tabela de notificações administrativas
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('all', 'active', 'specific')),
  target_users UUID[],
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  action_text VARCHAR(100),
  sent_by UUID REFERENCES profiles(id),
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 5. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- 6. Remover policies existentes e criar novas
DO $$
BEGIN
    -- Remover policies existentes
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can view own preferences" ON user_notification_preferences;
    DROP POLICY IF EXISTS "Users can update own preferences" ON user_notification_preferences;
    DROP POLICY IF EXISTS "Only admins can manage admin notifications" ON admin_notifications;
    
    -- Criar policies para notifications
    CREATE POLICY "Users can view own notifications" ON notifications
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own notifications" ON notifications
      FOR UPDATE USING (auth.uid() = user_id);
    
    -- Criar policies para user_notification_preferences
    CREATE POLICY "Users can view own preferences" ON user_notification_preferences
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own preferences" ON user_notification_preferences
      FOR ALL USING (auth.uid() = user_id);
    
    -- Criar policy para admin_notifications
    CREATE POLICY "Only admins can manage admin notifications" ON admin_notifications
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND (dados_segmentacao->>'role' = 'admin' OR id = auth.uid())
        )
      );
END
$$;

-- 7. Function principal para criar notificações
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_preferences RECORD;
BEGIN
  -- Verificar preferências do usuário
  SELECT * INTO v_preferences 
  FROM user_notification_preferences 
  WHERE user_id = p_user_id;
  
  -- Se não existir, criar com padrões
  IF NOT FOUND THEN
    INSERT INTO user_notification_preferences (user_id)
    VALUES (p_user_id);
    
    SELECT * INTO v_preferences 
    FROM user_notification_preferences 
    WHERE user_id = p_user_id;
  END IF;
  
  -- Verificar se tipo está ativo
  CASE p_type
    WHEN 'nova_mensagem' THEN
      IF NOT v_preferences.mensagens THEN RETURN NULL; END IF;
    WHEN 'item_reservado', 'reserva_expirando', 'reserva_confirmada', 'reserva_cancelada' THEN
      IF NOT v_preferences.reservas THEN RETURN NULL; END IF;
    WHEN 'girinhas_expirando', 'girinhas_recebidas' THEN
      IF NOT v_preferences.girinhas THEN RETURN NULL; END IF;
    WHEN 'sistema', 'boas_vindas', 'item_disponivel' THEN
      IF NOT v_preferences.sistema THEN RETURN NULL; END IF;
  END CASE;
  
  -- Criar notificação
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Triggers automáticos para eventos

-- Trigger para novas mensagens
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_destinatario_id UUID;
  v_remetente_nome TEXT;
BEGIN
  -- Buscar destinatário e nome do remetente
  SELECT 
    CASE 
      WHEN c.usuario1_id = NEW.remetente_id THEN c.usuario2_id
      ELSE c.usuario1_id
    END,
    p.nome
  INTO v_destinatario_id, v_remetente_nome
  FROM conversas c
  JOIN profiles p ON p.id = NEW.remetente_id
  WHERE c.id = NEW.conversa_id;
  
  -- Criar notificação
  PERFORM create_notification(
    v_destinatario_id,
    'nova_mensagem',
    'Nova mensagem',
    v_remetente_nome || ' enviou uma mensagem',
    jsonb_build_object(
      'conversa_id', NEW.conversa_id,
      'mensagem_id', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_message ON mensagens;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON mensagens
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- Trigger para itens reservados
CREATE OR REPLACE FUNCTION notify_item_reserved()
RETURNS TRIGGER AS $$
DECLARE
  v_item_titulo TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pendente' THEN
    -- Buscar título do item
    SELECT titulo INTO v_item_titulo
    FROM itens WHERE id = NEW.item_id;
    
    -- Notificar dono do item
    PERFORM create_notification(
      NEW.usuario_item,
      'item_reservado',
      'Item reservado!',
      'Seu item "' || v_item_titulo || '" foi reservado',
      jsonb_build_object(
        'reserva_id', NEW.id,
        'item_id', NEW.item_id,
        'valor', NEW.valor_girinhas
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_item_reserved ON reservas;
CREATE TRIGGER trigger_notify_item_reserved
  AFTER INSERT ON reservas
  FOR EACH ROW EXECUTE FUNCTION notify_item_reserved();

-- Trigger para reservas confirmadas
CREATE OR REPLACE FUNCTION notify_reservation_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  v_item_titulo TEXT;
BEGIN
  -- Quando status muda para confirmada
  IF NEW.status = 'confirmada' AND OLD.status != 'confirmada' THEN
    
    SELECT titulo INTO v_item_titulo FROM itens WHERE id = NEW.item_id;
    
    -- Notificar ambas partes
    PERFORM create_notification(
      NEW.usuario_reservou,
      'reserva_confirmada',
      'Troca confirmada!',
      'A troca do item "' || v_item_titulo || '" foi confirmada',
      jsonb_build_object('reserva_id', NEW.id, 'item_id', NEW.item_id)
    );
    
    PERFORM create_notification(
      NEW.usuario_item,
      'reserva_confirmada',
      'Troca confirmada!',
      'A troca do item "' || v_item_titulo || '" foi confirmada',
      jsonb_build_object('reserva_id', NEW.id, 'item_id', NEW.item_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_reservation_confirmed ON reservas;
CREATE TRIGGER trigger_notify_reservation_confirmed
  AFTER UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION notify_reservation_confirmed();

-- Trigger para Girinhas recebidas
CREATE OR REPLACE FUNCTION notify_girinhas_received()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo IN ('compra', 'bonus', 'missao', 'recebido') THEN
    PERFORM create_notification(
      NEW.user_id,
      'girinhas_recebidas',
      'Girinhas recebidas!',
      'Você recebeu ' || NEW.valor || ' Girinhas - ' || NEW.descricao,
      jsonb_build_object(
        'transacao_id', NEW.id,
        'valor', NEW.valor,
        'tipo', NEW.tipo
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_girinhas_received ON transacoes;
CREATE TRIGGER trigger_notify_girinhas_received
  AFTER INSERT ON transacoes
  FOR EACH ROW EXECUTE FUNCTION notify_girinhas_received();

-- 9. Habilitar realtime para notificações
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- 10. Function para envio em massa (admin)
CREATE OR REPLACE FUNCTION send_admin_notification(
  p_title TEXT,
  p_message TEXT,
  p_target_type VARCHAR(20) DEFAULT 'all',
  p_target_users UUID[] DEFAULT NULL,
  p_action_url VARCHAR(500) DEFAULT NULL,
  p_action_text VARCHAR(100) DEFAULT NULL,
  p_sent_by UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_admin_notification_id UUID;
  v_user_record RECORD;
  v_sent_count INTEGER := 0;
BEGIN
  -- Criar registro de notificação administrativa
  INSERT INTO admin_notifications (
    target_type, target_users, title, message, 
    action_url, action_text, sent_by
  )
  VALUES (
    p_target_type, p_target_users, p_title, p_message,
    p_action_url, p_action_text, p_sent_by
  )
  RETURNING id INTO v_admin_notification_id;
  
  -- Enviar para usuários baseado no tipo
  IF p_target_type = 'all' THEN
    -- Todos os usuários
    FOR v_user_record IN
      SELECT DISTINCT id FROM profiles
    LOOP
      PERFORM create_notification(
        v_user_record.id,
        'sistema',
        p_title,
        p_message,
        jsonb_build_object(
          'admin_notification_id', v_admin_notification_id,
          'action_url', p_action_url,
          'action_text', p_action_text
        )
      );
      v_sent_count := v_sent_count + 1;
    END LOOP;
    
  ELSIF p_target_type = 'active' THEN
    -- Usuários ativos (últimos 30 dias)
    FOR v_user_record IN
      SELECT DISTINCT p.id
      FROM profiles p
      WHERE p.ultima_atividade > now() - interval '30 days'
    LOOP
      PERFORM create_notification(
        v_user_record.id,
        'sistema',
        p_title,
        p_message,
        jsonb_build_object(
          'admin_notification_id', v_admin_notification_id,
          'action_url', p_action_url,
          'action_text', p_action_text
        )
      );
      v_sent_count := v_sent_count + 1;
    END LOOP;
    
  ELSIF p_target_type = 'specific' AND p_target_users IS NOT NULL THEN
    -- Usuários específicos
    FOR v_user_record IN
      SELECT DISTINCT id FROM profiles WHERE id = ANY(p_target_users)
    LOOP
      PERFORM create_notification(
        v_user_record.id,
        'sistema',
        p_title,
        p_message,
        jsonb_build_object(
          'admin_notification_id', v_admin_notification_id,
          'action_url', p_action_url,
          'action_text', p_action_text
        )
      );
      v_sent_count := v_sent_count + 1;
    END LOOP;
  END IF;
  
  -- Atualizar contador
  UPDATE admin_notifications 
  SET sent_count = v_sent_count 
  WHERE id = v_admin_notification_id;
  
  RETURN v_sent_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
