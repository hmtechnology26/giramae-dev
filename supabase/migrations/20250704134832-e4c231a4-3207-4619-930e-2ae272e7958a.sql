
-- Adicionar campo is_admin na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Criar função para verificar admin
CREATE OR REPLACE FUNCTION verificar_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissões de admin necessárias';
  END IF;
  RETURN true;
END;
$$;

-- Criar tabela de auditoria básica para logs admin
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS na tabela admin_actions
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Policy para que apenas admins vejam logs
CREATE POLICY "Apenas admins podem ver logs" ON admin_actions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_admin_actions_user_created ON admin_actions(user_id, created_at DESC);
