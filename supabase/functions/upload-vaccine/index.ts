
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Create a Supabase client with the Admin key
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    // Parse form data with file and metadata
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const email = formData.get('email') as string;
    
    if (!file || !email) {
      throw new Error('File and email are required');
    }

    // Generate safe filename
    const safeEmail = email.replace(/[^a-zA-Z0-9.@]/g, '_');
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${safeEmail}/${fileName}`;

    console.log(`Uploading file ${file.name} (${file.size} bytes) to ${filePath}`);

    // Upload the file using the admin client
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('vaccine_records')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('Upload successful:', data);

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('vaccine_records')
      .getPublicUrl(filePath);

    // Update the attendee record
    const { error: updateError } = await supabaseAdmin
      .from('attendees')
      .update({
        vaccine_upload_status: true,
        vaccine_file_path: filePath,
        vaccine_file_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        filePath,
        publicUrl
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in upload-vaccine function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error)
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
