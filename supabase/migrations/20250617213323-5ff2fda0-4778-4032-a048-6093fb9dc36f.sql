
-- Verificar se já existem usernames preenchidos, se não, gerar automático
DO $$
DECLARE
    profile_record RECORD;
    base_username TEXT;
    final_username TEXT;
    counter INTEGER;
BEGIN
    FOR profile_record IN SELECT id, nome FROM public.profiles WHERE username IS NULL OR username = ''
    LOOP
        -- Criar username base a partir do nome (apenas letras e números, minúsculo)
        base_username := LOWER(REGEXP_REPLACE(COALESCE(profile_record.nome, 'user'), '[^a-zA-Z0-9]', '', 'g'));
        
        -- Limitar a 15 caracteres
        base_username := LEFT(base_username, 15);
        
        -- Se ficou vazio, usar 'user'
        IF LENGTH(base_username) = 0 THEN
            base_username := 'user';
        END IF;
        
        -- Tentar o username base primeiro
        final_username := base_username;
        counter := 1;
        
        -- Se já existe, adicionar número até encontrar um disponível
        WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
            final_username := base_username || counter::TEXT;
            counter := counter + 1;
        END LOOP;
        
        -- Atualizar o perfil com o username gerado
        UPDATE public.profiles 
        SET username = final_username 
        WHERE id = profile_record.id;
    END LOOP;
END $$;

-- Modificar tabela conversas para permitir reserva_id opcional (conversas livres)
ALTER TABLE public.conversas 
ALTER COLUMN reserva_id DROP NOT NULL;

-- Adicionar constraint única para evitar conversas duplicadas entre os mesmos usuários (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_users_conversation' 
        AND table_name = 'conversas'
    ) THEN
        ALTER TABLE public.conversas 
        ADD CONSTRAINT unique_users_conversation 
        UNIQUE (usuario1_id, usuario2_id);
    END IF;
END $$;

-- Adicionar tabela para rastrear menções em mensagens (se não existir)
CREATE TABLE IF NOT EXISTS public.mencoes_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID NOT NULL REFERENCES public.mensagens(id) ON DELETE CASCADE,
  usuario_mencionado_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mencoes_usuario') THEN
        CREATE INDEX idx_mencoes_usuario ON public.mencoes_mensagens(usuario_mencionado_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mencoes_mensagem') THEN
        CREATE INDEX idx_mencoes_mensagem ON public.mencoes_mensagens(mensagem_id);
    END IF;
END $$;

-- RLS para menções
ALTER TABLE public.mencoes_mensagens ENABLE ROW LEVEL SECURITY;

-- Criar policy para menções (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can view mentions they are part of' 
        AND tablename = 'mencoes_mensagens'
    ) THEN
        CREATE POLICY "Users can view mentions they are part of"
        ON public.mencoes_mensagens
        FOR SELECT
        USING (
          usuario_mencionado_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.mensagens m 
            JOIN public.conversas c ON m.conversa_id = c.id
            WHERE m.id = mensagem_id 
            AND (c.usuario1_id = auth.uid() OR c.usuario2_id = auth.uid())
          )
        );
    END IF;
END $$;
