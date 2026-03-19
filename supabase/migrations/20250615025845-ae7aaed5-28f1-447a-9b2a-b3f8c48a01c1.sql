
-- Atualizar função handle_new_user para dar Girinhas iniciais (sem deletar)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    nome, 
    avatar_url, 
    saldo_girinhas,
    reputacao
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    50.00, -- Girinhas iniciais para novos usuários
    0 -- Reputação inicial
  );
  RETURN NEW;
END;
$$;

-- Adicionar campos faltantes na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS profissao TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS interesses TEXT[], -- Array de strings para interesses
ADD COLUMN IF NOT EXISTS ponto_retirada_preferido TEXT,
ADD COLUMN IF NOT EXISTS aceita_entrega_domicilio BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS raio_entrega_km INTEGER DEFAULT 5;

-- Criar tabela para informações dos filhos
CREATE TABLE IF NOT EXISTS public.filhos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mae_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  sexo TEXT CHECK (sexo IN ('masculino', 'feminino', 'outro')),
  tamanho_roupas TEXT,
  tamanho_calcados TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela filhos
ALTER TABLE public.filhos ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela profiles se ainda não estiver habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verificar e criar políticas apenas se não existirem
DO $$
BEGIN
    -- Políticas para tabela filhos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem ver seus próprios filhos' AND tablename = 'filhos') THEN
        CREATE POLICY "Usuários podem ver seus próprios filhos" 
        ON public.filhos 
        FOR SELECT 
        USING (mae_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem inserir seus próprios filhos' AND tablename = 'filhos') THEN
        CREATE POLICY "Usuários podem inserir seus próprios filhos" 
        ON public.filhos 
        FOR INSERT 
        WITH CHECK (mae_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem atualizar seus próprios filhos' AND tablename = 'filhos') THEN
        CREATE POLICY "Usuários podem atualizar seus próprios filhos" 
        ON public.filhos 
        FOR UPDATE 
        USING (mae_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem deletar seus próprios filhos' AND tablename = 'filhos') THEN
        CREATE POLICY "Usuários podem deletar seus próprios filhos" 
        ON public.filhos 
        FOR DELETE 
        USING (mae_id = auth.uid());
    END IF;
    
    -- Políticas para tabela profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem ver todos os perfis' AND tablename = 'profiles') THEN
        CREATE POLICY "Usuários podem ver todos os perfis" 
        ON public.profiles 
        FOR SELECT 
        TO authenticated
        USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem atualizar seu próprio perfil' AND tablename = 'profiles') THEN
        CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
        ON public.profiles 
        FOR UPDATE 
        USING (id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem inserir seu próprio perfil' AND tablename = 'profiles') THEN
        CREATE POLICY "Usuários podem inserir seu próprio perfil" 
        ON public.profiles 
        FOR INSERT 
        WITH CHECK (id = auth.uid());
    END IF;
END
$$;
