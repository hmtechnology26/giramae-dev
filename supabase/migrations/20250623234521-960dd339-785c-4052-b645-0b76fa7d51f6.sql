
-- 1. Verificar e ajustar tabela de preferências existente
DO $$
BEGIN
    -- Se a tabela não existir, criar
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_notification_preferences') THEN
        CREATE TABLE user_notification_preferences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            mensagens BOOLEAN DEFAULT true,
            reservas BOOLEAN DEFAULT true,
            girinhas BOOLEAN DEFAULT true,
            sistema BOOLEAN DEFAULT true,
            push_enabled BOOLEAN DEFAULT false,
            push_subscription JSONB,
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(user_id)
        );
    ELSE
        -- Se existir, adicionar colunas que faltam
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notification_preferences' AND column_name = 'mensagens') THEN
            ALTER TABLE user_notification_preferences ADD COLUMN mensagens BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notification_preferences' AND column_name = 'reservas') THEN
            ALTER TABLE user_notification_preferences ADD COLUMN reservas BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notification_preferences' AND column_name = 'girinhas') THEN
            ALTER TABLE user_notification_preferences ADD COLUMN girinhas BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notification_preferences' AND column_name = 'sistema') THEN
            ALTER TABLE user_notification_preferences ADD COLUMN sistema BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notification_preferences' AND column_name = 'push_enabled') THEN
            ALTER TABLE user_notification_preferences ADD COLUMN push_enabled BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notification_preferences' AND column_name = 'push_subscription') THEN
            ALTER TABLE user_notification_preferences ADD COLUMN push_subscription JSONB;
        END IF;
    END IF;
END
$$;

-- 2. Criar tabela de notificações se não existir
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
      'girinhas_recebidas', 'missao_completada', 'sistema'
    )
  )
);

-- 3. Criar tabela de notificações administrativas se não existir
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

-- 4. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 5. Habilitar RLS
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- 6. Criar policies se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_notification_preferences' AND policyname = 'Users can view own preferences') THEN
        CREATE POLICY "Users can view own preferences" ON user_notification_preferences
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_notification_preferences' AND policyname = 'Users can update own preferences') THEN
        CREATE POLICY "Users can update own preferences" ON user_notification_preferences
          FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications') THEN
        CREATE POLICY "Users can view own notifications" ON notifications
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications') THEN
        CREATE POLICY "Users can update own notifications" ON notifications
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_notifications' AND policyname = 'Only admins can manage admin notifications') THEN
        CREATE POLICY "Only admins can manage admin notifications" ON admin_notifications
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() AND (dados_segmentacao->>'role' = 'admin' OR id = auth.uid())
            )
          );
    END IF;
END
$$;

-- 7. Functions e triggers
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
    WHEN 'sistema' THEN
      IF NOT v_preferences.sistema THEN RETURN NULL; END IF;
  END CASE;
  
  -- Criar notificação
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
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

-- 8. Habilitar realtime
ALTER TABLE notifications REPLICA IDENTITY FULL;
