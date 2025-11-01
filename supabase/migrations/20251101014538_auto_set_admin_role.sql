/*
  # Auto-Set Admin Role for admin@pranicsoil.com
  
  1. Changes
    - Add a trigger that automatically sets role to 'admin' for admin@pranicsoil.com
    - This ensures that when the admin registers, they get admin privileges immediately
  
  2. Security
    - Only affects the specific admin email address
    - Cannot be exploited by other users
*/

-- Create function to auto-set admin role
CREATE OR REPLACE FUNCTION public.auto_set_admin_role()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  -- If the email is the admin email, set role to admin
  IF NEW.email = 'admin@pranicsoil.com' THEN
    NEW.role := 'admin';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that runs before insert or update
DROP TRIGGER IF EXISTS set_admin_role_trigger ON public.profiles;

CREATE TRIGGER set_admin_role_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_admin_role();