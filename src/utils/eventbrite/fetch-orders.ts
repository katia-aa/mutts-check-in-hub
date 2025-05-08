import { supabase } from "@/integrations/supabase/client";

// Fetch orders from Eventbrite via edge function with timeout
export const fetchEventbriteOrders = async () => {
  const responsePromise = supabase.functions.invoke("smooth-processor");
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () =>
        reject(
          new Error("Connection timeout: Could not reach the edge function")
        ),
      10000
    );
  });

  return Promise.race([responsePromise, timeoutPromise]);
}; 