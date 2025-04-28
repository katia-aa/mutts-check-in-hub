
-- Create a function to delete storage policies
-- This will be called from the edge function
CREATE OR REPLACE FUNCTION public.admin_delete_storage_policy(bucket_name_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to delete any existing policies for this bucket
  DELETE FROM storage.policies 
  WHERE bucket_id = bucket_name_param;
  
EXCEPTION WHEN undefined_table THEN
  -- If the table doesn't exist, just return
  RAISE NOTICE 'storage.policies table does not exist';
  RETURN;
END;
$$;
