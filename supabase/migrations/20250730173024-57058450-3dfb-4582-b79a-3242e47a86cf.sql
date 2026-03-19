-- Criar bucket de avatares se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket avatars
-- Permitir que todos vejam avatares (público)
CREATE POLICY "Avatars são públicos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- Permitir que usuários autenticados façam upload de seus próprios avatares
CREATE POLICY "Usuários podem fazer upload de avatares" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus avatares" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários deletem seus próprios avatares
CREATE POLICY "Usuários podem deletar seus avatares" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);