
import { supabase } from "@/integrations/supabase/client";

export async function configureStorage() {
  try {
    console.log("Configuring storage...");
    const { data, error } = await supabase.functions.invoke("configure-storage");
    
    if (error) {
      console.error("Error configuring storage:", error);
      return { success: false, error };
    }
    
    console.log("Storage configuration result:", data);
    return { success: true, data };
  } catch (e) {
    console.error("Exception configuring storage:", e);
    return { success: false, error: e };
  }
}
