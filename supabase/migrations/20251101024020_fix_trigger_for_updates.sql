/*
  # Fix Trigger to Handle Updates Properly
  
  1. Changes
    - Update handle_new_user to only create farm entry on INSERT, not UPDATE
    - Prevent duplicate farm entries when user confirms email
    - Only create records if they don't already exist
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_full_name text;
  user_phone text;
  new_profile_id uuid;
BEGIN
  -- Only create profile if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'gardener');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
    user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

    INSERT INTO public.profiles (
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
      NEW.email_confirmed_at IS NOT NULL
    ) RETURNING id INTO new_profile_id;

    -- Only create farm entry if profile was just created
    IF new_profile_id IS NOT NULL THEN
      INSERT INTO public.farms (
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
        new_profile_id,
        user_role,
        NEW.raw_user_meta_data->>'property_size',
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
      );
    END IF;
  ELSE
    -- Profile exists, just update email_confirmed if needed
    UPDATE public.profiles 
    SET email_confirmed = (NEW.email_confirmed_at IS NOT NULL)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
