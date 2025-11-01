/*
  # Create Admin Account
  
  1. Description
    - Creates an admin user account for system administration
    - Email: admin@pranicsoil.com
    - Password: Admin@PranicSoil2024
  
  2. Security
    - Admin role already configured in profiles table
    - RLS policies allow admin full access to all customer data
*/

-- Insert admin profile (the trigger will auto-create from auth.users)
-- First we need to check if admin exists in auth schema
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@pranicsoil.com';

  -- If admin doesn't exist, we'll create a profile entry
  -- Note: In production, you'll need to create the auth.users entry through Supabase Auth
  IF admin_user_id IS NULL THEN
    -- Create a placeholder profile that will be linked when admin signs up
    INSERT INTO profiles (email, role, full_name, notifications_enabled, email_confirmed)
    VALUES ('admin@pranicsoil.com', 'admin', 'System Administrator', true, true)
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;