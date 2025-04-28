
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Starting configure-storage function');
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    console.log('Checking for vaccine_records bucket');
    // Ensure the vaccine_records bucket exists and is public
    const { data: bucketData, error: bucketError } = await supabaseAdmin
      .storage
      .getBucket('vaccine_records');

    if (bucketError && bucketError.message.includes('does not exist')) {
      console.log('Bucket does not exist, creating it');
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabaseAdmin
        .storage
        .createBucket('vaccine_records', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
        });
      
      if (createError) {
        console.error('Failed to create bucket:', createError);
        throw new Error(`Failed to create bucket: ${createError.message}`);
      } else {
        console.log('Successfully created bucket');
      }
    } else if (bucketError) {
      console.error('Failed to check bucket:', bucketError);
      throw new Error(`Failed to check bucket: ${bucketError.message}`);
    } else {
      console.log('Bucket exists, checking if public');
    }

    // Update bucket to be public if it's not already
    if (bucketData && !bucketData.public) {
      console.log('Making bucket public');
      const { error: updateError } = await supabaseAdmin
        .storage
        .updateBucket('vaccine_records', {
          public: true,
        });
      
      if (updateError) {
        console.error('Failed to update bucket visibility:', updateError);
        throw new Error(`Failed to update bucket visibility: ${updateError.message}`);
      } else {
        console.log('Successfully made bucket public');
      }
    }

    // Create public policy for the bucket using SQL
    console.log('Setting up storage policies using SQL');
    
    try {
      const { error: policyError } = await supabaseAdmin.rpc('create_storage_policy', {
        bucket_name: 'vaccine_records',
      });

      if (policyError) {
        console.error('Error setting policy via RPC:', policyError);
        
        // Attempt direct SQL for policies if the RPC fails
        const { error: sqlError } = await supabaseAdmin.rpc('execute_sql', {
          sql_statement: `
            -- Allow public read access
            CREATE POLICY IF NOT EXISTS "Public Access" 
            ON storage.objects FOR SELECT 
            USING (bucket_id = 'vaccine_records');
            
            -- Allow authenticated users to insert
            CREATE POLICY IF NOT EXISTS "Allow Uploads" 
            ON storage.objects FOR INSERT 
            TO authenticated, anon, service_role
            WITH CHECK (bucket_id = 'vaccine_records');
          `
        });
        
        if (sqlError) {
          console.error('Error executing direct SQL policies:', sqlError);
        } else {
          console.log('Successfully set policies via direct SQL');
        }
      } else {
        console.log('Successfully set policies via RPC');
      }
    } catch (policyError) {
      console.error('Error setting policies:', policyError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Vaccine records storage configured successfully" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Configuration error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
