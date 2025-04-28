
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
    
    // After the edge function has run, wait a moment to ensure the bucket is registered
    await new Promise(resolve => setTimeout(resolve, 3000));

    return { success: true, data };
  } catch (e) {
    console.error("Exception configuring storage:", e);
    return { success: false, error: e };
  }
}
