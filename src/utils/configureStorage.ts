
import { supabase } from "@/integrations/supabase/client";

export async function configureStorage() {
  try {
    console.log("Configuring storage...");
    
    // Add a timestamp parameter to avoid caching issues
    const timestamp = new Date().getTime();
    
    // First, invoke the edge function to configure the storage
    const { data, error } = await supabase.functions.invoke(
      "configure-storage",
      {
        body: { timestamp },
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    
    if (error) {
      console.error("Error configuring storage:", error);
      return { success: false, error };
    }
    
    console.log("Storage configuration result:", data);
    
    // Wait a moment to ensure bucket is registered in the system
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we can access the bucket after configuration
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('vaccine_records');
      
      if (bucketError) {
        console.error("Error accessing bucket after configuration:", bucketError);
        // Try creating a dummy file to see if the bucket actually exists despite the error
        try {
          const testBlob = new Blob(['test'], { type: 'text/plain' });
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('vaccine_records')
            .upload(`test-${timestamp}.txt`, testBlob, { upsert: true });
            
          if (uploadError) {
            console.error("Error uploading test file:", uploadError);
          } else {
            console.log("Test file upload successful, bucket exists:", uploadData);
            // Try to delete the test file
            const { error: deleteError } = await supabase.storage
              .from('vaccine_records')
              .remove([`test-${timestamp}.txt`]);
              
            if (deleteError) {
              console.warn("Could not delete test file:", deleteError);
            }
          }
        } catch (testError) {
          console.error("Error testing bucket with upload:", testError);
        }
      } else {
        console.log("Bucket verification successful:", bucketData);
        
        // Check if we can list files in the bucket
        const { data: listData, error: listError } = await supabase.storage
          .from('vaccine_records')
          .list();
          
        if (listError) {
          console.error("Error listing bucket contents:", listError);
        } else {
          console.log("Bucket contents:", listData);
        }
      }
    } catch (verifyError) {
      console.error("Exception verifying bucket:", verifyError);
    }
    
    return { success: true, data };
  } catch (e) {
    console.error("Exception configuring storage:", e);
    return { success: false, error: e };
  }
}
