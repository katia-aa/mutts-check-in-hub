-- Add missing columns to attendees table for check-in flow

-- Remove old name column if it exists and add first_name and last_name
ALTER TABLE public.attendees DROP COLUMN IF EXISTS name;
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '';

-- Add dog ownership and vaccination tracking columns
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS has_dog BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS da2pp_vaccine BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS rabies_vaccine BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS bordetella_vaccine BOOLEAN NOT NULL DEFAULT false;

-- Update any existing records with empty names to have at least empty strings
UPDATE public.attendees SET first_name = '' WHERE first_name IS NULL;
UPDATE public.attendees SET last_name = '' WHERE last_name IS NULL;
