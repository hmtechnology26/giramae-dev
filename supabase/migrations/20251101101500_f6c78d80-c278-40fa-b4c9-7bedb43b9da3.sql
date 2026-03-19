-- Tabela para rastrear conexões e verificações Instagram
CREATE TABLE IF NOT EXISTS public.user_instagram_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_username TEXT,
  instagram_user_id TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'connected', 'verified', 'rejected')),
  connection_proof_url TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(instagram_username)
);

-- Índices para performance
CREATE INDEX idx_user_instagram_verifications_user_id ON public.user_instagram_verifications(user_id);
CREATE INDEX idx_user_instagram_verifications_status ON public.user_instagram_verifications(verification_status);
CREATE INDEX idx_user_instagram_verifications_instagram_username ON public.user_instagram_verifications(instagram_username);

-- Habilitar RLS
ALTER TABLE public.user_instagram_verifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas próprias verificações"
  ON public.user_instagram_verifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem inserir suas próprias verificações"
  ON public.user_instagram_verifications
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas próprias verificações"
  ON public.user_instagram_verifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins podem ver todas as verificações"
  ON public.user_instagram_verifications
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
  ));

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_instagram_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_instagram_verifications_updated_at
  BEFORE UPDATE ON public.user_instagram_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_instagram_verifications_updated_at();

-- Inserir missão de Instagram
INSERT INTO public.missoes (
  titulo,
  descricao,
  tipo_missao,
  categoria,
  icone,
  recompensa_girinhas,
  validade_recompensa_meses,
  limite_por_usuario,
  condicoes,
  ativo,
  criterios_segmentacao,
  acoes_eventos
) VALUES (
  '📷 Conecte seu Instagram e Marque @giramaeoficial',
  'Siga nosso perfil @giramaeoficial no Instagram, publique uma story ou post nos marcando e ganhe Girinhas! A verificação é automática.',
  'social',
  'engajamento',
  'instagram',
  50,
  12,
  1,
  jsonb_build_object(
    'tipo', 'instagram_follow_and_mention',
    'quantidade', 1,
    'verificacao', 'automatica',
    'steps', jsonb_build_array(
      'conectar_instagram',
      'seguir_giramaeoficial',
      'mencionar_story'
    )
  ),
  true,
  '{}'::jsonb,
  jsonb_build_array(
    jsonb_build_object(
      'id', '1',
      'tipo_evento', 'external_link',
      'ordem', 1,
      'parametros', jsonb_build_object(
        'url', 'https://instagram.com/giramaeoficial',
        'titulo', '1. Siga @giramaeoficial',
        'mensagem', 'Primeiro, siga nosso perfil no Instagram'
      )
    ),
    jsonb_build_object(
      'id', '2',
      'tipo_evento', 'trigger_notification',
      'ordem', 2,
      'parametros', jsonb_build_object(
        'titulo', '2. Marque-nos em uma Story!',
        'mensagem', 'Publique uma story mencionando @giramaeoficial para ganhar suas Girinhas'
      )
    )
  )
)
ON CONFLICT DO NOTHING;

-- Função para verificar e completar missão Instagram automaticamente
CREATE OR REPLACE FUNCTION verificar_e_completar_missao_instagram()
RETURNS TRIGGER AS $$
DECLARE
  v_missao_id UUID;
  v_missao_usuario_id UUID;
  v_progresso_necessario INTEGER;
BEGIN
  IF NEW.verification_status = 'verified' AND OLD.verification_status != 'verified' THEN
    
    SELECT id INTO v_missao_id
    FROM public.missoes
    WHERE titulo ILIKE '%Instagram%'
      AND tipo_missao = 'social'
      AND ativo = true
    LIMIT 1;
    
    IF v_missao_id IS NULL THEN
      RAISE NOTICE 'Missão do Instagram não encontrada';
      RETURN NEW;
    END IF;
    
    SELECT id, progresso_necessario INTO v_missao_usuario_id, v_progresso_necessario
    FROM public.missoes_usuarios
    WHERE user_id = NEW.user_id
      AND missao_id = v_missao_id;
    
    IF v_missao_usuario_id IS NULL THEN
      INSERT INTO public.missoes_usuarios (
        user_id,
        missao_id,
        progresso_atual,
        progresso_necessario,
        status,
        data_inicio,
        data_completada
      ) VALUES (
        NEW.user_id,
        v_missao_id,
        1,
        1,
        'completa',
        NOW(),
        NOW()
      ) RETURNING id INTO v_missao_usuario_id;
      
      RAISE NOTICE 'Missão Instagram criada e completada para user_id: %', NEW.user_id;
    ELSE
      UPDATE public.missoes_usuarios
      SET 
        progresso_atual = 1,
        status = 'completa',
        data_completada = NOW()
      WHERE id = v_missao_usuario_id;
      
      RAISE NOTICE 'Missão Instagram completada para user_id: %', NEW.user_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para completar missão automaticamente quando verificado
CREATE TRIGGER trigger_completar_missao_instagram
  AFTER UPDATE ON public.user_instagram_verifications
  FOR EACH ROW
  WHEN (NEW.verification_status = 'verified' AND OLD.verification_status IS DISTINCT FROM 'verified')
  EXECUTE FUNCTION verificar_e_completar_missao_instagram();

COMMENT ON TABLE public.user_instagram_verifications IS 'Rastreia conexões e verificações de Instagram para missões automatizadas';
COMMENT ON COLUMN public.user_instagram_verifications.verification_status IS 'pending: aguardando, connected: conectado mas não verificado, verified: menção confirmada, rejected: rejeitado';