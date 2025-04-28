
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
    // Try to get the bucket first to check if it exists
    const { data: bucketData, error: bucketError } = await supabaseAdmin
      .storage
      .getBucket('vaccine_records');

    // Check if bucket needs to be created
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
      
      // Update the bucket to be public
      const { error: updateError } = await supabaseAdmin.storage.updateBucket('vaccine_records', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (updateError) {
        console.error('Error updating bucket settings:', updateError);
      } else {
        console.log('Successfully updated bucket to public');
      }
      
      // Wait briefly for the bucket to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify bucket was created
      const { data: verifyData, error: verifyError } = await supabaseAdmin
        .storage
        .getBucket('vaccine_records');
        
      if (verifyError) {
        console.error('Failed to verify bucket creation:', verifyError);
        throw new Error(`Failed to verify bucket creation: ${verifyError.message}`);
      } else {
        console.log('Bucket creation verified:', verifyData);
      }
    } else if (bucketError) {
      console.error('Failed to check bucket:', bucketError);
      throw new Error(`Failed to check bucket: ${bucketError.message}`);
    } else {
      console.log('Bucket already exists:', bucketData);

      // Update the bucket to ensure it's public with correct settings
      const { error: updateError } = await supabaseAdmin.storage.updateBucket('vaccine_records', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (updateError) {
        console.error('Error updating bucket settings:', updateError);
      } else {
        console.log('Successfully updated bucket to public');
      }
    }

    // Return success
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
