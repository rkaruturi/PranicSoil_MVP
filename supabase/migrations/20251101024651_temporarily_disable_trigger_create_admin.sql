/*
  # Temporarily Disable Trigger and Create Admin
  
  1. Changes
    - Drop the trigger temporarily
    - Create admin user directly in auth and profiles
    - Recreate the trigger
*/

-- Drop the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create admin user directly
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin already exists in auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'rskaruturi@gmail.com';
  
  IF admin_user_id IS NULL THEN
    -- Generate a new UUID for the admin
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'rskaruturi@gmail.com',
      crypt('Admin@PranicSoil2024', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Ravi Karuturi","role":"admin"}',
      false,
      'authenticated',
      'authenticated'
    );
  END IF;
  
  -- Create profile if not exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'rskaruturi@gmail.com') THEN
    INSERT INTO public.profiles (
      id,
      user_id,
      email,
      role,
      full_name,
      email_confirmed
    ) VALUES (
      admin_user_id,
      admin_user_id,
      'rskaruturi@gmail.com',
      'admin',
      'Ravi Karuturi',
      true
    );
  END IF;
END $$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
