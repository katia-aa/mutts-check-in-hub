-- Mutts Check-In Hub Database Schema
-- Run this SQL in your Supabase SQL Editor: https://plukqfeodxnsypzilsmu.supabase.co

-- Create attendees table
CREATE TABLE IF NOT EXISTS public.attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  has_dog BOOLEAN DEFAULT false,
  da2pp_vaccine BOOLEAN DEFAULT false,
  rabies_vaccine BOOLEAN DEFAULT false,
  bordetella_vaccine BOOLEAN DEFAULT false,
  signature_svg TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_attendees_email ON public.attendees(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on attendees" ON public.attendees
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.attendees;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
