
-- Create a function to set up storage policies
-- This will be called from the edge function
CREATE OR REPLACE FUNCTION public.admin_setup_storage_policies(bucket_name_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete any existing policies for this bucket to avoid conflicts
  DELETE FROM storage.policies 
  WHERE bucket_id = bucket_name_param;

  -- Insert public read policy
  INSERT INTO storage.policies (name, bucket_id, operation, definition)
  VALUES (
    'Public Read Access',
    bucket_name_param,
    'SELECT',
    'true'
  ) ON CONFLICT (name, bucket_id, operation) DO NOTHING;

  -- Insert authenticated insert policy
  INSERT INTO storage.policies (name, bucket_id, operation, definition)
  VALUES (
    'Allow Uploads',
    bucket_name_param,
    'INSERT',
    'true'
  ) ON CONFLICT (name, bucket_id, operation) DO NOTHING;

  -- Insert authenticated update policy
  INSERT INTO storage.policies (name, bucket_id, operation, definition)
  VALUES (
    'Allow Updates',
    bucket_name_param,
    'UPDATE',
    'true'
  ) ON CONFLICT (name, bucket_id, operation) DO NOTHING;

  -- Insert authenticated delete policy
  INSERT INTO storage.policies (name, bucket_id, operation, definition)
  VALUES (
    'Allow Deletion',
    bucket_name_param,
    'DELETE',
    'true'
  ) ON CONFLICT (name, bucket_id, operation) DO NOTHING;
END;
$$;
