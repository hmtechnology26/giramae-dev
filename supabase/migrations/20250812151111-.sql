-- ETAPA 1: ESTRUTURA BASE DO SISTEMA DE MODERAÇÃO
-- ✅ Esta etapa NÃO afeta o funcionamento atual

-- 1.1 Criar tabela de moderação
CREATE TABLE IF NOT EXISTS public.moderacao_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.itens(id) ON DELETE CASCADE,
  moderador_id UUID REFERENCES public.profiles(id),
  status VARCHAR(20) DEFAULT 'pendente' NOT NULL,
  comentario_predefinido VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  moderado_em TIMESTAMP WITH TIME ZONE,
  
  -- Campos de denúncia (quando vier de denúncia)
  denuncia_id UUID REFERENCES public.denuncias(id),
  denuncia_aceita BOOLEAN,
  
  -- Constraints
  UNIQUE(item_id),
  CONSTRAINT moderacao_status_check CHECK (
    status IN ('pendente', 'aprovado', 'rejeitado', 'em_analise')
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_moderacao_status ON public.moderacao_itens(status);
CREATE INDEX IF NOT EXISTS idx_moderacao_pendente_data ON public.moderacao_itens(created_at) 
  WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS idx_moderacao_denuncia ON public.moderacao_itens(denuncia_id) 
  WHERE denuncia_id IS NOT NULL;

-- 1.2 Popular tabela com dados existentes (todos como 'aprovado')
INSERT INTO public.moderacao_itens (item_id, status, moderado_em, observacoes)
SELECT 
  id,
  'aprovado',
  created_at,
  'Aprovado automaticamente - item pré-existente'
FROM public.itens 
WHERE status IN ('disponivel', 'reservado')
ON CONFLICT (item_id) DO NOTHING;

-- 1.3 Trigger para novos itens
CREATE OR REPLACE FUNCTION public.criar_registro_moderacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Só criar para itens que vão para 'disponivel'
  IF NEW.status = 'disponivel' THEN
    INSERT INTO public.moderacao_itens (item_id, status)
    VALUES (NEW.id, 'pendente')
    ON CONFLICT (item_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_criar_moderacao ON public.itens;
CREATE TRIGGER trigger_criar_moderacao
  AFTER INSERT ON public.itens
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_registro_moderacao();

-- RLS Policies para moderacao_itens
ALTER TABLE public.moderacao_itens ENABLE ROW LEVEL SECURITY;

-- Admins podem ver tudo
CREATE POLICY "Admins podem gerenciar moderação" ON public.moderacao_itens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem ver status dos próprios itens
CREATE POLICY "Usuários podem ver moderação dos próprios itens" ON public.moderacao_itens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.itens 
      WHERE itens.id = moderacao_itens.item_id 
      AND itens.publicado_por = auth.uid()
    )
  );