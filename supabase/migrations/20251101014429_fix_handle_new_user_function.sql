/*
  # Fix handle_new_user Function
  
  1. Changes
    - Remove incorrect type cast for role (should be text, not user_role type)
    - This allows the function to work correctly when creating new users
*/

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
  IF NEW.email_confirmed_at IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
      user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'gardener');
      user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
      
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
        user_role,
        user_full_name
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;