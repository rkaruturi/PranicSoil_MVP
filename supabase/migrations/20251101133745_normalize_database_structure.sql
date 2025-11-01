/*
  # Normalize Database Structure

  1. Changes
    - Drop redundant role-specific profile tables (farmer_profiles, gardener_profiles, rancher_profiles)
    - Keep unified `profiles` table with `role` field
    - Keep unified `farms` table with `farm_type` field for all farm data
    
  2. Rationale
    - Eliminates data duplication
    - Simplifies queries and relationships
    - Makes role-based data management more efficient
    - Reduces database complexity
    
  3. Data Safety
    - No data loss: farms table already contains all necessary farm data
    - All relationships point to profiles table (not the role-specific tables)
*/

-- Drop the redundant role-specific profile tables
DROP TABLE IF EXISTS farmer_profiles CASCADE;
DROP TABLE IF EXISTS gardener_profiles CASCADE;
DROP TABLE IF EXISTS rancher_profiles CASCADE;
