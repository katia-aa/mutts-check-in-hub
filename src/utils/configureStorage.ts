
import { supabase } from "@/integrations/supabase/client";

export async function configureStorage() {
  try {
    console.log("Configuring storage...");
    
    // Add a timestamp parameter to avoid caching issues
    const timestamp = new Date().getTime();
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
    
    // Check if we can access the bucket after configuration
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('vaccine_records');
    
    if (bucketError) {
      console.error("Error accessing bucket after configuration:", bucketError);
      // Continue with the function execution, don't return an error here
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
    
    console.log("Storage configuration result:", data);
    return { success: true, data };
  } catch (e) {
    console.error("Exception configuring storage:", e);
    return { success: false, error: e };
  }
}
