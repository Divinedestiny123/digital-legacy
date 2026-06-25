CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_profiles (id, email)
    VALUES (new.id, new.email);
  EXCEPTION WHEN OTHERS THEN
    -- Log the error instead of failing the auth creation
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
