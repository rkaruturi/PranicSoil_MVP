/*
  # Create Unified Farms Table

  1. New Tables
    - `farms`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `farm_type` (text: gardener, farmer, rancher)
      - Common fields for all types:
        - `property_size` (text)
        - `current_challenges` (text)
      - Gardener-specific fields:
        - `garden_type` (text)
        - `growing_zone` (text)
        - `soil_type` (text)
        - `sunlight_exposure` (text)
      - Farmer-specific fields:
        - `crop_types` (text array)
        - `certifications` (text array)
        - `equipment` (text)
        - `farming_practices` (text)
      - Rancher-specific fields:
        - `livestock_types` (text array)
        - `herd_size` (text)
        - `grazing_management` (text)
        - `water_resources` (text)
      - Timestamps

  2. Security
    - Enable RLS on `farms` table
    - Add policies for authenticated users to manage their own farms
    - Admin can view all farms
*/

CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  farm_type text NOT NULL CHECK (farm_type IN ('gardener', 'farmer', 'rancher')),
  
  property_size text,
  current_challenges text,
  
  garden_type text,
  growing_zone text,
  soil_type text,
  sunlight_exposure text,
  
  crop_types text[],
  certifications text[],
  equipment text,
  farming_practices text,
  
  livestock_types text[],
  herd_size text,
  grazing_management text,
  water_resources text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS farms_profile_id_idx ON farms(profile_id);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own farm"
  ON farms FOR SELECT
  TO authenticated
  USING (
    auth.uid() = profile_id 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert own farm"
  ON farms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own farm"
  ON farms FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own farm"
  ON farms FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_full_name text;
  user_phone text;
  new_profile_id uuid;
BEGIN
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
