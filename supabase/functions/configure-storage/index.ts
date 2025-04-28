
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

Deno.serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Ensure the vaccine_records bucket exists and is public
    const { data: bucketData, error: bucketError } = await supabaseAdmin
      .storage
      .getBucket('vaccine_records');

    if (bucketError && bucketError.message.includes('does not exist')) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabaseAdmin
        .storage
        .createBucket('vaccine_records', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
        });
      
      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
    } else if (bucketError) {
      throw new Error(`Failed to check bucket: ${bucketError.message}`);
    }

    // Update bucket to be public if it's not already
    if (bucketData && !bucketData.public) {
      const { error: updateError } = await supabaseAdmin
        .storage
        .updateBucket('vaccine_records', {
          public: true,
        });
      
      if (updateError) {
        throw new Error(`Failed to update bucket visibility: ${updateError.message}`);
      }
    }

    // Create necessary policies for the bucket
    const policies = [
      {
        name: 'Public Access',
        definition: "bucket_id = 'vaccine_records'",
        operation: 'SELECT' as const,
      },
      {
        name: 'Anyone can upload',
        definition: "bucket_id = 'vaccine_records'",
        operation: 'INSERT' as const,
      },
      {
        name: 'Anyone can update',
        definition: "bucket_id = 'vaccine_records'",
        operation: 'UPDATE' as const,
      }
    ];

    for (const policy of policies) {
      const { error } = await supabaseAdmin.rpc('create_storage_policy', {
        name: policy.name,
        definition: policy.definition,
        operation: policy.operation,
        bucket: 'vaccine_records',
        force_replace: true,
      });

      if (error && !error.message.includes('already exists')) {
        console.error(`Failed to create policy "${policy.name}": ${error.message}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Vaccine records storage configured successfully" 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Configuration error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
