import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
  try {
    console.log('Checking if vaccine_records bucket exists...');
    const { data: bucketData, error: bucketError } = await supabaseAdmin.storage.getBucket('vaccine_records');
    if (!bucketData) {
      console.log('Bucket does not exist, creating...');
      const { error: createError } = await supabaseAdmin.storage.createBucket('vaccine_records', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'application/pdf'
        ]
      });
      if (createError) {
        console.error('Error creating bucket:', createError.message);
        throw new Error(`Bucket creation failed: ${createError.message}`);
      }
    } else {
      console.log('Bucket already exists. Skipping creation.');
    }
    console.log('Setting up storage policies...');
    const { error: policyError } = await supabaseAdmin.rpc('admin_setup_storage_policies', {
      bucket_name_param: 'vaccine_records'
    });
    if (policyError) {
      console.error('Error setting storage policies:', policyError.message);
      throw new Error(`Error setting storage policies: ${policyError.message}`);
    }
    console.log('Configuration complete.');
    return new Response(JSON.stringify({
      success: true,
      message: 'Vaccine records storage configured successfully'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Fatal error:', error.message || error.toString());
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Unknown error occurred'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
