/*
  # Fix Email Confirmation Trigger Issue

  1. Problem
    - The sync_email_confirmation trigger tries to UPDATE profiles during user creation
    - But profile doesn't exist yet, causing "Database error updating user"
    
  2. Solution
    - Drop the problematic trigger
    - We'll handle email confirmation status in the profile creation trigger instead
*/

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS sync_email_confirmation();
