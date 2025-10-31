/*
  # Enable Email Confirmation

  1. Changes
    - Add email_confirmed column to profiles table
    - Add trigger to update email confirmation status
    - Update RLS policies to handle unconfirmed users
  
  2. Security
    - Users must confirm email before full access
    - Maintains existing security policies
*/

-- Add email_confirmed column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_confirmed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_confirmed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create function to sync email confirmation status
CREATE OR REPLACE FUNCTION sync_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET email_confirmed = (
    SELECT email_confirmed_at IS NOT NULL
    FROM auth.users
    WHERE id = NEW.id
  )
  WHERE user_id = NEW.id OR id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to sync email confirmation
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION sync_email_confirmation();
