
-- 1. Criar registro para o usuário atual que está faltando
INSERT INTO user_notification_preferences (
  user_id,
  mensagens,
  reservas,
  girinhas,
  sistema,
  push_enabled
) VALUES (
  'c4dd0129-061d-4eac-b84b-264a01f526e1',
  true,
  true,
  true,
  true,
  false
) ON CONFLICT (user_id) DO NOTHING;

-- 2. Criar função trigger para automaticamente criar preferências para novos usuários
CREATE OR REPLACE FUNCTION create_user_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notification_preferences (
    user_id,
    mensagens,
    reservas,
    girinhas,
    sistema,
    push_enabled
  ) VALUES (
    NEW.id,
    true,
    true,
    true,
    true,
    false
  ) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger para executar a função quando um novo profile é criado
DROP TRIGGER IF EXISTS trigger_create_notification_preferences ON profiles;
CREATE TRIGGER trigger_create_notification_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_notification_preferences();

-- 4. Criar registros para todos os usuários existentes que não têm preferências
INSERT INTO user_notification_preferences (
  user_id,
  mensagens,
  reservas,
  girinhas,
  sistema,
  push_enabled
)
SELECT 
  p.id,
  true,
  true,
  true,
  true,
  false
FROM profiles p
LEFT JOIN user_notification_preferences unp ON unp.user_id = p.id
WHERE unp.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
