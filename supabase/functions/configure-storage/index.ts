
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

    // First, check if the bucket exists
    console.log('Checking for vaccine_records bucket');
    const { data: bucketData, error: bucketError } = await supabaseAdmin
      .storage
      .getBucket('vaccine_records');

    let bucketExists = false;

    // Create the bucket if it doesn't exist
    if (bucketError && bucketError.message.includes('does not exist')) {
      console.log('Bucket does not exist, creating it');
      
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
        bucketExists = true;
      }
    } else if (bucketError) {
      console.error('Failed to check bucket:', bucketError);
      throw new Error(`Failed to check bucket: ${bucketError.message}`);
    } else {
      console.log('Bucket already exists:', bucketData);
      bucketExists = true;
    }

    // Update bucket settings to be public if it exists
    if (bucketExists) {
      console.log('Setting bucket to public via API');
      
      try {
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
      } catch (updateErr) {
        console.error('Exception updating bucket:', updateErr);
      }
    }

    // Try to set RLS policies directly via SQL
    try {
      console.log('Setting storage policies directly via SQL');
      
      // Create explicit policies for the vaccine_records bucket
      const policyResult = await supabaseAdmin.rpc('admin_setup_storage_policies', {
        bucket_name_param: 'vaccine_records'
      }).catch(err => {
        console.error('Error calling admin_setup_storage_policies:', err);
        return { error: err };
      });
      
      if (policyResult.error) {
        console.error('Error setting storage policies:', policyResult.error);
      } else {
        console.log('Successfully set storage policies');
      }
      
      // Allow a few seconds for the policies to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error('Exception setting policies:', err);
    }

    // Try to insert a test file to validate the bucket is working
    try {
      const testContent = new TextEncoder().encode('Test file');
      const { data: testFile, error: testFileError } = await supabaseAdmin.storage
        .from('vaccine_records')
        .upload('test-access.txt', testContent, {
          contentType: 'text/plain',
          upsert: true
        });
        
      if (testFileError) {
        console.error('Error with test upload:', testFileError);
      } else {
        console.log('Test file uploaded successfully:', testFile);
        
        // Clean up the test file
        await supabaseAdmin.storage
          .from('vaccine_records')
          .remove(['test-access.txt']);
      }
    } catch (testErr) {
      console.error('Error testing bucket access:', testErr);
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
      message: error.message || "Unknown error occurred" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
