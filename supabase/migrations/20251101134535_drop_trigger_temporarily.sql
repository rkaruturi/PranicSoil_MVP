/*
  # Temporarily Drop Trigger to Test Registration

  1. Changes
    - Drop the trigger that's causing registration to fail
    - We'll handle profile/farm creation client-side instead
    
  2. Goal
    - Allow user registration to succeed
    - Then manually create profile and farm records
*/

-- Drop the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Keep the function for now but it won't be called
