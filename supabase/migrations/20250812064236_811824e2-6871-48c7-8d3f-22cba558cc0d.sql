-- Create profiles table modification to add company_logo field
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.company_logo IS 'URL to company logo uploaded by user';