-- Create Storage bucket for partnership documents and secure RLS policies
-- 1) Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-parcerias', 'documentos-parcerias', false)
ON CONFLICT (id) DO NOTHING;

-- 2) Policies for storage.objects (bucket-scoped)
-- Allow authenticated users to upload files into their own user folder: {user_id}/...
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'upload_own_parceria_docs'
  ) THEN
    CREATE POLICY "upload_own_parceria_docs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'documentos-parcerias'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END$$;

-- Allow users to read their own documents in this bucket; admins can read all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'read_parceria_docs_own_or_admin'
  ) THEN
    CREATE POLICY "read_parceria_docs_own_or_admin"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'documentos-parcerias'
      AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR EXISTS (
          SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
        )
      )
    );
  END IF;
END$$;

-- Allow users to update their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'update_own_parceria_docs'
  ) THEN
    CREATE POLICY "update_own_parceria_docs"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'documentos-parcerias'
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'documentos-parcerias'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END$$;

-- Allow users to delete their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'delete_own_parceria_docs'
  ) THEN
    CREATE POLICY "delete_own_parceria_docs"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'documentos-parcerias'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END$$;

-- Optional: Admins can manage (insert/update/delete) in this bucket if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'admin_manage_parceria_docs'
  ) THEN
    CREATE POLICY "admin_manage_parceria_docs"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
      bucket_id = 'documentos-parcerias' AND EXISTS (
        SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
      )
    )
    WITH CHECK (
      bucket_id = 'documentos-parcerias' AND EXISTS (
        SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
      )
    );
  END IF;
END$$;