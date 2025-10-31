/*
  # Fix Profile Insert Policy

  1. Changes
    - Drop existing INSERT policy that causes RLS violations
    - Create new policy that allows users to insert their own profile during signup
    - Uses auth.uid() directly in WITH CHECK since it's evaluated once during INSERT
    
  2. Security
    - Users can only insert profiles with their own user_id
    - No security compromise, just fixes the signup flow
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new insert policy that works during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));