/*
  # Fix Profile Update RLS Policy

  1. Updates
    - Drop and recreate the "Users can update own profile" policy
    - New policy checks both user_id and id columns to support legacy profiles
  
  2. Security
    - Maintains authentication requirement
    - Users can only update their own profile
*/

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR id = auth.uid());
