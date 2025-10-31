/*
  # Fix Profile Select RLS Policy

  1. Updates
    - Drop and recreate the "Users can view own profile" policy
    - New policy checks both user_id and id columns to support legacy profiles
  
  2. Security
    - Maintains authentication requirement
    - Users can only see their own profile
*/

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR id = auth.uid());
