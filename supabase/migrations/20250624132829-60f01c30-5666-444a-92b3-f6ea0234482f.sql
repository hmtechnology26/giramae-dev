
-- 1. Corrigir RLS policies - primeiro dropar todas as existentes
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow notification creation" ON notifications;

-- Recriar policies corretas
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow notification creation" ON notifications
  FOR INSERT WITH CHECK (true);

-- 2. Habilitar realtime para notifications
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- 3. Inserir notificações de teste para o usuário atual
INSERT INTO notifications (user_id, type, title, message, data, read)
VALUES 
  ('c4dd0129-061d-4eac-b84b-264a01f526e1', 'sistema', 'Bem-vinda ao GiraMãe!', 'Seu sistema de notificações está funcionando perfeitamente.', '{}', false),
  ('c4dd0129-061d-4eac-b84b-264a01f526e1', 'girinhas_recebidas', 'Girinhas de boas-vindas', 'Você recebeu 10 Girinhas de boas-vindas!', '{"valor": 10}', false),
  ('c4dd0129-061d-4eac-b84b-264a01f526e1', 'sistema', 'Dica importante', 'Complete seu perfil para melhorar suas trocas.', '{"action_url": "/perfil/editar"}', false)
ON CONFLICT DO NOTHING;
