
-- Create a function to handle new runner profile creation
CREATE OR REPLACE FUNCTION public.create_runner_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create runner profile if user role is 'runner'
  IF NEW.role = 'runner' THEN
    INSERT INTO public.runner_profiles (
      user_id,
      application_status,
      rating,
      total_deliveries,
      total_earnings,
      created_at
    ) 
    VALUES (
      NEW.id,
      'pending',
      0.00,
      0,
      0.00,
      now()
    )
    ON CONFLICT (user_id) DO NOTHING; -- Prevents duplicate entries
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a trigger that fires when a user is inserted or updated
DROP TRIGGER IF EXISTS on_user_role_runner ON public.users;
CREATE TRIGGER on_user_role_runner
  AFTER INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW
  WHEN (NEW.role = 'runner')
  EXECUTE FUNCTION public.create_runner_profile();

-- Also create runner profiles for existing users who are runners but don't have profiles yet
INSERT INTO public.runner_profiles (
  user_id,
  application_status,
  rating,
  total_deliveries,
  total_earnings,
  created_at
)
SELECT 
  u.id,
  'pending',
  0.00,
  0,
  0.00,
  now()
FROM public.users u
WHERE u.role = 'runner'
  AND NOT EXISTS (
    SELECT 1 FROM public.runner_profiles rp 
    WHERE rp.user_id = u.id
  );
