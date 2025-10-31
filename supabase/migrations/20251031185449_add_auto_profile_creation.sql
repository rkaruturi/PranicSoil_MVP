/*
  # Add Automatic Profile Creation on Email Confirmation

  1. New Functions
    - `handle_new_user()` - Automatically creates a profile when user confirms email
    
  2. Changes
    - Creates a trigger on auth.users that fires after INSERT or UPDATE
    - Extracts user metadata (role, full_name) from signup
    - Creates profile record automatically
    - Prevents duplicate profile creation
    
  3. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only creates profile if it doesn't exist
    - Uses user metadata from signup form
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
  user_full_name text;
BEGIN
  -- Only proceed if email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    -- Check if profile already exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
      -- Extract metadata from auth.users
      user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'gardener');
      user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
      
      -- Insert profile
      INSERT INTO public.profiles (
        id,
        user_id,
        email,
        role,
        full_name
      ) VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        user_role::public.user_role,
        user_full_name
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();