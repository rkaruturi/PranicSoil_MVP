/*
  # Add Admin User Management Capabilities

  1. Changes
    - Create a function to check if a user is an admin
    - Add RLS policy for admins to view all profiles
    - Add RLS policy for admins to delete any profile
    - Add RLS policy for admins to update any profile
  
  2. Security
    - Only users with role='admin' can manage other users
    - Admins can view, update, and delete any profile
    - Regular users maintain their existing restricted access
*/

-- Create a helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for admins to view all profiles (already exists but let's ensure it works)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add policy for admins to delete any profile
CREATE POLICY "Admins can delete any profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (is_admin());
