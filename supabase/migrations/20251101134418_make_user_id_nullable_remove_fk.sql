/*
  # Make user_id Nullable and Remove Foreign Key Constraint

  1. Problem
    - Foreign key constraint profiles_user_id_fkey causes issues during user creation
    - The constraint tries to validate user_id against auth.users during trigger execution
    - This creates a timing/transaction issue
    
  2. Solution
    - Remove the foreign key constraint
    - Make user_id nullable
    - Keep user_id for backward compatibility with existing policies
    - The trigger will still set it, but without the problematic FK constraint
    
  3. Benefits
    - Eliminates foreign key timing issues during registration
    - Maintains compatibility with existing RLS policies
    - Allows trigger to complete successfully
*/

-- Drop the foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Make user_id nullable (it may already be, but ensure it)
ALTER TABLE profiles ALTER COLUMN user_id DROP NOT NULL;
