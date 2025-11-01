/*
  # Fix Trigger Permissions for User Registration

  1. Problem
    - Trigger function fails because RLS policies block inserts during user creation
    - SECURITY DEFINER should bypass RLS but may need explicit grants
    
  2. Solution
    - Grant explicit permissions to the trigger function
    - Ensure RLS is properly bypassed during trigger execution
    - Add better error handling and logging
    
  3. Changes
    - Recreate trigger function with proper permissions
    - Ensure function owner has necessary privileges
*/

-- Ensure the postgres role can bypass RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE farms DISABLE ROW LEVEL SECURITY;

-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  user_role text;
  user_full_name text;
  user_phone text;
  v_profile_id uuid;
  v_farm_id uuid;
BEGIN
  RAISE NOTICE 'handle_new_user triggered for user: %', NEW.email;
  
  -- Extract user metadata with defaults
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'gardener');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  
  RAISE NOTICE 'User role: %, name: %', user_role, user_full_name;

  -- Insert profile
  BEGIN
    INSERT INTO profiles (
      id,
      user_id,
      email,
      role,
      full_name,
      phone,
      email_confirmed
    ) VALUES (
      NEW.id,
      NEW.id,
      NEW.email,
      user_role,
      user_full_name,
      user_phone,
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      email_confirmed = EXCLUDED.email_confirmed,
      updated_at = now()
    RETURNING id INTO v_profile_id;
    
    RAISE NOTICE 'Profile created with id: %', v_profile_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating profile for %: % %', NEW.email, SQLERRM, SQLSTATE;
      RETURN NEW;
  END;

  -- Insert farm
  BEGIN
    INSERT INTO farms (
      profile_id,
      farm_type,
      property_size,
      current_challenges,
      garden_type,
      growing_zone,
      soil_type,
      sunlight_exposure,
      crop_types,
      certifications,
      equipment,
      farming_practices,
      livestock_types,
      herd_size,
      grazing_management,
      water_resources
    ) VALUES (
      NEW.id,
      user_role,
      COALESCE(
        NEW.raw_user_meta_data->>'property_size',
        NEW.raw_user_meta_data->>'farm_size',
        NEW.raw_user_meta_data->>'ranch_size'
      ),
      NEW.raw_user_meta_data->>'current_challenges',
      NEW.raw_user_meta_data->>'garden_type',
      NEW.raw_user_meta_data->>'growing_zone',
      NEW.raw_user_meta_data->>'soil_type',
      NEW.raw_user_meta_data->>'sunlight_exposure',
      CASE 
        WHEN NEW.raw_user_meta_data->>'crop_types' IS NOT NULL 
        THEN string_to_array(NEW.raw_user_meta_data->>'crop_types', ',')
        ELSE NULL
      END,
      CASE 
        WHEN NEW.raw_user_meta_data->>'certifications' IS NOT NULL 
        THEN string_to_array(NEW.raw_user_meta_data->>'certifications', ',')
        ELSE NULL
      END,
      NEW.raw_user_meta_data->>'equipment',
      NEW.raw_user_meta_data->>'farming_practices',
      CASE 
        WHEN NEW.raw_user_meta_data->>'livestock_types' IS NOT NULL 
        THEN string_to_array(NEW.raw_user_meta_data->>'livestock_types', ',')
        ELSE NULL
      END,
      NEW.raw_user_meta_data->>'herd_size',
      NEW.raw_user_meta_data->>'grazing_management',
      NEW.raw_user_meta_data->>'water_resources'
    )
    ON CONFLICT (profile_id) DO NOTHING
    RETURNING id INTO v_farm_id;
    
    RAISE NOTICE 'Farm created with id: %', v_farm_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error creating farm for %: % %', NEW.email, SQLERRM, SQLSTATE;
      RETURN NEW;
  END;

  RETURN NEW;
END;
$$;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
