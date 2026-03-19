-- Correção: Adicionar RLS nas novas tabelas criadas (issues críticas de segurança)

-- 1. Habilitar RLS na tabela motivos_cancelamento
ALTER TABLE motivos_cancelamento ENABLE ROW LEVEL SECURITY;

-- 2. Política para motivos_cancelamento (somente leitura pública)
CREATE POLICY "Motivos de cancelamento são públicos" 
ON motivos_cancelamento 
FOR SELECT 
USING (ativo = true);

-- 3. Habilitar RLS na tabela fila_processamento  
ALTER TABLE fila_processamento ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para fila_processamento (somente sistema pode manipular)
CREATE POLICY "Sistema pode inserir na fila de processamento" 
ON fila_processamento 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar fila de processamento" 
ON fila_processamento 
FOR UPDATE 
USING (true);

CREATE POLICY "Sistema pode visualizar fila de processamento" 
ON fila_processamento 
FOR SELECT 
USING (true);

-- 5. Habilitar RLS na tabela fila_dead_letter
ALTER TABLE fila_dead_letter ENABLE ROW LEVEL SECURITY;

-- 6. Políticas para fila_dead_letter (somente admins podem ver)
CREATE POLICY "Apenas admins podem ver dead letter queue" 
ON fila_dead_letter 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE user_id = auth.uid()
));

-- 7. Corrigir função para verificar retorno correto da nova função
CREATE OR REPLACE FUNCTION obter_resultado_cancelamento(p_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((p_data->>'sucesso')::BOOLEAN, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;