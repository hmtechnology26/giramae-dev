
-- Remover política existente e criar nova
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar configurações" ON config_sistema;

-- Permitir que usuários autenticados possam inserir/atualizar configurações
CREATE POLICY "Usuários autenticados podem gerenciar configurações" ON config_sistema 
  FOR ALL USING (auth.uid() IS NOT NULL);
