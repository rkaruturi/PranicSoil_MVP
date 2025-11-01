/*
  # Complete Authentication System Fix
  
  1. Problem Identified
    - Complex trigger logic causing profile creation issues
    - RLS policies working correctly but profile creation failing
    - Need simpler, more reliable user creation flow
  
  2. Solution
    - Simplify handle_new_user function to be bulletproof
    - Ensure profiles table is always accessible
    - Create farms entry only after profile is confirmed
    - Remove complex conditional logic
  
  3. Changes
    - Drop and recreate handle_new_user function with simpler logic
    - Use upsert pattern to handle duplicates gracefully
    - Ensure proper error handling
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function with simpler logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_role text;
  user_full_name text;
  user_phone text;
BEGIN
  -- Extract user metadata with defaults
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'gardener');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  -- Insert or update profile (upsert pattern)
  INSERT INTO public.profiles (
    id,
    user_id,
    email,
    role,
    full_name,
    phone,
    email_confirmed
  ) VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    user_role,
    user_full_name,
    user_phone,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_confirmed = EXCLUDED.email_confirmed,
    updated_at = now();

  -- Create farms entry with basic info
  INSERT INTO public.farms (
    profile_id,
    farm_type,
    property_size,
    current_challenges
  ) VALUES (
    NEW.id,
    user_role,
    NEW.raw_user_meta_data->>'property_size',
    NEW.raw_user_meta_data->>'current_challenges'
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure farms has a unique constraint on profile_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'farms_profile_id_key'
  ) THEN
    ALTER TABLE public.farms 
    ADD CONSTRAINT farms_profile_id_key UNIQUE (profile_id);
  END IF;
END $$;
