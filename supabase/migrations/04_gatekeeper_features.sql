-- Migration: 04_gatekeeper_features.sql
-- Description: Adds a SECURITY DEFINER function to securely look up a user's UUID by email.

CREATE OR REPLACE FUNCTION get_user_id_by_email(creator_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_id uuid;
BEGIN
  -- We query the user_profiles table which has the email address.
  -- SECURITY DEFINER allows this function to bypass RLS so a claimant can find the ID.
  SELECT id INTO found_id
  FROM user_profiles
  WHERE email = creator_email
  LIMIT 1;
  
  RETURN found_id;
END;
$$;
