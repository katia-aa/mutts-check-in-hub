
import { supabase } from "@/integrations/supabase/client";

export async function configureStorage() {
  try {
    console.log("Configuring storage...");
    
    // First, invoke the edge function to configure the storage
    const { data, error } = await supabase.functions.invoke(
      "configure-storage",
      {
        body: { timestamp: new Date().getTime() },
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
    
    // Longer wait time to ensure the bucket is fully registered
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Try to verify the bucket using the client directly
    try {
      console.log("Verifying bucket access after configuration...");
      
      // First try to list buckets
      const { data: bucketListData, error: listError } = await supabase.storage.listBuckets();
      
      if (!listError && bucketListData) {
        const vaccineBucket = bucketListData.find(b => b.name === 'vaccine_records');
        if (vaccineBucket) {
          console.log("Bucket found in bucket list:", vaccineBucket);
        } else {
          console.log("Bucket not found in bucket list");
        }
      } else {
        console.log("Error listing buckets:", listError);
      }
      
      // Direct bucket check
      const { data: bucketData, error: bucketError } = await supabase.storage
        .getBucket('vaccine_records');
        
      if (bucketError) {
        console.error("Error verifying bucket after configuration:", bucketError);
      } else {
        console.log("Bucket verification successful:", bucketData);
      }
      
      // Test upload to verify permissions
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFile = `test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vaccine_records')
        .upload(testFile, testBlob, { contentType: 'text/plain' });
        
      if (uploadError) {
        console.error("Test upload failed:", uploadError);
      } else {
        console.log("Test upload successful:", uploadData);
        // Clean up test file
        await supabase.storage
          .from('vaccine_records')
          .remove([testFile]);
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
