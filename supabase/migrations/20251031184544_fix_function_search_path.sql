/*
  # Fix Function Search Path

  1. Changes
    - Drop and recreate update_updated_at_column function with secure search_path
    - Set search_path to empty to prevent SQL injection vulnerabilities
    
  2. Security
    - Makes function immune to search_path attacks
    - Uses fully qualified table references
*/

-- Drop existing function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Recreate with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for all tables that use this function
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gardener_profiles_updated_at ON gardener_profiles;
CREATE TRIGGER update_gardener_profiles_updated_at
  BEFORE UPDATE ON gardener_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_farmer_profiles_updated_at ON farmer_profiles;
CREATE TRIGGER update_farmer_profiles_updated_at
  BEFORE UPDATE ON farmer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rancher_profiles_updated_at ON rancher_profiles;
CREATE TRIGGER update_rancher_profiles_updated_at
  BEFORE UPDATE ON rancher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_agreements_updated_at ON service_agreements;
CREATE TRIGGER update_service_agreements_updated_at
  BEFORE UPDATE ON service_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shared_todos_updated_at ON shared_todos;
CREATE TRIGGER update_shared_todos_updated_at
  BEFORE UPDATE ON shared_todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();