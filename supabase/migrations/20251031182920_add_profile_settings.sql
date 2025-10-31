/*
  # Add Profile Settings

  1. Changes
    - Add `avatar_url` column to profiles table for profile pictures
    - Add `notifications_enabled` column to profiles table for notification preferences
    
  2. Security
    - No RLS changes needed as profiles table already has proper RLS policies
*/

-- Add avatar_url column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Add notifications_enabled column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'notifications_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notifications_enabled boolean DEFAULT true;
  END IF;
END $$;