
-- Primeiro, remover a policy que depende da coluna is_admin
DROP POLICY IF EXISTS "Apenas admins podem ver logs" ON admin_actions;

-- Remover a coluna is_admin da tabela profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS is_admin;

-- Criar tabela separada para administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  created_by text, -- Para auditoria manual
  notes text, -- Para anotações sobre o admin
  UNIQUE(user_id)
);

-- Sem RLS - apenas acesso direto via banco de dados
-- Não habilitar RLS propositalmente para maior segurança

-- Criar função para verificar se usuário é admin (versão atualizada)
CREATE OR REPLACE FUNCTION verificar_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado: permissões de admin necessárias';
  END IF;
  RETURN true;
END;
$$;

-- Recriar a policy da tabela admin_actions para usar a nova estrutura
CREATE POLICY "Apenas admins podem ver logs" ON admin_actions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Comentário de segurança
COMMENT ON TABLE admin_users IS 'Tabela de administradores - SEM RLS por segurança. Modificações apenas via SQL direto.';
