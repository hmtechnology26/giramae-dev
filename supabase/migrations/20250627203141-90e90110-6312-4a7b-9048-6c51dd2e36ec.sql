
-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sobrenome text,
ADD COLUMN IF NOT EXISTS data_nascimento date;

-- Add unique constraint to cadastro_temp_data if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_user_step' 
        AND table_name = 'cadastro_temp_data'
    ) THEN
        ALTER TABLE cadastro_temp_data 
        ADD CONSTRAINT unique_user_step UNIQUE (user_id, step);
    END IF;
END $$;

-- Create the RPC functions for step data management
CREATE OR REPLACE FUNCTION save_step_data(p_step text, p_data jsonb)
RETURNS void AS $$
BEGIN
    INSERT INTO cadastro_temp_data (user_id, step, form_data)
    VALUES (auth.uid(), p_step, p_data)
    ON CONFLICT (user_id, step)
    DO UPDATE SET 
        form_data = EXCLUDED.form_data,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_step_data(p_step text)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT form_data INTO result
    FROM cadastro_temp_data
    WHERE user_id = auth.uid() AND step = p_step;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing verify_phone_code functions to avoid conflicts
DROP FUNCTION IF EXISTS verify_phone_code(character varying);
DROP FUNCTION IF EXISTS verify_phone_code(text);

-- Create the phone verification function
CREATE OR REPLACE FUNCTION verify_phone_code(p_code text)
RETURNS boolean AS $$
DECLARE
    stored_code text;
    code_expires timestamp with time zone;
    current_user_id uuid;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get stored verification code and expiration
    SELECT verification_code, verification_code_expires
    INTO stored_code, code_expires
    FROM profiles
    WHERE id = current_user_id;
    
    -- Check if code exists and hasn't expired
    IF stored_code IS NULL OR code_expires IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if code has expired
    IF code_expires < now() THEN
        RETURN false;
    END IF;
    
    -- Check if code matches
    IF stored_code = p_code THEN
        -- Mark phone as verified and clear verification code
        UPDATE profiles
        SET 
            telefone_verificado = true,
            verification_code = NULL,
            verification_code_expires = NULL,
            cadastro_step = 'personal'
        WHERE id = current_user_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
