
-- Remover políticas existentes primeiro
DROP POLICY IF EXISTS "Usuários podem ver filas de espera" ON public.fila_espera;
DROP POLICY IF EXISTS "Usuários podem entrar em filas" ON public.fila_espera;
DROP POLICY IF EXISTS "Usuários podem sair de suas filas" ON public.fila_espera;

-- Recriar as políticas RLS para fila_espera
CREATE POLICY "Usuários podem ver filas de espera" 
ON public.fila_espera 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Usuários podem entrar em filas" 
ON public.fila_espera 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem sair de suas filas" 
ON public.fila_espera 
FOR DELETE 
TO authenticated
USING (auth.uid() = usuario_id);
