-- Create attendees table
CREATE TABLE public.attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  vaccine_upload_status BOOLEAN NOT NULL DEFAULT false,
  eventbrite_id TEXT,
  event_id TEXT,
  signature_svg TEXT,
  vaccine_file_path TEXT,
  vaccine_file_url TEXT,
  vaccine_file_paths TEXT[],
  vaccine_file_urls TEXT[],
  is_guest BOOLEAN,
  parent_ticket_email TEXT,
  guest_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dogs table
CREATE TABLE public.dogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  event_id TEXT,
  vaccine_file_path TEXT,
  vaccine_file_url TEXT,
  vaccine_file_paths TEXT[],
  vaccine_file_urls TEXT[],
  vaccine_upload_status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendees (public access for check-in flow)
CREATE POLICY "Anyone can view attendees"
  ON public.attendees FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert attendees"
  ON public.attendees FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update attendees"
  ON public.attendees FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete attendees"
  ON public.attendees FOR DELETE
  USING (true);

-- RLS Policies for dogs (public access)
CREATE POLICY "Anyone can view dogs"
  ON public.dogs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert dogs"
  ON public.dogs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update dogs"
  ON public.dogs FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete dogs"
  ON public.dogs FOR DELETE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_attendees_updated_at
  BEFORE UPDATE ON public.attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at
  BEFORE UPDATE ON public.dogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();