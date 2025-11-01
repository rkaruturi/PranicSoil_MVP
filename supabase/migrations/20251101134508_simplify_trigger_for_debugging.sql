/*
  # Simplify Trigger for Debugging

  1. Changes
    - Simplify handle_new_user to only create profile first
    - Skip farms creation temporarily to isolate the issue
    - Add explicit logging
    
  2. Goal
    - Identify if the issue is with profile creation or farm creation
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  RAISE LOG 'handle_new_user: Starting for user %', NEW.email;
  
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'gardener');
  
  RAISE LOG 'handle_new_user: Creating profile for % with role %', NEW.email, user_role;
  
  INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name,
    phone
  ) VALUES (
    NEW.id,
    NEW.email,
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  RAISE LOG 'handle_new_user: Profile created successfully';
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user ERROR for %: % (SQLSTATE: %)', NEW.email, SQLERRM, SQLSTATE;
    RAISE;
END;
$$;
